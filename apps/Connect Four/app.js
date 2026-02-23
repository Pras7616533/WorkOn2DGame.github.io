const boardEl = document.querySelector("[data-board]");
const turnEl = document.querySelector("[data-turn]");
const movesEl = document.querySelector("[data-moves]");
const winnerEl = document.querySelector("[data-winner]");
const resetBtn = document.querySelector("[data-action='reset']");

const rows = 6;
const cols = 7;
let board = [];
let currentPlayer = "red";
let moves = 0;
let winner = null;

const createBoard = () => Array.from({ length: rows }, () => Array(cols).fill(null));

const renderBoard = () => {
  boardEl.innerHTML = "";
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const value = board[row][col];
      if (value) cell.classList.add(value);
      cell.dataset.col = String(col);
      cell.dataset.row = String(row);
      cell.addEventListener("click", () => handleColumnClick(col));
      boardEl.appendChild(cell);
    }
  }
  turnEl.textContent = currentPlayer === "red" ? "Red" : "Yellow";
  turnEl.style.color = currentPlayer === "red" ? "var(--red)" : "var(--yellow)";
  movesEl.textContent = String(moves);
  winnerEl.textContent = winner ? (winner === "red" ? "Red" : "Yellow") : "—";
};

const dropDisc = (col) => {
  for (let row = rows - 1; row >= 0; row -= 1) {
    if (!board[row][col]) {
      board[row][col] = currentPlayer;
      return { row, col };
    }
  }
  return null;
};

const checkLine = (startRow, startCol, dirRow, dirCol) => {
  let count = 0;
  const player = currentPlayer;
  const winningCells = [];
  for (let i = 0; i < 4; i += 1) {
    const r = startRow + dirRow * i;
    const c = startCol + dirCol * i;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    if (board[r][c] !== player) return null;
    winningCells.push({ row: r, col: c });
    count += 1;
  }
  return count === 4 ? winningCells : null;
};

const findWinner = () => {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const directions = [
        { dr: 0, dc: 1 },
        { dr: 1, dc: 0 },
        { dr: 1, dc: 1 },
        { dr: 1, dc: -1 },
      ];
      for (const dir of directions) {
        const win = checkLine(row, col, dir.dr, dir.dc);
        if (win) return win;
      }
    }
  }
  return null;
};

const highlightWin = (cells) => {
  cells.forEach(({ row, col }) => {
    const cell = boardEl.querySelector(`[data-row='${row}'][data-col='${col}']`);
    if (cell) cell.classList.add("winner");
  });
};

const handleColumnClick = (col) => {
  if (winner) return;
  const dropped = dropDisc(col);
  if (!dropped) return;
  moves += 1;

  const winCells = findWinner();
  if (winCells) {
    winner = currentPlayer;
    renderBoard();
    highlightWin(winCells);
    return;
  }

  if (moves === rows * cols) {
    winner = "draw";
    winnerEl.textContent = "Draw";
    return;
  }

  currentPlayer = currentPlayer === "red" ? "yellow" : "red";
  renderBoard();
};

const resetGame = () => {
  board = createBoard();
  currentPlayer = "red";
  moves = 0;
  winner = null;
  renderBoard();
};

resetBtn.addEventListener("click", resetGame);

resetGame();
