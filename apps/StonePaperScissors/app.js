const choices = Array.from(document.querySelectorAll(".choice"));
const playerPickEl = document.querySelector("[data-player-pick]");
const cpuPickEl = document.querySelector("[data-cpu-pick]");
const messageEl = document.querySelector("[data-message]");
const playerScoreEl = document.querySelector("[data-score='player']");
const cpuScoreEl = document.querySelector("[data-score='cpu']");
const roundsEl = document.querySelector("[data-rounds]");
const resetBtn = document.querySelector("[data-action='reset']");

const moves = ["stone", "paper", "scissors"];
const labels = {
  stone: "🪨 Stone",
  paper: "📄 Paper",
  scissors: "✂️ Scissors",
};

let scores = { player: 0, cpu: 0 };
let rounds = 0;
let locked = false;

const cpuPick = () => moves[Math.floor(Math.random() * moves.length)];

const getResult = (player, cpu) => {
  if (player === cpu) return "draw";
  if (
    (player === "stone" && cpu === "scissors") ||
    (player === "paper" && cpu === "stone") ||
    (player === "scissors" && cpu === "paper")
  ) {
    return "win";
  }
  return "lose";
};

const updateScores = () => {
  playerScoreEl.textContent = String(scores.player);
  cpuScoreEl.textContent = String(scores.cpu);
  roundsEl.textContent = String(rounds);
};

const setMessage = (text) => {
  messageEl.textContent = text;
};

const handleRound = (playerMove) => {
  if (locked) return;
  locked = true;
  const cpuMove = cpuPick();
  const result = getResult(playerMove, cpuMove);
  rounds += 1;

  playerPickEl.textContent = labels[playerMove];
  cpuPickEl.textContent = labels[cpuMove];

  if (result === "win") {
    scores.player += 1;
    setMessage("You win this round!");
  } else if (result === "lose") {
    scores.cpu += 1;
    setMessage("CPU wins this round.");
  } else {
    setMessage("It's a draw.");
  }

  updateScores();

  if (scores.player === 5 || scores.cpu === 5) {
    setMessage(scores.player === 5 ? "You won the match!" : "CPU won the match.");
    choices.forEach((btn) => btn.setAttribute("disabled", "disabled"));
    locked = false;
    return;
  }

  setTimeout(() => {
    locked = false;
  }, 400);
};

const resetGame = () => {
  scores = { player: 0, cpu: 0 };
  rounds = 0;
  locked = false;
  playerPickEl.textContent = "—";
  cpuPickEl.textContent = "—";
  setMessage("Pick a move to start.");
  updateScores();
  choices.forEach((btn) => btn.removeAttribute("disabled"));
};

choices.forEach((btn) => {
  btn.addEventListener("click", () => handleRound(btn.dataset.move));
});

resetBtn.addEventListener("click", resetGame);

resetGame();
