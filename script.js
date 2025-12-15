// --- GAME STATE ---
let p1Score = 0;
let p2Score = 0;
let currentPlayer = 1;
let gameActive = false;
let gameMode = "cpu";
let timerInterval;
let timeLeft = 180; // 3 Minutes

// Stats (Load from Memory if available)
let stats = JSON.parse(localStorage.getItem("hidden20_stats")) || {
  total: 0,
  wins: 0,
  losses: 0,
  draw: 0,
};

// --- SOUNDS ---
const soundClick = document.getElementById("sound-click");
const soundWin = document.getElementById("sound-win");
const soundLose = document.getElementById("sound-lose");

function playSound(type) {
  try {
    if (type === "click") {
      soundClick.currentTime = 0;
      soundClick.play();
    }
    if (type === "win") soundWin.play();
    if (type === "lose") soundLose.play();
  } catch (e) {
    console.log("Sound error");
  }
}

// --- DOM ELEMENTS ---
const p1Card = document.getElementById("p1-card");
const p2Card = document.getElementById("p2-card");
const p1Display = document.getElementById("score-p1");
const p2Display = document.getElementById("score-p2");
const p2NameDisplay = document.getElementById("p2-name");
const logDisplay = document.getElementById("game-log");
const boxes = document.querySelectorAll(".box");
const gameArea = document.getElementById("game-area");
const modeSelection = document.getElementById("mode-selection");

// Load saved stats immediately
updateStatsBoard();

// --- THEME LOGIC (Added this!) 🌙 ---
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

// --- MENU FUNCTIONS ---
function showModeSelection() {
  gameArea.style.display = "none";
  modeSelection.style.display = "block";
  gameActive = false;
  clearInterval(timerInterval);
  // document.body.style.backgroundColor = "#2c3e50"; // Removed to keep Dark Mode working
}

function startGame(mode) {
  gameMode = mode;
  modeSelection.style.display = "none";
  gameArea.style.display = "block";
  p2NameDisplay.innerText = mode === "cpu" ? "🤖 CPU" : "👤 Friend";

  // Reset Game Data
  p1Score = 0;
  p2Score = 0;
  currentPlayer = 1;
  gameActive = true;
  timeLeft = 180;

  updateUI();
  startTimer();
  logDisplay.innerText = "Game Started! Player 1 Turn.";

  // Clear boxes
  boxes.forEach((box) => {
    box.innerText = "";
    box.className = "box";
  });
}

// --- CORE GAMEPLAY ---
function handleClick(index) {
  if (!gameActive) return;
  if (gameMode === "cpu" && currentPlayer === 2) return;

  let box = boxes[index];
  if (box.innerText !== "") return;

  playTurn(box, currentPlayer);
}

function playTurn(box, player) {
  playSound("click");

  let num = Math.floor(Math.random() * 6) + 1;
  box.innerText = num;
  box.classList.add("revealed");

  let message = "";
  let switchTurn = false;

  // LOGIC RULES
  if (num === 3) {
    addScore(player, 3);
    message = `Rolled 3! +3 Points. Play Again!`;
    box.classList.add("num-pos");
  } else if (num === 6) {
    addScore(player, 6);
    message = `Rolled 6! +6 Points. Play Again!`;
    box.classList.add("num-pos");
  } else if (num === 1) {
    addScore(player, 0);
    message = `Rolled 1! No Score. Play Again!`;
    box.classList.add("num-neu");
  }
  // Negative Numbers (With Shake)
  else if (num === 4) {
    addScore(player, -4);
    message = `Rolled 4! -4 Points. Turn Change.`;
    box.classList.add("num-neg", "shake-active");
    switchTurn = true;
  } else if (num === 5) {
    addScore(player, -5);
    message = `Rolled 5! -5 Points. Turn Change.`;
    box.classList.add("num-neg", "shake-active");
    switchTurn = true;
  }
  // The "2" Rule
  else if (num === 2) {
    addScore(1, 1);
    addScore(2, 1);
    message = `Rolled 2! +1 to BOTH. Turn Change.`;
    box.classList.add("num-neu");
    switchTurn = true;
  }

  let playerName = player === 1 ? "P1" : gameMode === "cpu" ? "CPU" : "P2";
  logDisplay.innerText = `${playerName}: ${message}`;

  updateUI();
  checkWin();

  // HIDE BOX
  setTimeout(() => {
    box.innerText = "";
    box.className = "box";

    if (gameActive && switchTurn) {
      togglePlayer();
    } else if (
      gameActive &&
      player === 2 &&
      gameMode === "cpu" &&
      !switchTurn
    ) {
      setTimeout(cpuMove, 1000);
    }
  }, 1000);
}

function addScore(player, amount) {
  if (player === 1) {
    p1Score += amount;
    if (p1Score < 0) p1Score = 0;
  } else {
    p2Score += amount;
    if (p2Score < 0) p2Score = 0;
  }
}

function togglePlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateUI();
  if (currentPlayer === 2 && gameMode === "cpu") {
    setTimeout(cpuMove, 1000);
  }
}

function cpuMove() {
  if (!gameActive) return;
  let randomIndex = Math.floor(Math.random() * 6);
  let box = boxes[randomIndex];
  playTurn(box, 2);
}

// --- WIN LOGIC ---
function checkWin() {
  if (p1Score >= 20) endGame(1);
  else if (p2Score >= 20) endGame(2);
}

function endGame(winner) {
  gameActive = false;
  clearInterval(timerInterval);
  stats.total++;

  if (winner === 1) {
    logDisplay.innerText = "🎉 PLAYER 1 WINS!";
    playSound("win");
    stats.wins++;
    // Use CSS classes for BG changes if needed, avoided hardcoding for Dark Mode compatibility
  } else if (winner === 2) {
    logDisplay.innerText =
      gameMode === "cpu" ? "💀 CPU WINS!" : "🎉 PLAYER 2 WINS!";
    playSound("lose");
    stats.losses++;
  } else {
    logDisplay.innerText = "⏰ TIE GAME!";
    stats.draw++; // Count the Draw!
  }

  saveStats();
  updateStatsBoard();
}

// --- LOCAL STORAGE ---
function saveStats() {
  localStorage.setItem("hidden20_stats", JSON.stringify(stats));
}

function updateStatsBoard() {
  document.getElementById("stat-total").innerText = stats.total;
  document.getElementById("stat-wins").innerText = stats.wins;
  document.getElementById("stat-losses").innerText = stats.losses;
  document.getElementById("stat-draw").innerText = stats.draw;
}

// --- UTILS ---
function updateUI() {
  p1Display.innerText = p1Score;
  p2Display.innerText = p2Score;
  if (currentPlayer === 1) {
    p1Card.classList.add("active");
    p2Card.classList.remove("active");
  } else {
    p1Card.classList.remove("active");
    p2Card.classList.add("active");
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timeLeft--;
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    document.getElementById("timer").innerText = `0${m}:${
      s < 10 ? "0" : ""
    }${s}`;
    if (timeLeft <= 0) endGame(0);
  }, 1000);
}
