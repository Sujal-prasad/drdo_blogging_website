/* =========================================================
   THEME (light / dark)
   - the icon/knob is drawn by CSS (.theme-toggle::before) from data-theme
   - clicking the switch persists an explicit light/dark choice
   - on load we DON'T persist, so a "System" choice (no stored value) survives
   NOTE: an inline <script> in <head> applies the saved theme before paint.
   ========================================================= */

(function () {
  const STORAGE_KEY = "midium-theme";
  const current = () => document.documentElement.getAttribute("data-theme") || "light";

  function syncLabel() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    const dark = current() === "dark";
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    btn.setAttribute("title", dark ? "Light mode" : "Dark mode");
  }

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function apply(theme, e) {
    const root = document.documentElement;
    const commit = () => { root.setAttribute("data-theme", theme); syncLabel(); };
    localStorage.setItem(STORAGE_KEY, theme);
    // circular "wipe" from the toggle, where supported; instant otherwise
    if (reduce || typeof document.startViewTransition !== "function") { commit(); return; }
    root.style.setProperty("--vt-x", ((e && e.clientX) || window.innerWidth - 40) + "px");
    root.style.setProperty("--vt-y", ((e && e.clientY) || 24) + "px");
    document.startViewTransition(commit);
  }

  syncLabel(); // just reflect the inline-script's choice; don't persist

  const btn = document.getElementById("themeToggle");
  if (btn) btn.addEventListener("click", (e) => apply(current() === "dark" ? "light" : "dark", e));
})();
