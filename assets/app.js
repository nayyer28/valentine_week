const DAYS = [
  {
    key: "rose",
    title: "Rose Day",
    icon: "🌹",
    unlock: "2026-02-07T00:00:00",
    href: "./days/rose.html",
    hint: "A small surprise is on its way today.",
  },
  {
    key: "propose",
    title: "Propose Day",
    icon: "💍",
    unlock: "2026-02-07T00:00:00",
    href: "./days/propose.html",
    hint: "This one needs your full attention.",
  },
  {
    key: "chocolate",
    title: "Chocolate Day",
    icon: "🍫",
    unlock: "2026-02-09T00:00:00",
    href: "./days/chocolate.html",
    hint: "Sweet, simple, and very you.",
  },
  {
    key: "teddy",
    title: "Teddy Day",
    icon: "🧸",
    unlock: "2026-02-10T00:00:00",
    href: "./days/teddy.html",
    hint: "A stand-in for my hugs.",
  },
  {
    key: "promise",
    title: "Promise Day",
    icon: "🤞",
    unlock: "2026-02-11T00:00:00",
    href: "./days/promise.html",
    hint: "No drama. Just intent.",
  },
  {
    key: "hug",
    title: "Hug Day",
    icon: "🤗",
    unlock: "2026-02-12T00:00:00",
    href: "./days/hug.html",
    hint: "Hold-to-hug. Trust me.",
  },
  {
    key: "kiss",
    title: "Kiss Day",
    icon: "💋",
    unlock: "2026-02-13T00:00:00",
    href: "./days/kiss.html",
    hint: "Soft. Not loud.",
  },
  {
    key: "valentine",
    title: "Valentine’s Day",
    icon: "",
    unlock: "2026-02-14T00:00:00",
    href: "./days/valentine.html",
    hint: "The main event.",
    isValentine: true,
  },
];

// ===== Server time (Cloudflare Worker) =====
const TIME_ENDPOINT = "https://valetine-time.nayyersaahil.workers.dev/"; // your worker
let serverOffsetMs = 0; // serverNow - deviceNow

async function syncServerTime() {
  try {
    const res = await fetch(TIME_ENDPOINT, { cache: "no-store" });
    const data = await res.json();
    const serverNowMs = Number(data.nowMs);
    if (!Number.isFinite(serverNowMs)) throw new Error("bad nowMs");
    serverOffsetMs = serverNowMs - Date.now();
  } catch (e) {
    // fallback: device time (still works, just less robust)
    serverOffsetMs = 0;
  }
}

function nowServerMs() {
  return Date.now() + serverOffsetMs;
}

// ===== IST parsing (treat unlock strings as IST local time) =====
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+05:30

function parseUnlockISTtoMs(unlockStr) {
  // unlockStr like "2026-02-12T00:00:00" (intended IST)
  const [datePart, timePart = "00:00:00"] = unlockStr.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);

  // Create a UTC timestamp for the same Y-M-D hh:mm:ss, then subtract IST offset
  // because "2026-02-12 00:00 IST" == "2026-02-11 18:30 UTC"
  const utcMs = Date.UTC(y, m - 1, d, hh || 0, mm || 0, ss || 0);
  return utcMs - IST_OFFSET_MS;
}

function formatCountdownWithSeconds(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) return "now";

  const d = days > 0 ? `${days} day${days === 1 ? "" : "s"}` : "";
  const h = hours > 0 ? `${hours} hour${hours === 1 ? "" : "s"}` : "";
  const m = minutes > 0 ? `${minutes} min` : "";
  const s = `${seconds}s`;

  return [d, h, m, s].filter(Boolean).join(" ");
}

// ---- UI ----
function cardTemplate(item, unlocked, countdownText, visited) {
  const key = String(item.key || "").trim();
  const btnClass = unlocked ? "btn unlocked" : "btn locked";
  const btnText = "Click me";
  const backTitle = unlocked ? `${item.title} ${item.icon || "❤️"}` : "Not yet";

  const frontEmoji =
    key === "valentine"
      ? `<div class="bigEmoji valBeat" aria-hidden="true">❤️</div>`
      : `<div class="bigEmoji" aria-hidden="true">${item.icon}</div>`;

  return `
    <div class="flip ${key} ${visited ? "visited" : ""}" data-key="${key}" data-href="${item.href}"
         data-unlocked="${unlocked ? "1" : "0"}" data-countdown="${countdownText}">
      <div class="flipInner">
        <div class="face front">
          <div class="frontCenter">
            <h2 class="dayTitle">${item.title}</h2>
            ${frontEmoji}
          </div>
        </div>

        <div class="face back">
          <div>
            <h3>${backTitle}</h3>
            <p class="countdown">
              ${unlocked ? "You can open this now." : `Unlocks in <b>${countdownText}</b>`}
            </p>
          </div>
          <div class="ctaRow">
            <a class="${btnClass}" href="${unlocked ? item.href : "#"}" aria-disabled="${unlocked ? "false" : "true"}">
              ${btnText}
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function hydrate() {
  const nowMs = nowServerMs();

  DAYS.forEach((item) => {
    const unlockAtMs = parseUnlockISTtoMs(item.unlock);
    const unlocked = nowMs >= unlockAtMs;

    const el = document.querySelector(`.flip[data-key="${item.key}"]`);
    if (!el) return;

    const countdown = unlocked
      ? "now"
      : formatCountdownWithSeconds(unlockAtMs - nowMs);

    // Update stored state
    el.setAttribute("data-unlocked", unlocked ? "1" : "0");
    el.setAttribute("data-countdown", countdown);

    // Update back face text
    const h3 = el.querySelector(".back h3");
    const cd = el.querySelector(".countdown");
    if (h3) h3.textContent = unlocked ? `${item.title} ${item.icon || "❤️"}` : "Not yet";
    if (cd)
      cd.innerHTML = unlocked
        ? "You can open this now."
        : `Unlocks in <b>${countdown}</b>`;

    // Update button
    const btn = el.querySelector("a.btn");
    if (btn) {
      btn.className = unlocked ? "btn unlocked" : "btn locked";
      btn.setAttribute("aria-disabled", unlocked ? "false" : "true");
      btn.setAttribute("href", unlocked ? item.href : "#");
      btn.textContent = "Click me";
    }
  });
}

function render() {
  const container = document.getElementById("cards");
  if (!container) return;

  const nowMs = nowServerMs();

  container.innerHTML = DAYS.map((item) => {
    const unlockAtMs = parseUnlockISTtoMs(item.unlock);
    const unlocked = nowMs >= unlockAtMs;
    const countdownText = unlocked
      ? "now"
      : formatCountdownWithSeconds(unlockAtMs - nowMs);

    const key = String(item.key || "").trim();
    const visited = localStorage.getItem(`vw:visited:${key}`) === "1";

    return cardTemplate(item, unlocked, countdownText, visited);
  }).join("");

  let openCard = null;

  const closeOpenCard = () => {
    if (openCard) openCard.classList.remove("is-flipped");
    openCard = null;
  };

  // Close when tapping outside
  document.addEventListener("pointerup", (e) => {
    if (!e.target.closest(".flip")) closeOpenCard();
  });

  container.querySelectorAll(".flip").forEach((el) => {
    const btn = el.querySelector("a.btn");
    const key = String(el.getAttribute("data-key") || "").trim();

    const isUnlocked = () => el.getAttribute("data-unlocked") === "1";
    const href = () => el.getAttribute("data-href");
    const countdown = () => el.getAttribute("data-countdown");

    const markVisited = () => {
      if (!key) return;
      localStorage.setItem(`vw:visited:${key}`, "1");
      el.classList.add("visited");
    };

    const flipOpen = () => {
      if (openCard && openCard !== el) openCard.classList.remove("is-flipped");
      el.classList.add("is-flipped");
      openCard = el;
    };

    // Button: locked -> block, unlocked -> allow navigation
    btn.addEventListener("click", (e) => {
      if (!isUnlocked()) {
        e.preventDefault();
        alert(`Come back in ${countdown()} ❤️`);
        return;
      }
      markVisited();
    });

    // Card tap: first tap flips, second tap opens
    el.addEventListener("pointerup", (e) => {
      if (e.target.closest("a.btn")) return;

      const touchLike = window.matchMedia("(hover: none)").matches;

      if (touchLike) {
        e.preventDefault?.();

        if (!el.classList.contains("is-flipped")) {
          flipOpen();
          return;
        }

        if (isUnlocked()) {
          markVisited();
          window.location.href = href();
        } else {
          alert(`Come back in ${countdown()} ❤️`);
        }
      } else {
        if (isUnlocked()) {
          markVisited();
          window.location.href = href();
        } else {
          alert(`Come back in ${countdown()} ❤️`);
        }
      }
    });
  });
}

function setupIntroModal() {
  const overlay = document.getElementById("introOverlay");
  const startBtn = document.getElementById("introStart");
  if (!overlay || !startBtn) return;

  const KEY_SEEN = "vw:introSeenSession";

  const show = () => {
    overlay.classList.remove("is-hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const hide = () => {
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    sessionStorage.setItem(KEY_SEEN, "1");
  };

  // If seen this session, hide silently (NO effects)
  const seenThisSession = sessionStorage.getItem(KEY_SEEN) === "1";
  if (seenThisSession) hide();
  else show();

  // ONLY exit path: Let’s go
  startBtn.addEventListener("click", async () => {
    hide();

    // Effects only here
    try { confettiBurst?.({ pieces: 180, ms: 1400 }); } catch {}
    try { partyBalloons?.({ count: 34, durMin: 2400, durMax: 3900 }); } catch {}
    try { showToast?.("Music on 🎶"); } catch {}

    // Music only here (gesture-safe)
    try {
      if (window.__vw_music && window.__vw_music.wantsMusic?.()) {
        await window.__vw_music.play();
      } else if (window.__vw_music && !window.__vw_music.wantsMusic) {
        // if you ever remove wantsMusic(), still try play
        await window.__vw_music.play();
      }
    } catch {
      // ignore autoplay failures
    }
  });

  // No outside click close, no escape close
}

function setupLandingMusic() {
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");
  if (!audio || !btn) return;

  const KEY = "vw:music:on:session";

  const setUI = (playing) => {
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    btn.textContent = playing ? "⏸ 🎧" : "▶︎ 🎧";
    btn.title = playing ? "Pause music" : "Play music";
  };

  // Default intent: ON, but actual playback might be blocked until a gesture
  const wanted = sessionStorage.getItem(KEY);
  const wantsMusic = wanted === null ? true : wanted === "1";

  // IMPORTANT: start UI as NOT playing until we successfully play.
  setUI(false);

  const play = async () => {
    try {
      // Some browsers require volume to be set after user gesture; keep it simple:
      audio.volume = 0.35;

      await audio.play();
      setUI(true);
      sessionStorage.setItem(KEY, "1");
      return true;
    } catch (e) {
      // Autoplay blocked or failed: keep UI as "play"
      setUI(false);
      sessionStorage.setItem(KEY, "0");
      return false;
    }
  };

  const pause = () => {
    audio.pause();
    setUI(false);
    sessionStorage.setItem(KEY, "0");
  };

  // Toggle button: if currently playing -> pause, else -> play
  btn.addEventListener("click", async () => {
    const isPlaying = !audio.paused && !audio.ended;
    if (isPlaying) pause();
    else await play();
  });

  // Expose for intro modal to start music on "Let's go"
  window.__vw_music = {
    play,
    pause,
    wantsMusic: () => (sessionStorage.getItem(KEY) ?? "1") === "1",
  };

  // If she wants music, we don't autoplay here (mobile blocks).
  // We start it from the intro "Let's go" gesture.
  if (!wantsMusic) {
    // If she previously paused in this session, keep it off.
    setUI(false);
  }
}

function partyBalloons(opts = {}) {
  const { count = 28, durMin = 2600, durMax = 4200 } = opts;

  let layer = document.querySelector(".partyLayer");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "partyLayer";
    document.body.appendChild(layer);
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  const colors = [
    "#ff4fa3",
    "#ff7bbd",
    "#ff3b6a",
    "#ffb3d9",
    "#ff5c8a",
    "#ff8fb3",
    "#ffd1e8",
    "#ff6fb1",
  ];

  for (let i = 0; i < count; i++) {
    const outer = document.createElement("div");
    outer.className = "balloon";

    // spread across screen
    outer.style.left = `${rand(6, 94)}%`;

    // stable rise params
    outer.style.setProperty("--x", `${rand(-10, 10).toFixed(0)}px`);
    outer.style.setProperty("--rise", `${rand(120, 160).toFixed(0)}vh`);
    outer.style.setProperty("--dur", `${rand(durMin, durMax).toFixed(0)}ms`);
    outer.style.setProperty("--delay", `${rand(0, 220).toFixed(0)}ms`);

    const inner = document.createElement("div");
    inner.className = "balloonInner";
    inner.style.setProperty(
      "--color",
      colors[Math.floor(rand(0, colors.length))],
    );

    // depth / variety
    inner.style.setProperty("--s", rand(0.78, 1.22).toFixed(2));
    inner.style.setProperty("--amp", `${rand(10, 22).toFixed(0)}px`);
    inner.style.setProperty("--swayDur", `${rand(900, 1500).toFixed(0)}ms`);

    const string = document.createElement("div");
    string.className = "balloonString";

    inner.appendChild(string);
    outer.appendChild(inner);
    layer.appendChild(outer);

    const total =
      parseFloat(outer.style.getPropertyValue("--dur")) +
      parseFloat(outer.style.getPropertyValue("--delay")) +
      800;

    setTimeout(() => outer.remove(), total);
  }

  // Optional: remove layer later when empty
  setTimeout(() => {
    if (layer && layer.childElementCount === 0) layer.remove();
  }, durMax + 1800);
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

function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1600);
}

async function init() {
  setupIntroModal();
  setupLandingMusic();
  await syncServerTime(); // get server time once
  render(); // render cards once
  hydrate(); // sync immediately
  setInterval(hydrate, 1000); // update countdown every second
  setInterval(syncServerTime, 60_000); // resync server time every minute
}

init();
