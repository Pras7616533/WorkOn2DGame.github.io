const gridEl = document.querySelector("[data-grid]");
const wordListEl = document.querySelector("[data-word-list]");
const foundEl = document.querySelector("[data-found]");
const totalEl = document.querySelector("[data-total]");
const timeEl = document.querySelector("[data-time]");
const newBtn = document.querySelector("[data-action='new']");
const hintBtn = document.querySelector("[data-action='hint']");

const size = 12;
const words = ["PIXEL", "SPRITE", "ARCADE", "LEVEL", "BOSS", "LIVES", "QUEST", "SCORE"];

let board = [];
let placedWords = [];
let foundWords = new Set();
let selecting = false;
let selectedCells = [];
let timer = null;
let secondsElapsed = 0;

const directions = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: -1, dc: 1 },
];

const formatTime = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

const startTimer = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    secondsElapsed += 1;
    timeEl.textContent = formatTime(secondsElapsed);
  }, 1000);
};

const stopTimer = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

const createEmptyBoard = () => Array.from({ length: size }, () => Array(size).fill(""));

const within = (r, c) => r >= 0 && r < size && c >= 0 && c < size;

const canPlace = (word, row, col, dir) => {
  for (let i = 0; i < word.length; i += 1) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    if (!within(r, c)) return false;
    if (board[r][c] && board[r][c] !== word[i]) return false;
  }
  return true;
};

const placeWord = (word) => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (!canPlace(word, row, col, dir)) continue;
    const positions = [];
    for (let i = 0; i < word.length; i += 1) {
      const r = row + dir.dr * i;
      const c = col + dir.dc * i;
      board[r][c] = word[i];
      positions.push({ r, c });
    }
    placedWords.push({ word, positions });
    return true;
  }
  return false;
};

const fillRandomLetters = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!board[r][c]) {
        board[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
};

const renderBoard = () => {
  gridEl.innerHTML = "";
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = board[r][c];
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      cell.addEventListener("mousedown", () => startSelection(r, c));
      cell.addEventListener("mouseenter", () => updateSelection(r, c));
      cell.addEventListener("mouseup", () => endSelection());
      cell.addEventListener("touchstart", (event) => {
        event.preventDefault();
        startSelection(r, c);
      });
      cell.addEventListener("touchmove", (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains("cell")) {
          updateSelection(Number(target.dataset.row), Number(target.dataset.col));
        }
      });
      cell.addEventListener("touchend", () => endSelection());
      gridEl.appendChild(cell);
    }
  }
};

const renderWordList = () => {
  wordListEl.innerHTML = "";
  words.forEach((word) => {
    const item = document.createElement("div");
    item.className = "word";
    item.textContent = word;
    if (foundWords.has(word)) item.classList.add("found");
    wordListEl.appendChild(item);
  });
};

const clearSelection = () => {
  selectedCells.forEach((cell) => cell.classList.remove("selected"));
  selectedCells = [];
};

const startSelection = (r, c) => {
  if (!timer) startTimer();
  selecting = true;
  clearSelection();
  selectCell(r, c);
};

const selectCell = (r, c) => {
  const cell = gridEl.querySelector(`[data-row='${r}'][data-col='${c}']`);
  if (!cell || selectedCells.includes(cell)) return;
  cell.classList.add("selected");
  selectedCells.push(cell);
};

const updateSelection = (r, c) => {
  if (!selecting) return;
  const last = selectedCells[selectedCells.length - 1];
  if (!last) return;
  const lastRow = Number(last.dataset.row);
  const lastCol = Number(last.dataset.col);
  const dr = Math.sign(r - lastRow);
  const dc = Math.sign(c - lastCol);
  if (dr === 0 && dc === 0) return;
  if (Math.abs(r - lastRow) > 1 || Math.abs(c - lastCol) > 1) return;
  selectCell(r, c);
};

const getSelectedWord = () => {
  return selectedCells.map((cell) => cell.textContent).join("");
};

const markFound = (word) => {
  foundWords.add(word);
  selectedCells.forEach((cell) => cell.classList.add("found"));
  renderWordList();
  foundEl.textContent = String(foundWords.size);
  if (foundWords.size === words.length) {
    stopTimer();
  }
};

const endSelection = () => {
  if (!selecting) return;
  selecting = false;
  const selectedWord = getSelectedWord();
  const reversed = selectedWord.split("").reverse().join("");
  const match = words.find((word) => word === selectedWord || word === reversed);
  if (match && !foundWords.has(match)) {
    markFound(match);
  } else {
    selectedCells.forEach((cell) => cell.classList.remove("selected"));
  }
  selectedCells = [];
};

const buildPuzzle = () => {
  board = createEmptyBoard();
  placedWords = [];
  foundWords = new Set();
  words.forEach((word) => placeWord(word));
  fillRandomLetters();
  renderBoard();
  renderWordList();
  foundEl.textContent = "0";
  totalEl.textContent = String(words.length);
  secondsElapsed = 0;
  timeEl.textContent = "00:00";
  stopTimer();
};

const revealHint = () => {
  const remaining = placedWords.filter(({ word }) => !foundWords.has(word));
  if (remaining.length === 0) return;
  const hint = remaining[Math.floor(Math.random() * remaining.length)];
  hint.positions.forEach(({ r, c }) => {
    const cell = gridEl.querySelector(`[data-row='${r}'][data-col='${c}']`);
    if (cell) cell.classList.add("selected");
  });
  setTimeout(() => {
    hint.positions.forEach(({ r, c }) => {
      const cell = gridEl.querySelector(`[data-row='${r}'][data-col='${c}']`);
      if (cell) cell.classList.remove("selected");
    });
  }, 700);
};

newBtn.addEventListener("click", buildPuzzle);
hintBtn.addEventListener("click", revealHint);

buildPuzzle();
