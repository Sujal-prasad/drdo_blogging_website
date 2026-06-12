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

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    syncLabel();
  }

  syncLabel(); // just reflect the inline-script's choice; don't persist

  const btn = document.getElementById("themeToggle");
  if (btn) btn.addEventListener("click", () => apply(current() === "dark" ? "light" : "dark"));
})();
