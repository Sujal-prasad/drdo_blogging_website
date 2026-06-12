/* =========================================================
   AUTHOR PAGE — an author's articles + follow button
   ========================================================= */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const coverStyle = (a) =>
    a.cover
      ? `background-color:${a.accent}; background-image: linear-gradient(135deg, ${a.accent}cc, ${a.accent}66), url('${a.cover}');`
      : `background: linear-gradient(135deg, ${a.accent}, color-mix(in srgb, ${a.accent} 50%, #000));`;
  const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  function toast(msg) {
    const stack = $("#toastStack"); if (!stack) return;
    const t = document.createElement("div");
    t.className = "toast success";
    t.innerHTML = `<span class="toast-icon">✅</span><span>${msg}</span>`;
    stack.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2400);
  }

  function cardHTML(a) {
    return `
      <a class="card" href="/pages/article.html?id=${encodeURIComponent(a.id)}">
        <div class="card-cover" style="${coverStyle(a)}"><span class="card-emoji">${a.emoji || "📝"}</span></div>
        <div class="card-body">
          <span class="card-tag">${esc(a.tag)}</span>
          <h3 class="card-title">${esc(a.title)}</h3>
          <p class="card-dek">${esc(a.dek)}</p>
          <div class="card-meta">
            <span>${a.readingTime || MidiumArticles.readingTime(a.body)} min read</span>
            <span class="dotsep">·</span><span>${fmtDate(a.date)}</span>
            <span class="claps">👏 ${MidiumArticles.clapsFor(a)}</span>
          </div>
        </div>
      </a>`;
  }

  async function init() {
    const s = await Session.requireAuth();
    if (!s) return;
    const authorId = new URLSearchParams(location.search).get("id");

    await MidiumArticles.load();
    const posts = authorId ? MidiumArticles.getByAuthor(authorId) : [];
    const name = posts.length ? posts[0].author : "Unknown author";
    const initial = esc((name.trim().charAt(0) || "?").toUpperCase());
    const accent = posts.length ? posts[0].accent : "#1a8917";

    const me = await Social.uid();
    const isSelf = me && authorId === me;
    let following = await Social.isFollowing(authorId);
    const followers = await Social.followerCount(authorId);

    $("#authorHead").innerHTML = `
      <span class="author-avatar" style="background:linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 50%, #000))">${initial}</span>
      <div class="author-info">
        <h1>${esc(name)}</h1>
        <p><span id="followCount">${followers}</span> follower${followers === 1 ? "" : "s"} · ${posts.length} post${posts.length === 1 ? "" : "s"}</p>
      </div>
      ${isSelf ? "" : `<button class="btn ${following ? "btn--ghost" : "btn--accent"}" id="followBtn">${following ? "Following ✓" : "Follow"}</button>`}`;

    const followBtn = $("#followBtn");
    if (followBtn) followBtn.addEventListener("click", async () => {
      followBtn.disabled = true;
      try {
        if (following) { await Social.unfollow(authorId); following = false; }
        else { await Social.follow(authorId); following = true; }
        followBtn.textContent = following ? "Following ✓" : "Follow";
        followBtn.classList.toggle("btn--accent", !following);
        followBtn.classList.toggle("btn--ghost", following);
        $("#followCount").textContent = await Social.followerCount(authorId);
        toast(following ? "You're now following " + name + "." : "Unfollowed.");
      } catch (e) { toast("Couldn't update follow."); }
      followBtn.disabled = false;
    });

    $("#cards").innerHTML = posts.length
      ? posts.map(cardHTML).join("")
      : `<p class="empty">This author hasn't published anything yet.</p>`;
  }

  init();
})();
