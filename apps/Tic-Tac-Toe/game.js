const cells = Array.from(document.querySelectorAll(".cell"));
const statusEl = document.querySelector(".status");
const scoreX = document.querySelector("[data-score='x']");
const scoreO = document.querySelector("[data-score='o']");
const scoreDraw = document.querySelector("[data-score='draw']");
const newRoundBtn = document.querySelector("[data-action='new-round']");
const resetScoreBtn = document.querySelector("[data-action='reset-score']");

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let scores = { X: 0, O: 0, D: 0 };

const updateStatus = (message) => {
  if (message) {
    statusEl.textContent = message;
    return;
  }
  statusEl.textContent = `Player ${currentPlayer}'s turn`;
};

const renderScores = () => {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.D;
};

const clearBoardStyles = () => {
  cells.forEach((cell) => {
    cell.classList.remove("win");
    cell.removeAttribute("data-player");
  });
};

const resetBoard = () => {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
  });
  clearBoardStyles();
  updateStatus();
};

const resetScores = () => {
  scores = { X: 0, O: 0, D: 0 };
  renderScores();
  resetBoard();
};

const highlightWinner = (combo) => {
  combo.forEach((index) => {
    cells[index].classList.add("win");
  });
};

const checkWinner = () => {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return combo;
    }
  }
  return null;
};

const endRound = (result) => {
  gameActive = false;
  if (result === "draw") {
    scores.D += 1;
    updateStatus("It's a draw!");
  } else {
    scores[result] += 1;
    updateStatus(`Player ${result} wins!`);
  }
  renderScores();
  cells.forEach((cell) => {
    cell.disabled = true;
  });
};

const handleCellClick = (event) => {
  const index = Number(event.currentTarget.dataset.index);
  if (!gameActive || board[index]) return;

  board[index] = currentPlayer;
  event.currentTarget.textContent = currentPlayer;
  event.currentTarget.dataset.player = currentPlayer;

  const winningCombo = checkWinner();
  if (winningCombo) {
    highlightWinner(winningCombo);
    endRound(currentPlayer);
    return;
  }

  if (!board.includes("")) {
    endRound("draw");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus();
};

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

newRoundBtn.addEventListener("click", resetBoard);
resetScoreBtn.addEventListener("click", resetScores);

renderScores();
updateStatus();
