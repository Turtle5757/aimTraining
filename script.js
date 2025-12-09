const gameArea = document.getElementById("gameArea");
const menu = document.getElementById("menu");
const hud = document.getElementById("hud");

const timeEl = document.getElementById("time");
const hitsEl = document.getElementById("hits");
const missesEl = document.getElementById("misses");
const scoreEl = document.getElementById("score");
const accuracyEl = document.getElementById("accuracy");
const levelSelect = document.getElementById("level");

let mode = "practice";
let timeLeft = 30;
let timer = null;
let hits = 0;
let misses = 0;
let score = 0;
let active = false;

let targetMinSize = 40;
let targetMaxSize = 60;
let moveAnimation = null;

const targetsData = new Map(); // store target movement data

function startGame(selectedMode) {
  mode = selectedMode;
  menu.classList.add("hidden");
  hud.classList.remove("hidden");

  hits = 0;
  misses = 0;
  score = 0;

  if (mode === "test") {
    timeLeft = 30;
    timeEl.textContent = timeLeft;
  } else {
    timeLeft = 0;
    timeEl.textContent = "∞";
    setDifficulty();
  }

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
    startSmoothMovement();
  }
}

function setDifficulty() {
  const level = levelSelect.value;
  if (level === "easy") {
    targetMinSize = 50;
    targetMaxSize = 80;
  } else if (level === "medium") {
    targetMinSize = 35;
    targetMaxSize = 60;
  } else {
    targetMinSize = 20;
    targetMaxSize = 40;
  }
}

function spawnTarget() {
  if (!active) return;

  const target = document.createElement("div");
  target.classList.add("target");

  const size = Math.random() * (targetMaxSize - targetMinSize) + targetMinSize;
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
    targetsData.delete(target);
    if (mode === "test") {
      spawnTarget();
    } else {
      spawnTarget(); // ensure endless moving targets
    }
  };

  gameArea.appendChild(target);

  // Add movement data for Practice mode
  if (mode === "practice") {
    const dx = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1);
    const dy = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1);
    targetsData.set(target, { dx, dy });
  }
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

  const total = hits + misses;
  const accuracy = total === 0 ? 100 : Math.round((hits / total) * 100);
  accuracyEl.textContent = accuracy + "%";
}

// --- Smooth Movement ---
function startSmoothMovement() {
  function moveTargets() {
    targetsData.forEach((data, target) => {
      let x = parseFloat(target.style.left);
      let y = parseFloat(target.style.top);
      const size = parseFloat(target.style.width);

      x += data.dx;
      y += data.dy;

      // Bounce off edges
      if (x <= 0 || x + size >= window.innerWidth) data.dx *= -1;
      if (y <= 0 || y + size >= window.innerHeight) data.dy *= -1;

      target.style.left = `${Math.max(0, Math.min(window.innerWidth - size, x))}px`;
      target.style.top = `${Math.max(0, Math.min(window.innerHeight - size, y))}px`;
    });

    if (active) moveAnimation = requestAnimationFrame(moveTargets);
  }

  moveAnimation = requestAnimationFrame(moveTargets);
}

function endGame() {
  active = false;
  clearInterval(timer);
  cancelAnimationFrame(moveAnimation);
  targetsData.clear();

  document.querySelectorAll(".target").forEach((t) => t.remove());
  hud.classList.add("hidden");
  menu.classList.remove("hidden");

  alert(
    `Game Over!\nHits: ${hits}\nMisses: ${misses}\nAccuracy: ${accuracyEl.textContent}\nScore: ${score}`
  );
}
