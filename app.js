import {
  createTournament,
  getCurrentMatch,
  recordWin,
  advanceMatch
} from "./tournament.js";

let images = [];
let tournament = null;

const app = document.getElementById("app");

function enableZoomAndPan(container, img) {
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isActive = false;

  const MAX_SCALE = 4;
  const PAN_STEP = 40;

  container.addEventListener("mouseenter", () => {
    isActive = true;
  });

  container.addEventListener("mouseleave", () => {
    isActive = false;
  });

  container.addEventListener("wheel", (e) => {
    e.preventDefault();

    const rect = img.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(1, scale * zoomFactor), MAX_SCALE);

    // Adjust translation so zoom happens at cursor
    translateX -= (offsetX - rect.width / 2) * (newScale / scale - 1);
    translateY -= (offsetY - rect.height / 2) * (newScale / scale - 1);

    scale = newScale;
    update();
  });

  window.addEventListener("keydown", (e) => {
    if (!isActive || scale === 1) return;

    switch (e.key) {
      case "ArrowUp":
        translateY += PAN_STEP;
        break;
      case "ArrowDown":
        translateY -= PAN_STEP;
        break;
      case "ArrowLeft":
        translateX += PAN_STEP;
        break;
      case "ArrowRight":
        translateX -= PAN_STEP;
        break;
      default:
        return;
    }

    update();
  });

  function update() {
    img.style.transform = `
      translate(${translateX}px, ${translateY}px)
      scale(${scale})
    `;
  }
}



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

  // Auto-advance byes
  if (!match.right) {
    recordWin(tournament, match.left);
    advanceMatch(tournament);
    showComparison();
    return;
  }

  app.innerHTML = `
    <div class="screen comparison">
      <div class="progress">
        Round ${tournament.round} • Match ${tournament.currentMatchIndex + 1} of ${tournament.matches.length}
      </div>
      <div class="images">
        <div class="choice" id="left">
          <img src="${match.left.url}" />
          <button>Left wins</button>
        </div>
        <div class="choice" id="right">
          <img src="${match.right.url}" />
          <button>Right wins</button>
        </div>
      </div>
    </div>
  `;
const leftContainer = document.getElementById("left");
const rightContainer = document.getElementById("right");

const leftImg = leftContainer.querySelector("img");
const rightImg = rightContainer.querySelector("img");

enableZoomAndPan(leftContainer, leftImg);
enableZoomAndPan(rightContainer, rightImg);

  document.getElementById("left").onclick = () => pick(match.left, match.right);
  document.getElementById("right").onclick = () => pick(match.right, match.left);
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

      <div class="winner-container">
        <img class="winner" src="${winner.url}" />
        <div class="winner-label">${winner.file.name}</div>
      </div>

      <p>This photo won ${winner.history.length} match(es).</p>
      <button onclick="location.reload()">Start over</button>
    </div>
  `;
}


showLanding();
