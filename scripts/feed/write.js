/* =========================================================
   WRITE / COMPOSE
   - pick cover colour + icon, type title/dek/body
   - live reading-time, draft autosave, publish to the store
   ========================================================= */

(function () {
  const $ = (s) => document.querySelector(s);
  const DRAFT_KEY = "midium-draft";

  const COLORS = ["#1a8917", "#2f6db0", "#7a4fd0", "#c0392b", "#e0a800", "#1f9e8a", "#e06b2f"];
  const EMOJIS = ["📝", "💸", "📈", "🤖", "🧘", "🏠", "🥣", "🔥", "💡", "🐱", "✈️", "☕"];

  const els = {
    author: $("#authorName"), changeName: $("#changeName"),
    title: $("#title"), dek: $("#dek"), tag: $("#tag"), body: $("#body"),
    swatches: $("#swatches"), emojis: $("#emojis"),
    preview: $("#coverPreview"), coverEmoji: $("#coverEmoji"),
    readtime: $("#readtime"), publish: $("#publish"), toastStack: $("#toastStack")
  };

  let state = { color: COLORS[0], emoji: EMOJIS[0] };

  /* ---- tiny toast ---- */
  function toast(msg, type = "info") {
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${type === "success" ? "✅" : "💬"}</span><span>${msg}</span>`;
    els.toastStack.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2600);
  }

  /* ---- cover helpers ---- */
  const gradient = (c) => `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 50%, #000))`;
  function paintPreview() {
    els.preview.style.background = gradient(state.color);
    els.coverEmoji.textContent = state.emoji;
  }

  function buildPickers() {
    els.swatches.innerHTML = COLORS.map((c) =>
      `<button type="button" class="swatch ${c === state.color ? "active" : ""}" data-color="${c}" style="background:${c}"></button>`).join("");
    els.emojis.innerHTML = EMOJIS.map((e) =>
      `<button type="button" class="emoji-opt ${e === state.emoji ? "active" : ""}" data-emoji="${e}">${e}</button>`).join("");
  }

  els.swatches.addEventListener("click", (e) => {
    const b = e.target.closest(".swatch"); if (!b) return;
    state.color = b.dataset.color; buildPickers(); paintPreview(); saveDraft();
  });
  els.emojis.addEventListener("click", (e) => {
    const b = e.target.closest(".emoji-opt"); if (!b) return;
    state.emoji = b.dataset.emoji; buildPickers(); paintPreview(); saveDraft();
  });

  /* ---- reading time + publish enabled ---- */
  function refresh() {
    const mins = MidiumArticles.readingTime(els.body.value);
    els.readtime.textContent = `${mins} min read · drafts save automatically`;
    els.publish.disabled = !(els.title.value.trim() && els.body.value.trim());
  }

  /* ---- draft autosave / restore ---- */
  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      title: els.title.value, dek: els.dek.value, tag: els.tag.value,
      body: els.body.value, color: state.color, emoji: state.emoji
    }));
  }
  function restoreDraft() {
    let d; try { d = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (_) { d = null; }
    if (!d) return;
    els.title.value = d.title || ""; els.dek.value = d.dek || "";
    els.tag.value = d.tag || ""; els.body.value = d.body || "";
    if (d.color) state.color = d.color;
    if (d.emoji) state.emoji = d.emoji;
  }

  ["input"].forEach((evt) => {
    [els.title, els.dek, els.tag, els.body].forEach((el) =>
      el.addEventListener(evt, () => { refresh(); saveDraft(); }));
  });

  /* ---- publish ---- */
  els.publish.addEventListener("click", () => {
    if (els.publish.disabled) return;
    const article = MidiumArticles.addArticle({
      title: els.title.value, dek: els.dek.value, tag: els.tag.value,
      body: els.body.value, author: els.author.textContent.trim(),
      accent: state.color, emoji: state.emoji
    });
    localStorage.removeItem(DRAFT_KEY);
    toast("Published! Redirecting…", "success");
    if (typeof confetti === "function") {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.7 }, colors: [state.color, "#e0a800", "#ffffff"] });
    }
    setTimeout(() => { window.location.href = "article.html?id=" + encodeURIComponent(article.id); }, 900);
  });

  /* ---- init ---- */
  async function init() {
    const s = await Session.requireAuth();
    if (!s) return;

    els.author.textContent = Session.displayName(s.user);
    els.changeName.addEventListener("click", () => {
      const name = prompt("Publish under what name?", els.author.textContent.trim());
      if (name && name.trim()) {
        els.author.textContent = name.trim();
        localStorage.setItem("midium-penname", name.trim());
      }
    });

    restoreDraft();
    buildPickers();
    paintPreview();
    refresh();
  }

  init();
})();
