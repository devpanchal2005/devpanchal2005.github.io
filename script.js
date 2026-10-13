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
