const board = document.querySelector("[data-board]");
const movesEl = document.querySelector("[data-moves]");
const matchesEl = document.querySelector("[data-matches]");
const timeEl = document.querySelector("[data-time]");
const newBtn = document.querySelector("[data-action='new']");
const hintBtn = document.querySelector("[data-action='hint']");

const symbols = ["🍄", "🎲", "🧩", "🎧", "🛰️", "🚀", "🪐", "🎮"];

let cardValues = [];
let flipped = [];
let locked = false;
let moves = 0;
let matches = 0;
let timer = null;
let secondsElapsed = 0;

const shuffle = (array) => {
  const items = [...array];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

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

const resetStats = () => {
  moves = 0;
  matches = 0;
  secondsElapsed = 0;
  movesEl.textContent = "0";
  matchesEl.textContent = "0";
  timeEl.textContent = "00:00";
};

const createCard = (value, index) => {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";
  card.dataset.value = value;
  card.dataset.index = String(index);

  const front = document.createElement("div");
  front.className = "card-face card-front";
  front.textContent = "?";

  const back = document.createElement("div");
  back.className = "card-face card-back";
  back.textContent = value;

  card.appendChild(front);
  card.appendChild(back);
  card.addEventListener("click", () => handleFlip(card));
  return card;
};

const buildBoard = () => {
  board.innerHTML = "";
  const deck = shuffle([...symbols, ...symbols]);
  cardValues = deck;
  deck.forEach((value, index) => {
    board.appendChild(createCard(value, index));
  });
};

const handleFlip = (card) => {
  if (locked || card.classList.contains("is-flipped") || card.classList.contains("matched")) {
    return;
  }

  if (!timer) startTimer();
  card.classList.add("is-flipped");
  flipped.push(card);

  if (flipped.length === 2) {
    moves += 1;
    movesEl.textContent = String(moves);
    checkMatch();
  }
};

const checkMatch = () => {
  locked = true;
  const [first, second] = flipped;
  const isMatch = first.dataset.value === second.dataset.value;

  if (isMatch) {
    first.classList.add("matched");
    second.classList.add("matched");
    flipped = [];
    matches += 1;
    matchesEl.textContent = String(matches);
    locked = false;

    if (matches === symbols.length) {
      stopTimer();
    }
    return;
  }

  setTimeout(() => {
    first.classList.remove("is-flipped");
    second.classList.remove("is-flipped");
    flipped = [];
    locked = false;
  }, 900);
};

const newGame = () => {
  stopTimer();
  locked = false;
  flipped = [];
  resetStats();
  buildBoard();
};

const revealHint = () => {
  if (locked) return;
  const unmatched = Array.from(board.querySelectorAll(".card")).filter(
    (card) => !card.classList.contains("matched")
  );
  if (unmatched.length < 2) return;
  const preview = unmatched.slice(0, 4);
  preview.forEach((card) => card.classList.add("is-flipped"));
  locked = true;
  setTimeout(() => {
    preview.forEach((card) => card.classList.remove("is-flipped"));
    locked = false;
  }, 700);
};

newBtn.addEventListener("click", newGame);
hintBtn.addEventListener("click", revealHint);

newGame();
