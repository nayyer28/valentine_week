const LINES = [
  document.getElementById("line1"),
  document.getElementById("line2"),
  document.getElementById("line3"),
  document.getElementById("line4"),
  document.getElementById("line5"),
];

const TOTAL_MS = 25000;
const TOTAL_SECONDS = 25;
const TIMER_START_MS = 1200;

const timerRing = document.getElementById("timerRing");
const timerWrap = document.getElementById("hugOrb");
const timerValue = document.getElementById("timerValue");
const musicBtn = document.getElementById("musicBtn");
const bgm = document.getElementById("bgm");
const playBtn = document.getElementById("hugPlay");
const sequenceWrap = document.getElementById("hugSequence");

const ringLength = timerRing.getTotalLength();
timerRing.style.strokeDasharray = `${ringLength}`;
timerRing.style.strokeDashoffset = `${ringLength}`;

let timerStarted = false;

const schedule = [
  { at: TIMER_START_MS, show: [1], action: startTimer },
  { at: TIMER_START_MS + 8000, show: [2], hide: [1] },
  { at: TIMER_START_MS + 18000, show: [3], hide: [2] },
  { at: TIMER_START_MS + 23000, show: [4], hide: [3] },
];

const activate = (index) => {
  LINES[index]?.classList.add("is-active");
  if (index >= 2) {
    LINES[index].classList.add("emphasis");
  }
};

const deactivate = (index) => {
  LINES[index]?.classList.remove("is-active");
};

function startSequence() {
  if (sequenceWrap) {
    sequenceWrap.classList.add("is-active");
    sequenceWrap.setAttribute("aria-hidden", "false");
  }

  schedule.forEach((step) => {
    window.setTimeout(() => {
      step.hide?.forEach(deactivate);
      step.show?.forEach(activate);
      step.action?.();
    }, step.at);
  });

  window.setTimeout(() => {
    LINES.forEach((line, idx) => {
      if (idx !== 4) {
        line.classList.remove("is-active");
      }
    });
  }, TIMER_START_MS + TOTAL_MS + 800);
}

function startTimer() {
  if (timerStarted) {
    return;
  }
  timerStarted = true;
  timerWrap.classList.add("is-running");

  let lastSecond = TOTAL_SECONDS + 1;
  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / TOTAL_MS, 1);
    const remaining = Math.max(0, Math.ceil(TOTAL_SECONDS - elapsed / 1000));

    timerRing.style.strokeDashoffset = ringLength * (1 - progress);

    if (remaining !== lastSecond && timerValue) {
      lastSecond = remaining;
      timerValue.textContent = String(remaining);
      timerValue.classList.remove("is-animating");
      void timerValue.offsetWidth;
      timerValue.classList.add("is-animating");
    }

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  if (timerValue) {
    timerValue.textContent = String(TOTAL_SECONDS);
    timerValue.classList.add("is-animating");
  }
  window.requestAnimationFrame(tick);
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

musicBtn?.addEventListener("click", toggleMusic);

playBtn?.addEventListener("click", () => {
  playBtn.disabled = true;
  playBtn.classList.add("is-hidden");
  timerWrap.classList.remove("is-hidden");
  playMusic();
  startSequence();
});
