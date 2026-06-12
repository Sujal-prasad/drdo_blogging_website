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

  const cover = (a) =>
    `linear-gradient(135deg, ${a.accent}, color-mix(in srgb, ${a.accent} 50%, #000))`;

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  let state = { q: "", tag: "All" };

  function cardHTML(a) {
    const claps = MidiumArticles.clapsFor(a);
    return `
      <a class="card" href="article.html?id=${encodeURIComponent(a.id)}">
        <div class="card-cover" style="background:${cover(a)}">
          ${a.userPost ? '<span class="you-badge">Your post</span>' : ""}
          <span>${a.emoji || "📝"}</span>
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
      : `<p class="empty">No stories match that. Even Mo looked. 🐱<br>Try a different search or <a href="write.html">write one yourself</a>.</p>`;
  }

  function renderChips() {
    const tags = ["All", ...MidiumArticles.allTags()];
    $("#chips").innerHTML = tags
      .map((t) => `<button class="chip ${t === state.tag ? "active" : ""}" data-tag="${esc(t)}">${esc(t)}</button>`)
      .join("");
  }

  async function init() {
    const s = await Session.requireAuth();
    if (!s) return; // redirected to login

    $("#greeting").textContent = `Welcome back, ${Session.displayName(s.user)}.`;
    $("#signout").addEventListener("click", () => Session.signOut());

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
