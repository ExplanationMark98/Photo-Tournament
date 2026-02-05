import {
  createTournament,
  getCurrentMatch,
  recordWin,
  advanceMatch
} from "./tournament.js";

let images = [];
let tournament = null;
let currentMatch = null;
let winnerShown = false;

const app = document.getElementById("app");

/* =========================
   FULLSCREEN ZOOM FEATURE
========================= */

function openFullscreen(src) {
  const fs = document.getElementById("fullscreen");
  const img = document.getElementById("fullscreenImg");

  img.src = src;
  img.style.transform = "scale(1)";
  img.dataset.scale = "1";

  fs.classList.remove("hidden");

  fs.onclick = closeFullscreen;
  fs.onwheel = zoomFullscreen;
  document.addEventListener("keydown", escClose);
}

function closeFullscreen() {
  const fs = document.getElementById("fullscreen");
  fs.classList.add("hidden");
  fs.onwheel = null;
  document.removeEventListener("keydown", escClose);
}

function escClose(e) {
  if (e.key === "Escape") closeFullscreen();
}

function zoomFullscreen(e) {
  e.preventDefault();

  const img = document.getElementById("fullscreenImg");
  let scale = parseFloat(img.dataset.scale || "1");

  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.min(Math.max(1, scale * zoomFactor), 4);

  img.dataset.scale = scale.toString();
  img.style.transform = `scale(${scale})`;
}

/* =========================
   SCREENS
========================= */

function showLanding() {
  app.innerHTML = `
    <div class="screen">
      <h1>Photo Tournament</h1>
      <p>Upload photos and choose the best one through head-to-head comparisons.</p>
      <button id="startBtn">Start a new photo tournament</button>
    </div>
  `;
  document.getElementById("startBtn").onclick = showUpload;
}

function showUpload() {
  app.innerHTML = `
    <div class="screen">
      <h2>Upload Photos</h2>
      <input type="file" id="fileInput" multiple accept="image/*" />
      <p>Select between 2 and 16 photos</p>
      <button id="beginBtn" disabled>Begin Tournament</button>
    </div>
  `;

  const input = document.getElementById("fileInput");
  const beginBtn = document.getElementById("beginBtn");

  input.onchange = () => {
    images = [...input.files].slice(0, 16).map(file => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      history: []
    }));
    beginBtn.disabled = images.length < 2;
  };

  beginBtn.onclick = () => {
    tournament = createTournament(images);
    showComparison();
  };
}

function showComparison() {
  const match = getCurrentMatch(tournament);
  currentMatch = match;

  if (!match) return;

  if (!match.right) {
    recordWin(tournament, match.left);
    advanceMatch(tournament);
    showComparison();
    return;
  }

  app.innerHTML = `
    <div class="comparison">
      <div class="images">
        <div class="choice left">
          <img id="leftImg" src="${match.left.url}" />
        </div>
        <div class="choice right">
          <img id="rightImg" src="${match.right.url}" />
        </div>
      </div>
    </div>

    <div id="fullscreen" class="fullscreen hidden">
      <img id="fullscreenImg" />
    </div>
  `;

  document.getElementById("leftImg").onclick = (e) => {
    e.stopPropagation();
    openFullscreen(match.left.url);
  };

  document.getElementById("rightImg").onclick = (e) => {
    e.stopPropagation();
    openFullscreen(match.right.url);
  };
}

function pick(winner, loser) {
  recordWin(tournament, winner, loser);
  const result = advanceMatch(tournament);

  if (result === "DONE") {
    showWinner(winner);
  } else {
    showComparison();
  }
}

function showWinner(winner) {
  winnerShown = true;

  app.innerHTML = `
    <div class="screen">
      <h2>Winner</h2>
      <img class="winner" src="${winner.url}" />
      <p>${winner.file.name}</p>
      <button onclick="location.reload()">Start over</button>
    </div>
  `;
}

/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener("keydown", (e) => {
  if (!currentMatch || winnerShown) return;

  const fs = document.getElementById("fullscreen");
  if (fs && !fs.classList.contains("hidden")) return;

  if (e.key === "ArrowLeft") {
    pick(currentMatch.left, currentMatch.right);
  }

  if (e.key === "ArrowRight") {
    pick(currentMatch.right, currentMatch.left);
  }
});

showLanding();
