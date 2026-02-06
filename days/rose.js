const ROSE_OPTIONS = [
  {
    name: "Ruby Red",
    file: "ruby-red.png",
    message: "Bold love, steady heart.",
  },
  {
    name: "Blush Pink",
    file: "blush-pink.png",
    message: "Soft strength, always kind.",
  },
  {
    name: "Golden Yellow",
    file: "golden-yellow.png",
    message: "Sunlit joy, warm and bright.",
  },
  {
    name: "Cream Pearl",
    file: "cream-pearl.png",
    message: "Calm presence, gentle glow.",
  },
  {
    name: "Peach Bloom",
    file: "peach-bloom.png",
    message: "Playful heart, easy laughter.",
  },
  {
    name: "Coral Kiss",
    file: "coral-kiss.png",
    message: "Magnetic energy, sparks everywhere.",
  },
  {
    name: "Lavender Mist",
    file: "lavender-mist.png",
    message: "Dreamy soul, soft magic.",
  },
  {
    name: "Burgundy Night",
    file: "burgundy-night.png",
    message: "Deep love, fierce loyalty.",
  },
  {
    name: "Ivory Snow",
    file: "ivory-snow.png",
    message: "Pure heart, endless patience.",
  },
  {
    name: "Sunset Orange",
    file: "sunset-orange.png",
    message: "Radiant charm, fearless smile.",
  },
];

const ASSET_DIR = "../assets/rose-bouquets/";

const els = {
  camShell: document.getElementById("camShell"),
  camera: document.getElementById("camera"),
  fallbackBg: document.getElementById("fallbackBg"),
  roulette: document.getElementById("roulette"),
  rouletteImg: document.getElementById("rouletteImg"),
  bouquet: document.getElementById("bouquet"),
  bouquetImg: document.getElementById("bouquetImg"),
  shutterBtn: document.getElementById("shutterBtn"),
  playBtn: document.getElementById("playBtn"),
  againBtn: document.getElementById("againBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  resultCard: document.getElementById("resultCard"),
  resultTitle: document.getElementById("resultTitle"),
  resultText: document.getElementById("resultText"),
  musicBtn: document.getElementById("musicBtn"),
  bgm: document.getElementById("bgm"),
  introOverlay: document.getElementById("introOverlay"),
  introPlay: document.getElementById("introPlay"),
  modeOverlay: document.getElementById("modeOverlay"),
  modeCamera: document.getElementById("modeCamera"),
  modeStatic: document.getElementById("modeStatic"),
};

let cycleTimer = null;
let cycleIndex = 0;
let locked = true;
let cameraReady = false;
let stream = null;
let hasPlayed = false;
let selectedMode = null;

function confettiBurst(opts = {}) {
  const { pieces = 160, ms = 1400 } = opts;

  let c = document.querySelector("canvas.confetti");
  if (!c) {
    c = document.createElement("canvas");
    c.className = "confetti";
    document.body.appendChild(c);
  }

  const ctx = c.getContext("2d");
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  const resize = () => {
    c.width = Math.floor(window.innerWidth * dpr);
    c.height = Math.floor(window.innerHeight * dpr);
    c.style.width = window.innerWidth + "px";
    c.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const W = window.innerWidth,
    H = window.innerHeight;
  const rand = (a, b) => a + Math.random() * (b - a);

  const ps = [];
  for (let i = 0; i < pieces; i++) {
    ps.push({
      x: rand(0, W),
      y: H + rand(10, 140),
      vx: rand(-1.6, 1.6),
      vy: rand(-10.5, -6.5),
      g: rand(0.12, 0.22),
      w: rand(4, 8),
      h: rand(2, 5),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.25, 0.25),
      life: rand(50, 90),
      color: `hsl(${Math.floor(rand(0, 360))} 90% 65%)`,
    });
  }

  const start = performance.now();
  function tick(t) {
    const dt = t - start;
    ctx.clearRect(0, 0, W, H);

    for (const p of ps) {
      if (p.life <= 0) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.rot += p.vr;
      p.life -= 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (dt < ms) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, W, H);
  }

  requestAnimationFrame(tick);
  window.addEventListener("resize", resize, { once: true });
}

function setBouquet(option) {
  const src = ASSET_DIR + option.file;
  els.rouletteImg.src = src;
  els.bouquetImg.src = src;
}

function setResult(option) {
  els.resultTitle.textContent = option.name + " Rose";
  els.resultText.textContent = option.message;
}

function startCycle() {
  locked = false;
  els.camShell.classList.remove("is-final");
  els.shutterBtn.classList.remove("is-hidden");
  els.againBtn.classList.add("is-hidden");
  els.downloadBtn.classList.add("is-hidden");
  els.playBtn.classList.add("is-hidden");
  cycleTimer = setInterval(() => {
    cycleIndex = (cycleIndex + 1 + Math.floor(Math.random() * 4)) % ROSE_OPTIONS.length;
    setBouquet(ROSE_OPTIONS[cycleIndex]);
  }, 240);
}

function stopCycle() {
  if (locked) return;
  locked = true;
  clearInterval(cycleTimer);
  const finalOption = ROSE_OPTIONS[cycleIndex];
  setResult(finalOption);
  els.camShell.classList.add("is-final");
  els.againBtn.classList.remove("is-hidden");
  els.downloadBtn.classList.remove("is-hidden");
  els.shutterBtn.classList.add("is-hidden");
  try {
    confettiBurst();
  } catch {}
}

async function playMusic() {
  if (!els.bgm) return;
  try {
    els.bgm.volume = 0.35;
    await els.bgm.play();
    els.musicBtn.setAttribute("aria-pressed", "true");
    els.musicBtn.textContent = "⏸ 🎧";
    els.musicBtn.title = "Pause music";
  } catch {
    els.musicBtn.setAttribute("aria-pressed", "false");
    els.musicBtn.textContent = "▶︎ 🎧";
    els.musicBtn.title = "Play music";
  }
}

function toggleMusic() {
  if (!els.bgm) return;
  if (els.bgm.paused) playMusic();
  else {
    els.bgm.pause();
    els.musicBtn.setAttribute("aria-pressed", "false");
    els.musicBtn.textContent = "▶︎ 🎧";
    els.musicBtn.title = "Play music";
  }
}

function addPetals() {
  for (let i = 0; i < 10; i++) {
    const petal = document.createElement("div");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDelay = `${Math.random() * 4}s`;
    petal.style.animationDuration = `${6 + Math.random() * 6}s`;
    els.camShell.appendChild(petal);
  }
}

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    els.camera.srcObject = stream;
    await els.camera.play();
    cameraReady = true;
    els.camShell.classList.add("is-camera");
    return true;
  } catch {
    return false;
  }
}

function shutdownCamera() {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
  stream = null;
  cameraReady = false;
  els.camShell.classList.remove("is-camera");
}

function downloadSnapshot() {
  if (selectedMode === "camera" && !cameraReady) return;
  const shellRect = els.camShell.getBoundingClientRect();
  const bouquetRect = els.bouquet.getBoundingClientRect();
  const videoW = els.camera.videoWidth || 720;
  const videoH = els.camera.videoHeight || 1280;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(shellRect.width);
  canvas.height = Math.round(shellRect.height);
  const ctx = canvas.getContext("2d");

  const targetW = shellRect.width;
  const targetH = shellRect.height;

  if (selectedMode === "camera") {
    const scale = Math.max(targetW / videoW, targetH / videoH);
    const drawW = videoW * scale;
    const drawH = videoH * scale;
    const dx = (targetW - drawW) / 2;
    const dy = (targetH - drawH) / 2;
    ctx.drawImage(els.camera, dx, dy, drawW, drawH);
  } else {
    ctx.fillStyle = "#0f0a14";
    ctx.fillRect(0, 0, targetW, targetH);
  }

  const img = els.bouquetImg;
  if (img && img.complete) {
    const x = bouquetRect.left - shellRect.left;
    const y = bouquetRect.top - shellRect.top;
    const w = bouquetRect.width;
    const h = bouquetRect.height;
    ctx.drawImage(img, x, y, w, h);
  }

  const cardRect = els.resultCard.getBoundingClientRect();
  const cardX = cardRect.left - shellRect.left;
  const cardY = cardRect.top - shellRect.top;
  const cardW = cardRect.width;
  const cardH = cardRect.height;

  const radius = 14;
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + radius, cardY);
  ctx.lineTo(cardX + cardW - radius, cardY);
  ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
  ctx.lineTo(cardX + cardW, cardY + cardH - radius);
  ctx.quadraticCurveTo(
    cardX + cardW,
    cardY + cardH,
    cardX + cardW - radius,
    cardY + cardH,
  );
  ctx.lineTo(cardX + radius, cardY + cardH);
  ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
  ctx.lineTo(cardX, cardY + radius);
  ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const title = els.resultTitle.textContent || "";
  const msg = els.resultText.textContent || "";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(title, cardX + cardW / 2, cardY + cardH * 0.38);
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.font = "500 13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(msg, cardX + cardW / 2, cardY + cardH * 0.68);
  ctx.restore();

  const link = document.createElement("a");
  link.download = "rose-day.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function showIntro() {
  els.introOverlay.classList.remove("is-hidden");
  els.introOverlay.setAttribute("aria-hidden", "false");
}

function showModeSelect() {
  els.modeOverlay.classList.remove("is-hidden");
  els.modeOverlay.setAttribute("aria-hidden", "false");
}

function hideIntro() {
  els.introOverlay.classList.add("is-hidden");
  els.introOverlay.setAttribute("aria-hidden", "true");
}

function hideModeSelect() {
  els.modeOverlay.classList.add("is-hidden");
  els.modeOverlay.setAttribute("aria-hidden", "true");
}

function resetRound() {
  clearInterval(cycleTimer);
  locked = true;
  els.camShell.classList.remove("is-final");
  els.shutterBtn.classList.add("is-hidden");
  els.downloadBtn.classList.add("is-hidden");
  els.againBtn.classList.add("is-hidden");
  els.playBtn.classList.add("is-hidden");
}

function applyMode(mode) {
  selectedMode = mode;
  els.camShell.classList.remove("mode-static");
  if (mode === "static") {
    els.camShell.classList.add("mode-static");
  }
}

async function onReady() {
  setBouquet(ROSE_OPTIONS[0]);
  addPetals();

  els.introPlay.addEventListener("click", () => {
    hideIntro();
    showModeSelect();
  });

  els.modeCamera.addEventListener("click", async () => {
    resetRound();
    applyMode("camera");
    hideModeSelect();
    await setupCamera();
    els.playBtn.classList.remove("is-hidden");
  });

  els.modeStatic.addEventListener("click", () => {
    resetRound();
    shutdownCamera();
    applyMode("static");
    hideModeSelect();
    els.playBtn.classList.remove("is-hidden");
  });

  els.playBtn.addEventListener("click", async () => {
    if (!hasPlayed) {
      await playMusic();
      hasPlayed = true;
    }
    startCycle();
  });

  els.shutterBtn.addEventListener("click", () => {
    stopCycle();
  });

  els.againBtn.addEventListener("click", () => {
    resetRound();
    showModeSelect();
  });

  els.downloadBtn.addEventListener("click", () => {
    downloadSnapshot();
  });

  els.musicBtn.addEventListener("click", toggleMusic);

  resetRound();
  showIntro();
}

onReady();
