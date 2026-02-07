const playCore = document.getElementById("playCore");
const orbitFrame = document.getElementById("orbitFrame");
const rings = Array.from(document.querySelectorAll(".orbit .ring"));
const revealOverlay = document.getElementById("revealOverlay");
const ringReveal = document.getElementById("ringReveal");
const ringName = document.getElementById("ringName");
const ringLine = document.getElementById("ringLine");
const ringPreview = document.getElementById("ringPreview");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const answerMsg = document.getElementById("answerMsg");
const playAgain = document.getElementById("playAgain");
const revealSweep = document.querySelector(".revealSweep");
const reactionWrap = document.getElementById("reactionWrap");
const honestBtn = document.getElementById("honestBtn");
const reactionVideoWrap = document.getElementById("reactionVideoWrap");
const reactionGif = document.getElementById("reactionGif");
const reactionVideo = document.getElementById("reactionVideo");
const questionBlock = document.getElementById("questionBlock");
const musicBtn = document.getElementById("musicBtn");
const bgm = document.getElementById("bgm");
const celebrationBgm = document.getElementById("celebrationBgm");

let spinning = false;
let currentRing = null;
let activeTrack = "bgm";

const ringLines = {
  "Classic Solitaire": "Will you be my valentine and my forever Benne companion?",
  "Pavé Band": "Will you be my valentine and put your beautiful head on my shoulder?",
  "Leaf Vine": "Will you be my valentine and my Netflix & chill partner 😉?",
  "Three Stone": "Will you be my valentine and share all your worries and laughter?",
  "Partial Bezel": "Will you be my valentine and my Malkin?",
  "Twisted Rope": "Will you be my valentine and my gandi baaten partner forever?",
  "Knife Edge": "Will you be my valentine and please sit on my face?",
};

function resetRings() {
  rings.forEach((ring) => {
    ring.classList.remove("is-selected", "is-pop");
  });
  answerMsg.textContent = "";
  answerMsg.setAttribute("aria-hidden", "true");
  playAgain.classList.add("is-hidden");
  reactionWrap.classList.add("is-hidden");
  if (questionBlock) questionBlock.classList.remove("is-hidden");
  revealOverlay.classList.remove("is-visible");
  revealOverlay.setAttribute("aria-hidden", "true");
  ringReveal.classList.remove("is-ready");
  currentRing = null;
  if (reactionVideoWrap) reactionVideoWrap.classList.add("is-hidden");
  if (reactionGif) reactionGif.classList.remove("is-hidden");
  if (honestBtn) honestBtn.classList.remove("is-hidden");
  if (reactionVideo) {
    reactionVideo.pause();
    reactionVideo.currentTime = 0;
  }
  if (yesBtn && noBtn) {
    yesBtn.textContent = "Yes";
    noBtn.textContent = "No";
    yesBtn.classList.add("yes");
    yesBtn.classList.remove("no");
    noBtn.classList.add("no");
    noBtn.classList.remove("yes");
  }
  if (celebrationBgm) {
    celebrationBgm.pause();
    celebrationBgm.currentTime = 0;
  }
  activeTrack = "bgm";
  if (musicBtn) {
    musicBtn.setAttribute("aria-pressed", "false");
    musicBtn.textContent = "▶︎ 🎧";
    musicBtn.title = "Play music";
  }
}

function pickRing() {
  const pick = rings[Math.floor(Math.random() * rings.length)];
  rings.forEach((ring) => ring.classList.remove("is-selected", "is-pop"));
  pick.classList.add("is-selected", "is-pop");
  currentRing = pick;

  const name = pick.dataset.name || "Forever";
  if (ringName) ringName.textContent = name;
  if (ringLine) ringLine.textContent = ringLines[name] || "Will you be my valentine and my partner in crime?";

  if (ringPreview) {
    const img = ringPreview.querySelector(".ringPreviewImg");
    const src = pick.querySelector(".ringImg")?.getAttribute("src");
    if (img && src) {
      img.src = src;
      img.alt = `${name} ring preview`;
    }
  }

  revealOverlay.classList.add("is-visible");
  revealOverlay.setAttribute("aria-hidden", "false");
  if (revealSweep) {
    revealSweep.style.animation = "none";
    void revealSweep.offsetHeight;
    revealSweep.style.animation = "";
  }
}

function spinRings() {
  if (spinning) return;
  spinning = true;
  playCore.disabled = true;
  resetRings();
  playMusic();
  orbitFrame.classList.add("is-spinning");

  setTimeout(() => {
    orbitFrame.classList.remove("is-spinning");
    pickRing();
    playCore.disabled = false;
    spinning = false;
  }, 2300);
}

async function playMusic() {
  if (!bgm) return;
  try {
    activeTrack = "bgm";
    bgm.volume = 0.4;
    await bgm.play();
    musicBtn?.setAttribute("aria-pressed", "true");
    if (musicBtn) {
      musicBtn.textContent = "⏸ 🎧";
      musicBtn.title = "Pause music";
    }
  } catch {
    musicBtn?.setAttribute("aria-pressed", "false");
    if (musicBtn) {
      musicBtn.textContent = "▶︎ 🎧";
      musicBtn.title = "Play music";
    }
  }
}

async function playCelebration() {
  if (!celebrationBgm) return;
  try {
    if (bgm) bgm.pause();
    activeTrack = "celebration";
    celebrationBgm.volume = 0.5;
    await celebrationBgm.play();
    musicBtn?.setAttribute("aria-pressed", "true");
    if (musicBtn) {
      musicBtn.textContent = "⏸ 🎧";
      musicBtn.title = "Pause music";
    }
  } catch {
    musicBtn?.setAttribute("aria-pressed", "false");
    if (musicBtn) {
      musicBtn.textContent = "▶︎ 🎧";
      musicBtn.title = "Play music";
    }
  }
}

function toggleMusic() {
  const track = activeTrack === "celebration" ? celebrationBgm : bgm;
  if (!track) return;
  if (track.paused) {
    if (activeTrack === "celebration") playCelebration();
    else playMusic();
  } else {
    track.pause();
    musicBtn?.setAttribute("aria-pressed", "false");
    if (musicBtn) {
      musicBtn.textContent = "▶︎ 🎧";
      musicBtn.title = "Play music";
    }
  }
}

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

function finalizeYes() {
  if (questionBlock) questionBlock.classList.add("is-hidden");
  if (yesBtn) yesBtn.classList.add("is-hidden");
  if (noBtn) noBtn.classList.add("is-hidden");
  if (reactionWrap) reactionWrap.classList.remove("is-hidden");
  answerMsg.textContent = "";
  answerMsg.setAttribute("aria-hidden", "true");
  playAgain.classList.remove("is-hidden");
  confettiBurst({ pieces: 180, ms: 1400 });
  playCelebration();
}

function swapButtons() {
  const yesText = yesBtn.textContent;
  yesBtn.textContent = noBtn.textContent;
  noBtn.textContent = yesText;
  const yesWasYes = yesBtn.classList.contains("yes");
  const noWasYes = noBtn.classList.contains("yes");
  const yesWasNo = yesBtn.classList.contains("no");
  const noWasNo = noBtn.classList.contains("no");
  yesBtn.classList.toggle("yes", noWasYes);
  noBtn.classList.toggle("yes", yesWasYes);
  yesBtn.classList.toggle("no", noWasNo);
  noBtn.classList.toggle("no", yesWasNo);
}

playCore?.addEventListener("click", spinRings);
musicBtn?.addEventListener("click", toggleMusic);

yesBtn?.addEventListener("click", () => {
  finalizeYes();
});

noBtn?.addEventListener("click", () => {
  swapButtons();
  setTimeout(finalizeYes, 250);
});

playAgain?.addEventListener("click", () => {
  resetRings();
  if (yesBtn) yesBtn.classList.remove("is-hidden");
  if (noBtn) noBtn.classList.remove("is-hidden");
});

honestBtn?.addEventListener("click", () => {
  if (reactionGif) reactionGif.classList.add("is-hidden");
  if (honestBtn) honestBtn.classList.add("is-hidden");
  if (reactionVideoWrap) reactionVideoWrap.classList.remove("is-hidden");
  if (reactionVideo) {
    reactionVideo.currentTime = 0;
    reactionVideo.play().catch(() => {});
  }
  if (bgm) bgm.pause();
  if (celebrationBgm) celebrationBgm.pause();
  activeTrack = "bgm";
  if (musicBtn) {
    musicBtn.setAttribute("aria-pressed", "false");
    musicBtn.textContent = "▶︎ 🎧";
    musicBtn.title = "Play music";
  }
});

resetRings();
