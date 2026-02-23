const chainEl = document.querySelector("[data-chain]");
const messageEl = document.querySelector("[data-message]");
const handRedEl = document.querySelector("[data-hand='red']");
const handBlueEl = document.querySelector("[data-hand='blue']");
const turnEl = document.querySelector("[data-turn]");
const boneyardEl = document.querySelector("[data-boneyard]");
const redLeftEl = document.querySelector("[data-red-left]");
const blueLeftEl = document.querySelector("[data-blue-left]");
const drawBtn = document.querySelector("[data-action='draw']");
const passBtn = document.querySelector("[data-action='pass']");
const resetBtn = document.querySelector("[data-action='reset']");
const choicePanel = document.querySelector("[data-choice]");
const choiceLeft = document.querySelector("[data-choice='left']");
const choiceRight = document.querySelector("[data-choice='right']");

const state = {
  current: "red",
  players: {
    red: { hand: [] },
    blue: { hand: [] },
  },
  boneyard: [],
  chain: [],
  leftValue: null,
  rightValue: null,
  pendingTile: null,
  passes: 0,
  locked: false,
};

const generateTiles = () => {
  const tiles = [];
  let id = 0;
  for (let a = 0; a <= 6; a += 1) {
    for (let b = a; b <= 6; b += 1) {
      tiles.push({ a, b, id: id++ });
    }
  }
  return tiles;
};

const shuffle = (tiles) => {
  const items = [...tiles];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

const createTileElement = (tile, color, hidden = false) => {
  const el = document.createElement("div");
  el.className = `tile ${color || ""}`.trim();
  if (hidden) {
    el.classList.add("back");
    el.innerHTML = "<span class='half'>•</span><span class='half'>•</span>";
    return el;
  }
  const left = document.createElement("span");
  left.className = "half";
  left.textContent = tile.left ?? tile.a;
  const right = document.createElement("span");
  right.className = "half";
  right.textContent = tile.right ?? tile.b;
  el.appendChild(left);
  el.appendChild(right);
  return el;
};

const updateStatus = () => {
  turnEl.textContent = state.current === "red" ? "Red" : "Blue";
  turnEl.style.color = state.current === "red" ? "var(--red)" : "var(--blue)";
  boneyardEl.textContent = String(state.boneyard.length);
  redLeftEl.textContent = String(state.players.red.hand.length);
  blueLeftEl.textContent = String(state.players.blue.hand.length);
};

const setMessage = (text) => {
  messageEl.textContent = text;
};

const renderChain = () => {
  chainEl.innerHTML = "";
  if (state.chain.length === 0) {
    chainEl.innerHTML = "<span class='muted'>No tiles played yet.</span>";
    return;
  }
  state.chain.forEach((tile) => {
    const tileEl = createTileElement(tile);
    chainEl.appendChild(tileEl);
  });
};

const renderHand = (color) => {
  const handEl = color === "red" ? handRedEl : handBlueEl;
  const isCurrent = state.current === color;
  handEl.innerHTML = "";
  state.players[color].hand.forEach((tile) => {
    const tileEl = createTileElement(tile, color, !isCurrent);
    if (isCurrent) {
      tileEl.addEventListener("click", () => handleTileClick(tile.id));
    }
    handEl.appendChild(tileEl);
  });
};

const render = () => {
  updateStatus();
  renderChain();
  renderHand("red");
  renderHand("blue");
};

const dealHands = () => {
  state.players.red.hand = [];
  state.players.blue.hand = [];
  for (let i = 0; i < 7; i += 1) {
    state.players.red.hand.push(state.boneyard.pop());
    state.players.blue.hand.push(state.boneyard.pop());
  }
};

const findOpeningTile = () => {
  const all = [
    ...state.players.red.hand.map((tile, index) => ({ tile, color: "red", index })),
    ...state.players.blue.hand.map((tile, index) => ({ tile, color: "blue", index })),
  ];
  const doubles = all.filter(({ tile }) => tile.a === tile.b);
  if (doubles.length > 0) {
    return doubles.sort((a, b) => b.tile.a - a.tile.a)[0];
  }
  return all.sort((a, b) => (b.tile.a + b.tile.b) - (a.tile.a + a.tile.b))[0];
};

const placeOpeningTile = () => {
  const opener = findOpeningTile();
  if (!opener) return;
  const { tile, color } = opener;
  state.players[color].hand = state.players[color].hand.filter((t) => t.id !== tile.id);
  state.chain = [{ ...tile, left: tile.a, right: tile.b }];
  state.leftValue = tile.a;
  state.rightValue = tile.b;
  state.current = color === "red" ? "blue" : "red";
  setMessage(`${color === "red" ? "Red" : "Blue"} opened with ${tile.a}|${tile.b}.`);
};

const getPlayableSides = (tile) => {
  if (state.chain.length === 0) {
    return { left: true, right: true };
  }
  return {
    left: tile.a === state.leftValue || tile.b === state.leftValue,
    right: tile.a === state.rightValue || tile.b === state.rightValue,
  };
};

const placeTile = (tile, side) => {
  if (state.chain.length === 0) {
    state.chain.push({ ...tile, left: tile.a, right: tile.b });
    state.leftValue = tile.a;
    state.rightValue = tile.b;
    return true;
  }
  if (side === "left") {
    if (tile.a === state.leftValue) {
      state.chain.unshift({ ...tile, left: tile.b, right: tile.a });
      state.leftValue = tile.b;
      return true;
    }
    if (tile.b === state.leftValue) {
      state.chain.unshift({ ...tile, left: tile.a, right: tile.b });
      state.leftValue = tile.a;
      return true;
    }
  }
  if (side === "right") {
    if (tile.a === state.rightValue) {
      state.chain.push({ ...tile, left: tile.a, right: tile.b });
      state.rightValue = tile.b;
      return true;
    }
    if (tile.b === state.rightValue) {
      state.chain.push({ ...tile, left: tile.b, right: tile.a });
      state.rightValue = tile.a;
      return true;
    }
  }
  return false;
};

const removeTileFromHand = (tileId) => {
  state.players[state.current].hand = state.players[state.current].hand.filter((t) => t.id !== tileId);
};

const checkWin = () => {
  if (state.players[state.current].hand.length === 0) {
    setMessage(`${state.current === "red" ? "Red" : "Blue"} wins!`);
    state.locked = true;
    return true;
  }
  return false;
};

const switchTurn = () => {
  state.current = state.current === "red" ? "blue" : "red";
  render();
};

const closeChoice = () => {
  state.pendingTile = null;
  choicePanel.classList.add("hidden");
};

const handleTileClick = (tileId) => {
  if (state.locked) return;
  const tile = state.players[state.current].hand.find((t) => t.id === tileId);
  if (!tile) return;
  const sides = getPlayableSides(tile);
  if (!sides.left && !sides.right) {
    setMessage("That tile doesn't fit. Try another.");
    return;
  }
  if (sides.left && sides.right) {
    state.pendingTile = tile;
    choicePanel.classList.remove("hidden");
    setMessage("Choose left or right for this tile.");
    return;
  }
  const side = sides.left ? "left" : "right";
  if (placeTile(tile, side)) {
    removeTileFromHand(tile.id);
    closeChoice();
    state.passes = 0;
    if (!checkWin()) {
      switchTurn();
      setMessage("Turn switched.");
    }
  }
  render();
};

const handleChoice = (side) => {
  if (!state.pendingTile) return;
  const tile = state.pendingTile;
  if (placeTile(tile, side)) {
    removeTileFromHand(tile.id);
    closeChoice();
    state.passes = 0;
    if (!checkWin()) {
      switchTurn();
      setMessage("Turn switched.");
    }
  }
  render();
};

const canPlayAny = (color) => {
  return state.players[color].hand.some((tile) => {
    const sides = getPlayableSides(tile);
    return sides.left || sides.right;
  });
};

const drawTile = () => {
  if (state.locked) return;
  if (state.boneyard.length === 0) {
    setMessage("Boneyard is empty.");
    return;
  }
  const tile = state.boneyard.pop();
  state.players[state.current].hand.push(tile);
  if (canPlayAny(state.current)) {
    setMessage("You drew a tile. You can play or pass.");
  } else {
    state.passes += 1;
    switchTurn();
    setMessage("No playable tiles. Turn switched.");
  }
  render();
};

const passTurn = () => {
  if (state.locked) return;
  if (canPlayAny(state.current)) {
    setMessage("You still have a playable tile.");
    return;
  }
  state.passes += 1;
  if (state.passes >= 2) {
    setMessage("No moves for both players. It's a draw.");
    state.locked = true;
    render();
    return;
  }
  switchTurn();
  setMessage("Turn passed.");
};

const resetGame = () => {
  state.locked = false;
  state.chain = [];
  state.leftValue = null;
  state.rightValue = null;
  state.pendingTile = null;
  state.passes = 0;
  state.boneyard = shuffle(generateTiles());
  dealHands();
  placeOpeningTile();
  closeChoice();
  render();
};

choiceLeft.addEventListener("click", () => handleChoice("left"));
choiceRight.addEventListener("click", () => handleChoice("right"));
drawBtn.addEventListener("click", drawTile);
passBtn.addEventListener("click", passTurn);
resetBtn.addEventListener("click", resetGame);

resetGame();
