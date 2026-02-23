const boardEl = document.querySelector("[data-board]");
const scoreEl = document.querySelector("[data-score]");
const bestEl = document.querySelector("[data-best]");
const movesEl = document.querySelector("[data-moves]");
const newBtn = document.querySelector("[data-action='new']");
const resetBestBtn = document.querySelector("[data-action='reset']");
const restartBtn = document.querySelector("[data-action='restart']");
const overlay = document.querySelector("[data-overlay]");
const overlayTitle = document.querySelector("[data-overlay-title]");
const overlayText = document.querySelector("[data-overlay-text]");

const size = 4;
let board = [];
let score = 0;
let moves = 0;
let best = Number(localStorage.getItem("twoDGame2048Best") || 0);

const createEmptyBoard = () => Array.from({ length: size }, () => Array(size).fill(0));

const updateStats = () => {
  scoreEl.textContent = String(score);
  movesEl.textContent = String(moves);
  if (score > best) {
    best = score;
    localStorage.setItem("twoDGame2048Best", String(best));
  }
  bestEl.textContent = String(best);
};

const renderBoard = () => {
  boardEl.innerHTML = "";
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const value = board[row][col];
      const cell = document.createElement("div");
      cell.className = "tile";
      cell.dataset.value = String(value);
      cell.textContent = value === 0 ? "" : String(value);
      boardEl.appendChild(cell);
    }
  }
  updateStats();
};

const addRandomTile = () => {
  const empty = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (board[row][col] === 0) empty.push({ row, col });
    }
  }
  if (empty.length === 0) return false;
  const spot = empty[Math.floor(Math.random() * empty.length)];
  board[spot.row][spot.col] = Math.random() < 0.9 ? 2 : 4;
  return true;
};

const compress = (row) => {
  const filtered = row.filter((value) => value !== 0);
  while (filtered.length < size) filtered.push(0);
  return filtered;
};

const merge = (row) => {
  const newRow = [...row];
  for (let i = 0; i < size - 1; i += 1) {
    if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      score += newRow[i];
      newRow[i + 1] = 0;
    }
  }
  return newRow;
};

const slideRowLeft = (row) => compress(merge(compress(row)));

const rotateClockwise = (grid) => {
  const rotated = createEmptyBoard();
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      rotated[col][size - 1 - row] = grid[row][col];
    }
  }
  return rotated;
};

const moveLeft = () => {
  let changed = false;
  const newBoard = board.map((row, rowIndex) => {
    const newRow = slideRowLeft(row);
    if (newRow.some((value, index) => value !== board[rowIndex][index])) {
      changed = true;
    }
    return newRow;
  });
  board = newBoard;
  return changed;
};

const moveRight = () => {
  board = board.map((row) => row.slice().reverse());
  const changed = moveLeft();
  board = board.map((row) => row.slice().reverse());
  return changed;
};

const moveUp = () => {
  board = rotateClockwise(board);
  board = rotateClockwise(board);
  board = rotateClockwise(board);
  const changed = moveLeft();
  board = rotateClockwise(board);
  return changed;
};

const moveDown = () => {
  board = rotateClockwise(board);
  const changed = moveLeft();
  board = rotateClockwise(board);
  board = rotateClockwise(board);
  board = rotateClockwise(board);
  return changed;
};

const hasMoves = () => {
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (board[row][col] === 0) return true;
      if (col < size - 1 && board[row][col] === board[row][col + 1]) return true;
      if (row < size - 1 && board[row][col] === board[row + 1][col]) return true;
    }
  }
  return false;
};

const showOverlay = (title, text) => {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
};

const hideOverlay = () => {
  overlay.classList.add("hidden");
};

const handleMove = (direction) => {
  let moved = false;
  if (direction === "left") moved = moveLeft();
  if (direction === "right") moved = moveRight();
  if (direction === "up") moved = moveUp();
  if (direction === "down") moved = moveDown();

  if (moved) {
    moves += 1;
    addRandomTile();
    renderBoard();
    if (!hasMoves()) {
      showOverlay("Game Over", "No more moves. Try again.");
    }
  }
};

const resetGame = () => {
  board = createEmptyBoard();
  score = 0;
  moves = 0;
  hideOverlay();
  addRandomTile();
  addRandomTile();
  renderBoard();
};

const resetBest = () => {
  best = 0;
  localStorage.setItem("twoDGame2048Best", "0");
  updateStats();
};

document.addEventListener("keydown", (event) => {
  const keyMap = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
  };
  const direction = keyMap[event.key];
  if (!direction) return;
  event.preventDefault();
  handleMove(direction);
});

let touchStartX = 0;
let touchStartY = 0;

boardEl.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

boardEl.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    handleMove(dx > 0 ? "right" : "left");
  } else {
    handleMove(dy > 0 ? "down" : "up");
  }
});

newBtn.addEventListener("click", resetGame);
resetBestBtn.addEventListener("click", resetBest);
restartBtn.addEventListener("click", resetGame);

resetGame();
