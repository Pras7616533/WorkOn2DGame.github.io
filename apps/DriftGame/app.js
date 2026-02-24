const track = document.querySelector("[data-track]");
const car = document.querySelector("[data-car]");
const scoreEl = document.querySelector("[data-score]");
const comboEl = document.querySelector("[data-combo]");
const bestEl = document.querySelector("[data-best]");
const startBtn = document.querySelector("[data-action='start']");
const resetBtn = document.querySelector("[data-action='reset']");

const lanes = [16.5, 50, 83.5];
let currentLane = 0;
let score = 0;
let combo = 0;
let best = Number(localStorage.getItem("twoDGameDriftBest") || 0);
let running = false;
let cones = [];
let animationId = null;
let spawnTimer = null;

const updateStats = () => {
  scoreEl.textContent = String(score);
  comboEl.textContent = String(combo);
  bestEl.textContent = String(best);
};

const setLane = (laneIndex) => {
  currentLane = laneIndex;
  car.style.left = `${lanes[laneIndex]}%`;
};

const spawnCone = () => {
  if (!running) return;
  const cone = document.createElement("div");
  cone.className = "cone";
  cone.dataset.lane = String(Math.floor(Math.random() * lanes.length));
  cone.style.left = `${lanes[Number(cone.dataset.lane)]}%`;
  cone.style.top = "-30px";
  track.appendChild(cone);
  cones.push(cone);
};

const moveCones = () => {
  const trackHeight = track.clientHeight;
  cones.forEach((cone) => {
    const top = Number(cone.style.top.replace("px", "")) + 4 + combo * 0.2;
    cone.style.top = `${top}px`;
    if (top > trackHeight + 40) {
      cone.remove();
      cones = cones.filter((item) => item !== cone);
      score += 1;
      combo += 1;
      if (score > best) {
        best = score;
        localStorage.setItem("twoDGameDriftBest", String(best));
      }
    }
  });
};

const checkCollision = () => {
  const carRect = car.getBoundingClientRect();
  cones.forEach((cone) => {
    const coneRect = cone.getBoundingClientRect();
    const sameLane = Number(cone.dataset.lane) === currentLane;
    const overlap =
      coneRect.bottom > carRect.top &&
      coneRect.top < carRect.bottom &&
      coneRect.left < carRect.right &&
      coneRect.right > carRect.left;
    if (sameLane && overlap) {
      endRun();
    }
  });
};

const tick = () => {
  if (!running) return;
  moveCones();
  checkCollision();
  updateStats();
  animationId = requestAnimationFrame(tick);
};

const startRun = () => {
  if (running) return;
  running = true;
  score = 0;
  combo = 0;
  cones.forEach((cone) => cone.remove());
  cones = [];
  updateStats();
  spawnCone();
  spawnTimer = setInterval(spawnCone, 900);
  animationId = requestAnimationFrame(tick);
};

const endRun = () => {
  running = false;
  combo = 0;
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
  endRun();
  score = 0;
  combo = 0;
  updateStats();
};

const handleMove = () => {
  const nextLane = (currentLane + 1) % lanes.length;
  setLane(nextLane);
};

startBtn.addEventListener("click", startRun);
resetBtn.addEventListener("click", resetGame);
track.addEventListener("click", handleMove);

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    handleMove();
  }
});

setLane(0);
updateStats();
