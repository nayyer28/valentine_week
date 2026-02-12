const playBtn = document.getElementById("kissPlay");
const intro = document.getElementById("kissIntro");
const deckWrap = document.getElementById("kissDeckWrap");
const deck = document.getElementById("kissDeck");
const slides = Array.from(document.querySelectorAll(".kissSlide"));
const dots = Array.from(document.querySelectorAll(".kissDot"));
const musicBtn = document.getElementById("musicBtn");
const bgm = document.getElementById("bgm");

let hasStarted = false;
let activeIndex = 0;
let settleTimer = null;
let revealTimer = null;

function prepareTextSlides() {
  slides.forEach((slide) => {
    if (!slide.classList.contains("kissSlide--text")) return;
    const textEl = slide.querySelector("p");
    if (!textEl) return;
    const words = (textEl.textContent || "").trim().split(/\s+/).filter(Boolean);
    textEl.innerHTML = words
      .map((word, index) => `<span class="kissWord" style="--word-index:${index}">${word}</span>`)
      .join(" ");
  });
}

function setActiveDot(index) {
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

function setCurrentSlide(index) {
  slides.forEach((slide, slideIndex) => {
    const isCurrent = slideIndex === index;
    slide.classList.toggle("is-current", isCurrent);
    slide.classList.remove("is-revealing");
    if (isCurrent && slide.classList.contains("kissSlide--text")) {
      // Force reflow so word-by-word reveal restarts on each visit.
      void slide.offsetWidth;
      slide.classList.add("is-revealing");
    }
  });
}

function clearCurrentSlide() {
  slides.forEach((slide) => {
    slide.classList.remove("is-current");
    slide.classList.remove("is-revealing");
  });
}

function scheduleReveal(index) {
  if (revealTimer) {
    window.clearTimeout(revealTimer);
  }
  revealTimer = window.setTimeout(() => {
    setCurrentSlide(index);
  }, 110);
}

function clampIndex(index) {
  return Math.max(0, Math.min(index, slides.length - 1));
}

function getCurrentIndex() {
  if (!deck || deck.clientWidth === 0) return activeIndex;
  return clampIndex(Math.round(deck.scrollLeft / deck.clientWidth));
}

function goToIndex(index) {
  if (!deck) return;
  const nextIndex = clampIndex(index);
  activeIndex = nextIndex;
  deck.scrollTo({
    left: nextIndex * deck.clientWidth,
    behavior: "smooth",
  });
  setActiveDot(nextIndex);
}

function handleDeckScroll() {
  const index = getCurrentIndex();
  activeIndex = index;
  setActiveDot(index);
  clearCurrentSlide();

  if (settleTimer) {
    window.clearTimeout(settleTimer);
  }
  settleTimer = window.setTimeout(() => {
    const settledIndex = getCurrentIndex();
    activeIndex = settledIndex;
    setActiveDot(settledIndex);
    scheduleReveal(settledIndex);

    if (settledIndex === slides.length - 1) {
      localStorage.setItem("done:kiss", "1");
    }
  }, 160);
}

function handleDeckClick(event) {
  if (!hasStarted || !deck) return;
  const rect = deck.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const midpoint = rect.width / 2;
  const current = getCurrentIndex();

  if (clickX >= midpoint) {
    goToIndex(current + 1);
  } else {
    goToIndex(current - 1);
  }
}

function startExperience() {
  if (hasStarted) return;
  hasStarted = true;

  intro?.classList.add("is-hidden");
  deckWrap?.classList.add("is-active");
  deckWrap?.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    intro?.setAttribute("aria-hidden", "true");
  }, 450);

  clearCurrentSlide();
  scheduleReveal(0);
  handleDeckScroll();
  playMusic();
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

playBtn?.addEventListener("click", startExperience);
deck?.addEventListener("scroll", handleDeckScroll, { passive: true });
deck?.addEventListener("click", handleDeckClick);
musicBtn?.addEventListener("click", toggleMusic);
prepareTextSlides();
