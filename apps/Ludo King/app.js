const board = document.querySelector(".board");
const trackContainer = document.querySelector("[data-track]");
const homeRed = document.querySelector("[data-home='red']");
const homeBlue = document.querySelector("[data-home='blue']");
const goalRed = document.querySelector("[data-goal='red']");
const goalBlue = document.querySelector("[data-goal='blue']");
const turnEl = document.querySelector("[data-turn]");
const diceEl = document.querySelector("[data-dice]");
const movesEl = document.querySelector("[data-moves]");
const rollBtn = document.querySelector("[data-action='roll']");
const resetBtn = document.querySelector("[data-action='reset']");

const trackPath = [
  { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
  { x: 12, y: 1 }, { x: 12, y: 2 }, { x: 12, y: 3 }, { x: 12, y: 4 }, { x: 12, y: 5 },
  { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 }, { x: 8, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 6 },
  { x: 6, y: 7 }, { x: 6, y: 8 }, { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 },
  { x: 5, y: 12 }, { x: 4, y: 12 }, { x: 3, y: 12 }, { x: 2, y: 12 }, { x: 1, y: 12 }, { x: 0, y: 12 },
  { x: 0, y: 11 }, { x: 0, y: 10 }, { x: 0, y: 9 }, { x: 0, y: 8 }, { x: 0, y: 7 }, { x: 0, y: 6 },
  { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
  { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
];
const totalTrackCells = trackPath.length;
const safeCells = new Set([0, 8, 13, 21, 26, 34, 39, 47].filter((idx) => idx < totalTrackCells));
const startIndex = { red: 0, blue: Math.floor(totalTrackCells / 2) };

const state = {
  currentPlayer: "red",
  dice: 1,
  movesLeft: 0,
  tokens: {
    red: [null, null, null, null],
    blue: [null, null, null, null],
  },
};

const trackCells = [];

const createTrack = () => {
  trackContainer.innerHTML = "";
  trackCells.length = 0;
  const gridSize = 13;
  for (let i = 0; i < gridSize * gridSize; i += 1) {
    const cell = document.createElement("div");
    cell.className = "track-cell";
    trackContainer.appendChild(cell);
  }

  trackPath.forEach((coord, index) => {
    const cell = trackContainer.children[coord.y * gridSize + coord.x];
    if (!cell) return;
    cell.classList.add("path");
    if (safeCells.has(index)) cell.classList.add("safe");
    trackCells.push(cell);
  });
};

const renderHomes = () => {
  homeRed.innerHTML = "";
  homeBlue.innerHTML = "";
  for (let i = 0; i < 4; i += 1) {
    const slotRed = document.createElement("div");
    slotRed.className = "token-slot";
    homeRed.appendChild(slotRed);
    const slotBlue = document.createElement("div");
    slotBlue.className = "token-slot";
    homeBlue.appendChild(slotBlue);
  }
};

const createToken = (color, index) => {
  const token = document.createElement("div");
  token.className = `token ${color}`;
  token.textContent = index + 1;
  token.dataset.color = color;
  token.dataset.index = String(index);
  token.addEventListener("click", () => handleTokenClick(color, index));
  board.appendChild(token);
  return token;
};

const resetTokens = () => {
  document.querySelectorAll(".token").forEach((token) => token.remove());
  state.tokens.red = [null, null, null, null];
  state.tokens.blue = [null, null, null, null];

  for (let i = 0; i < 4; i += 1) {
    state.tokens.red[i] = {
      position: null,
      element: createToken("red", i),
    };
    state.tokens.blue[i] = {
      position: null,
      element: createToken("blue", i),
    };
  }
};

const getHomeSlotPosition = (color, index) => {
  const home = color === "red" ? homeRed : homeBlue;
  const slot = home.querySelectorAll(".token-slot")[index];
  const rect = slot.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  return {
    left: rect.left - boardRect.left + rect.width / 2,
    top: rect.top - boardRect.top + rect.height / 2,
  };
};

const getTrackPosition = (index) => {
  const cell = trackCells[index];
  const rect = cell.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  return {
    left: rect.left - boardRect.left + rect.width / 2,
    top: rect.top - boardRect.top + rect.height / 2,
  };
};

const getGoalPosition = (color, index) => {
  const goal = color === "red" ? goalRed : goalBlue;
  const rect = goal.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  const offsets = [
    { x: -0.18, y: -0.18 },
    { x: 0.18, y: -0.18 },
    { x: -0.18, y: 0.18 },
    { x: 0.18, y: 0.18 },
  ];
  const offset = offsets[index % offsets.length];
  return {
    left: rect.left - boardRect.left + rect.width / 2 + offset.x * rect.width,
    top: rect.top - boardRect.top + rect.height / 2 + offset.y * rect.height,
  };
};

const getTrackIndex = (color, position) => {
  return (startIndex[color] + position) % totalTrackCells;
};

const positionTokens = () => {
  ["red", "blue"].forEach((color) => {
    state.tokens[color].forEach((token, index) => {
      if (!token) return;
      let position;
      if (token.position === null) {
        position = getHomeSlotPosition(color, index);
      } else if (token.position >= totalTrackCells) {
        position = getGoalPosition(color, index);
      } else {
        position = getTrackPosition(getTrackIndex(color, token.position));
      }
      token.element.style.left = `${position.left}px`;
      token.element.style.top = `${position.top}px`;
    });
  });
};

const rollDice = () => {
  if (state.movesLeft > 0) return;
  const roll = Math.floor(Math.random() * 6) + 1;
  state.dice = roll;
  state.movesLeft = roll;
  updateStatus();
  const canMove = state.tokens[state.currentPlayer].some((token) => canMoveToken(token));
  if (!canMove) {
    state.movesLeft = 0;
    updateStatus();
    setTimeout(() => {
      switchTurn();
    }, 500);
    return;
  }
  highlightMoves();
};

const switchTurn = () => {
  state.currentPlayer = state.currentPlayer === "red" ? "blue" : "red";
  state.movesLeft = 0;
  updateStatus();
  clearHighlights();
};

const updateStatus = () => {
  turnEl.textContent = state.currentPlayer === "red" ? "Red" : "Blue";
  turnEl.style.color = state.currentPlayer === "red" ? "var(--red)" : "var(--blue)";
  diceEl.textContent = String(state.dice);
  movesEl.textContent = String(state.movesLeft);
};

const clearHighlights = () => {
  document.querySelectorAll(".token").forEach((token) => token.classList.remove("highlight"));
};

const canMoveToken = (token) => {
  if (state.movesLeft === 0) return false;
  if (token.position === null) {
    return state.dice === 6;
  }
  if (token.position >= totalTrackCells) return false;
  return token.position + state.movesLeft <= totalTrackCells;
};

const highlightMoves = () => {
  clearHighlights();
  const playerTokens = state.tokens[state.currentPlayer];
  playerTokens.forEach((token) => {
    if (canMoveToken(token)) {
      token.element.classList.add("highlight");
    }
  });
};

const handleTokenClick = (color, index) => {
  if (color !== state.currentPlayer) return;
  const token = state.tokens[color][index];
  if (!canMoveToken(token)) return;

  if (token.position === null) {
    token.position = 0;
  } else {
    token.position += state.movesLeft;
  }

  const trackIndex = token.position < totalTrackCells ? getTrackIndex(color, token.position) : null;
  captureTokens(trackIndex, color);
  positionTokens();

  state.movesLeft = 0;
  updateStatus();
  clearHighlights();

  if (token.position >= totalTrackCells) {
    checkWinner(color);
  }

  if (state.dice !== 6) {
    switchTurn();
  }
};

const captureTokens = (trackIndex, color) => {
  if (trackIndex === null) return;
  if (safeCells.has(trackIndex)) return;
  const opponent = color === "red" ? "blue" : "red";
  state.tokens[opponent].forEach((token) => {
    if (token.position !== null && token.position < totalTrackCells) {
      const opponentTrack = getTrackIndex(opponent, token.position);
      if (opponentTrack === trackIndex) {
        token.position = null;
      }
    }
  });
};

const checkWinner = (color) => {
  const finished = state.tokens[color].every(
    (token) => token.position !== null && token.position >= totalTrackCells
  );
  if (finished) {
    alert(`${color === "red" ? "Red" : "Blue"} wins!`);
    resetGame();
  }
};

const resetGame = () => {
  state.currentPlayer = "red";
  state.dice = 1;
  state.movesLeft = 0;
  updateStatus();
  clearHighlights();
  resetTokens();
  positionTokens();
};

createTrack();
renderHomes();
resetTokens();

window.addEventListener("resize", () => {
  positionTokens();
});

rollBtn.addEventListener("click", rollDice);
resetBtn.addEventListener("click", resetGame);

positionTokens();
updateStatus();
