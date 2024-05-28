const mysql = require("mysql");
const http = require("http");
const url = require("url");
const messages = require("./lang/messages/en/user.json");

class Database {
  constructor() {
    // Create connection
    this.db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });
    this.connect();
  }

  connect() {
    this.db.connect((err) => {
      if (err) {
        console.error("Error connecting to MySql Database:", err);
        throw err;
      }
      console.log("MySql Connected...");
      this.createTable(); // create table if not exists
    });
  }

  // create table if not exists
  createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS patient (
        patientid INT(11) AUTO_INCREMENT,
        name VARCHAR(100),
        dateOfBirth DATETIME,
        PRIMARY KEY (patientid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `;
    this.db.query(createTableQuery, (err, res) => {
      if (err) {
        console.error("Error creating table:", err);
        throw err;
      }
      console.log("Table created successfully!");
    });
  }

  insertQuery(query) {
    return new Promise((resolve, reject) => {
      // Create table if not exists
      this.createTable();

      this.db.query(query, (err, res) => {
        if (err) {
          console.error("Error inserting data:", err);
          reject(err);
        }
        console.log("Data inserted successfully!");
        resolve();
      });
    });
  }

  selectQuery(query) {
    return new Promise((resolve, reject) => {
      // Create table if not exists
      this.createTable();

      this.db.query(query, (err, res) => {
        if (err) {
          console.error("Error fetching data:", err);
          reject(err);
        }
        console.log("Data fetched successfully!");
        resolve(res); // return fetched data
      });
    });
  }
}

class Server {
  constructor(port) {
    this.port = port;
    this.server = http.createServer(this.handleRequest.bind(this));
    this.api_endpoint = "/lab5/api/v1/sql";
    this.db = new Database();
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }

  async handleRequest(req, res) {
    const reqUrl = url.parse(req.url, true);
    const { pathname } = reqUrl;
    const path = decodeURIComponent(pathname)
      .replace("/COMP4537/labs/5", "")
      .toLowerCase();
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (!path.startsWith(this.api_endpoint)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: 404,
          message: messages.endpointInvalidMsg,
        })
      );
      return;
    }

    if (req.method === "GET") {
      // Used ChatGPT to remove the quotes from the path
      const query = path
        .replace(this.api_endpoint + "/", "") // remove endpoint from path
        .replace(/^"|"$/g, ""); // remove quotes
      await this.handleGetRequest(res, query);
    } else if (req.method === "POST") {
      await this.handlePostRequest(req, res);
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: 405,
          message: messages.methodNotAllowedMsg,
        })
      );
    }
  }

  // Handles SELECT queries to the database
  async handleGetRequest(res, query) {
    try {
      const dbResponse = await this.db.selectQuery(query);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: 200,
          message: messages.dbSelectQuerySuccessMsg,
          data: dbResponse || [],
        })
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: 500,
          message: messages.dbSelectQueryErrorMsg,
          error: error,
        })
      );
    }
  }

  // Handles INSERT queries to the database
  async handlePostRequest(req, res) {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          // check if query is INSERT, if not return 403 error
          if (!body.toLowerCase().startsWith("insert into")) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                status: 403,
                message: messages.dbForbiddenSqlQueryMsg,
              })
            );
            return;
          }

          await this.db.insertQuery(body);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: 200,
              message: messages.dbInsertQuerySuccessMsg,
            })
          );
        } catch (error) {
          console.error("Error inserting data:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: 500,
              message: messages.dbInsertQueryErrorMsg,
            })
          );
        }
      });
    } catch (error) {
      console.error("Error handling POST request:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: 500,
          message: messages.failedPostResponseMsg,
          error: error,
        })
      );
    }
  }
}

// Start server
const server = new Server(8080);
server.start();
