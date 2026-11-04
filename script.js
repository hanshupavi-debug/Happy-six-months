/* ---------- Password gate ----------
   Client-side only: this keeps the page from opening by accident,
   but anyone who inspects the code could find the password.
   (It's stored encoded, not in plain text. To change it, replace the
   value below with btoa("yourNewPassword") run in the browser console.) */
const ENCODED_PASSWORD = "MTgwMg==";

const gate = document.getElementById("gate");
const form = document.getElementById("gate-form");
const input = document.getElementById("pw");
const msg = document.getElementById("gate-msg");
const site = document.getElementById("site");

/* ---------- Time since we met ---------- */
const meetingDate = new Date(2026, 4, 5);
const counterDays = document.getElementById("counter-days");
const counterHours = document.getElementById("counter-hours");
const counterMinutes = document.getElementById("counter-minutes");
const counterSeconds = document.getElementById("counter-seconds");

function updateTimeCounter() {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - meetingDate.getTime()) / 1000));
  const days = Math.floor(elapsedSeconds / 86400);
  const hours = Math.floor((elapsedSeconds % 86400) / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  counterDays.textContent = days.toLocaleString();
  counterHours.textContent = String(hours).padStart(2, "0");
  counterMinutes.textContent = String(minutes).padStart(2, "0");
  counterSeconds.textContent = String(seconds).padStart(2, "0");
}

updateTimeCounter();
setInterval(updateTimeCounter, 1000);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (btoa(input.value.trim()) === ENCODED_PASSWORD) {
    msg.textContent = "";
    gate.classList.add("open");
    site.hidden = false;
    document.body.classList.remove("locked");
    window.scrollTo(0, 0);
    setTimeout(() => { gate.hidden = true; startReveal(); }, 1100);
  } else {
    msg.textContent = "Oops! That's not quite it, try again.";
    form.classList.remove("shake");
    void form.offsetWidth; // restart animation
    form.classList.add("shake");
    input.select();
  }
});

/* ---------- Fade-in when sections enter the screen ---------- */
function startReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => io.observe(el));
}

/* ---------- Surprise button ---------- */
const lastBtn = document.getElementById("last-btn");
const lastMsg = document.getElementById("last-msg");
lastBtn.addEventListener("click", () => {
  const open = lastMsg.classList.toggle("show");
  lastBtn.setAttribute("aria-expanded", open);
  if (open) setTimeout(() => lastMsg.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
});

/* ---------- Floating stars ---------- */
(function stars() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, dots = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = w < 600 ? 45 : 90;
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.12 + 0.03,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      const a = 0.25 + 0.55 * Math.abs(Math.sin(t / 1800 + d.phase));
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190, 228, 255, ${a})`;
      ctx.shadowColor = "rgba(159, 214, 255, 0.8)";
      ctx.shadowBlur = 6;
      ctx.fill();
      if (!reduce) { d.y -= d.speed; if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; } }
    }
    if (!reduce) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => { resize(); if (reduce) draw(0); });
  resize();
  requestAnimationFrame(draw);
})();
