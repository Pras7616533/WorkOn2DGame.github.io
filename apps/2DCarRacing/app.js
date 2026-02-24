const track = document.querySelector("[data-track]");
const car = document.querySelector("[data-car]");
const distanceEl = document.querySelector("[data-distance]");
const speedEl = document.querySelector("[data-speed]");
const bestEl = document.querySelector("[data-best]");
const startBtn = document.querySelector("[data-action='start']");
const resetBtn = document.querySelector("[data-action='reset']");

const lanes = [16.5, 50, 83.5];
let laneIndex = 0;
let distance = 0;
let speed = 1;
let best = Number(localStorage.getItem("twoDGameCarBest") || 0);
let running = false;
let traffic = [];
let spawnTimer = null;
let animationId = null;

const updateStats = () => {
  distanceEl.textContent = `${distance} m`;
  speedEl.textContent = `${speed.toFixed(1)}x`;
  bestEl.textContent = `${best} m`;
};

const setLane = (index) => {
  laneIndex = index;
  car.style.left = `${lanes[laneIndex]}%`;
};

const spawnTraffic = () => {
  if (!running) return;
  const vehicle = document.createElement("div");
  vehicle.className = "traffic";
  const lane = Math.floor(Math.random() * lanes.length);
  vehicle.dataset.lane = String(lane);
  vehicle.style.left = `${lanes[lane]}%`;
  vehicle.style.top = "-120px";
  track.appendChild(vehicle);
  traffic.push(vehicle);
};

const moveTraffic = () => {
  const height = track.clientHeight;
  traffic.forEach((vehicle) => {
    const top = Number(vehicle.style.top.replace("px", "")) + 5 + speed;
    vehicle.style.top = `${top}px`;
    if (top > height + 120) {
      vehicle.remove();
      traffic = traffic.filter((item) => item !== vehicle);
      distance += 1;
      speed = 1 + distance / 30;
      if (distance > best) {
        best = distance;
        localStorage.setItem("twoDGameCarBest", String(best));
      }
    }
  });
};

const checkCollision = () => {
  const carRect = car.getBoundingClientRect();
  traffic.forEach((vehicle) => {
    const rect = vehicle.getBoundingClientRect();
    const sameLane = Number(vehicle.dataset.lane) === laneIndex;
    const overlap =
      rect.bottom > carRect.top &&
      rect.top < carRect.bottom &&
      rect.left < carRect.right &&
      rect.right > carRect.left;
    if (sameLane && overlap) {
      endRace();
    }
  });
};

const loop = () => {
  if (!running) return;
  moveTraffic();
  checkCollision();
  updateStats();
  animationId = requestAnimationFrame(loop);
};

const startRace = () => {
  if (running) return;
  running = true;
  distance = 0;
  speed = 1;
  traffic.forEach((vehicle) => vehicle.remove());
  traffic = [];
  updateStats();
  spawnTraffic();
  spawnTimer = setInterval(spawnTraffic, 900);
  animationId = requestAnimationFrame(loop);
};

const endRace = () => {
  running = false;
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

const resetRace = () => {
  endRace();
  distance = 0;
  speed = 1;
  updateStats();
};

const moveLeft = () => {
  if (laneIndex > 0) setLane(laneIndex - 1);
};

const moveRight = () => {
  if (laneIndex < lanes.length - 1) setLane(laneIndex + 1);
};

startBtn.addEventListener("click", startRace);
resetBtn.addEventListener("click", resetRace);
track.addEventListener("click", () => moveRight());

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft") moveLeft();
  if (event.code === "ArrowRight") moveRight();
});

setLane(0);
updateStats();
