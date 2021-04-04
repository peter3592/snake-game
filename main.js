const root = document.querySelector(":root");

const playground = document.querySelector(".playground");
const backdrop = document.querySelector(".backdrop");
const backdropText = document.querySelector(".backdrop__text");

// Start game
const initMenu = document.querySelector(".gameStartInit");
const btnStartGame = document.querySelector(".gameStartInit__btnStart");
const btnDimensionPlus = document.querySelector(".gameStartInit__btn--plus");
const btnDimensionMinus = document.querySelector(".gameStartInit__btn--minus");
const dimensionText = document.querySelector(".gameStartInit__value");
const snakePreview = document.querySelector(".gameStartInit__snake-preview");
const btnsColor = document.querySelectorAll(".gameStartInit__color");
// Score
const scoreDOM = document.querySelector(".menu__score__value");
// Speed Control
const btnMinus = document.querySelector(".menu__gauge__btn--minus");
const btnPlus = document.querySelector(".menu__gauge__btn--plus");
const gaugeHand = document.querySelector(".menu__gauge--hand");
// New record
const newRecord = document.querySelector(".game__new-record");
const newRecordText = document.querySelector(".game__new-record__text");
const newRecordFireworks = document.querySelectorAll(
  ".game__new-record__firework"
);
// Game over, Form submit score
const gameOverDOM = document.querySelector(".game-over");
const gameOverText = document.querySelector(".game-over__text ");
const formScore = document.getElementById("game-over__form");
const formScoreInput = document.querySelector("#game-over__form input");
//const btnGameOverDOM = document.querySelector(".game-over__btn");
const newGame = document.querySelector(".new-game");
const btnNewGame = document.querySelector(".new-game__btn");
// Highscores
const highscoresRows = document.querySelectorAll(".highscores__row");

let dimension = 14; // 11 min, 17 max
const DIMENSION_MIN = 11;
const DIMENSION_MAX = 17;
const SIZE_OF_BOX = 25;
const defaultSpeed = 100;
let gameSpeed = 100;
let food = null;
let intervalID = null;
let score = null;
let handRotate = 90;
const handRotateStep = 40;
let gameRunning = false;
let record = null;
let minScore = null;
let recordAnimationPlayed = false;

let scoreRecords = [
  {
    name: "John",
    score: 8,
  },
  {
    name: "Martin",
    score: 4,
  },
  {
    name: "Jim",
    score: 2,
  },
  {
    name: "Adam",
    score: 7,
  },
];

let boxes2D = [];
let direction = null;
// default snake
const defaultSnake = [
  [2, 0],
  [2, 1],
  [2, 2],
];
let snake = [];

// *********
// Functions
// *********

const gameInit = function () {
  // Calculate dimension of playground
  playground.style.width = `${(SIZE_OF_BOX * dimension) / 10}rem`;
  playground.style.height = `${(SIZE_OF_BOX * dimension) / 10}rem`;
  playground.style.gridTemplateColumns = `repeat(${dimension}, 1fr)`;

  // Generate boxes of playground according to dimension
  const html = `<div class="playground__box">
  </div>`;
  for (let i = 0; i < dimension ** 2; i++) {
    playground.insertAdjacentHTML("beforeend", html);
  }

  // Default values
  direction = "right";
  boxes2D = [];
  score = 0;
  scoreDOM.textContent = 0;

  // Create 2-dimensional array of boxes elements
  const boxesAll = [
    ...document.querySelectorAll(".playground .playground__box"),
  ];
  for (let i = 0; i < boxesAll.length / dimension; i++) {
    boxes2D.push(boxesAll.slice(i * dimension, i * dimension + dimension));
  }

  // Draw snake and food at the beggining
  snake = [...defaultSnake];

  fillBox(...snake[0], "snake");
  fillBox(...snake[1], "snake");
  fillBox(...snake[2], "head");
  generateNewFood();
  // fillBox(...food, "food");

  // Start game loop
  intervalID = setInterval(function () {
    moveSnake();
  }, defaultSpeed);

  updateScoresUI();
  newRecord.classList.remove("hidden-colapse");
  recordAnimationPlayed = false;
  formScoreInput.value = "";

  gameRunning = true;
  ////
  changeSpeed(handRotate);
};

const gameReset = function () {
  // remove all boxes
  let boxesAll = document.querySelectorAll(".playground .playground__box");
  for (const box of boxesAll) {
    box.remove();
  }
  clearInterval(intervalID);
  gameInit();
};

const playAnimation = function (el, animationStr, mode = "play") {
  el.style.animation = "none";
  el.offsetHeight; /* trigger reflow */
  el.style.animation = null;
  if (mode === "play") {
    el.style.animation = animationStr;
  }
};

const fillBox = function (i, j, boxType) {
  boxes2D[i][j].classList.add(`fill-${boxType}`);
};

const clearBox = function (i, j, boxType) {
  boxes2D[i][j].classList.remove(`fill-${boxType}`);
};

const moveSnake = function () {
  const oldHead = snake[snake.length - 1];
  const newHead = [...oldHead];

  if (direction === "right") {
    newHead[1] = newHead[1] + 1;
    // Edge of playground
    if (newHead[1] === dimension) newHead[1] = 0;
  }
  if (direction === "left") {
    newHead[1] = newHead[1] - 1;
    // Edge of playground
    if (newHead[1] === -1) newHead[1] = dimension - 1;
  }
  if (direction === "up") {
    newHead[0] = newHead[0] - 1;
    // Edge of playground
    if (newHead[0] === -1) newHead[0] = dimension - 1;
  }
  if (direction === "down") {
    newHead[0] = newHead[0] + 1;
    // Edge of playground
    if (newHead[0] === dimension) newHead[0] = 0;
  }

  // Check if there is no collision with snake
  if (boxes2D[newHead[0]][newHead[1]].classList.contains("fill-snake")) {
    // Game Over
    gameOver(oldHead);
    return;
  }

  // Draw new head
  fillBox(...oldHead, "snake");
  clearBox(...oldHead, "head");
  fillBox(...newHead, "head");
  snake.push(newHead);

  // Check if snake has found food
  if (newHead[0] === food[0] && newHead[1] === food[1]) {
    // Food found
    clearBox(...food, "food");
    scoreDOM.textContent = ++score;
    playAnimation(scoreDOM, "scoreUpdate 0.6s both");
    // Check if record was beaten
    if (score > record && !recordAnimationPlayed) {
      playAnimation(newRecordText, "newRecordText 2s both");
      newRecordFireworks.forEach((firework) =>
        playAnimation(firework, "showFirework 2s both")
      );
      recordAnimationPlayed = true;
    }

    generateNewFood();
  } else {
    // If no food found, cut the tail
    clearBox(...snake.shift(), "snake");
  }
};

const gameOver = function (oldHead) {
  clearInterval(intervalID);
  gameRunning = false;
  boxes2D[oldHead[0]][oldHead[1]].classList.add("fill-head-game-over");
  gameOverText.classList.remove("game-over-hidden");

  // Hide new recond element when game over happened
  newRecord.classList.add("hidden-colapse");
  // Remove animation style form new record elements
  playAnimation(newRecordText, "", "reset");
  newRecordFireworks.forEach((firework) =>
    playAnimation(firework, "", "reset")
  );
  if (score > minScore || scoreRecords.length < 5) {
    // TOP 5 scores reached
    gameOverDOM.classList.remove("hidden");
    playAnimation(gameOverDOM, "slide-in 1.2s both 0.3s");
  } else {
    // No highscore reached, just start new game
    newGame.classList.remove("new-game-hidden");
    playAnimation(newGame, "slide-in 1.2s both 0.7s");
  }
};

const generateNewFood = function () {
  while (true) {
    food = [
      Math.trunc(Math.random() * dimension),
      Math.trunc(Math.random() * dimension),
    ];
    // Check if box is not occupied by snake
    if (
      !boxes2D[food[0]][food[1]].classList.contains("fill-snake") &&
      !boxes2D[food[0]][food[1]].classList.contains("fill-head")
    ) {
      break;
    }
  }

  fillBox(...food, "food");
};

// TODO
const updateScores = function (player, score) {
  if (player && score) {
    scoreRecords.push({ name: player, score });
  }
  scoreRecords.sort((player1, player2) => player2.score - player1.score);
  // Take first 5 scores only
  scoreRecords = scoreRecords.slice(0, 5);
  // Calculate max and min scores
  record = scoreRecords[0].score;
  minScore = scoreRecords[scoreRecords.length - 1].score;

  updateScoresUI();
};

const updateScoresUI = function () {
  const highscoresRowsArray = [...highscoresRows];
  highscoresRowsArray.slice(0, scoreRecords.length).forEach((row, index) => {
    const id = index + 1;
    const name = scoreRecords[index].name;
    const score = scoreRecords[index].score;
    row.querySelector(".highscores__row__id").textContent = id;
    row.querySelector(".highscores__row__name").textContent = name;
    row.querySelector(".highscores__row__score").textContent = score;
  });
};

// *******************
// Start game init
// *******************

const startGameUI = function () {
  snakePreview.style.width = `${(SIZE_OF_BOX * 5) / 10}rem`;
  snakePreview.style.height = `${(SIZE_OF_BOX * 2) / 10}rem`;
  snakePreview.style.gridTemplateColumns = `repeat(${5}, 1fr)`;
};

btnDimensionPlus.addEventListener("click", function () {
  if (dimension < DIMENSION_MAX) {
    dimension++;
    dimensionText.textContent = `${dimension} x ${dimension}`;
  } else {
    playAnimation(dimensionText, "shaking 0.5s both");
  }
});

btnDimensionMinus.addEventListener("click", function () {
  if (dimension > DIMENSION_MIN) {
    dimension--;
    dimensionText.textContent = `${dimension} x ${dimension}`;
  } else {
    playAnimation(dimensionText, "shaking 0.5s both");
  }
});

btnStartGame.addEventListener("click", function () {
  initMenu.classList.add("hidden-colapse");
  gameInit();
});

const removeColorChosen = function (btnsColor) {
  for (const color of btnsColor) {
    if (color.classList.contains("color-chosen")) {
      color.classList.remove("color-chosen");
      return;
    }
  }
};

btnsColor.forEach(function (btnColor, index) {
  btnColor.addEventListener("click", function () {
    root.style.setProperty("--color-snake", `var(--color-snake${index + 1})`);
    root.style.setProperty(
      "--color-snake-head",
      `var(--color-snake${index + 1}-head)`
    );

    removeColorChosen(btnsColor);
    this.classList.add("color-chosen");
  });
});

updateScores();
startGameUI();

// *******************
// Speed Adjustment
// *******************

const changeSpeed = function (handRotate) {
  if (!gameRunning) return;

  handRotate = handRotate - 90; // default rotate value  is +90
  clearInterval(intervalID);
  //
  gameSpeed = defaultSpeed - handRotate / 2;
  intervalID = setInterval(function () {
    moveSnake();
  }, gameSpeed);
};

btnMinus.addEventListener("click", function () {
  if (handRotate === -30) {
    // min speed reached
    return;
  }
  if (btnPlus.classList.contains("btn-inactive")) {
    btnPlus.classList.remove("btn-inactive");
  }

  handRotate = handRotate - handRotateStep;
  gaugeHand.style.transform = `translateX(17%) rotate(${handRotate}deg)`;
  changeSpeed(handRotate);

  if (handRotate === -30) {
    this.classList.add("btn-inactive");
  }
});

btnPlus.addEventListener("click", function () {
  if (handRotate === 210) {
    // max speed reached
    return;
  }
  if (btnMinus.classList.contains("btn-inactive")) {
    btnMinus.classList.remove("btn-inactive");
  }

  handRotate = handRotate + handRotateStep;
  gaugeHand.style.transform = `translateX(17%) rotate(${handRotate}deg)`;
  changeSpeed(handRotate);

  if (handRotate === 210) {
    this.classList.add("btn-inactive");
  }
});

// *******************
// Score form
// *******************

formScore.addEventListener("submit", function (e) {
  e.preventDefault();
  updateScores(formScoreInput.value, score);
  playAnimation(gameOverDOM, "slide-out 0.7s both");
  newGame.classList.remove("new-game-hidden");
  playAnimation(newGame, "slide-in 1.2s both 0.7s");
  formScoreInput.value = " ";
});

// *******************
// New game
// *******************

btnNewGame.addEventListener("click", function () {
  gameOverText.classList.add("game-over-hidden");
  newGame.style.animation = "slide-out 0.7s both";
  gameReset();
});

// *******************
// Key pressed handler
// *******************

document.addEventListener("keydown", function (e) {
  // Pause pressed
  if (e.key === "p" || e.key === "P") {
    // Start menu is on || game is over, so ignore p key
    if (
      !initMenu.classList.contains("hidden-colapse") ||
      !gameOverText.classList.contains("game-over-hidden")
    )
      return;

    if (gameRunning) {
      backdrop.classList.remove("hidden");
      backdropText.classList.remove("text-hidden");
      clearInterval(intervalID);
      gameRunning = false;
    } else {
      backdrop.classList.add("hidden");
      backdropText.classList.add("text-hidden");
      gameRunning = true;
      changeSpeed(handRotate);
    }
  }

  // Arrow pressed
  if (e.key.startsWith("Arrow") && backdrop.classList.contains("hidden")) {
    const pressedDirection = e.key.slice(5).toLowerCase();
    // Check if opposite direction was pressed. If yes, do nothing
    if (
      (pressedDirection === "left" && direction === "right") ||
      (pressedDirection === "right" && direction === "left") ||
      (pressedDirection === "up" && direction === "down") ||
      (pressedDirection === "down" && direction === "up")
    ) {
      return;
    }

    direction = pressedDirection;
  }
});
