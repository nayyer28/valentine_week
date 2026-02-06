const TIME_ENDPOINT = "https://valetine-time.nayyersaahil.workers.dev/";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
let serverOffsetMs = 0;

async function syncServerTime() {
  try {
    const res = await fetch(TIME_ENDPOINT, { cache: "no-store" });
    const data = await res.json();
    const serverNowMs = Number(data.nowMs);
    if (!Number.isFinite(serverNowMs)) throw new Error("bad nowMs");
    serverOffsetMs = serverNowMs - Date.now();
  } catch {
    serverOffsetMs = 0;
  }
}

function nowServerMs() {
  return Date.now() + serverOffsetMs;
}

function parseUnlockISTtoMs(unlockStr) {
  const [datePart, timePart = "00:00:00"] = unlockStr.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);
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

function ensureOverlay() {
  let overlay = document.getElementById("unlockOverlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "unlockOverlay";
  overlay.className = "unlockOverlay";
  overlay.innerHTML = `
    <div class="unlockCard">
      <img class="unlockGif" src="https://media.tenor.com/_lHZNadvdpwAAAAi/%E0%A4%A0%E0%A4%B9%E0%A4%B0%E0%A4%9C%E0%A4%BE%E0%A4%AD%E0%A4%BE%E0%A4%88-%E0%A4%A5%E0%A5%8B%E0%A4%A1%E0%A4%BC%E0%A4%BE%E0%A4%B8%E0%A4%AC%E0%A5%8D%E0%A4%B0%E0%A4%95%E0%A4%B0%E0%A5%8B.gif" alt="Please wait"/>
      <p class="unlockMsg">Unlocks in <span id="unlockCountdown">...</span></p>
    </div>
  `;
  document.body.appendChild(overlay);

  const style = document.createElement("style");
  style.textContent = `
    .unlockOverlay{
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(0,0,0,.55);
      backdrop-filter: blur(10px);
      z-index: 10002;
    }
    .unlockOverlay.is-hidden{ display:none; }
    .unlockCard{
      width: min(520px, 92vw);
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,.16);
      background: rgba(0,0,0,.55);
      box-shadow: 0 30px 90px rgba(0,0,0,.55);
      padding: 18px;
      text-align: center;
      color: #fff;
      display: grid;
      gap: 10px;
      justify-items: center;
    }
    .unlockGif{
      width: min(180px, 60vw);
      height: auto;
      display: block;
    }
    .unlockMsg{ margin: 0; color: rgba(255,255,255,.85); }
  `;
  document.head.appendChild(style);

  return overlay;
}

async function initUnlockGate() {
  const unlockStr = document.body.getAttribute("data-unlock");
  if (!unlockStr) return;

  const key = document.body.getAttribute("data-key");
  const overlay = ensureOverlay();
  const cd = overlay.querySelector("#unlockCountdown");
  const unlockAtMs = parseUnlockISTtoMs(unlockStr);

  await syncServerTime();

  const tick = () => {
    const nowMs = nowServerMs();
    const remaining = unlockAtMs - nowMs;
    if (remaining <= 0) {
      overlay.classList.add("is-hidden");
      if (key) localStorage.setItem(`vw:visited:${key}`, "1");
      return;
    }
    if (cd) cd.textContent = formatCountdownWithSeconds(remaining);
  };

  tick();
  setInterval(tick, 1000);
  setInterval(syncServerTime, 60_000);
}

initUnlockGate();
