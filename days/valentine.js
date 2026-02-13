const fx = document.getElementById("valFx");
const cta = document.getElementById("valCta");
const hero = document.getElementById("valHero");
const videoWrap = document.getElementById("valVideoWrap");
const video = document.getElementById("valVideo");
const stage = document.getElementById("valStage");
const entry = document.getElementById("valEntry");
const entryPlay = document.getElementById("valEntryPlay");
const musicBtn = document.getElementById("musicBtn");
const bgm = document.getElementById("bgm");

const CELEBRATION_MS = 5600;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function spawnParticle(className, content = "") {
  if (!fx) return;
  const el = document.createElement("span");
  el.className = `valParticle ${className}`;
  if (content) el.textContent = content;
  fx.appendChild(el);
  return el;
}

function launchHearts() {
  const hearts = ["❤", "💗", "💖", "💘"];
  for (let i = 0; i < 40; i += 1) {
    const el = spawnParticle("valParticle--heart", pick(hearts));
    if (!el) continue;
    const fromLeft = i % 2 === 0;
    el.style.left = fromLeft ? "-8%" : "102%";
    el.style.top = `${rand(16, 82)}%`;
    el.style.setProperty("--size", `${rand(16, 28)}px`);
    el.style.setProperty("--dur", `${rand(2300, 3600)}ms`);
    el.style.setProperty("--tx", `${fromLeft ? rand(140, 320) : rand(-320, -140)}px`);
    el.style.setProperty("--ty", `${rand(-80, 80)}px`);
    el.style.setProperty("--rot", `${rand(-40, 40)}deg`);
    el.style.animationDelay = `${rand(0, 2600)}ms`;
    window.setTimeout(() => el.remove(), 5000);
  }
}

function launchStars() {
  const stars = ["✦", "✧", "★"];
  for (let i = 0; i < 36; i += 1) {
    const el = spawnParticle("valParticle--star", pick(stars));
    if (!el) continue;
    el.style.left = `${rand(4, 96)}%`;
    el.style.top = "-10%";
    el.style.setProperty("--size", `${rand(14, 24)}px`);
    el.style.setProperty("--dur", `${rand(2400, 4300)}ms`);
    el.style.setProperty("--tx", `${rand(-40, 40)}px`);
    el.style.setProperty("--ty", `${rand(380, 620)}px`);
    el.style.animationDelay = `${rand(0, 2800)}ms`;
    window.setTimeout(() => el.remove(), 5400);
  }
}

function launchBalloons() {
  const colors = ["#ff5ea8", "#ff7aa7", "#ff9f95", "#ffb1d7", "#ffd9b0"];
  for (let i = 0; i < 24; i += 1) {
    const el = spawnParticle("valParticle--balloon");
    if (!el) continue;
    el.style.left = `${rand(6, 94)}%`;
    el.style.bottom = "-110px";
    el.style.setProperty("--w", `${rand(30, 52)}px`);
    el.style.setProperty("--dur", `${rand(3200, 5200)}ms`);
    el.style.setProperty("--color", pick(colors));
    el.style.setProperty("--tx", `${rand(-34, 34)}px`);
    el.style.setProperty("--rise", `${rand(105, 145)}vh`);
    el.style.animationDelay = `${rand(0, 2200)}ms`;
    window.setTimeout(() => el.remove(), 6400);
  }
}

function launchConfetti() {
  const colors = ["#ffd166", "#ff6ea5", "#8ce99a", "#74c0fc", "#fff3e8"];
  for (let i = 0; i < 170; i += 1) {
    const el = spawnParticle("valParticle--confetti");
    if (!el) continue;
    el.style.left = `${rand(8, 92)}%`;
    el.style.bottom = "-16px";
    el.style.setProperty("--w", `${rand(5, 9)}px`);
    el.style.setProperty("--h", `${rand(10, 18)}px`);
    el.style.setProperty("--dur", `${rand(1700, 2600)}ms`);
    el.style.setProperty("--color", pick(colors));
    el.style.setProperty("--tx", `${rand(-180, 180)}px`);
    el.style.setProperty("--ty", `${rand(-220, -420)}px`);
    el.style.setProperty("--rot", `${rand(140, 460)}deg`);
    el.style.animationDelay = `${rand(0, 800)}ms`;
    window.setTimeout(() => el.remove(), 3800);
  }
}

function startCelebration() {
  launchConfetti();
  launchHearts();
  launchStars();
  launchBalloons();
  window.setTimeout(launchConfetti, 900);
  window.setTimeout(launchHearts, 1300);
  window.setTimeout(launchStars, 1700);
  window.setTimeout(launchBalloons, 2200);

  window.setTimeout(() => {
    cta?.classList.add("is-ready");
  }, CELEBRATION_MS);
}

async function playVideoExperience() {
  await fadeOutAndPauseMusic();
  hero?.classList.add("is-hidden");
  fx?.replaceChildren();
  videoWrap?.classList.add("is-active");
  videoWrap?.setAttribute("aria-hidden", "false");

  if (!video) return;
  try {
    await video.play();
  } catch {
    // Fallback: controls are already visible for manual play.
  }
}

async function playMusic() {
  if (!bgm) return;
  try {
    bgm.volume = 0.5;
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

function toggleMusic() {
  if (!bgm) return;
  if (bgm.paused) {
    playMusic();
  } else {
    bgm.pause();
    musicBtn?.setAttribute("aria-pressed", "false");
    if (musicBtn) {
      musicBtn.textContent = "▶︎ 🎧";
      musicBtn.title = "Play music";
    }
  }
}

function fadeOutAndPauseMusic(durationMs = 900) {
  return new Promise((resolve) => {
    if (!bgm || bgm.paused) {
      resolve();
      return;
    }

    const startVolume = bgm.volume;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / durationMs, 1);
      bgm.volume = startVolume * (1 - t);
      if (t < 1) {
        window.requestAnimationFrame(tick);
      } else {
        bgm.pause();
        bgm.currentTime = 0;
        bgm.volume = startVolume;
        musicBtn?.setAttribute("aria-pressed", "false");
        if (musicBtn) {
          musicBtn.textContent = "▶︎ 🎧";
          musicBtn.title = "Play music";
        }
        resolve();
      }
    };

    window.requestAnimationFrame(tick);
  });
}

function startExperience() {
  stage?.classList.remove("is-locked");
  entry?.classList.add("is-hidden");
  musicBtn?.classList.remove("valMusicHidden");
  startCelebration();
  playMusic();
}

cta?.addEventListener("click", playVideoExperience);
entryPlay?.addEventListener("click", startExperience);
musicBtn?.addEventListener("click", toggleMusic);
