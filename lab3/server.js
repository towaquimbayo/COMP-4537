const http = require("http");
const url = require("url");
const fs = require("fs");
const utils = require("./modules/utils");
const messages = fs.readFileSync("./lang/en/en.json");

const Endpoints = {
  HOME: "",
  GETDATE: "getdate",
  READFILE: "readfile",
  WRITEFILE: "writefile",
};

class FileHandler {
  static read(path) {
    return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : null;
  }

  static write(path, data) {
    fs.existsSync(path)
      ? fs.appendFileSync(path, data)
      : fs.writeFileSync(path, data);
  }
}

class Server {
  constructor(port) {
    this.server = http.createServer(this.handleGetRequests.bind(this));
    this.port = port;
  }

  start() {
    this.server.listen(this.port, () =>
      console.log(`Server is running on port ${this.port}`)
    );
  }

  renderHtml(childElement = "") {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>COMP 4537: Lab 3 - Node JS</title>
      </head>
      <body>
        ${childElement}
      </body>
      </html>
    `;
  }

  handleGetRequests(req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    const urlObj = url.parse(req.url, true);
    const { pathname, query } = urlObj;
    const path = pathname.replace("/COMP4537/labs/3", "");

    if (req.method !== "GET") res.end();
    switch (path.split("/")[1].toLowerCase()) {
      case Endpoints.GETDATE:
        this.handleGetDate(res, query);
        break;
      case Endpoints.WRITEFILE:
        this.handleWriteFile(res, query);
        break;
      case Endpoints.READFILE:
        this.handleReadFile(res, path);
        break;
      case Endpoints.HOME:
        res.write(this.renderHtml("<h1>COMP 4537: Lab 3 - Node JS</h1>"));
        break;
      default:
        break;
    }
    res.end();
  }

  handleGetDate(res, query) {
    const message = JSON.parse(messages).greetingMsg;
    const greeting = message.replace("%1", query.name);
    res.write(
      this.renderHtml(
        `<h1 style="color:blue;">${greeting + utils.getDate()}</h1>`
      )
    );
  }

  handleWriteFile(res, query) {
    const filePath = "file.txt";
    res.write(this.renderHtml());
    if (!query.text) return;
    FileHandler.write(filePath, query.text + "\n");
  }

  handleReadFile(res, pathname) {
    const fileName = pathname.split("/")[2];
    const fileContent = FileHandler.read(fileName);
    if (fileContent) {
      res.write(this.renderHtml(`<h1>${fileContent}</h1>`));
    } else {
      res.write(
        this.renderHtml(
          `<h1>404 error!</h1><h1>File "${fileName}" not found.</h1>`
        )
      );
    }
  }
}

// Start the server
const server = new Server(3000);
server.start();
