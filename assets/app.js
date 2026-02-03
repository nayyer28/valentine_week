const DAYS = [
  { key:"rose",      title:"Rose Day",        icon:"🌹", unlock:"2026-02-01T00:00:00", href:"./days/rose.html", hint:"A small surprise is on its way today." },
  { key:"propose",   title:"Propose Day",     icon:"💍", unlock:"2026-02-01T00:00:00", href:"./days/propose.html", hint:"This one needs your full attention." },
  { key:"chocolate", title:"Chocolate Day",   icon:"🍫", unlock:"2026-02-09T00:00:00", href:"./days/chocolate.html", hint:"Sweet, simple, and very you." },
  { key:"teddy",     title:"Teddy Day",       icon:"🧸", unlock:"2026-02-10T00:00:00", href:"./days/teddy.html", hint:"A stand-in for my hugs." },
  { key:"promise",   title:"Promise Day",     icon:"🤞", unlock:"2026-02-11T00:00:00", href:"./days/promise.html", hint:"No drama. Just intent." },
  { key:"hug",       title:"Hug Day",         icon:"🤗", unlock:"2026-02-12T00:00:00", href:"./days/hug.html", hint:"Hold-to-hug. Trust me." },
  { key:"kiss",      title:"Kiss Day",        icon:"💋", unlock:"2026-02-13T00:00:00", href:"./days/kiss.html", hint:"Soft. Not loud." },
  { key:"valentine", title:"Valentine’s Day", icon:"", unlock:"2026-02-14T00:00:00", href:"./days/valentine.html", hint:"The main event." , isValentine:true},
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
  const backTitle = unlocked ? "It’s open ❤️" : "Not yet";

  const frontEmoji = (key === "valentine")
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

  DAYS.forEach(item => {
    const unlockAtMs = parseUnlockISTtoMs(item.unlock);
    const unlocked = nowMs >= unlockAtMs;

    const el = document.querySelector(`.flip[data-key="${item.key}"]`);
    if (!el) return;

    const countdown = unlocked ? "now" : formatCountdownWithSeconds(unlockAtMs - nowMs);

    // Update stored state
    el.setAttribute("data-unlocked", unlocked ? "1" : "0");
    el.setAttribute("data-countdown", countdown);

    // Update back face text
    const h3 = el.querySelector(".back h3");
    const cd = el.querySelector(".countdown");
    if (h3) h3.textContent = unlocked ? "It’s open ❤️" : "Not yet";
    if (cd) cd.innerHTML = unlocked ? "You can open this now." : `Unlocks in <b>${countdown}</b>`;

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

  container.innerHTML = DAYS.map(item => {
    const unlockAtMs = parseUnlockISTtoMs(item.unlock);
    const unlocked = nowMs >= unlockAtMs;
    const countdownText = unlocked ? "now" : formatCountdownWithSeconds(unlockAtMs - nowMs);

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

  container.querySelectorAll(".flip").forEach(el => {
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



(async function init(){
  await syncServerTime();      // get server time once
  render();                    // render cards once
  hydrate();                   // sync immediately
  setInterval(hydrate, 1000);  // update countdown every second
  setInterval(syncServerTime, 60_000); // resync server time every minute
})();
