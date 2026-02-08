const chocoGrid = document.getElementById("chocoGrid");
const chocolates = [
{ id: 1, name: "Cabdury Silk Box", image: "../assets/chocolates/1.jpeg", link: "" },
  { id: 2, name: "Cabdury Silk Bar", image: "../assets/chocolates/2.jpeg", link: "" },
  { id: 3, name: "KitKat Box", image: "../assets/chocolates/3.jpeg", link: "" },
  { id: 4, name: "Ferrero Rocher", image: "../assets/chocolates/4.jpeg", link: "" },
  { id: 5, name: "Lindt Lindor Box", image: "../assets/chocolates/5.jpeg", link: "" },
  { id: 6, name: "Choko Laka Box", image: "../assets/chocolates/6.jpeg", link: "" },
  { id: 7, name: "Snicker Minis Chocolate", image: "../assets/chocolates/7.jpeg", link: "" },
  { id: 8, name: "Hershey's Kisses", image: "../assets/chocolates/8.jpeg", link: "" },
  { id: 9, name: "Snicker Minis Assorted", image: "../assets/chocolates/9.jpeg", link: "" },
  { id: 10, name: "Hershey's Festive Moments Assorted", image: "../assets/chocolates/10.jpeg", link: "" },
  { id: 11, name: "Fabelle's Valentine's Hearts", image: "../assets/chocolates/11.jpeg", link: "" },
  { id: 12, name: "Fabelle's Elements Pralines", image: "../assets/chocolates/12.jpeg", link: "" },
  { id: 13, name: "Cream Bell Chocolate Ice Cream Cake", image: "../assets/chocolates/13.jpeg", link: "" },
  { id: 14, name: "Cheesecake", image: "../assets/chocolates/14.jpeg", link: "" },
  { id: 15, name: "Chocolate Truffle", image: "../assets/chocolates/15.jpeg", link: "" },
  { id: 16, name: "Fabelle's Open Secret Milk Chocolate", image: "../assets/chocolates/16.jpeg", link: "" },
];

function renderCards() {
  if (!chocoGrid) return;
  chocoGrid.innerHTML = chocolates
    .map(
      (choco) => `
        <button
          class="choco-card"
          type="button"
          data-name="${choco.name}"
          data-image="${choco.image}"
          data-link="${choco.link}"
        >
          <img src="${choco.image}" alt="${choco.name}" loading="lazy" />
          <div class="label">${choco.name}</div>
        </button>
      `,
    )
    .join("");
}

renderCards();

const cards = Array.from(document.querySelectorAll(".choco-card"));
const overlay = document.getElementById("chocoOverlay");
const focusImg = document.getElementById("focusImg");
const focusTitle = document.getElementById("focusTitle");
const focusMessage = document.getElementById("focusMessage");
const finalCelebrate = document.getElementById("finalCelebrate");
const finalGif = document.getElementById("finalGif");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const musicBtn = document.getElementById("musicBtn");
const bgm = document.getElementById("bgm");
const chocoField = document.getElementById("chocoField");
const chocoImage = document.getElementById("chocoImage");
const chocoLink = document.getElementById("chocoLink");
const chocoForm = document.getElementById("chocoForm");

let pendingChoice = null;
const lockKey = "chocolate:final-choice";
const finalMessageText =
  "Happy Chocolate Day, love. Expect this chocolate to be delivered to you sometime today.";
const alreadyChosenText =
  "Babe, you've already selected this chocolate. Expect this to be delivered sometime later today.";

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

  const W = window.innerWidth;
  const H = window.innerHeight;
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

function setOverlayVisible(isVisible) {
  if (!overlay) return;
  overlay.classList.toggle("is-visible", isVisible);
  overlay.setAttribute("aria-hidden", String(!isVisible));
  document.body.classList.toggle("no-scroll", isVisible);
}

function submitChoice({ name, image, link }) {
  if (!chocoForm) return;

  chocoField.value = name;
  chocoImage.value = image;
  chocoLink.value = link || "";

  const data = new FormData(chocoForm);
  data.set("form-name", chocoForm.getAttribute("name"));

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data).toString(),
  })
    .then(() => {})
    .catch(() => {});
}

async function playMusic() {
  if (!bgm) return;
  try {
    bgm.volume = 0.45;
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

function showFinalMessage(text) {
  if (focusMessage) {
    focusMessage.textContent = text;
    focusMessage.classList.remove("is-hidden");
  }
  if (finalCelebrate) finalCelebrate.classList.remove("is-hidden");
  if (finalGif) finalGif.classList.add("is-hidden");
  if (confirmYes) confirmYes.classList.add("is-hidden");
  if (confirmNo) confirmNo.classList.add("is-hidden");
}

function showLockedOverlay() {
  const stored = localStorage.getItem(lockKey);
  if (!stored) return false;
  let choice;
  try {
    choice = JSON.parse(stored);
  } catch {
    return false;
  }
  if (focusImg && choice.image) {
    focusImg.src = choice.image;
    focusImg.alt = choice.name || "Chocolate";
  }
  if (focusTitle) {
    focusTitle.textContent = choice.name || "Chocolate";
  }
  const name = choice.name || "this chocolate";
  showFinalMessage(`Babe, you've already selected ${name}. Expect this to be delivered sometime later today.`);
  setOverlayVisible(true);
  return true;
}

function handlePick(card) {
  if (showLockedOverlay()) return;

  if (bgm?.paused) playMusic();

  const name = card.dataset.name || "Chocolate";
  const image = card.dataset.image || "";
  const link = card.dataset.link || "";

  cards.forEach((item) => item.classList.remove("is-selected"));
  card.classList.add("is-selected");

  if (focusImg) {
    focusImg.src = image;
    focusImg.alt = name;
  }
  if (focusTitle) focusTitle.textContent = name;
  if (focusMessage) focusMessage.classList.add("is-hidden");
  if (finalCelebrate) finalCelebrate.classList.add("is-hidden");
  if (finalGif) finalGif.classList.remove("is-hidden");
  if (confirmYes) confirmYes.classList.remove("is-hidden");
  if (confirmNo) confirmNo.classList.remove("is-hidden");

  setOverlayVisible(true);
  confettiBurst({ pieces: 180, ms: 1400 });
  pendingChoice = { name, image, link };
}

cards.forEach((card) => {
  card.addEventListener("click", () => handlePick(card));
});

confirmNo?.addEventListener("click", () => {
  setOverlayVisible(false);
  pendingChoice = null;
});

confirmYes?.addEventListener("click", () => {
  if (!pendingChoice) return;
  submitChoice(pendingChoice);
  localStorage.setItem(lockKey, JSON.stringify(pendingChoice));
  showFinalMessage(finalMessageText);
});

musicBtn?.addEventListener("click", toggleMusic);

overlay?.addEventListener("click", (event) => {
  if (event.target === overlay) setOverlayVisible(false);
});
