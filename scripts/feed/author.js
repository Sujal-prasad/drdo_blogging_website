/* =========================================================
   AUTHOR PAGE — an author's posts + Follow.
   - ?id=<uuid>  → a real user: follow via Supabase (shared, real counts)
   - ?name=<str> → a house/sample author: local follow (by name)
   ========================================================= */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const coverStyle = (a) =>
    a.cover
      ? `background-color:${a.accent}; background-image: linear-gradient(180deg, rgba(20,19,15,.06), rgba(20,19,15,.42)), url('${a.cover}');`
      : `background: linear-gradient(140deg, color-mix(in srgb, ${a.accent} 82%, #14130f), color-mix(in srgb, ${a.accent} 40%, #000));`;
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
      <a class="card reveal" href="/pages/article.html?id=${encodeURIComponent(a.id)}">
        <div class="card-cover" style="${coverStyle(a)}"></div>
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
    const params = new URLSearchParams(location.search);
    const id = params.get("id");     // real user (Supabase)
    const name = params.get("name"); // house author (local)

    await MidiumArticles.load();

    let posts, authorName, isSelf, following, followers = null, toggle;

    if (id) {
      posts = MidiumArticles.getByAuthor(id);
      authorName = posts.length ? posts[0].author : "Author";
      const me = await Social.uid();
      isSelf = !!me && id === me;
      following = await Social.isFollowing(id);
      followers = await Social.followerCount(id);
      toggle = async () => {
        if (following) await Social.unfollow(id); else await Social.follow(id);
        following = !following;
        followers = await Social.followerCount(id);
        return following;
      };
    } else {
      posts = name ? MidiumArticles.getByAuthorName(name) : [];
      authorName = name || "Unknown author";
      isSelf = !!name && name === Session.displayName(s.user);
      following = MidiumArticles.isFollowingAuthor(name);
      toggle = async () => { following = MidiumArticles.toggleFollowAuthor(name); return following; };
    }

    const accent = posts.length ? posts[0].accent : "#1a8917";
    const initial = esc((authorName.trim().charAt(0) || "?").toUpperCase());
    const hasAuthor = !!(id || name);
    const meta = followers != null
      ? `<span id="followCount" data-countup="${followers}">${followers}</span> follower${followers === 1 ? "" : "s"} · ${posts.length} post${posts.length === 1 ? "" : "s"}`
      : `${posts.length} post${posts.length === 1 ? "" : "s"}`;

    $("#authorHead").innerHTML = `
      <span class="author-avatar" style="background:linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 50%, #000))">${initial}</span>
      <div class="author-info"><h1>${esc(authorName)}</h1><p>${meta}</p></div>
      ${!hasAuthor ? ""
        : isSelf ? `<span class="author-self">✓ This is you</span>`
        : `<button class="btn ${following ? "btn--ghost" : "btn--accent"}" id="followBtn">${following ? "Following ✓" : "Follow"}</button>`}`;

    const followBtn = $("#followBtn");
    if (followBtn) followBtn.addEventListener("click", async () => {
      followBtn.disabled = true;
      try {
        const now = await toggle();
        followBtn.textContent = now ? "Following ✓" : "Follow";
        followBtn.classList.toggle("btn--accent", !now);
        followBtn.classList.toggle("btn--ghost", now);
        const fc = $("#followCount"); if (fc && followers != null) fc.textContent = followers;
        toast(now ? "You're now following " + authorName + "." : "Unfollowed " + authorName + ".");
      } catch (e) { toast("Couldn't update follow — is the follows table set up?"); }
      followBtn.disabled = false;
    });

    $("#cards").innerHTML = posts.length
      ? posts.map(cardHTML).join("")
      : `<p class="empty">No posts found for this author.</p>`;

    if (window.Effects) Effects.scan(document); // reveal cards + count up the follower total
  }

  init();
})();
