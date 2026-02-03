// assets/app.js
const TZ = "Asia/Kolkata"; // use her time behind the scenes

const DAYS = [
  { key:"rose",      title:"Rose Day",        icon:"🌹", unlock:"2026-02-01T00:00:00", href:"./days/rose.html", hint:"A small surprise is on its way today." },
  { key:"propose",   title:"Propose Day",     icon:"💍", unlock:"2026-02-08T00:00:00", href:"./days/propose.html", hint:"This one needs your full attention." },
  { key:"chocolate", title:"Chocolate Day",   icon:"🍫", unlock:"2026-02-09T00:00:00", href:"./days/chocolate.html", hint:"Sweet, simple, and very you." },
  { key:"teddy",     title:"Teddy Day",       icon:"🧸", unlock:"2026-02-10T00:00:00", href:"./days/teddy.html", hint:"A stand-in for my hugs." },
  { key:"promise",   title:"Promise Day",     icon:"🤞", unlock:"2026-02-11T00:00:00", href:"./days/promise.html", hint:"No drama. Just intent." },
  { key:"hug",       title:"Hug Day",         icon:"🤗", unlock:"2026-02-12T00:00:00", href:"./days/hug.html", hint:"Hold-to-hug. Trust me." },
  { key:"kiss",      title:"Kiss Day",        icon:"💋", unlock:"2026-02-13T00:00:00", href:"./days/kiss.html", hint:"Soft. Not loud." },
  { key:"valentine", title:"Valentine’s Day", icon:"", unlock:"2026-02-14T00:00:00", href:"./days/valentine.html", hint:"The main event." , isValentine:true},
];

// ---- Time helpers (Mumbai time) ----
function nowInTZ() {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(dtf.formatToParts(new Date()).map(p => [p.type, p.value]));
  const iso = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
  return new Date(iso);
}

function parseUnlock(unlockStr) {
  return new Date(unlockStr);
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
function cardTemplate(item, unlocked, countdownText) {
  const key = String(item.key || "").trim();
  const btnClass = unlocked ? "btn unlocked" : "btn locked";
  const btnText = "Click me";
  const backTitle = unlocked ? "It’s open ❤️" : "Not yet";

  const frontEmoji = (key === "valentine")
    ? `<div class="bigEmoji valBeat" aria-hidden="true">❤️</div>`
    : `<div class="bigEmoji" aria-hidden="true">${item.icon}</div>`;

  return `
    <div class="flip ${key}" data-key="${key}" data-href="${item.href}"
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
  const now = nowInTZ();

  DAYS.forEach(item => {
    const unlockAt = parseUnlock(item.unlock);
    const unlocked = now >= unlockAt;

    const el = document.querySelector(`.flip[data-key="${item.key}"]`);
    if (!el) return;

    const countdown = unlocked ? "now" : formatCountdownWithSeconds(unlockAt - now);

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

  const now = nowInTZ();

  container.innerHTML = DAYS.map(item => {
    const unlockAt = parseUnlock(item.unlock);
    const unlocked = now >= unlockAt;
    const countdownText = unlocked ? "now" : formatCountdownWithSeconds(unlockAt - now);
    return cardTemplate(item, unlocked, countdownText);
  }).join("");

  // Attach click behavior once (doesn't get duplicated if we don't re-render repeatedly)
  container.querySelectorAll(".flip").forEach(el => {
    const btn = el.querySelector("a.btn");

    btn.addEventListener("click", (e) => {
      const unlocked = el.getAttribute("data-unlocked") === "1";
      const href = el.getAttribute("data-href");
      const countdown = el.getAttribute("data-countdown");

      if (!unlocked) {
        e.preventDefault();
        alert(`Come back in ${countdown} ❤️`);
      } else {
        // normal navigation via href
      }
    });

    el.addEventListener("click", (e) => {
      if (e.target.closest("a.btn")) return;

      const unlocked = el.getAttribute("data-unlocked") === "1";
      const href = el.getAttribute("data-href");
      const countdown = el.getAttribute("data-countdown");

      if (unlocked) window.location.href = href;
      else alert(`Come back in ${countdown} ❤️`);
    });
  });
}

render();
hydrate();              // immediately sync
setInterval(hydrate, 1000);  // update countdown & button every second without re-rendering
