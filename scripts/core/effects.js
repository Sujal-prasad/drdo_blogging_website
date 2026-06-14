/* =========================================================
   EFFECTS — tasteful, dependency-free UI motion.
   Everything here is gated behind prefers-reduced-motion: when the
   user prefers less motion we add NOTHING and content shows plainly.
   Page scripts call window.Effects.* after they render dynamic nodes.
   ========================================================= */
window.Effects = (function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ON = !reduce;
  if (ON) document.documentElement.classList.add("fx"); // CSS hides .reveal etc. only when set

  const fmt = (n) => Number(n || 0).toLocaleString();

  /* ---- scroll reveal ---------------------------------------------------- */
  let revealIO = null;
  function reveal(scope) {
    const root = scope || document;
    const items = root.querySelectorAll(".reveal:not(.in):not([data-rev])");
    if (!ON || !("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("in")); return; }
    if (!revealIO) revealIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    let i = 0;
    items.forEach((el) => {
      el.setAttribute("data-rev", "1");
      el.style.transitionDelay = Math.min(i, 7) * 55 + "ms";
      revealIO.observe(el);
      i++;
    });
  }
  // used on re-renders (search/filter) — show instantly, no animation
  function show(scope) { (scope || document).querySelectorAll(".reveal").forEach((el) => el.classList.add("in")); }

  /* ---- count up --------------------------------------------------------- */
  let countIO = null;
  function animateNumber(el) {
    const target = parseFloat(el.getAttribute("data-countup")) || 0;
    el.setAttribute("data-done", "1");
    if (!ON || target <= 0) { el.textContent = fmt(target); return; }
    const dur = 900, t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function countUp(scope) {
    const items = (scope || document).querySelectorAll("[data-countup]:not([data-done])");
    if (!ON || !("IntersectionObserver" in window)) { items.forEach(animateNumber); return; }
    if (!countIO) countIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animateNumber(e.target); countIO.unobserve(e.target); } });
    }, { threshold: 0.6 });
    items.forEach((el) => countIO.observe(el));
  }

  function scan(scope) { reveal(scope); countUp(scope); }

  /* ---- clap burst + floating "+1" --------------------------------------- */
  function clapBurst(btn) {
    if (!ON || !btn) return;
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const plus = document.createElement("span");
    plus.className = "fx-plusone"; plus.textContent = "+1";
    plus.style.left = cx + "px"; plus.style.top = cy + "px";
    document.body.appendChild(plus);
    plus.addEventListener("animationend", () => plus.remove());
    const N = 9;
    for (let k = 0; k < N; k++) {
      const p = document.createElement("span");
      p.className = "fx-particle";
      const ang = -Math.PI / 2 + (k / (N - 1) - 0.5) * Math.PI * 1.1; // upward fan
      const dist = 24 + Math.random() * 30;
      p.style.left = cx + "px"; p.style.top = cy + "px";
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
  }

  /* ---- generic pop (bookmark, etc.) ------------------------------------- */
  function pop(el) {
    if (!ON || !el) return;
    el.classList.remove("fx-pop"); void el.offsetWidth; el.classList.add("fx-pop");
  }

  /* ---- delegated: button ripple + card cursor-spotlight ----------------- */
  if (ON) {
    document.addEventListener("pointerdown", (e) => {
      const b = e.target.closest(".btn, .chip, .pay-tab");
      if (!b || b.disabled) return;
      const r = b.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const sp = document.createElement("span");
      sp.className = "fx-ripple";
      sp.style.width = sp.style.height = size + "px";
      sp.style.left = (e.clientX - r.left - size / 2) + "px";
      sp.style.top = (e.clientY - r.top - size / 2) + "px";
      b.appendChild(sp);
      sp.addEventListener("animationend", () => sp.remove());
    });
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) / r.width * 100 + "%");
      card.style.setProperty("--my", (e.clientY - r.top) / r.height * 100 + "%");
    }, { passive: true });
  }

  return { reveal, show, countUp, scan, clapBurst, pop, enabled: ON };
})();
