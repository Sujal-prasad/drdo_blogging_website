/* =========================================================
   FEED (home page)
   - guards the route (login required in live mode)
   - renders article cards from MidiumArticles
   - search box + tag-chip filtering
   ========================================================= */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function toast(msg) {
    const stack = $("#toastStack"); if (!stack) return;
    const t = document.createElement("div");
    t.className = "toast success";
    t.innerHTML = `<span class="toast-icon">✅</span><span>${msg}</span>`;
    stack.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2600);
  }

  // a real cover photo tinted with the article's accent, or a plain gradient
  const coverStyle = (a) =>
    a.cover
      ? `background-color:${a.accent}; background-image: linear-gradient(135deg, ${a.accent}cc, ${a.accent}66), url('${a.cover}');`
      : `background: linear-gradient(135deg, ${a.accent}, color-mix(in srgb, ${a.accent} 50%, #000));`;

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  let state = { q: "", tag: "All" };

  function cardHTML(a) {
    const claps = MidiumArticles.clapsFor(a);
    return `
      <a class="card" href="article.html?id=${encodeURIComponent(a.id)}">
        <div class="card-cover" style="${coverStyle(a)}">
          ${a.userPost ? '<span class="you-badge">Your post</span>' : ""}
          <span class="card-emoji">${a.emoji || "📝"}</span>
        </div>
        <div class="card-body">
          <span class="card-tag">${esc(a.tag)}</span>
          <h3 class="card-title">${esc(a.title)}</h3>
          <p class="card-dek">${esc(a.dek)}</p>
          <div class="card-meta">
            <span>${esc(a.author)}</span>
            <span class="dotsep">·</span>
            <span>${a.readingTime || MidiumArticles.readingTime(a.body)} min read</span>
            <span class="dotsep">·</span>
            <span>${fmtDate(a.date)}</span>
            <span class="claps">👏 ${claps}</span>
          </div>
        </div>
      </a>`;
  }

  function render() {
    const q = state.q.trim().toLowerCase();
    const list = MidiumArticles.getAll().filter((a) => {
      const tagOk = state.tag === "All" || a.tag === state.tag;
      const text = (a.title + " " + a.dek + " " + a.author + " " + a.body).toLowerCase();
      return tagOk && (!q || text.includes(q));
    });

    const grid = $("#cards");
    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<p class="empty">No stories match your search.<br>Try different keywords or <a href="write.html">write one yourself</a>.</p>`;
  }

  function renderChips() {
    const tags = ["All", ...MidiumArticles.allTags()];
    $("#chips").innerHTML = tags
      .map((t) => `<button class="chip ${t === state.tag ? "active" : ""}" data-tag="${esc(t)}">${esc(t)}</button>`)
      .join("");
  }

  // brief success card shown on the feed after an OAuth login
  function showOverlay(title, subtitle, emoji) {
    const ov = document.createElement("div");
    ov.className = "success-overlay";
    ov.innerHTML =
      `<div class="success-card">
         <div class="success-emoji">${emoji}</div>
         <h3>${title}</h3>
         <p>${subtitle}</p>
       </div>`;
    document.body.appendChild(ov);
    setTimeout(() => {
      ov.style.transition = "opacity .4s ease";
      ov.style.opacity = "0";
      setTimeout(() => ov.remove(), 400);
    }, 1700);
  }

  // celebration shown on the feed right after an OAuth login lands here
  function celebrate(isNew) {
    if (typeof confetti !== "function") return;
    if (isNew) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      const end = Date.now() + 800;
      (function frame() {
        confetti({ particleCount: 4, angle: 60,  spread: 70, origin: { x: 0 }, colors: ["#1a8917", "#e0a800", "#14130f"] });
        confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors: ["#1a8917", "#e0a800", "#14130f"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    } else {
      confetti({ particleCount: 70, spread: 55, startVelocity: 26, origin: { y: 0.5 }, colors: ["#1a8917", "#e0a800", "#ffffff"] });
    }
  }

  async function init() {
    const s = await Session.requireAuth();
    if (!s) return; // redirected to login

    const name = Session.displayName(s.user);
    const isNew = Session.isNewUser(s.user);
    $("#greeting").textContent = isNew ? `Welcome to Midium, ${name}! 🎉` : `Welcome back, ${name}.`;

    // OAuth can't animate on the login page (it redirects away), so do it here
    if (window.__cameFromOAuth) {
      celebrate(isNew);
      showOverlay(
        isNew ? "Welcome to Midium! 🎉" : "Welcome back 👋",
        isNew ? "Your account is ready." : "Good to see you again.",
        isNew ? "🎉" : "📖"
      );
      window.__cameFromOAuth = false;
    }

    $("#signout").addEventListener("click", () => Session.signOut());

    // membership button (shows only for members; click to cancel)
    const memberBtn = $("#memberBtn");
    function refreshMemberBtn() {
      if (Paywall.isMember()) { memberBtn.hidden = false; memberBtn.textContent = "★ Member"; memberBtn.title = "Manage membership"; }
      else { memberBtn.hidden = true; }
    }
    refreshMemberBtn();
    memberBtn.addEventListener("click", () => {
      if (!Paywall.isMember()) return;
      if (confirm("Cancel your Midium membership?\n\nYou'll return to the free plan (5 free articles).")) {
        Paywall.cancel();
        refreshMemberBtn();
        render();
        toast("Membership cancelled. You're back on the free plan.");
      }
    });

    renderChips();
    render();

    $("#search").addEventListener("input", (e) => { state.q = e.target.value; render(); });
    $("#chips").addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      state.tag = btn.dataset.tag;
      renderChips();
      render();
    });
  }

  init();
})();
