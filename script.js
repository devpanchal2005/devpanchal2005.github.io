document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  // ==============================
  // SECTION REVEAL
  // ==============================
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // ==============================
  // NAV HIGHLIGHT ON SCROLL (sliding pill)
  // ==============================
  const pill = document.querySelector(".nav-pill");
  const navLinks = document.querySelectorAll(".nav a");
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function movePill(link) {
    if (!pill) return;
    if (!link) {
      pill.classList.remove("on");
      return;
    }
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.setProperty("--pill-x", `${link.offsetLeft}px`);
    pill.classList.add("on");
  }

  let currentId = undefined;

  function setActive() {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    const y = window.scrollY + window.innerHeight * 0.4;
    let current = null;
    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section.id;
    });
    if (atBottom && sections.length) current = sections[sections.length - 1].id;
    if (current === currentId) return;
    currentId = current;
    let activeLink = null;
    navLinks.forEach((link) => {
      const on = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("active", on);
      if (on) activeLink = link;
    });
    movePill(activeLink);
  }

  window.addEventListener("scroll", setActive, { passive: true });
  window.addEventListener("resize", () => {
    currentId = undefined;
    setActive();
  });
  setActive();
  if (document.fonts) document.fonts.ready.then(() => {
    currentId = undefined;
    setActive();
  });

  // ==============================
  // POINTER EFFECTS (background spotlight + skill card glow)
  // ==============================
  const spot = document.querySelector(".bg-spot");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (spot && finePointer && !reduceMotion) {
    let px = 0;
    let py = 0;
    let queued = false;
    window.addEventListener(
      "pointermove",
      (e) => {
        px = e.clientX;
        py = e.clientY;
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          spot.style.setProperty("--mx", `${px}px`);
          spot.style.setProperty("--my", `${py}px`);
          spot.classList.add("on");
          queued = false;
        });
      },
      { passive: true },
    );
    document.addEventListener("pointerleave", () => spot.classList.remove("on"));
  }

  document.querySelectorAll(".skill").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - r.left}px`);
      card.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  });

  // ==============================
  // TENURE (e.g. "1 yr 2 mos")
  // ==============================
  document.querySelectorAll("[data-tenure]").forEach((el) => {
    const [y, m] = el.dataset.tenure.split("-").map(Number);
    const now = new Date();
    const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m) + 1;
    if (months < 1) return;
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    const parts = [];
    if (yrs) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
    if (mos) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);
    el.textContent = parts.join(" ");
  });

  // ==============================
  // LOCAL TIME (IST)
  // ==============================
  const timeEl = document.getElementById("local-time");

  function updateTime() {
    timeEl.textContent = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  }

  if (timeEl) {
    updateTime();
    setInterval(updateTime, 30000);
  }
});

// ==============================
// THEME TOGGLE
// ==============================
(function () {
  const btn  = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-icon");
  if (!btn || !icon) return;

  // Icon shown when dark  → sun  ("click to switch to light")
  // Icon shown when light → moon ("click to switch to dark")
  const SUN_PATH  = '<path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M2.93 13.07l1.06-1.06M12.01 3.99l1.06-1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
  const MOON_PATH = '<path d="M13.5 9A5.5 5.5 0 0 1 7 2.5a.5.5 0 0 0-.6-.6A6.5 6.5 0 1 0 14.1 9.6a.5.5 0 0 0-.6-.6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>';

  let isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  function apply(force) {
    if (force) {
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    }
    // Show sun when dark (action = go light), moon when light (action = go dark)
    icon.innerHTML = isDark ? SUN_PATH : MOON_PATH;
    btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  btn.addEventListener("click", function () {
    isDark = !isDark;
    apply(true);
  });

  // Set icon on load without overriding data-theme (let OS media query win)
  apply(false);
})();
