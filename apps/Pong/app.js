const court = document.querySelector("[data-court]");
const ball = document.querySelector("[data-ball]");
const leftPaddle = document.querySelector("[data-paddle='left']");
const rightPaddle = document.querySelector("[data-paddle='right']");
const scoreLeftEl = document.querySelector("[data-score='left']");
const scoreRightEl = document.querySelector("[data-score='right']");
const statusEl = document.querySelector("[data-status]");
const startBtn = document.querySelector("[data-action='start']");
const resetBtn = document.querySelector("[data-action='reset']");

let leftScore = 0;
let rightScore = 0;
let running = false;
let ballPos = { x: 0.5, y: 0.5 };
let ballVel = { x: 0.25, y: 0.2 };
let leftY = 0.4;
let rightY = 0.4;
let animationId = null;
let speedBoost = false;
const cpuEnabled = true;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const updateScore = () => {
  scoreLeftEl.textContent = String(leftScore);
  scoreRightEl.textContent = String(rightScore);
};

const updateStatus = (text) => {
  statusEl.textContent = text;
};

const setPositions = () => {
  const courtRect = court.getBoundingClientRect();
  const ballSize = 18;
  const paddleHeight = 90;
  ball.style.left = `${ballPos.x * (courtRect.width - ballSize)}px`;
  ball.style.top = `${ballPos.y * (courtRect.height - ballSize)}px`;
  leftPaddle.style.top = `${leftY * (courtRect.height - paddleHeight)}px`;
  rightPaddle.style.top = `${rightY * (courtRect.height - paddleHeight)}px`;
};

const resetBall = (direction = 1) => {
  ballPos = { x: 0.5, y: 0.5 };
  ballVel = { x: 0.25 * direction, y: (Math.random() * 0.4 - 0.2) };
};

const checkPaddleCollision = () => {
  const paddleWidth = 14;
  if (ballPos.x <= 0.05) {
    const hit = ballPos.y + 0.04 >= leftY && ballPos.y <= leftY + 0.3;
    if (hit) {
      ballVel.x *= -1;
      ballVel.y += (ballPos.y - (leftY + 0.15)) * 0.6;
    }
  }
  if (ballPos.x >= 0.95) {
    const hit = ballPos.y + 0.04 >= rightY && ballPos.y <= rightY + 0.3;
    if (hit) {
      ballVel.x *= -1;
      ballVel.y += (ballPos.y - (rightY + 0.15)) * 0.6;
    }
  }
};

const step = () => {
  if (!running) return;
  const speed = speedBoost ? 0.012 : 0.008;
  ballPos.x += ballVel.x * speed;
  ballPos.y += ballVel.y * speed;

  if (ballPos.y <= 0 || ballPos.y >= 1) {
    ballVel.y *= -1;
    ballPos.y = clamp(ballPos.y, 0, 1);
  }

  checkPaddleCollision();

  if (cpuEnabled) {
    const target = clamp(ballPos.y - 0.15, 0, 1);
    const aiSpeed = 0.012;
    if (rightY < target) {
      rightY = clamp(rightY + aiSpeed, 0, 1);
    } else if (rightY > target) {
      rightY = clamp(rightY - aiSpeed, 0, 1);
    }
  }

  if (ballPos.x < 0) {
    rightScore += 1;
    updateScore();
    updateStatus("Right scores!");
    resetBall(1);
  }

  if (ballPos.x > 1) {
    leftScore += 1;
    updateScore();
    updateStatus("Left scores!");
    resetBall(-1);
  }

  if (leftScore >= 7 || rightScore >= 7) {
    running = false;
    updateStatus(leftScore >= 7 ? "Left wins!" : "Right wins!");
    return;
  }

  setPositions();
  animationId = requestAnimationFrame(step);
};

const startGame = () => {
  if (running) return;
  running = true;
  updateStatus("Playing");
  resetBall(Math.random() > 0.5 ? 1 : -1);
  animationId = requestAnimationFrame(step);
};

const resetGame = () => {
  running = false;
  if (animationId) cancelAnimationFrame(animationId);
  leftScore = 0;
  rightScore = 0;
  leftY = 0.4;
  rightY = 0.4;
  updateScore();
  updateStatus("Ready");
  resetBall(Math.random() > 0.5 ? 1 : -1);
  setPositions();
};

const handleKey = (event, pressed) => {
  const speed = pressed ? 0.03 : 0;
  if (event.code === "KeyW") leftY = clamp(leftY - speed, 0, 1);
  if (event.code === "KeyS") leftY = clamp(leftY + speed, 0, 1);
  if (!cpuEnabled) {
    if (event.code === "ArrowUp") rightY = clamp(rightY - speed, 0, 1);
    if (event.code === "ArrowDown") rightY = clamp(rightY + speed, 0, 1);
  }
  if (event.shiftKey) speedBoost = pressed;
  setPositions();
};

document.addEventListener("keydown", (event) => handleKey(event, true));
document.addEventListener("keyup", (event) => handleKey(event, false));
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

resetGame();
