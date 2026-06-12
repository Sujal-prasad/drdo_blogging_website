/* =========================================================
   UI — small shared helpers (styled confirm dialog)
   ========================================================= */
window.UI = (function () {
  const esc = (s) => (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // UI.confirm({ title, body, confirmText, cancelText, danger, emoji, onConfirm })
  function confirm(opts) {
    opts = opts || {};
    const ov = document.createElement("div");
    ov.className = "modal-overlay";
    ov.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true">
        ${opts.emoji ? `<div class="modal-emoji">${opts.emoji}</div>` : ""}
        <h3>${esc(opts.title || "Are you sure?")}</h3>
        <p>${esc(opts.body || "")}</p>
        <div class="modal-actions">
          <button class="btn btn--ghost" data-act="cancel">${esc(opts.cancelText || "Never mind")}</button>
          <button class="btn ${opts.danger ? "btn--danger" : "btn--accent"}" data-act="ok">${esc(opts.confirmText || "Confirm")}</button>
        </div>
      </div>`;
    document.body.appendChild(ov);

    function close() {
      document.removeEventListener("keydown", onKey);
      ov.style.opacity = "0";
      setTimeout(() => ov.remove(), 200);
    }
    function onKey(e) { if (e.key === "Escape") close(); }

    ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
    ov.querySelector('[data-act="cancel"]').addEventListener("click", close);
    ov.querySelector('[data-act="ok"]').addEventListener("click", () => {
      close();
      if (typeof opts.onConfirm === "function") opts.onConfirm();
    });
    document.addEventListener("keydown", onKey);
    // focus the confirm button for keyboard users
    setTimeout(() => ov.querySelector('[data-act="ok"]').focus(), 50);
  }

  return { confirm };
})();
