const promiseLines = [
  "I promise to always choose us even on the most testing days.",
  "I promise to always keep you in my heart no matter how long the distance be.",
  "I promise to carry your laughs and worries alike and let you be a baby with me.",
  "I promise to grow with you, not away from you.",
  "I promise to keep learning you as you evolve next to me and keep my patience in the difficult chapters.",
  "I promise to always lose all our fights if there ever be any.",
  "I promise you will always find me next to you even if the land beneath us subsides.",
  "I promise to always treat you like my princess and feel about you the same way I did when I first saw you.",
  "I promise to always give you the space to be and breathe and grow into your best self. You have a beautiful heart.",
  "I promise to love you on your good skin days and even more on the bad ones.",
  "I promise to do my best and never give up on us.",
  "I promise that what you say is always right no questions asked.",
  "I promise to be present and always make time for you coz woman you can never ever completely fathom how fucking much I love you",

];


const listEl = document.getElementById("promiseList");
const statusEl = document.getElementById("promiseStatus");
const acceptBtn = document.getElementById("acceptBtn");
const denyBtn = document.getElementById("denyBtn");
const signPad = document.getElementById("signaturePad");
const musicBtn = document.getElementById("musicBtn");
const bgm = document.getElementById("bgm");
const acceptPanel = document.getElementById("acceptPanel");
const denyPanel = document.getElementById("denyPanel");
const rethinkBtn = document.getElementById("rethinkBtn");
const acceptFineBtn = document.getElementById("acceptFineBtn");
const fineGif = document.getElementById("fineGif");
const promptEl = document.getElementById("promisePrompt");
const introOverlay = document.getElementById("introOverlay");
const introStart = document.getElementById("introStart");

const fineText = "You must accept a fine of 1 crore rupees.";
let hasSignature = false;
let finalized = false;

function renderPromises() {
  if (!listEl) return;
  listEl.innerHTML = promiseLines
    .map((line) => `<li class="promiseLine"></li>`)
    .join("");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typePromises() {
  if (!listEl) return;
  const items = Array.from(listEl.querySelectorAll(".promiseLine"));
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const text = promiseLines[i] || "";
    item.classList.add("is-active");
    item.textContent = "";
    for (let c = 0; c < text.length; c += 1) {
      item.textContent += text[c];
      await sleep(120);
    }
    item.classList.remove("is-active");
    await sleep(900);
  }
}

function setStatus(message, isFine = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("fineMsg", isFine);
}

function setPrompt(isVisible) {
  if (!promptEl) return;
  promptEl.classList.toggle("is-hidden", !isVisible);
  promptEl.setAttribute("aria-hidden", String(!isVisible));
}

function setFinalized() {
  finalized = true;
  if (acceptBtn) {
    acceptBtn.disabled = true;
    acceptBtn.classList.add("is-disabled");
  }
  if (denyBtn) {
    denyBtn.disabled = true;
    denyBtn.classList.add("is-disabled");
  }
}

function showPanel(panel) {
  if (acceptPanel) {
    const isAccept = panel === "accept";
    acceptPanel.classList.toggle("is-hidden", !isAccept);
    acceptPanel.setAttribute("aria-hidden", String(!isAccept));
  }
  if (denyPanel) {
    const isDeny = panel === "deny";
    denyPanel.classList.toggle("is-hidden", !isDeny);
    denyPanel.setAttribute("aria-hidden", String(!isDeny));
  }
}


function initSignaturePad() {
  if (!signPad) return;
  const ctx = signPad.getContext("2d");
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    const rect = signPad.getBoundingClientRect();
    signPad.width = rect.width * dpr;
    signPad.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#3b2f2a";
  }

  resize();
  window.addEventListener("resize", resize);

  let drawing = false;

  function pointFromEvent(evt) {
    const rect = signPad.getBoundingClientRect();
    const touch = evt.touches ? evt.touches[0] : null;
    const clientX = touch ? touch.clientX : evt.clientX;
    const clientY = touch ? touch.clientY : evt.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function start(evt) {
    drawing = true;
    const { x, y } = pointFromEvent(evt);
    ctx.beginPath();
    ctx.moveTo(x, y);
    hasSignature = true;
    setPrompt(false);
  }

  function move(evt) {
    if (!drawing) return;
    const { x, y } = pointFromEvent(evt);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    drawing = false;
    ctx.closePath();
  }

  signPad.addEventListener("pointerdown", (evt) => {
    evt.preventDefault();
    start(evt);
  });
  signPad.addEventListener("pointermove", (evt) => {
    evt.preventDefault();
    move(evt);
  });
  signPad.addEventListener("pointerup", end);
  signPad.addEventListener("pointerleave", end);

  if (acceptPanel) acceptPanel.classList.add("is-hidden");
  if (denyPanel) denyPanel.classList.add("is-hidden");
  if (fineGif) fineGif.classList.add("is-hidden");
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

function initActions() {
  if (introStart && introOverlay) {
    introStart.addEventListener("click", () => {
      introOverlay.classList.add("is-hidden");
      introOverlay.setAttribute("aria-hidden", "true");
      playMusic();
      typePromises();
    });
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      if (finalized) return;
      if (!hasSignature) {
        setPrompt(true);
        return;
      }
      //setStatus("Promise accepted. Signature received.");
      showPanel("accept");
      setFinalized();
      if (bgm?.paused) playMusic();
    });
  }

  if (denyBtn) {
    denyBtn.addEventListener("click", () => {
      if (finalized) return;
      setStatus(fineText, true);
      showPanel("deny");
      if (fineGif) fineGif.classList.add("is-hidden");
    });
  }

  if (rethinkBtn) {
    rethinkBtn.addEventListener("click", () => {
      setStatus("");
      setPrompt(false);
      showPanel(null);
    });
  }

  if (acceptFineBtn) {
    acceptFineBtn.addEventListener("click", () => {
      if (finalized) return;
      setStatus(fineText, true);
      showPanel("deny");
      if (fineGif) fineGif.classList.remove("is-hidden");
      setFinalized();
    });
  }

  musicBtn?.addEventListener("click", toggleMusic);

}

renderPromises();
initSignaturePad();
initActions();
