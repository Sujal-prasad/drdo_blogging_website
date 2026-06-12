/* =========================================================
   POLISH / MICRO-INTERACTIONS  (login page only)
   - GSAP staggered entrance
   - password: reveal toggle, caps-lock hint, live strength meter
   - rotating headline ticker
   ========================================================= */

(function () {
  const $ = (id) => document.getElementById(id);
  const hasGSAP = typeof window.gsap !== "undefined";

  /* ---------- 1. Entrance animation ---------- */
  if (hasGSAP) {
    gsap.set(".brand-logo, .mascot, .brand-copy h1, .brand-copy p, .ticker", { opacity: 0, y: 18 });
    gsap.set(".form-card > *", { opacity: 0, y: 16 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } });
    tl.to(".brand-logo", { opacity: 1, y: 0 }, 0.1)
      .to(".mascot", { opacity: 1, y: 0, duration: 0.9, ease: "back.out(1.5)" }, 0.2)
      .to(".brand-copy h1", { opacity: 1, y: 0 }, 0.35)
      .to(".brand-copy p", { opacity: 1, y: 0 }, 0.45)
      .to(".ticker", { opacity: 1, y: 0 }, 0.55)
      .to(".form-card > *", { opacity: 1, y: 0, stagger: 0.07 }, 0.3);
  }

  /* ---------- 2. Password reveal toggle ---------- */
  const pwd = $("password");
  const reveal = $("revealPwd");
  if (reveal && pwd) {
    // keep focus in the input so the mascot stays "covering" while peeking
    reveal.addEventListener("mousedown", (e) => e.preventDefault());
    reveal.addEventListener("click", () => {
      const show = pwd.type === "password";
      pwd.type = show ? "text" : "password";
      reveal.textContent = show ? "🙈" : "👁️";
      reveal.setAttribute("aria-label", show ? "Hide password" : "Show password");
      pwd.focus();
    });
  }

  /* ---------- 3. Caps-lock hint ---------- */
  const capsHint = $("capsHint");
  if (pwd && capsHint) {
    const check = (e) => {
      const on = e.getModifierState && e.getModifierState("CapsLock");
      capsHint.classList.toggle("hidden", !on);
    };
    pwd.addEventListener("keydown", check);
    pwd.addEventListener("keyup", check);
    pwd.addEventListener("blur", () => capsHint.classList.add("hidden"));
  }

  /* ---------- 4. Live strength meter (signup only) ---------- */
  const strength = $("strength");
  const nameField = $("nameField"); // visible only in signup mode
  function scorePassword(v) {
    let s = 0;
    if (v.length >= 6) s++;
    if (v.length >= 10) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(s, 4); // 0..4
  }
  const LEVELS = [
    { label: "Too short", color: "#c0392b", w: "12%" },
    { label: "Weak",      color: "#e67e22", w: "33%" },
    { label: "Okay",      color: "#e0a800", w: "58%" },
    { label: "Good",      color: "#3fae3b", w: "80%" },
    { label: "Strong",    color: "#1a8917", w: "100%" }
  ];
  if (pwd && strength) {
    const bar = strength.querySelector("i");
    const label = strength.querySelector(".strength-label");
    pwd.addEventListener("input", () => {
      const signup = nameField && !nameField.classList.contains("hidden");
      if (!signup || !pwd.value) { strength.classList.add("hidden"); return; }
      strength.classList.remove("hidden");
      const lvl = LEVELS[scorePassword(pwd.value)];
      bar.style.width = lvl.w;
      bar.style.background = lvl.color;
      label.textContent = lvl.label;
      label.style.color = lvl.color;
    });
  }

  /* ---------- 5. Rotating headline ticker ---------- */
  const tickerText = $("tickerText");
  if (tickerText) {
    const lines = [
      "The science of why we forget what we read.",
      "Designing technology that respects your time.",
      "How great teams make decisions under uncertainty.",
      "The quiet return of the walkable city.",
      "What a decade of remote work actually changed.",
      "In praise of the commonplace book.",
      "The economics of attention, explained.",
      "Why good writing is mostly good thinking.",
      "Understanding the new wave of clean energy.",
      "How small habits compound into careers.",
      "The enduring case for deep, slow reading.",
      "Lessons from the world's longest-lived companies.",
      "What the latest research says about sleep.",
      "The hidden history of everyday objects.",
      "How cities are designing for people, not cars.",
      "The craft of asking better questions.",
      "Notes on building things that last."
    ];
    // shuffle so the rotation is different every visit
    for (let k = lines.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [lines[k], lines[j]] = [lines[j], lines[k]];
    }
    let i = 0;
    setInterval(() => {
      i = (i + 1) % lines.length;
      tickerText.style.opacity = "0";
      setTimeout(() => {
        tickerText.textContent = lines[i];
        tickerText.style.opacity = "1";
      }, 350);
    }, 6000);
  }
})();
