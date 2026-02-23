const gridEl = document.querySelector("[data-grid]");
const markersEl = document.querySelector("[data-markers]");
const turnEl = document.querySelector("[data-turn]");
const diceEl = document.querySelector("[data-dice]");
const movesEl = document.querySelector("[data-moves]");
const rollBtn = document.querySelector("[data-action='roll']");
const resetBtn = document.querySelector("[data-action='reset']");

const boardSize = 10;
const lastCell = boardSize * boardSize;
const ladders = {
  3: 22,
  5: 8,
  11: 26,
  20: 29,
  27: 56,
  36: 44,
  51: 67,
  71: 92,
  80: 99,
};
const snakes = {
  17: 4,
  19: 7,
  21: 9,
  43: 34,
  49: 30,
  62: 19,
  74: 53,
  87: 24,
  95: 75,
  98: 79,
};

const state = {
  currentPlayer: "red",
  dice: 1,
  movesLeft: 0,
  positions: {
    red: 1,
    blue: 1,
  },
};

const buildGrid = () => {
  gridEl.innerHTML = "";
  for (let row = boardSize; row >= 1; row -= 1) {
    const isReverse = row % 2 === 0;
    for (let col = 1; col <= boardSize; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const value = (row - 1) * boardSize + (isReverse ? boardSize - col + 1 : col);
      cell.dataset.cell = String(value);
      cell.textContent = value;
      gridEl.appendChild(cell);
    }
  }
};

const getCellCenter = (value) => {
  const cell = gridEl.querySelector(`[data-cell='${value}']`);
  const rect = cell.getBoundingClientRect();
  const boardRect = gridEl.getBoundingClientRect();
  return {
    left: rect.left - boardRect.left + rect.width / 2,
    top: rect.top - boardRect.top + rect.height / 2,
  };
};

const createToken = (color) => {
  const token = document.createElement("div");
  token.className = `token ${color}`;
  token.textContent = color === "red" ? "R" : "B";
  markersEl.appendChild(token);
  return token;
};

const tokens = {
  red: createToken("red"),
  blue: createToken("blue"),
};

const positionTokens = () => {
  ["red", "blue"].forEach((color) => {
    const position = state.positions[color];
    const center = getCellCenter(position);
    tokens[color].style.left = `${center.left}px`;
    tokens[color].style.top = `${center.top}px`;
  });
};

const renderMarkers = () => {
  markersEl.innerHTML = "";
  Object.entries(ladders).forEach(([start, end]) => {
    const marker = document.createElement("div");
    marker.className = "marker ladder";
    marker.textContent = `${start} ⇧ ${end}`;
    const center = getCellCenter(Number(start));
    marker.style.left = `${center.left}px`;
    marker.style.top = `${center.top}px`;
    markersEl.appendChild(marker);
  });

  Object.entries(snakes).forEach(([start, end]) => {
    const marker = document.createElement("div");
    marker.className = "marker snake";
    marker.textContent = `${start} ⇩ ${end}`;
    const center = getCellCenter(Number(start));
    marker.style.left = `${center.left}px`;
    marker.style.top = `${center.top}px`;
    markersEl.appendChild(marker);
  });

  markersEl.appendChild(tokens.red);
  markersEl.appendChild(tokens.blue);
};

const updateStatus = () => {
  turnEl.textContent = state.currentPlayer === "red" ? "Red" : "Blue";
  turnEl.style.color = state.currentPlayer === "red" ? "var(--red)" : "var(--blue)";
  diceEl.textContent = String(state.dice);
  movesEl.textContent = String(state.movesLeft);
};

const rollDice = () => {
  if (state.movesLeft > 0) return;
  state.dice = Math.floor(Math.random() * 6) + 1;
  state.movesLeft = state.dice;
  updateStatus();
  moveToken();
};

const moveToken = () => {
  const color = state.currentPlayer;
  let position = state.positions[color] + state.movesLeft;
  if (position > lastCell) {
    position = lastCell;
  }
  state.movesLeft = 0;

  if (ladders[position]) {
    position = ladders[position];
  } else if (snakes[position]) {
    position = snakes[position];
  }

  state.positions[color] = position;
  positionTokens();

  if (position === lastCell) {
    setTimeout(() => {
      alert(`${color === "red" ? "Red" : "Blue"} wins!`);
      resetGame();
    }, 200);
    return;
  }

  if (state.dice !== 6) {
    state.currentPlayer = state.currentPlayer === "red" ? "blue" : "red";
  }
  updateStatus();
};

const resetGame = () => {
  state.currentPlayer = "red";
  state.dice = 1;
  state.movesLeft = 0;
  state.positions.red = 1;
  state.positions.blue = 1;
  updateStatus();
  positionTokens();
};

buildGrid();
renderMarkers();
positionTokens();
updateStatus();

window.addEventListener("resize", () => {
  positionTokens();
  renderMarkers();
});

rollBtn.addEventListener("click", rollDice);
resetBtn.addEventListener("click", resetGame);
