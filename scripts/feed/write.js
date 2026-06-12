/* =========================================================
   WRITE / COMPOSE
   - pick cover colour + icon, type title/dek/body
   - live reading-time, draft autosave, publish to the store
   ========================================================= */

(function () {
  const $ = (s) => document.querySelector(s);
  const DRAFT_KEY = "midium-draft";
  const editId = new URLSearchParams(location.search).get("edit"); // editing an existing post?

  const COLORS = ["#1a8917", "#2f6db0", "#7a4fd0", "#c0392b", "#e0a800", "#1f9e8a", "#e06b2f"];
  const EMOJIS = ["📝", "💸", "📈", "🤖", "🧘", "🏠", "🥣", "🔥", "💡", "🐱", "✈️", "☕"];

  const els = {
    author: $("#authorName"), changeName: $("#changeName"),
    title: $("#title"), dek: $("#dek"), tag: $("#tag"), body: $("#body"),
    swatches: $("#swatches"), emojis: $("#emojis"),
    preview: $("#coverPreview"), coverEmoji: $("#coverEmoji"),
    coverFile: $("#coverFile"), coverUpload: $("#coverUpload"), coverRemove: $("#coverRemove"),
    readtime: $("#readtime"), publish: $("#publish"), toastStack: $("#toastStack")
  };

  let state = { color: COLORS[0], emoji: EMOJIS[0], coverImage: null };

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
    els.preview.style.background = state.coverImage
      ? `linear-gradient(135deg, ${state.color}cc, ${state.color}66), url('${state.coverImage}') center/cover`
      : gradient(state.color);
    els.coverEmoji.textContent = state.emoji;
  }

  // read an image file, downscale it, and return a compact JPEG data URL
  function fileToDataURL(file, maxW, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width);
          const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
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

  /* ---- cover photo upload ---- */
  els.coverUpload.addEventListener("click", () => els.coverFile.click());
  els.coverFile.addEventListener("change", async () => {
    const file = els.coverFile.files[0];
    if (!file) return;
    try {
      state.coverImage = await fileToDataURL(file, 1280, 0.78);
      els.coverRemove.classList.remove("hidden");
      paintPreview(); saveDraft();
    } catch (_) { toast("Couldn't load that image.", "info"); }
    els.coverFile.value = "";
  });
  els.coverRemove.addEventListener("click", () => {
    state.coverImage = null;
    els.coverRemove.classList.add("hidden");
    paintPreview(); saveDraft();
  });

  /* ---- insert a photo into the story body (markdown image) ---- */
  const bodyImgBtn = $("#bodyImage"), bodyImgFile = $("#bodyImageFile");
  if (bodyImgBtn) bodyImgBtn.addEventListener("click", () => bodyImgFile.click());
  if (bodyImgFile) bodyImgFile.addEventListener("change", async () => {
    const file = bodyImgFile.files[0];
    if (!file) return;
    try {
      const url = await fileToDataURL(file, 1280, 0.75);
      const ta = els.body;
      const pos = (ta.selectionStart != null) ? ta.selectionStart : ta.value.length;
      const snippet = `\n\n![photo](${url})\n\n`;
      ta.value = ta.value.slice(0, pos) + snippet + ta.value.slice(pos);
      refresh(); saveDraft();
      toast("Photo added to your story.", "success");
    } catch (_) { toast("Couldn't load that image.", "info"); }
    bodyImgFile.value = "";
  });

  /* ---- reading time + publish enabled ---- */
  function refresh() {
    const mins = MidiumArticles.readingTime(els.body.value);
    els.readtime.textContent = `${mins} min read · drafts save automatically`;
    els.publish.disabled = !(els.title.value.trim() && els.body.value.trim());
  }

  /* ---- draft autosave / restore ---- */
  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        title: els.title.value, dek: els.dek.value, tag: els.tag.value,
        body: els.body.value, color: state.color, emoji: state.emoji, coverImage: state.coverImage
      }));
    } catch (_) { /* draft too big to autosave (large images) — ignore */ }
  }
  function restoreDraft() {
    let d; try { d = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (_) { d = null; }
    if (!d) return;
    els.title.value = d.title || ""; els.dek.value = d.dek || "";
    els.tag.value = d.tag || ""; els.body.value = d.body || "";
    if (d.color) state.color = d.color;
    if (d.emoji) state.emoji = d.emoji;
    if (d.coverImage) { state.coverImage = d.coverImage; els.coverRemove.classList.remove("hidden"); }
  }

  ["input"].forEach((evt) => {
    [els.title, els.dek, els.tag, els.body].forEach((el) =>
      el.addEventListener(evt, () => { refresh(); saveDraft(); }));
  });

  /* ---- publish ---- */
  els.publish.addEventListener("click", async () => {
    if (els.publish.disabled) return;
    els.publish.disabled = true;
    const original = els.publish.textContent;
    els.publish.textContent = "Publishing…";
    try {
      const fields = {
        title: els.title.value, dek: els.dek.value, tag: els.tag.value,
        body: els.body.value, author: els.author.textContent.trim(),
        accent: state.color, emoji: state.emoji, cover: state.coverImage
      };
      const article = editId
        ? await MidiumArticles.updateArticle(editId, fields)
        : await MidiumArticles.addArticle(fields);
      localStorage.removeItem(DRAFT_KEY);
      toast(editId ? "Saved! Redirecting…" : "Published! Redirecting…", "success");
      if (typeof confetti === "function") {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.7 }, colors: [state.color, "#e0a800", "#ffffff"] });
      }
      const goId = editId || (article && article.id);
      setTimeout(() => { window.location.href = "/pages/article.html?id=" + encodeURIComponent(goId); }, 900);
    } catch (e) {
      els.publish.disabled = false;
      els.publish.textContent = original;
      toast("Couldn't publish: " + (e.message || e), "info");
    }
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

    if (editId) {
      await MidiumArticles.load();
      const art = MidiumArticles.getById(editId);
      if (art) {
        els.title.value = art.title; els.dek.value = art.dek || ""; els.tag.value = art.tag || "";
        els.body.value = art.body || "";
        state.color = art.accent || state.color;
        state.emoji = art.emoji || state.emoji;
        state.coverImage = (art.cover && /^data:/.test(art.cover)) ? art.cover : null;
        if (state.coverImage) els.coverRemove.classList.remove("hidden");
        els.author.textContent = art.author || els.author.textContent;
        els.publish.textContent = "Save changes";
        const kicker = document.querySelector(".kicker");
        if (kicker) kicker.insertAdjacentHTML("afterbegin", "✏️ Editing · ");
      }
    } else {
      restoreDraft();
    }
    buildPickers();
    paintPreview();
    refresh();
  }

  init();
})();
