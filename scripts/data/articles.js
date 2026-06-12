/* =========================================================
   ARTICLE STORE
   - SEED: built-in parody articles (the "Midium" house style)
   - user-written posts live in localStorage ("midium-articles")
   - clap counts for seed posts are tracked in "midium-claps"
   Everything is front-end only — no backend, works in preview mode.
   ========================================================= */

window.MidiumArticles = (function () {
  const LS_KEY    = "midium-articles"; // user-written posts
  const CLAPS_KEY = "midium-claps";    // clap overrides for seed posts

  /* ---- Built-in parody articles ---- */
  const SEED = [
    {
      id: "seed-passion", title: "How I Made $0 Following My Passion",
      dek: "A six-figure mindset on a strictly zero-figure income.",
      author: "Chad Vanguard", tag: "Hustle", accent: "#1a8917", emoji: "💸",
      date: "2026-06-08", claps: 1284,
      body:
`They said do what you love and the money will follow. The money has not followed. The money has, in fact, filed a restraining order.

But here's what they don't tell you about the grind: it's mostly grinding. I wake up at 4:57 AM (the 5 AM crowd are quitters) and immediately journal about how grateful I am for things I cannot afford.

My revenue is $0, but my mindset is worth millions, which is also roughly what I owe. Remember: you're not broke, you're pre-rich. Now please buy my $499 course on monetizing your passion.`
    },
    {
      id: "seed-pivot", title: "We're 'Pivoting' — Latin for 'We Have No Idea'",
      dek: "Inside my startup's bold new direction, bravely away from revenue.",
      author: "Brynn Disrupt", tag: "Startups", accent: "#2f6db0", emoji: "📈",
      date: "2026-06-05", claps: 902,
      body:
`When we raised our seed round, we were an app that delivered ice. Then we pivoted to an app that delivers the idea of ice. Then we became an AI company, because that's where the term sheets live now.

Our team is not a team, it's a family. A family that does not have dental, but does have a ping-pong table and a vague sense of dread.

We've burned through $14 million and have one (1) user, who is my mom, and even she churned last Tuesday. But the vision? The vision is intact. We are going to change the world, or at the very least, raise a Series A.`
    },
    {
      id: "seed-therapist", title: "I Replaced My Therapist With a Chatbot. Now We're Both Confused.",
      dek: "It told me to drink water and touch grass. The grass was synthetic.",
      author: "Dev Null", tag: "Tech", accent: "#7a4fd0", emoji: "🤖",
      date: "2026-06-02", claps: 1571,
      body:
`My old therapist cost $200 an hour and made eye contact. My new therapist costs nothing and once told me my feelings were "a great question."

We've made real progress. By "we," I mean the model and I have jointly hallucinated a breakthrough that neither of us can substantiate. It validates everything I say, which is exactly what I asked for and absolutely not what I need.

Last night I told it I felt empty inside. It generated a recipe for soup. Honestly? Closer than my last three relationships.`
    },
    {
      id: "seed-water", title: "I Drank Only Water for 30 Days. Doctors Call It 'Being Alive.'",
      dek: "The ancient wellness secret that Big Hydration doesn't want you gatekeeping.",
      author: "Sage Moonbeam", tag: "Wellness", accent: "#1f9e8a", emoji: "🧘",
      date: "2026-05-29", claps: 643,
      body:
`For 30 days I consumed nothing but water, sunlight, and the smug satisfaction of telling people about it. The results were nothing short of transformative: I was thirsty, then I was not thirsty, then I was thirsty again.

My energy levels skyrocketed, mostly from panic. My skin is glowing, which my dermatologist assures me is "concerning." I have never felt more centered, or more like I'm about to faint near a smoothie bar.

I now charge $1,200 for a weekend retreat where I teach others this protocol. The protocol is water. The retreat is a field.`
    },
    {
      id: "seed-house", title: "How I Bought a House: A Work of Fiction",
      dek: "A gripping tale of imagination, spreadsheets, and quietly crying.",
      author: "Penny Lessworth", tag: "Money", accent: "#c0392b", emoji: "🏠",
      date: "2026-05-25", claps: 2210,
      body:
`Chapter One: I open Zillow. Chapter Two: I close Zillow. This is the entire arc of my home-buying journey and frankly it has more closure than most novels.

Experts say I should simply stop buying coffee. I have run the numbers. If I forgo my daily latte every day for 4,000 years, I will have a 12% down payment, assuming the price of houses politely waits for me, which it will not.

In the end, I did not buy a house. But I did buy a houseplant, named it "Equity," and now I have something that depreciates slower than my dreams.`
    },
    {
      id: "seed-cereal", title: "Is Cereal a Soup? An Investigation Nobody Requested",
      dek: "I followed the milk wherever it led. It led to a difficult conversation.",
      author: "Reed Crumble", tag: "Food", accent: "#e0a800", emoji: "🥣",
      date: "2026-05-21", claps: 488,
      body:
`A soup, by definition, is a liquid food made by boiling ingredients. Cereal is cold, unboiled, and aggressively crunchy. And yet. The milk. The bowl. The spoon. The vibes are undeniably soup-adjacent.

I brought this theory to dinner with my in-laws. By dessert, three relationships had been irreparably damaged and my brother-in-law had left in a Honda. The milk, as ever, remained neutral.

I am no closer to an answer, but I am closer to understanding myself. Cereal is not a soup. Cereal is a cry for help that comes in 14 flavors.`
    }
  ];

  /* ---- localStorage helpers ---- */
  function loadUser() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch (_) { return []; }
  }
  function saveUser(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

  function loadClaps() {
    try { return JSON.parse(localStorage.getItem(CLAPS_KEY)) || {}; }
    catch (_) { return {}; }
  }

  /* ---- public API ---- */
  function readingTime(text) {
    const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  function getAll() {
    const user = loadUser();
    return [...user, ...SEED].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getById(id) { return getAll().find((a) => a.id === id) || null; }

  function addArticle({ title, dek, tag, body, author, accent, emoji }) {
    const article = {
      id: "u-" + Date.now().toString(36),
      title: (title || "Untitled").trim(),
      dek: (dek || "").trim(),
      tag: (tag || "Life").trim(),
      author: (author || "You").trim(),
      accent: accent || "#1a8917",
      emoji: emoji || "📝",
      body: (body || "").trim(),
      date: new Date().toISOString(),
      claps: 0,
      userPost: true,
      readingTime: readingTime(body)
    };
    const user = loadUser();
    user.unshift(article);
    saveUser(user);
    return article;
  }

  function deleteArticle(id) { saveUser(loadUser().filter((a) => a.id !== id)); }

  function clapsFor(article) {
    if (article.userPost) return article.claps || 0;
    const o = loadClaps();
    return o[article.id] !== undefined ? o[article.id] : (article.claps || 0);
  }

  function clap(id) {
    const user = loadUser();
    const idx = user.findIndex((a) => a.id === id);
    if (idx >= 0) { user[idx].claps = (user[idx].claps || 0) + 1; saveUser(user); return user[idx].claps; }
    const seed = SEED.find((a) => a.id === id);
    const o = loadClaps();
    const base = o[id] !== undefined ? o[id] : (seed ? seed.claps || 0 : 0);
    o[id] = base + 1;
    localStorage.setItem(CLAPS_KEY, JSON.stringify(o));
    return o[id];
  }

  function allTags() { return [...new Set(getAll().map((a) => a.tag))]; }

  return { SEED, getAll, getById, addArticle, deleteArticle, clap, clapsFor, allTags, readingTime };
})();
