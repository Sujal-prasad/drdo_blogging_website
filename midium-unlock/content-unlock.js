// content-unlock.js  —  DRDO Midium Unlock: paywall bypass via localStorage injection
// Runs at document_start, before the site's own scripts execute.
// Strategy: the site's paywall.js checks localStorage keys directly — if
// `midium-member === "true"` the gating function returns immediately and
// the `.paywalled` class is never added to article cards.

(function () {
  "use strict";

  /* ── Keys the site's paywall module reads ────────────────────────────── */
  const PAYWALL_KEYS = {
    isMember: "midium-member", // set to "true"  →  all articles unlocked
    alreadyReads: "midium-reads", // cached article IDs that count toward the free limit
  };

  /* ── Always unlock: set member flag before any site code runs ───────── */
  try {
    localStorage.setItem(PAYWALL_KEYS.isMember, "true");
    // Reset read history so even a fresh session gets unlimited access
    localStorage.removeItem(PAYWALL_KEYS.alreadyReads);
  } catch (_) {
    // localStorage can throw in some edge-cases (e.g. private mode after quota hit)
  }

  /* ── Monkey-patch localStorage so any later write to our key is neutralised ── */
  (function patchStorage() {
    if (!window.Storage.prototype) return;

    const MEMBER_KEY = PAYWALL_KEYS.isMember;

    // Save the original
    const originalSetItem = window.Storage.prototype.setItem;

    window.Storage.prototype.setItem = function (key, value) {
      if (key === MEMBER_KEY && value !== "true") {
        // The site itself (or other code) tried to revoke membership —
        // silently redirect back to "premium" mode.
        return originalSetItem.call(this, key, "true");
      }
      return originalSetItem.call(this, key, value);
    };

    // Also patch removeItem so MEMBER_KEY can't be deleted
    const originalRemoveItem = window.Storage.prototype.removeItem;
    window.Storage.prototype.removeItem = function (key) {
      if (key === MEMBER_KEY) {
        // Silently refuse removal — re-write the value immediately
        originalSetItem.call(this, key, "true");
        return;
      }
      return originalRemoveItem.call(this, key);
    };
  })();

  /* ── Remove the CSS blur class from any already-rendered paywalled cards ─ */
  (function clearBlur() {
    // MutationObserver catches lazy-loaded card renders after page load
    const root = document.documentElement || document.body;
    if (!root) return; // guard: DOM may not be initialised yet at document_start

    const observer = new MutationObserver(() => {
      root
        .querySelectorAll(".paywalled")
        .forEach((el) => el.classList.remove("paywalled"));
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    // Kick once immediately in case paywalled elements are already present
    root
      .querySelectorAll(".paywalled")
      .forEach((el) => el.classList.remove("paywalled"));
  })();

  /* ── Stop any overlay / checkout that might have already opened ──────── */
  (function closeOverlay() {
    const close = () => {
      document.querySelectorAll(".pay-overlay, .pay-locked").forEach((el) => {
        el.style.transition = "opacity .2s ease";
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 200);
      });
      document.body.classList.remove("pay-locked");
    };
    close();
    window.addEventListener("DOMContentLoaded", close);
  })();

  /* ── Prevent the site from hiding body content (auth-gate) ──────────── */
  try {
    document.documentElement.classList.remove("auth-gate");
  } catch (_) {}

  /* ── Debug logging ──────────────────────────────────────────────────── */
  console.log(
    '%c[DRDO Unlock] Paywall bypass injected — localStorage.midium-member = "true"',
    "color: #4CAF50; font-weight: bold;",
  );
})();
