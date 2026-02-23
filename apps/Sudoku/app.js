const boardEl = document.querySelector(".board");
const keypadButtons = document.querySelectorAll(".key");
const difficultyEl = document.querySelector("[data-difficulty]");
const errorsEl = document.querySelector("[data-errors]");
const timerEl = document.querySelector("[data-timer]");
const newBtn = document.querySelector("[data-action='new']");
const resetBtn = document.querySelector("[data-action='reset']");
const checkBtn = document.querySelector("[data-action='check']");
const solveBtn = document.querySelector("[data-action='solve']");

const puzzles = [
  {
    difficulty: "Easy",
    puzzle: [
      0, 0, 0, 2, 6, 0, 7, 0, 1,
      6, 8, 0, 0, 7, 0, 0, 9, 0,
      1, 9, 0, 0, 0, 4, 5, 0, 0,
      8, 2, 0, 1, 0, 0, 0, 4, 0,
      0, 0, 4, 6, 0, 2, 9, 0, 0,
      0, 5, 0, 0, 0, 3, 0, 2, 8,
      0, 0, 9, 3, 0, 0, 0, 7, 4,
      0, 4, 0, 0, 5, 0, 0, 3, 6,
      7, 0, 3, 0, 1, 8, 0, 0, 0,
    ],
    solution: [
      4, 3, 5, 2, 6, 9, 7, 8, 1,
      6, 8, 2, 5, 7, 1, 4, 9, 3,
      1, 9, 7, 8, 3, 4, 5, 6, 2,
      8, 2, 6, 1, 9, 5, 3, 4, 7,
      3, 7, 4, 6, 8, 2, 9, 1, 5,
      9, 5, 1, 7, 4, 3, 6, 2, 8,
      5, 1, 9, 3, 2, 6, 8, 7, 4,
      2, 4, 8, 9, 5, 7, 1, 3, 6,
      7, 6, 3, 4, 1, 8, 2, 5, 9,
    ],
  },
  {
    difficulty: "Medium",
    puzzle: [
      0, 2, 0, 6, 0, 8, 0, 0, 0,
      5, 8, 0, 0, 0, 9, 7, 0, 0,
      0, 0, 0, 0, 4, 0, 0, 0, 0,
      3, 7, 0, 0, 0, 0, 5, 0, 0,
      6, 0, 0, 0, 0, 0, 0, 0, 4,
      0, 0, 8, 0, 0, 0, 0, 1, 3,
      0, 0, 0, 0, 2, 0, 0, 0, 0,
      0, 0, 9, 8, 0, 0, 0, 3, 6,
      0, 0, 0, 3, 0, 6, 0, 9, 0,
    ],
    solution: [
      1, 2, 3, 6, 7, 8, 9, 4, 5,
      5, 8, 4, 2, 3, 9, 7, 6, 1,
      9, 6, 7, 1, 4, 5, 3, 2, 8,
      3, 7, 2, 4, 6, 1, 5, 8, 9,
      6, 9, 1, 5, 8, 3, 2, 7, 4,
      4, 5, 8, 7, 9, 2, 6, 1, 3,
      8, 3, 6, 9, 2, 4, 1, 5, 7,
      2, 1, 9, 8, 5, 7, 4, 3, 6,
      7, 4, 5, 3, 1, 6, 8, 9, 2,
    ],
  },
  {
    difficulty: "Hard",
    puzzle: [
      8, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 3, 6, 0, 0, 0, 0, 0,
      0, 7, 0, 0, 9, 0, 2, 0, 0,
      0, 5, 0, 0, 0, 7, 0, 0, 0,
      0, 0, 0, 0, 4, 5, 7, 0, 0,
      0, 0, 0, 1, 0, 0, 0, 3, 0,
      0, 0, 1, 0, 0, 0, 0, 6, 8,
      0, 0, 8, 5, 0, 0, 0, 1, 0,
      0, 9, 0, 0, 0, 0, 4, 0, 0,
    ],
    solution: [
      8, 1, 2, 7, 5, 3, 6, 4, 9,
      9, 4, 3, 6, 8, 2, 1, 7, 5,
      6, 7, 5, 4, 9, 1, 2, 8, 3,
      1, 5, 4, 2, 3, 7, 8, 9, 6,
      3, 6, 9, 8, 4, 5, 7, 2, 1,
      2, 8, 7, 1, 6, 9, 5, 3, 4,
      5, 2, 1, 9, 7, 4, 3, 6, 8,
      4, 3, 8, 5, 2, 6, 9, 1, 7,
      7, 9, 6, 3, 1, 8, 4, 5, 2,
    ],
  },
];

let currentPuzzleIndex = 0;
let puzzle = [];
let solution = [];
let initial = [];
let selectedIndex = null;
let errors = 0;
let timer = null;
let secondsElapsed = 0;

const formatTime = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

const startTimer = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    secondsElapsed += 1;
    timerEl.textContent = formatTime(secondsElapsed);
  }, 1000);
};

const stopTimer = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

const setErrors = (value) => {
  errors = value;
  errorsEl.textContent = errors;
};

const buildBoard = () => {
  boardEl.innerHTML = "";
  for (let i = 0; i < 81; i += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.index = String(i);

    const row = Math.floor(i / 9);
    const col = i % 9;
    if (col === 2 || col === 5) cell.classList.add("box-divider-right");
    if (row === 2 || row === 5) cell.classList.add("box-divider-bottom");

    cell.addEventListener("click", () => selectCell(i));
    boardEl.appendChild(cell);
  }
};

const renderBoard = () => {
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    const value = puzzle[index];
    cell.textContent = value ? String(value) : "";
    cell.classList.toggle("fixed", initial[index] !== 0);
    cell.classList.toggle("selected", index === selectedIndex);
    cell.classList.remove("error", "same");
    if (selectedIndex !== null && value !== 0 && value === puzzle[selectedIndex]) {
      cell.classList.add("same");
    }
  });
};

const loadPuzzle = (index) => {
  const entry = puzzles[index];
  currentPuzzleIndex = index;
  puzzle = [...entry.puzzle];
  solution = [...entry.solution];
  initial = [...entry.puzzle];
  selectedIndex = null;
  const banner = document.querySelector(".win-banner");
  if (banner) banner.remove();
  secondsElapsed = 0;
  timerEl.textContent = "00:00";
  difficultyEl.textContent = entry.difficulty;
  setErrors(0);
  renderBoard();
  startTimer();
};

const selectCell = (index) => {
  if (initial[index] !== 0) return;
  selectedIndex = index;
  renderBoard();
};

const setCellValue = (value) => {
  if (selectedIndex === null) return;
  if (initial[selectedIndex] !== 0) return;
  puzzle[selectedIndex] = value;
  renderBoard();
  validateCell(selectedIndex);
  checkSolved();
};

const validateCell = (index) => {
  const value = puzzle[index];
  if (value === 0) return;
  if (value !== solution[index]) {
    setErrors(errors + 1);
    const cell = boardEl.querySelector(`.cell[data-index='${index}']`);
    if (cell) {
      cell.classList.add("error");
      setTimeout(() => cell.classList.remove("error"), 500);
    }
  }
};

const checkSolved = () => {
  const solved = puzzle.every((val, idx) => val === solution[idx]);
  if (solved) {
    stopTimer();
    const status = document.createElement("div");
    status.className = "win-banner";
    status.textContent = "Puzzle solved! Great job.";
    status.style.color = "#0f172a";
    status.style.background = "#22c55e";
    status.style.padding = "10px 14px";
    status.style.borderRadius = "12px";
    status.style.marginTop = "16px";
    status.style.fontWeight = "700";
    const intro = document.querySelector(".intro");
    if (intro && !intro.querySelector(".win-banner")) {
      intro.appendChild(status);
    }
  }
};

const checkBoard = () => {
  let mistakes = 0;
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    if (puzzle[index] !== 0 && puzzle[index] !== solution[index]) {
      cell.classList.add("error");
      mistakes += 1;
    } else {
      cell.classList.remove("error");
    }
  });
  setErrors(errors + mistakes);
};

const resetBoard = () => {
  puzzle = [...initial];
  selectedIndex = null;
  renderBoard();
  secondsElapsed = 0;
  timerEl.textContent = "00:00";
  setErrors(0);
  startTimer();
};

const solveBoard = () => {
  puzzle = [...solution];
  renderBoard();
  stopTimer();
};

const cyclePuzzle = () => {
  const nextIndex = (currentPuzzleIndex + 1) % puzzles.length;
  loadPuzzle(nextIndex);
};

const handleKeypadClick = (event) => {
  const button = event.target.closest(".key");
  if (!button) return;
  const value = Number(button.dataset.value);
  setCellValue(value);
};

const handleKeydown = (event) => {
  if (!/^[1-9]$/.test(event.key) && event.key !== "Backspace" && event.key !== "Delete") {
    return;
  }
  event.preventDefault();
  if (event.key === "Backspace" || event.key === "Delete") {
    setCellValue(0);
  } else {
    setCellValue(Number(event.key));
  }
};

buildBoard();
loadPuzzle(0);

keypadButtons.forEach((button) => {
  button.addEventListener("click", handleKeypadClick);
});

newBtn.addEventListener("click", cyclePuzzle);
resetBtn.addEventListener("click", resetBoard);
checkBtn.addEventListener("click", checkBoard);
solveBtn.addEventListener("click", solveBoard);

document.addEventListener("keydown", handleKeydown);
