/* =========================================================
   THEME (light / dark)
   - remembers the user's choice in localStorage
   - falls back to the OS preference on first visit
   - wires up any element with id="themeToggle"
   NOTE: an inline <script> in <head> applies the saved theme
   BEFORE first paint to avoid a flash — see the top of each page.
   ========================================================= */

(function () {
  const STORAGE_KEY = "midium-theme";

  function current() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById("themeToggle");
    if (btn) {
      const dark = theme === "dark";
      btn.textContent = dark ? "☀️" : "🌙";
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("title", dark ? "Light mode" : "Dark mode");
    }
  }

  // sync the icon with whatever the early inline script already set
  apply(current());

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      apply(current() === "dark" ? "light" : "dark");
    });
  }
})();
