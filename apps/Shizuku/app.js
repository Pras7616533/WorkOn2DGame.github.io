const stage = document.querySelector(".shizuku-stage");
const toggleBtn = document.querySelector("[data-action='toggle-rain']");
const intensityInput = document.getElementById("intensity");
const countEl = document.querySelector("[data-count]");

let dropCount = 0;
let raining = false;
let rainTimer = null;

const updateCount = () => {
  countEl.textContent = dropCount;
};

const spawnDrop = (x = null, y = null) => {
  if (!stage) return;
  const size = Math.floor(Math.random() * 14) + 8;
  const rect = stage.getBoundingClientRect();

  const drop = document.createElement("div");
  drop.className = "drop";
  drop.style.setProperty("--size", `${size}px`);
  drop.style.left = `${x ?? Math.random() * rect.width}px`;
  drop.style.top = `${y ?? Math.random() * rect.height}px`;

  const dot = document.createElement("span");
  dot.className = "dot";
  const ring = document.createElement("span");
  ring.className = "ring";

  drop.appendChild(dot);
  drop.appendChild(ring);
  stage.appendChild(drop);

  dropCount += 1;
  updateCount();

  setTimeout(() => {
    drop.remove();
  }, 2100);
};

const getInterval = () => {
  const intensity = Number(intensityInput.value);
  return Math.max(220, 1100 - intensity * 80);
};

const startRain = () => {
  if (raining) return;
  raining = true;
  toggleBtn.textContent = "Stop Rain";
  const tick = () => {
    spawnDrop();
    if (!raining) return;
    rainTimer = setTimeout(tick, getInterval());
  };
  tick();
};

const stopRain = () => {
  raining = false;
  toggleBtn.textContent = "Start Rain";
  if (rainTimer) {
    clearTimeout(rainTimer);
    rainTimer = null;
  }
};

toggleBtn.addEventListener("click", () => {
  if (raining) {
    stopRain();
  } else {
    startRain();
  }
});

intensityInput.addEventListener("input", () => {
  if (raining) {
    stopRain();
    startRain();
  }
});

stage.addEventListener("click", (event) => {
  const rect = stage.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  spawnDrop(x, y);
});

updateCount();
