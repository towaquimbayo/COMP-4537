class Button {
  constructor(number, bgColor) {
    this.number = number;
    this.isRevealed = false;
    this.button = document.createElement("button");
    this.button.className = "randBtn";
    this.button.innerHTML = number;
    this.button.style.backgroundColor = bgColor;
    document.getElementById("randBtnsContainer").appendChild(this.button);
  }

  move(top, left) {
    if (top < 100) top = 100; // To avoid overlap with the game label
    if (left < 0) left = 0;
    if (top + this.button.offsetHeight > window.innerHeight) {
      top = window.innerHeight - this.button.offsetHeight - 100; // -100px to maintain space
    }
    if (left + this.button.offsetWidth > window.innerWidth) {
      left = window.innerWidth - this.button.offsetWidth - 100; // -100px to maintain space
    }
    this.button.style.position = "absolute";
    this.button.style.top = top + "px";
    this.button.style.left = left + "px";
  }

  hideNumber() {
    this.button.innerHTML = "";
  }

  revealNumber() {
    this.isRevealed = true;
    this.button.innerHTML = this.number;
  }
}

class MemoryGame {
  constructor() {
    this.buttonsArray = [];
    this.gameEndingMessage = document.getElementById("gameEndingMessage");
    this.errorMessageElement = document.getElementById("errorMessage");
  }

  init() {
    document.getElementById("gameLabel").innerHTML = gameLabelMessage;
  }

  hideErrorMsg() {
    this.errorMessageElement.style.display = "none";
  }

  resetGame() {
    this.buttonsArray = [];
    this.gameEndingMessage.innerHTML = "";
    document.getElementById("randBtnsContainer").innerHTML = "";
  }

  startGame() {
    this.resetGame(); // Reset game when 'Go' button is clicked
    const inputNumber = parseInt(document.getElementById("inputNumber").value);
    if (!this.validateInputNumber(inputNumber)) return;
    document.getElementById("startGameButton").disabled = true; // Disable to prevent multiple clicks
    this.generateButtons(inputNumber);
    setTimeout(() => this.moveButtonLocations(inputNumber), inputNumber * 1000);
  }

  validateInputNumber(inputNumber) {
    if (inputNumber < 3 || inputNumber > 7 || isNaN(inputNumber)) {
      this.errorMessageElement.innerHTML = errorMessage;
      this.errorMessageElement.style.display = "block";
      return false;
    }
    return true;
  }

  generateButtons(inputNumber) {
    const colors = [
      "red",
      "green",
      "blue",
      "yellow",
      "orange",
      "purple",
      "pink",
    ];
    for (let i = 1; i <= inputNumber; i++) {
      const buttonColor = colors[Math.floor(Math.random() * colors.length)];
      const button = new Button(i, buttonColor);
      colors.splice(colors.indexOf(buttonColor), 1); // Used ChatGPT to remove the color from the array to avoid duplicates
      this.buttonsArray.push(button);
    }
  }

  moveButtonLocations(inputNumber) {
    // used chatGPT to use setTimeout loop recursively instead of setInterval for better accuracy in timing
    let counter = 0;
    const moveButtonsLoop = () => {
      this.buttonsArray.forEach((button) => {
        button.move(
          Math.floor(Math.random() * window.innerHeight),
          Math.floor(Math.random() * window.innerWidth)
        );
      });
      counter++;

      // call itself to move the buttons again unless the counter is equal to the input number
      if (counter < inputNumber) setTimeout(moveButtonsLoop, 2000);
      else {
        this.buttonsArray.forEach((button) => button.hideNumber());
        this.testMemory(inputNumber);
      }
    };
    moveButtonsLoop(); // Call the function to start the loop
  }

  // Check if the buttons are clicked in the correct order and reveal the numbers
  testMemory(inputNumber) {
    let counter = 0;
    this.buttonsArray.forEach((button) => {
      button.button.addEventListener("click", () => {
        if (button.isRevealed) return;
        button.revealNumber();
        if (button.number === counter + 1) {
          counter++;
          if (counter === inputNumber) this.gameWon(); // Game won when all buttons are clicked in order
        } else this.gameOver(); // Game over as soon as a button is clicked in the wrong order
      });
    });
  }

  gameWon() {
    document.getElementById("startGameButton").disabled = false;
    this.gameEndingMessage.style.color = "lime";
    this.gameEndingMessage.innerHTML = gameSuccessMessage;
  }

  gameOver() {
    document.getElementById("startGameButton").disabled = false;
    this.gameEndingMessage.style.color = "red";
    this.gameEndingMessage.innerHTML = gameOverMessage;
    this.revealAllNumbers();
  }

  revealAllNumbers() {
    this.buttonsArray.forEach((button) => button.revealNumber());
  }
}

// Run when the page is loaded
window.onload = () => {
  const memoryGame = new MemoryGame();
  memoryGame.init();

  document.getElementById("startGameButton").addEventListener("click", (e) => {
    e.preventDefault();
    memoryGame.hideErrorMsg();
    memoryGame.startGame();
  });

  // Hide error message when user types
  document.getElementById("inputNumber").onkeyup = () => {
    memoryGame.hideErrorMsg();
  };
};
