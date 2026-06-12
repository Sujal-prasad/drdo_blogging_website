/* =========================================================
   ARTICLE READER
   - reads ?id= from the URL, renders the article
   - clap button + delete (for your own posts)
   ========================================================= */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const gradient = (c) => `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 50%, #000))`;
  const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const paragraphs = (body) =>
    esc(body).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast success";
    t.innerHTML = `<span class="toast-icon">✅</span><span>${msg}</span>`;
    $("#toastStack").appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2400);
  }

  function render(a) {
    const claps = MidiumArticles.clapsFor(a);
    const mins = a.readingTime || MidiumArticles.readingTime(a.body);
    const initial = esc((a.author || "?").trim().charAt(0).toUpperCase() || "?");

    $("#article").innerHTML = `
      <div class="article-cover" style="background:${gradient(a.accent)}">${a.emoji || "📝"}</div>
      <span class="article-tag">${esc(a.tag)}</span>
      <h1 class="article-title">${esc(a.title)}</h1>
      ${a.dek ? `<p class="article-dek">${esc(a.dek)}</p>` : ""}
      <div class="article-byline">
        <span class="avatar" style="background:${gradient(a.accent)}">${initial}</span>
        <div>
          <div><strong>${esc(a.author)}</strong>${a.userPost ? " · your post" : ""}</div>
          <div>${fmtDate(a.date)} · ${mins} min read</div>
        </div>
      </div>
      <div class="article-body">${paragraphs(a.body)}</div>
      <div class="article-foot">
        <button class="clap-btn" id="clap">👏 <span id="clapCount">${claps}</span></button>
        ${a.userPost ? '<button class="danger-link" id="delete">Delete this post</button>' : ""}
      </div>`;

    $("#clap").addEventListener("click", () => {
      const n = MidiumArticles.clap(a.id);
      $("#clapCount").textContent = n;
      const btn = $("#clap");
      btn.classList.remove("bumped"); void btn.offsetWidth; btn.classList.add("bumped");
    });

    const del = $("#delete");
    if (del) del.addEventListener("click", () => {
      if (confirm("Delete this post? This can't be undone.")) {
        MidiumArticles.deleteArticle(a.id);
        toast("Post deleted.");
        setTimeout(() => { window.location.href = "index.html"; }, 700);
      }
    });
  }

  function notFound() {
    $("#article").innerHTML = `
      <div class="empty" style="padding:80px 0">
        <h1 class="article-title" style="font-size:2rem">This story wandered off. 🐾</h1>
        <p style="margin:12px 0 22px">Mo couldn't find it. It may have been deleted.</p>
        <a class="btn btn--accent" href="index.html">Back to the feed</a>
      </div>`;
  }

  async function init() {
    const s = await Session.requireAuth();
    if (!s) return;
    const id = new URLSearchParams(location.search).get("id");
    const a = id ? MidiumArticles.getById(id) : null;
    if (a) { document.title = a.title + " · Midium"; render(a); }
    else notFound();
  }

  init();
})();
