const gameArea = document.getElementById("gameArea");
const menu = document.getElementById("menu");
const hud = document.getElementById("hud");

const timeEl = document.getElementById("time");
const hitsEl = document.getElementById("hits");
const missesEl = document.getElementById("misses");
const scoreEl = document.getElementById("score");

let mode = "practice";
let timeLeft = 60;
let timer = null;
let hits = 0;
let misses = 0;
let score = 0;
let active = false;

function startGame(selectedMode) {
  mode = selectedMode;
  menu.classList.add("hidden");
  hud.classList.remove("hidden");

  hits = 0;
  misses = 0;
  score = 0;
  timeLeft = mode === "test" ? 60 : 0;

  updateHUD();
  active = true;

  spawnTarget();

  if (mode === "test") {
    timer = setInterval(() => {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  } else {
    timeEl.textContent = "∞";
  }
}

function spawnTarget() {
  if (!active) return;

  const target = document.createElement("div");
  target.classList.add("target");

  const size = Math.random() * 30 + 30;
  const x = Math.random() * (window.innerWidth - size);
  const y = Math.random() * (window.innerHeight - size);

  target.style.width = `${size}px`;
  target.style.height = `${size}px`;
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.onclick = (e) => {
    e.stopPropagation();
    hits++;
    score += 10;
    updateHUD();
    target.remove();
    spawnTarget();
  };

  gameArea.appendChild(target);
}

gameArea.addEventListener("click", () => {
  if (!active) return;
  misses++;
  score = Math.max(0, score - 5);
  updateHUD();
});

function updateHUD() {
  hitsEl.textContent = hits;
  missesEl.textContent = misses;
  scoreEl.textContent = score;
}

function endGame() {
  active = false;
  clearInterval(timer);

  document.querySelectorAll(".target").forEach(t => t.remove());
  hud.classList.add("hidden");
  menu.classList.remove("hidden");

  alert(`Game Over!\nHits: ${hits}\nMisses: ${misses}\nScore: ${score}`);
}
