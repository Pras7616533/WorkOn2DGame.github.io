const boardEl = document.querySelector("[data-board]");
const minesEl = document.querySelector("[data-mines]");
const flagsEl = document.querySelector("[data-flags]");
const timeEl = document.querySelector("[data-time]");
const newBtn = document.querySelector("[data-action='new']");
const difficultyBtn = document.querySelector("[data-action='difficulty']");

const difficulties = [
  { name: "Easy", size: 9, mines: 10 },
  { name: "Medium", size: 12, mines: 20 },
  { name: "Hard", size: 16, mines: 40 },
];

let difficultyIndex = 0;
let size = difficulties[difficultyIndex].size;
let mineCount = difficulties[difficultyIndex].mines;
let grid = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let timer = null;
let secondsElapsed = 0;

const createEmpty = () => Array.from({ length: size }, () => Array(size).fill(0));

const within = (r, c) => r >= 0 && r < size && c >= 0 && c < size;

const placeMines = (safeRow, safeCol) => {
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if ((r === safeRow && c === safeCol) || grid[r][c] === -1) continue;
    grid[r][c] = -1;
    placed += 1;
  }
};

const countNeighbors = (row, col) => {
  let count = 0;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (within(r, c) && grid[r][c] === -1) count += 1;
    }
  }
  return count;
};

const fillCounts = () => {
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (grid[r][c] === -1) continue;
      grid[r][c] = countNeighbors(r, c);
    }
  }
};

const startTimer = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    secondsElapsed += 1;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
    const secs = String(secondsElapsed % 60).padStart(2, "0");
    timeEl.textContent = `${mins}:${secs}`;
  }, 1000);
};

const stopTimer = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

const renderBoard = () => {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      if (revealed[r][c]) {
        cell.classList.add("revealed");
        if (grid[r][c] === -1) {
          cell.classList.add("mine");
        } else if (grid[r][c] > 0) {
          cell.textContent = String(grid[r][c]);
          cell.dataset.count = String(grid[r][c]);
        }
      }
      if (flagged[r][c]) {
        cell.classList.add("flagged");
      }
      cell.addEventListener("click", () => handleReveal(r, c));
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        toggleFlag(r, c);
      });
      cell.addEventListener("touchstart", (event) => {
        if (event.touches.length > 1) return;
        cell.dataset.touchTime = String(Date.now());
      });
      cell.addEventListener("touchend", (event) => {
        const touchTime = Number(cell.dataset.touchTime);
        const duration = Date.now() - touchTime;
        if (duration > 400) {
          toggleFlag(r, c);
        } else {
          handleReveal(r, c);
        }
      });
      boardEl.appendChild(cell);
    }
  }
  minesEl.textContent = String(mineCount);
  flagsEl.textContent = String(flagged.flat().filter(Boolean).length);
};

const revealCell = (row, col) => {
  if (!within(row, col) || revealed[row][col] || flagged[row][col]) return;
  revealed[row][col] = true;
  if (grid[row][col] === 0) {
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (dr === 0 && dc === 0) continue;
        revealCell(row + dr, col + dc);
      }
    }
  }
};

const checkWin = () => {
  let safeRevealed = 0;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (grid[r][c] !== -1 && revealed[r][c]) safeRevealed += 1;
    }
  }
  if (safeRevealed === size * size - mineCount) {
    gameOver = true;
    stopTimer();
    setTimeout(() => {
      alert("You cleared the field!");
    }, 100);
  }
};

const revealAllMines = () => {
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (grid[r][c] === -1) {
        revealed[r][c] = true;
      }
    }
  }
};

const handleReveal = (row, col) => {
  if (gameOver || flagged[row][col]) return;
  if (!timer) startTimer();
  if (grid[row][col] === 0 && revealed.every((rowVals) => rowVals.every((val) => !val))) {
    placeMines(row, col);
    fillCounts();
  }
  if (grid[row][col] === -1) {
    revealed[row][col] = true;
    revealAllMines();
    gameOver = true;
    stopTimer();
    renderBoard();
    setTimeout(() => {
      alert("Boom! You hit a mine.");
    }, 100);
    return;
  }
  revealCell(row, col);
  renderBoard();
  checkWin();
};

const toggleFlag = (row, col) => {
  if (gameOver || revealed[row][col]) return;
  flagged[row][col] = !flagged[row][col];
  renderBoard();
};

const resetGame = () => {
  const diff = difficulties[difficultyIndex];
  size = diff.size;
  mineCount = diff.mines;
  grid = createEmpty();
  revealed = Array.from({ length: size }, () => Array(size).fill(false));
  flagged = Array.from({ length: size }, () => Array(size).fill(false));
  gameOver = false;
  secondsElapsed = 0;
  timeEl.textContent = "00:00";
  stopTimer();
  renderBoard();
};

const toggleDifficulty = () => {
  difficultyIndex = (difficultyIndex + 1) % difficulties.length;
  resetGame();
};

newBtn.addEventListener("click", resetGame);
difficultyBtn.addEventListener("click", toggleDifficulty);

resetGame();
