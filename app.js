import {
  createTournament,
  getCurrentMatch,
  recordWin,
  advanceMatch
} from "./tournament.js";

let images = [];
let tournament = null;
let currentMatch = null;

const app = document.getElementById("app");

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

  if (!match.right) {
    recordWin(tournament, match.left);
    advanceMatch(tournament);
    showComparison();
    return;
  }

  app.innerHTML = `
    <div class="comparison">
      <div class="images">
        <div id="left" class="choice left">
          <img id="leftImg" src="${match.left.url}" />
        </div>
        <div id="right" class="choice right">
          <img id="rightImg" src="${match.right.url}" />
        </div>
      </div>
    </div>

    <div id="fullscreen" class="fullscreen hidden">
      <img id="fullscreenImg" />
    </div>
  `;

  document.getElementById("left").onclick = () => pick(match.left, match.right);
  document.getElementById("right").onclick = () => pick(match.right, match.left);

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
  app.innerHTML = `
    <div class="screen">
      <h2>Winner</h2>
      <img class="winner" src="${winner.url}" />
      <p>${winner.file.name}</p>
      <button onclick="location.reload()">Start over</button>
    </div>
  `;
}

// ---------------------
// FULLSCREEN IMAGE VIEW
// ---------------------

function openFullscreen(src) {
  const fs = document.getElementById("fullscreen");
  const img = document.getElementById("fullscreenImg");
  img.src = src;
  fs.classList.remove("hidden");

  fs.onclick = closeFullscreen;
  document.addEventListener("keydown", escClose);
}

function closeFullscreen() {
  const fs = document.getElementById("fullscreen");
  fs.classList.add("hidden");
  document.removeEventListener("keydown", escClose);
}

function escClose(e) {
  if (e.key === "Escape") closeFullscreen();
}

// ---------------------
// KEYBOARD VOTING
// ---------------------

document.addEventListener("keydown", (e) => {
  if (!currentMatch) return;

  if (e.key === "ArrowLeft") {
    pick(currentMatch.left, currentMatch.right);
  }

  if (e.key === "ArrowRight") {
    pick(currentMatch.right, currentMatch.left);
  }
});

showLanding();
