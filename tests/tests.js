/* =========================================================
   Midium — automated test suite (runs in tests.html)
   Unit + integration tests for MidiumArticles + Paywall.
   Snapshots & restores localStorage so real data is safe.
   ========================================================= */

(function () {
  const out = document.getElementById("results");
  const sum = document.getElementById("summary");
  let pass = 0, fail = 0;

  function line(okFlag, msg) {
    okFlag ? pass++ : fail++;
    const li = document.createElement("li");
    li.textContent = (okFlag ? "✅ " : "❌ ") + msg;
    li.style.color = okFlag ? "#1a8917" : "#c0392b";
    out.appendChild(li);
  }
  const ok = (c, m) => line(!!c, m);
  const eq = (a, b, m) => line(a === b, `${m}  →  expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  function section(name) {
    const li = document.createElement("li");
    li.innerHTML = "<strong>" + name + "</strong>";
    li.style.marginTop = "14px";
    out.appendChild(li);
  }

  // ---- isolate localStorage ----
  const KEYS = ["midium-articles", "midium-claps", "midium-clapped", "midium-bookmarks",
                "midium-member", "midium-reads", "midium-penname", "midium-draft"];
  const snap = {};
  KEYS.forEach((k) => (snap[k] = localStorage.getItem(k)));
  const reset = () => KEYS.forEach((k) => localStorage.removeItem(k));
  const restore = () => KEYS.forEach((k) => { localStorage.removeItem(k); if (snap[k] != null) localStorage.setItem(k, snap[k]); });

  function finish() {
    restore();
    sum.innerHTML = `<strong>${pass} passed, ${fail} failed</strong> · ${pass + fail} assertions`;
    sum.style.background = fail ? "#fbe9e7" : "#eaf6e9";
    sum.style.color = fail ? "#c0392b" : "#1a8917";
  }

  async function run() {
    reset();

    // ===== UNIT · readingTime =====
    section("Unit · readingTime");
    eq(MidiumArticles.readingTime(""), 1, "empty text → 1 min");
    eq(MidiumArticles.readingTime("word ".repeat(200)), 1, "200 words → 1 min");
    eq(MidiumArticles.readingTime("word ".repeat(400)), 2, "400 words → 2 min");

    // ===== UNIT · paywall =====
    section("Unit · paywall");
    reset();
    eq(Paywall.remainingFree(), Paywall.FREE_LIMIT, "remainingFree starts at FREE_LIMIT");
    ok(!Paywall.isMember(), "not a member initially");
    Paywall.setMember(true); ok(Paywall.isMember(), "setMember(true) → member");
    Paywall.cancel(); ok(!Paywall.isMember(), "cancel() removes membership");
    eq(Paywall.remainingFree(), Paywall.FREE_LIMIT, "cancel() resets the free allowance");

    section("Unit · paywall gating logic");
    reset();
    ok(!Paywall.isLocked({ id: "own", userPost: true }), "your own posts are never locked");
    Paywall.setMember(true);
    ok(!Paywall.isLocked({ id: "m1" }), "members are never locked");
    Paywall.cancel(); reset();
    for (let i = 1; i <= 5; i++) Paywall.recordRead("seed-" + i);
    eq(Paywall.remainingFree(), 0, "after reading 5, 0 free reads left");
    ok(Paywall.isLocked({ id: "seed-6" }), "6th distinct article is locked (non-member)");
    ok(!Paywall.isLocked({ id: "seed-3" }), "an already-read article stays unlocked");

    // ===== INTEGRATION · article store (local mode) =====
    section("Integration · article store");
    reset();
    const art = await MidiumArticles.addArticle({
      title: "Hello world", dek: "a dek", tag: "Tech",
      body: "one two three four", author: "Tester", accent: "#2f6db0", emoji: "🚀"
    });
    ok(art && art.id, "addArticle resolves with an article + id");
    ok(art.userPost === true, "new article is flagged userPost");
    ok(!!MidiumArticles.getById(art.id), "getById finds the new article");
    eq(MidiumArticles.getById(art.id).title, "Hello world", "title persisted");
    eq(MidiumArticles.getAll()[0].id, art.id, "newest article sorts to the front of getAll()");

    section("Integration · input sanitization (XSS-safe)");
    const mal = await MidiumArticles.addArticle({
      title: "x", body: "b", accent: "javascript:alert(1)", emoji: "<img src=x onerror=alert(1)>", cover: "javascript:evil"
    });
    const g = MidiumArticles.getById(mal.id);
    eq(g.accent, "#1a8917", "malicious accent falls back to default");
    ok(g.emoji.indexOf("<") === -1 && g.emoji.indexOf(">") === -1, "emoji is stripped of angle brackets");
    eq(g.cover, null, "non-image cover scheme is rejected");

    section("Integration · clap (one per device)");
    const c1 = MidiumArticles.clap(mal.id);
    const c2 = MidiumArticles.clap(mal.id);
    eq(c2, c1, "a second clap does not increase the count");
    ok(MidiumArticles.hasClapped(mal.id), "hasClapped() true after clapping");

    section("Integration · bookmarks");
    ok(MidiumArticles.toggleBookmark(mal.id) === true, "toggleBookmark returns true when adding");
    ok(MidiumArticles.isBookmarked(mal.id), "isBookmarked true after add");
    ok(MidiumArticles.toggleBookmark(mal.id) === false, "toggleBookmark returns false when removing");
    ok(!MidiumArticles.isBookmarked(mal.id), "isBookmarked false after remove");

    section("Integration · edit + delete");
    await MidiumArticles.updateArticle(mal.id, { title: "Edited", body: "x", tag: "Life", accent: "#1a8917", emoji: "📝" });
    eq(MidiumArticles.getById(mal.id).title, "Edited", "updateArticle changes the title");
    await MidiumArticles.deleteArticle(mal.id);
    ok(MidiumArticles.getById(mal.id) === null, "deleteArticle removes the article");

    section("Integration · seed articles always present");
    ok(MidiumArticles.getAll().some((a) => a.id === "seed-finish"), "house/seed articles appear in getAll()");
    ok(MidiumArticles.allTags().length > 3, "allTags() returns multiple topics");
  }

  run().catch((e) => ok(false, "fatal error: " + (e && e.message))).finally(finish);
})();
