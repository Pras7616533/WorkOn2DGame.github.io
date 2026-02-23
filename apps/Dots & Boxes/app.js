const boardEl = document.querySelector("[data-board]");
const turnEl = document.querySelector("[data-turn]");
const scoreRedEl = document.querySelector("[data-score='red']");
const scoreBlueEl = document.querySelector("[data-score='blue']");
const resetBtn = document.querySelector("[data-action='reset']");
const sizeBtn = document.querySelector("[data-action='size']");

let boxesPerSide = 4;
let gridSize = boxesPerSide * 2 + 1;
let currentPlayer = "red";
let scores = { red: 0, blue: 0 };
let lines = {};
let boxes = {};

const makeKey = (r, c, type) => `${type}-${r}-${c}`;

const updateStatus = () => {
  turnEl.textContent = currentPlayer === "red" ? "Red" : "Blue";
  turnEl.style.color = currentPlayer === "red" ? "var(--red)" : "var(--blue)";
  scoreRedEl.textContent = String(scores.red);
  scoreBlueEl.textContent = String(scores.blue);
};

const buildBoard = () => {
  boardEl.innerHTML = "";
  gridSize = boxesPerSide * 2 + 1;
  boardEl.style.gridTemplateColumns = `repeat(${gridSize}, auto)`;
  boardEl.style.gridTemplateRows = `repeat(${gridSize}, auto)`;
  lines = {};
  boxes = {};

  for (let r = 0; r < gridSize; r += 1) {
    for (let c = 0; c < gridSize; c += 1) {
      const isDot = r % 2 === 0 && c % 2 === 0;
      const isHLine = r % 2 === 0 && c % 2 === 1;
      const isVLine = r % 2 === 1 && c % 2 === 0;
      const isBox = r % 2 === 1 && c % 2 === 1;

      if (isDot) {
        const dot = document.createElement("div");
        dot.className = "dot";
        boardEl.appendChild(dot);
      } else if (isHLine) {
        const line = document.createElement("div");
        line.className = "line horizontal";
        const key = makeKey(r, c, "h");
        line.dataset.key = key;
        line.addEventListener("click", () => handleLineClick(key));
        boardEl.appendChild(line);
      } else if (isVLine) {
        const line = document.createElement("div");
        line.className = "line vertical";
        const key = makeKey(r, c, "v");
        line.dataset.key = key;
        line.addEventListener("click", () => handleLineClick(key));
        boardEl.appendChild(line);
      } else if (isBox) {
        const box = document.createElement("div");
        box.className = "box";
        const key = makeKey(r, c, "b");
        box.dataset.key = key;
        boxes[key] = null;
        boardEl.appendChild(box);
      }
    }
  }
};

const getLineElement = (key) => boardEl.querySelector(`[data-key='${key}']`);

const checkBox = (r, c) => {
  const top = makeKey(r - 1, c, "h");
  const bottom = makeKey(r + 1, c, "h");
  const left = makeKey(r, c - 1, "v");
  const right = makeKey(r, c + 1, "v");
  if (lines[top] && lines[bottom] && lines[left] && lines[right]) {
    const boxKey = makeKey(r, c, "b");
    if (!boxes[boxKey]) {
      boxes[boxKey] = currentPlayer;
      const boxEl = boardEl.querySelector(`[data-key='${boxKey}']`);
      boxEl.classList.add(currentPlayer);
      scores[currentPlayer] += 1;
      return true;
    }
  }
  return false;
};

const handleLineClick = (key) => {
  if (lines[key]) return;
  lines[key] = currentPlayer;
  const lineEl = getLineElement(key);
  lineEl.classList.add(currentPlayer);

  const [type, rStr, cStr] = key.split("-");
  const r = Number(rStr);
  const c = Number(cStr);
  let scored = false;

  if (type === "h") {
    if (r > 0) scored = checkBox(r - 1, c) || scored;
    if (r < gridSize - 1) scored = checkBox(r + 1, c) || scored;
  } else {
    if (c > 0) scored = checkBox(r, c - 1) || scored;
    if (c < gridSize - 1) scored = checkBox(r, c + 1) || scored;
  }

  if (!scored) {
    currentPlayer = currentPlayer === "red" ? "blue" : "red";
  }

  updateStatus();
  checkGameOver();
};

const checkGameOver = () => {
  const totalBoxes = boxesPerSide * boxesPerSide;
  if (scores.red + scores.blue >= totalBoxes) {
    const winner =
      scores.red === scores.blue ? "Draw" : scores.red > scores.blue ? "Red" : "Blue";
    setTimeout(() => {
      alert(`Game over! ${winner} wins.`);
    }, 100);
  }
};

const resetGame = () => {
  currentPlayer = "red";
  scores = { red: 0, blue: 0 };
  buildBoard();
  updateStatus();
};

const toggleSize = () => {
  boxesPerSide = boxesPerSide === 4 ? 5 : 4;
  resetGame();
};

resetBtn.addEventListener("click", resetGame);
sizeBtn.addEventListener("click", toggleSize);

resetGame();
