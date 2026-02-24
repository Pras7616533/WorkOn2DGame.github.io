const sky = document.querySelector("[data-sky]");
const bird = document.querySelector("[data-bird]");
const scoreEl = document.querySelector("[data-score]");
const bestEl = document.querySelector("[data-best]");
const statusEl = document.querySelector("[data-status]");
const startBtn = document.querySelector("[data-action='start']");
const resetBtn = document.querySelector("[data-action='reset']");

let birdY = 160;
let velocity = 0;
let gravity = 0.35;
let lift = -6.5;
let running = false;
let score = 0;
let best = Number(localStorage.getItem("twoDGameFlappyBest") || 0);
let pipes = [];
let animationId = null;
let spawnTimer = null;

const updateStats = () => {
  scoreEl.textContent = String(score);
  bestEl.textContent = String(best);
};

const setStatus = (text) => {
  statusEl.textContent = text;
};

const resetBird = () => {
  birdY = sky.clientHeight / 2;
  velocity = 0;
  bird.style.top = `${birdY}px`;
};

const spawnPipe = () => {
  if (!running) return;
  const gap = 120;
  const topHeight = Math.floor(Math.random() * (sky.clientHeight - gap - 120)) + 40;
  const bottomHeight = sky.clientHeight - gap - topHeight;
  const pipeTop = document.createElement("div");
  pipeTop.className = "pipe top";
  pipeTop.style.height = `${topHeight}px`;
  pipeTop.style.left = `${sky.clientWidth}px`;

  const pipeBottom = document.createElement("div");
  pipeBottom.className = "pipe bottom";
  pipeBottom.style.height = `${bottomHeight}px`;
  pipeBottom.style.left = `${sky.clientWidth}px`;

  pipeTop.dataset.passed = "false";
  pipeBottom.dataset.passed = "false";

  sky.appendChild(pipeTop);
  sky.appendChild(pipeBottom);
  pipes.push({ top: pipeTop, bottom: pipeBottom });
};

const movePipes = () => {
  pipes.forEach((pipe) => {
    const currentLeft = Number(pipe.top.style.left.replace("px", ""));
    const nextLeft = currentLeft - 3;
    pipe.top.style.left = `${nextLeft}px`;
    pipe.bottom.style.left = `${nextLeft}px`;

    if (nextLeft + 60 < bird.offsetLeft && pipe.top.dataset.passed === "false") {
      pipe.top.dataset.passed = "true";
      score += 1;
      if (score > best) {
        best = score;
        localStorage.setItem("twoDGameFlappyBest", String(best));
      }
    }
  });

  pipes = pipes.filter((pipe) => {
    const left = Number(pipe.top.style.left.replace("px", ""));
    if (left + 60 < 0) {
      pipe.top.remove();
      pipe.bottom.remove();
      return false;
    }
    return true;
  });
};

const checkCollision = () => {
  const birdRect = bird.getBoundingClientRect();
  const skyRect = sky.getBoundingClientRect();
  if (birdRect.top <= skyRect.top || birdRect.bottom >= skyRect.bottom - 70) {
    endGame();
    return;
  }
  pipes.forEach((pipe) => {
    const topRect = pipe.top.getBoundingClientRect();
    const bottomRect = pipe.bottom.getBoundingClientRect();
    if (
      birdRect.left < topRect.right &&
      birdRect.right > topRect.left &&
      (birdRect.top < topRect.bottom || birdRect.bottom > bottomRect.top)
    ) {
      endGame();
    }
  });
};

const loop = () => {
  if (!running) return;
  velocity += gravity;
  birdY += velocity;
  bird.style.top = `${birdY}px`;
  movePipes();
  checkCollision();
  updateStats();
  animationId = requestAnimationFrame(loop);
};

const startGame = () => {
  if (running) return;
  running = true;
  score = 0;
  setStatus("Flying");
  pipes.forEach((pipe) => {
    pipe.top.remove();
    pipe.bottom.remove();
  });
  pipes = [];
  resetBird();
  updateStats();
  spawnPipe();
  spawnTimer = setInterval(spawnPipe, 1600);
  animationId = requestAnimationFrame(loop);
};

const endGame = () => {
  running = false;
  setStatus("Crashed");
  if (spawnTimer) {
    clearInterval(spawnTimer);
    spawnTimer = null;
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  updateStats();
};

const resetGame = () => {
  endGame();
  score = 0;
  updateStats();
  setStatus("Ready");
  pipes.forEach((pipe) => {
    pipe.top.remove();
    pipe.bottom.remove();
  });
  pipes = [];
  resetBird();
};

const flap = () => {
  if (!running) startGame();
  velocity = lift;
};

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
sky.addEventListener("click", flap);

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
  }
});

resetGame();
