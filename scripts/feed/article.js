/* =========================================================
   READER (reel-style)
   - opens the clicked article, then scrolls into the next one
   - an article only counts toward the free limit once it's VIEWED
     (so pre-loading the next one doesn't burn a free read)
   - paywall enforced per article; stops at the free limit
   ========================================================= */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const plainGradient = (c) => `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 50%, #000))`;
  function coverStyle(a) {
    if (a.cover) return `background-color:${a.accent}; background-image: linear-gradient(135deg, ${a.accent}cc, ${a.accent}66), url('${a.cover}');`;
    return `background: ${plainGradient(a.accent)};`;
  }
  const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const paragraphs = (body) =>
    esc(body).split(/\n{2,}/).map((p) => {
      const m = p.match(/^!\[[^\]]*\]\((.+)\)$/s); // an image block: ![alt](url)
      if (m) return `<img class="article-img" src="${m[1]}" alt="" loading="lazy">`;
      return `<p>${p.replace(/\n/g, "<br>")}</p>`;
    }).join("");

  const memberPill = `<span class="meter-pill member">★ Member · unlimited reading</span>`;
  const ownPill = `<span class="meter-pill">Your post · always free</span>`;
  const leftPill = (n) => `<span class="meter-pill">${n} of ${Paywall.FREE_LIMIT} free articles left</span>`;

  function toast(msg, type = "success") {
    const stack = $("#toastStack"); if (!stack) return;
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${type === "error" ? "⚠️" : "✅"}</span><span>${msg}</span>`;
    stack.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2600);
  }

  function openShareSheet(a) {
    const url = location.origin + "/pages/article.html?id=" + encodeURIComponent(a.id);
    const text = a.title;
    const ov = document.createElement("div");
    ov.className = "share-overlay";
    ov.innerHTML = `
      <div class="share-sheet">
        <h3>Share this story</h3>
        <div class="share-grid">
          <a class="share-opt" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text + " " + url)}"><span>🟢</span>WhatsApp</a>
          <a class="share-opt" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}"><span>🔵</span>Facebook</a>
          <a class="share-opt" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}"><span>✖️</span>X</a>
          <a class="share-opt" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}"><span>🔷</span>Telegram</a>
          <a class="share-opt" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}"><span>💼</span>LinkedIn</a>
          <button class="share-opt" id="share-copy" type="button"><span>🔗</span>Copy link</button>
        </div>
        <button class="btn btn--ghost" id="share-close" type="button">Close</button>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    ov.querySelector("#share-close").addEventListener("click", () => ov.remove());
    ov.querySelector("#share-copy").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(url); toast("Link copied to clipboard!"); }
      catch (_) { toast("Couldn't copy the link.", "error"); }
      ov.remove();
    });
  }

  const stories = $("#stories");
  const sentinel = $("#sentinel");
  let all = [], cursor = 0, loading = false, paused = false, ended = false, first = true;
  let currentName = "You";
  const seen = new Set();

  function storyHTML(a) {
    const claps = MidiumArticles.clapsFor(a);
    const mins = a.readingTime || MidiumArticles.readingTime(a.body);
    const initial = esc((a.author || "?").trim().charAt(0).toUpperCase() || "?");
    return `
      <article class="story" data-id="${esc(a.id)}">
        <div class="article-cover" style="${coverStyle(a)}"><span class="cover-emoji">${a.emoji || "📝"}</span></div>
        <span class="article-tag">${esc(a.tag)}</span>
        <h1 class="article-title">${esc(a.title)}</h1>
        ${a.dek ? `<p class="article-dek">${esc(a.dek)}</p>` : ""}
        <div class="article-byline">
          <span class="avatar" style="background:${plainGradient(a.accent)}">${initial}</span>
          <div>
            <div>${a.authorId
              ? `<a class="author-link" href="/pages/author.html?id=${encodeURIComponent(a.authorId)}"><strong>${esc(a.author)}</strong></a>`
              : `<strong>${esc(a.author)}</strong>`}${a.userPost ? " · your post" : ""}</div>
            <div>${fmtDate(a.date)} · ${mins} min read</div>
          </div>
        </div>
        <div class="read-meter"></div>
        <div class="article-body">${paragraphs(a.body)}</div>
        <div class="article-foot">
          <button class="clap-btn">👏 <span class="clap-count">${claps}</span></button>
          <button class="share-btn">↗ Share</button>
          <button class="bookmark-btn">${MidiumArticles.isBookmarked(a.id) ? "🔖 Saved" : "🔖 Save"}</button>
          ${a.userPost ? `<a class="edit-link" href="/pages/write.html?edit=${encodeURIComponent(a.id)}">Edit</a><button class="danger-link">Delete</button>` : ""}
        </div>
        <div class="comments" data-cid="${esc(a.id)}"></div>
      </article>`;
  }

  function refreshMeter(storyEl, a) {
    const meter = storyEl.querySelector(".read-meter");
    if (!meter) return;
    if (Paywall.isMember()) meter.innerHTML = memberPill;
    else if (a.userPost) meter.innerHTML = ownPill;
    else meter.innerHTML = leftPill(Paywall.remainingFree());
  }

  // locked article: drop the full text from the DOM, keep only a fading teaser
  // (so it can't be read by scrolling/Escape/devtools behind the paywall)
  function lockBody(el) {
    const body = el.querySelector(".article-body");
    if (!body) return;
    const first = body.querySelector("p"); // one teaser paragraph
    body.innerHTML = "";
    if (first) body.appendChild(first);
    body.classList.add("teaser");
  }

  // membership just gained: restore full text, refresh meters, resume
  function onUnlock() {
    stories.querySelectorAll(".story").forEach((el) => {
      const a = all.find((x) => x.id === el.dataset.id);
      if (!a) return;
      const body = el.querySelector(".article-body");
      if (body && body.classList.contains("teaser")) {
        body.classList.remove("teaser");
        body.innerHTML = paragraphs(a.body);
      }
      refreshMeter(el, a);
    });
    paused = false;
    loadNext();
  }

  // a story scrolled into view -> now it counts (record read or show paywall)
  const viewObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting || e.intersectionRatio < 0.3) return;
      const el = e.target;
      if (seen.has(el)) return;
      seen.add(el);
      viewObserver.unobserve(el);
      const a = all.find((x) => x.id === el.dataset.id);
      if (!a) return;
      const gated = Paywall.gate(a, { onUnlock }); // no blur — we truncate instead
      refreshMeter(el, a);
      if (gated) { paused = true; lockBody(el); } // remove text + stop loading more
    });
  }, { threshold: [0, 0.3] });

  function mountStory(a) {
    if (!first) {
      const sep = document.createElement("div");
      sep.className = "story-sep";
      sep.textContent = "Up next";
      stories.appendChild(sep);
    }
    first = false;

    const wrap = document.createElement("div");
    wrap.innerHTML = storyHTML(a);
    const storyEl = wrap.firstElementChild;
    stories.appendChild(storyEl);
    document.title = a.title + " · Midium";

    const clap = storyEl.querySelector(".clap-btn");
    if (MidiumArticles.hasClapped(a.id)) clap.classList.add("clapped");
    clap.addEventListener("click", () => {
      if (MidiumArticles.hasClapped(a.id)) { toast("You've already clapped for this story."); return; }
      const n = MidiumArticles.clap(a.id);
      clap.querySelector(".clap-count").textContent = n;
      clap.classList.add("clapped");
      clap.classList.remove("bumped"); void clap.offsetWidth; clap.classList.add("bumped");
    });

    storyEl.querySelector(".share-btn").addEventListener("click", () => openShareSheet(a));

    const del = storyEl.querySelector(".danger-link");
    if (del) del.addEventListener("click", async () => {
      if (confirm("Delete this post? This can't be undone.")) {
        await MidiumArticles.deleteArticle(a.id);
        window.location.href = "/index.html";
      }
    });

    const bm = storyEl.querySelector(".bookmark-btn");
    if (MidiumArticles.isBookmarked(a.id)) bm.classList.add("saved");
    bm.addEventListener("click", () => {
      const on = MidiumArticles.toggleBookmark(a.id);
      bm.textContent = on ? "🔖 Saved" : "🔖 Save";
      bm.classList.toggle("saved", on);
      toast(on ? "Saved to your reading list." : "Removed from your reading list.");
    });

    // comments only for real (database) articles, not the sample/house ones
    if (a.authorId && window.Social) renderComments(storyEl.querySelector(".comments"), a);

    refreshMeter(storyEl, a);
    viewObserver.observe(storyEl); // gate when it scrolls into view
  }

  function commentHTML(c, me) {
    const initial = esc((c.author_name || "?").charAt(0).toUpperCase() || "?");
    return `
      <div class="comment">
        <span class="comment-av">${initial}</span>
        <div class="comment-main">
          <div class="comment-head"><strong>${esc(c.author_name || "Anonymous")}</strong>
            <span>${new Date(c.created_at).toLocaleDateString()}</span></div>
          <p>${esc(c.body)}</p>
        </div>
        ${me && c.user_id === me ? `<button class="comment-del" data-id="${esc(c.id)}" title="Delete">✕</button>` : ""}
      </div>`;
  }

  async function renderComments(box, a) {
    if (!box) return;
    const me = await Social.uid();
    box.innerHTML = `
      <h3 class="comments-title">💬 Responses</h3>
      <div class="comment-form">
        <textarea class="comment-input" rows="2" placeholder="Write a response…"></textarea>
        <button class="btn btn--accent comment-send" type="button">Respond</button>
      </div>
      <div class="comment-list">Loading…</div>`;
    const list = box.querySelector(".comment-list");
    async function load() {
      const rows = await Social.getComments(a.id);
      list.innerHTML = rows.length
        ? rows.map((c) => commentHTML(c, me)).join("")
        : `<p class="comment-empty">No responses yet. Be the first.</p>`;
      list.querySelectorAll(".comment-del").forEach((b) =>
        b.addEventListener("click", async () => { await Social.deleteComment(b.dataset.id); load(); }));
    }
    box.querySelector(".comment-send").addEventListener("click", async () => {
      const ta = box.querySelector(".comment-input");
      const body = ta.value.trim();
      if (!body) return;
      try { await Social.addComment(a.id, body, currentName); ta.value = ""; load(); toast("Response posted."); }
      catch (e) { toast(e.message || "Couldn't post your response.", "error"); }
    });
    load();
  }

  function loadNext() {
    if (loading || paused || ended) return;
    if (cursor >= all.length) {
      ended = true;
      const end = document.createElement("div");
      end.className = "stories-end";
      end.innerHTML = `<p>You've reached the end. 📭</p><a class="btn btn--accent" href="/index.html">Back to the feed</a>`;
      stories.appendChild(end);
      return;
    }
    loading = true;
    mountStory(all[cursor]);
    cursor++;
    loading = false;
  }

  function notFound() {
    stories.innerHTML = `
      <div class="empty" style="padding:80px 0">
        <h1 class="article-title" style="font-size:2rem">Story not found</h1>
        <p style="margin:12px 0 22px">We couldn't find that article. It may have been removed.</p>
        <a class="btn btn--accent" href="/index.html">Back to the feed</a>
      </div>`;
  }

  async function init() {
    const s = await Session.requireAuth();
    if (!s) return;
    currentName = Session.displayName(s.user);
    await MidiumArticles.load(); // hydrate posts from Supabase
    all = MidiumArticles.getAll();
    const id = new URLSearchParams(location.search).get("id");
    const start = all.findIndex((x) => x.id === id);
    if (start < 0) { notFound(); return; }

    cursor = start;
    loadNext(); // the clicked article

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) loadNext();
    }, { rootMargin: "300px" });
    io.observe(sentinel);
  }

  init();
})();
