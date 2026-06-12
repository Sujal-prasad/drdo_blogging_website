/* =========================================================
   ARTICLE STORE
   - SEED: a small set of well-written sample articles
   - user-written posts live in localStorage ("midium-articles")
   - clap counts for seed posts are tracked in "midium-claps"
   Everything is front-end only — no backend, works in preview mode.
   ========================================================= */

window.MidiumArticles = (function () {
  const LS_KEY    = "midium-articles"; // user-written posts
  const CLAPS_KEY = "midium-claps";    // clap overrides for seed posts

  /* ---- Built-in sample articles ---- */
  const SEED = [
    {
      id: "seed-finish", title: "The Lost Art of Finishing What You Start",
      dek: "Beginning has never been easier or more celebrated. Finishing is where the real work — and the real reward — lives.",
      author: "Imogen Clarke", tag: "Productivity", accent: "#c0392b", emoji: "🏁",
      date: "2026-06-11", claps: 1342,
      body:
`We are surrounded by beginnings. New projects, new apps, new year's resolutions — starting has never been easier or more celebrated. Finishing, by contrast, is quiet, unglamorous, and increasingly rare.

There is a reason for this. Beginning is fueled by novelty and optimism; the project exists, untarnished, only in the imagination. Finishing means confronting the gap between that imagined version and the messy, compromised, real one. 🪛 The last ten percent — the debugging, the proofreading, the final coat of paint — is where the excitement runs out and the discipline begins.

Psychologists describe the pull of unfinished tasks as the Zeigarnik effect: open loops occupy the mind, nagging quietly for attention. A dozen half-finished projects don't just sit on a shelf; they sit in your head, each one drawing a little energy. Finishing is, among other things, an act of mental hygiene.

The craftsperson's secret is not superior motivation but a different relationship with the word "done." Done is not perfect; done is shipped. A finished thing that exists in the world will teach you more than a perfect thing that never leaves your desk — because the world answers back, and your imagination only flatters.

So the advice is almost embarrassingly simple: finish things. Choose fewer beginnings and grant them the dignity of an ending. The satisfaction waiting at the close of a completed task is one of the few reliable pleasures that never quite wears off. 🏁`
    },
    {
      id: "seed-editing", title: "Why the Best Writers Are Ruthless Editors",
      dek: "Good writing is mostly rewriting — and rewriting is mostly deleting.",
      author: "Oliver Hanson", tag: "Culture", accent: "#1f9e8a", emoji: "✒️",
      date: "2026-06-10", claps: 988,
      body:
`Ask a room of people what makes good writing and most will point to the writing itself — the vocabulary, the turns of phrase, the flashes of brilliance. Ask a professional, and they'll point to the editing.

Good writing is rewriting. ✒️ The first draft exists only to be wrong on paper, to get the raw clay onto the wheel. The real work begins afterward, in the unglamorous act of cutting: removing the clever line that flatters the writer but doesn't serve the reader, collapsing three sentences into one, deleting the very paragraph you were proudest of because the piece is sharper without it.

"Kill your darlings," the old advice goes, and it endures because it is so hard to follow. The sentences we cling to are often the ones doing the least work — ornaments mistaken for structure.

Editing is also where thinking gets sharpened. Vague writing is almost always a symptom of vague thinking; forcing a sentence to be precise forces you to discover what you actually believe. This is why writing is such a powerful tool for thought — and why handing it over wholesale to a machine quietly costs you something you may not notice until it's gone.

None of this requires rare talent so much as patience and honesty: the willingness to read your own work as a stranger would, and to serve the reader over the author. The page does not care how clever you felt while writing it. It only cares whether it is clear. 🖊️`
    },
    {
      id: "seed-walking", title: "What History's Great Thinkers Knew About Walking",
      dek: "From Aristotle to Darwin, the same humble habit keeps showing up behind big ideas.",
      author: "Beatrix Lowe", tag: "Health", accent: "#1a8917", emoji: "🚶",
      date: "2026-06-09", claps: 1175,
      body:
`Charles Darwin kept a gravel path behind his house that he called his "thinking path." He walked it several times a day, working through problems step by step — sometimes literally kicking stones off the trail to count his laps, so he wouldn't have to interrupt his thoughts to keep track.

He was in good company. 🚶 Aristotle taught while walking; his school was named the Peripatetic, from the Greek for "given to walking." Nietzsche claimed that all truly great thoughts are conceived while walking. Dickens roamed London for miles at night. The pattern is too consistent to be a coincidence.

Modern research has caught up to the intuition. Studies find that walking — especially outdoors — measurably boosts creative thinking, both during the walk and for a while afterward. The gentle, rhythmic, semi-automatic motion seems to occupy the body just enough to free the mind, letting it wander and make the loose associations creativity depends on.

There is also the matter of attention. A walk with no destination, and ideally no headphones, is one of the last socially acceptable forms of doing nothing. It creates the empty space in which ideas surface — the same space we now reflexively fill with a screen at every red light and elevator ride.

The prescription is cheap and ancient: when stuck, go for a walk. Leave the phone, or at least the podcast, behind. Let the problem rattle around while your feet do the thinking. The answer, more often than not, is somewhere along the path. 🌳`
    },
    {
      id: "seed-attention", title: "Designing Technology That Respects Your Time",
      dek: "The best products give your attention back instead of competing for more of it.",
      author: "Maya Iyer", tag: "Technology", accent: "#2f6db0", emoji: "⏳",
      date: "2026-06-08", claps: 642,
      body:
`For most of the last decade, software success was measured in engagement: minutes spent, sessions per day, notifications opened. The unintended result is a generation of products engineered to be difficult to put down.

A quieter design philosophy is gaining ground. Calm technology asks a different question — not "how do we capture attention?" but "how do we return it?" In practice that means sensible defaults, notifications that batch instead of interrupt, and interfaces that finish the job and get out of the way.

The shift is not anti-technology; it is pro-intention. A tool that respects your time earns a different kind of loyalty — the kind that survives once the novelty fades. As more people audit where their hours go, the products that win may be the ones humble enough to ask for fewer of them.`
    },
    {
      id: "seed-forget", title: "The Science of Why We Forget What We Read",
      dek: "Memory is built through retrieval, not exposure — and that should change how we read.",
      author: "Daniel Hart", tag: "Science", accent: "#7a4fd0", emoji: "🧠",
      date: "2026-06-05", claps: 980,
      body:
`We tend to assume that reading something carefully is enough to remember it. Decades of memory research suggest otherwise. Within days, most of what we passively consume fades — a pattern first mapped by Hermann Ebbinghaus and his "forgetting curve."

What reliably slows the decline is retrieval: the effort of pulling information back out of memory. Closing the book and trying to summarize a chapter in your own words does more for retention than re-reading it three times. Spacing those attempts over days, rather than cramming them together, strengthens the effect further.

The practical takeaway is modest but powerful. Read a little less, and recall a little more. Keep notes that force you to restate ideas, not just highlight them. The goal of reading is not to have read — it is to be changed by what you read, and that change is made of effortful recall.`
    },
    {
      id: "seed-commonplace", title: "In Praise of the Commonplace Book",
      dek: "A centuries-old habit for thinking on paper is quietly making a comeback.",
      author: "Eleanor Briggs", tag: "Culture", accent: "#1f9e8a", emoji: "📚",
      date: "2026-06-02", claps: 415,
      body:
`Long before the note-taking app, readers kept commonplace books: personal anthologies of quotations, observations, and stray ideas worth keeping. Marcus Aurelius, John Locke, and Virginia Woolf all maintained versions of them. Locke even published a method for indexing one.

The appeal is not nostalgia. A commonplace book turns reading from a stream you forget into a collection you can revisit. Copying a passage by hand slows you down just enough to think about why it mattered. Over time, themes emerge that you never planned — your own preoccupations, made visible.

You do not need a beautiful notebook or a perfect system to begin. A single page, a date, and one idea worth remembering is enough. The discipline is small; the compounding return, like most reading habits, arrives quietly and late.`
    },
    {
      id: "seed-teams", title: "How Great Teams Make Decisions",
      dek: "Speed and quality are not opposites — the best teams deliberately design for both.",
      author: "Rohan Mehta", tag: "Business", accent: "#1a8917", emoji: "🧭",
      date: "2026-05-29", claps: 1203,
      body:
`Most teams slow down for the wrong reasons. They treat every choice as if it were permanent, applying the same heavy process to a reversible experiment that they would to a one-way door. The result is a culture that confuses caution with rigor.

A more useful frame separates decisions by reversibility. Reversible decisions should be made quickly, by the people closest to the work; if they are wrong, you simply change course. Irreversible decisions deserve genuine deliberation — written proposals, named trade-offs, and a clear owner.

The other ingredient is the willingness to disagree and commit. Endless consensus-seeking feels collaborative but quietly erodes accountability. The strongest teams argue honestly, decide clearly, and then move together — even the people who lost the argument. Clarity, not unanimity, is what lets a group move fast without breaking trust.`
    },
    {
      id: "seed-cities", title: "How Cities Are Redesigning Themselves Around People",
      dek: "From car-first to people-first: the slow, deliberate return of the walkable city.",
      author: "Lucía Romero", tag: "Society", accent: "#e06b2f", emoji: "🏙️",
      date: "2026-05-25", claps: 738,
      body:
`For half a century, many cities optimized for one thing: moving cars quickly. Streets widened, parking multiplied, and neighborhoods were spaced for the windshield rather than the sidewalk. The costs — congestion, pollution, isolation — accumulated slowly enough to feel normal.

A counter-movement is reshaping urban policy. The "15-minute city" proposes that daily needs — groceries, school, work, green space — should sit within a short walk or bike ride. Cities from Paris to Bogotá are removing parking minimums, narrowing traffic lanes, and reclaiming street space for people.

None of this is simple, and the politics are real. But the underlying idea is old and intuitive: a city is for the people who live in it. Designing around the human pace, rather than the engine, tends to produce places people actually want to be.`
    },
    {
      id: "seed-energy", title: "Understanding the New Wave of Clean Energy",
      dek: "Solar, storage, and smarter grids are changing faster than most forecasts predicted.",
      author: "Amara Okafor", tag: "Science", accent: "#e0a800", emoji: "🌍",
      date: "2026-05-20", claps: 854,
      body:
`Energy transitions are usually slow, which is exactly why the last decade has surprised so many analysts. The cost of solar power has fallen by roughly 90%, and battery storage has followed a similar curve. Technologies once dismissed as boutique are now, in many places, the cheapest electricity available.

The harder problem is no longer generation but timing. The sun does not shine on demand, so the next frontier is flexibility: large-scale storage, grids that can shift load across regions, and software that matches supply to demand minute by minute.

Forecasting the pace from here is genuinely difficult — incentives, supply chains, and politics all pull in different directions. But the direction is no longer in serious doubt. The interesting questions have shifted from "if" to "how fast," and the answers increasingly depend on engineering and policy rather than on the underlying economics.`
    },
    {
      id: "seed-sleep", title: "What the Latest Research Says About Sleep",
      dek: "We spent years trying to need less of it. The science keeps insisting otherwise.",
      author: "Nadia Rahman", tag: "Health", accent: "#2f6db0", emoji: "😴",
      date: "2026-05-18", claps: 1106,
      body:
`For years, sleep was treated as downtime — hours to be trimmed in the name of productivity. The research now points the other way: sleep is when the brain consolidates memory, clears metabolic waste, and regulates mood. Cutting it short undercuts the very faculties we stay up to use.

The most robust findings are also the least glamorous. Consistency matters more than perfection: going to bed and waking at the same time, even on weekends, stabilizes the body's internal clock. Morning light and its absence at night do much of the heavy lifting.

There is no supplement or gadget that reliably beats the basics. A cool, dark room, a steady schedule, and a genuine wind-down routine outperform almost everything sold to "optimize" sleep. The unglamorous truth is that good sleep is mostly a habit, not a purchase.`
    },
    {
      id: "seed-objects", title: "The Hidden History of Everyday Objects",
      dek: "The things we handle without thinking each carry a long and unlikely story.",
      author: "Thomas Vale", tag: "History", accent: "#7a4fd0", emoji: "🗝️",
      date: "2026-05-15", claps: 524,
      body:
`The objects we use without a second thought each carry a long, strange history. The humble pencil combines graphite from one place, wood from another, and a manufacturing process that puzzled engineers for centuries. The zipper took decades to win the public's trust.

Studying everyday things is a quiet antidote to the myth of the lone inventor. Most of what we use is the product of countless small improvements, made by people whose names we will never know, refined across generations until the object seems inevitable.

There is a lesson in that for anyone who makes things. The designs that feel obvious in hindsight were rarely obvious at the time. Mastery often looks like the patient removal of friction, until what remains seems to have always been there.`
    },
    {
      id: "seed-habits", title: "How Small Habits Compound Into Careers",
      dek: "The flat part of the curve is where most people quit — and where everything is decided.",
      author: "Grace Lin", tag: "Productivity", accent: "#1a8917", emoji: "🌱",
      date: "2026-05-12", claps: 1342,
      body:
`Careers are rarely transformed by single decisions. They are shaped by small habits repeated across years — the daily half hour of practice, the consistent follow-through, the willingness to do unglamorous work well. These compound quietly until, from the outside, they look like talent.

The difficulty is that compounding is invisible in the short term. A month of effort produces little; a decade produces a great deal. Most people quit during the flat part of the curve, mistaking slow progress for no progress.

The practical move is to lower the bar for consistency and raise it for quality. A habit you can keep on a bad day beats an ambitious routine you abandon in a week. Show up, do the work well, and let time do the rest.`
    },
    {
      id: "seed-investing", title: "The Underrated Power of Boring Investing",
      dek: "The most reliable financial advice rarely makes headlines, because there's nothing to sell.",
      author: "Victor Adeyemi", tag: "Finance", accent: "#c0392b", emoji: "📊",
      date: "2026-05-09", claps: 1789,
      body:
`The most reliable investing advice is also the most boring: spend less than you earn, invest the difference in low-cost, broadly diversified funds, and leave it alone for decades. It rarely makes headlines because there is nothing exciting to sell.

Excitement, in markets, is usually a cost. Frequent trading, chasing trends, and trying to time the market tend to erode returns through fees, taxes, and badly timed decisions. The investor's worst enemy is often their own impatience.

None of this guarantees outcomes, and personal circumstances vary. But the evidence is consistent: a simple, patient, low-cost approach beats most clever ones over the long run. In investing, boring is frequently a feature, not a bug.`
    },
    {
      id: "seed-creativity", title: "Where Creative Ideas Actually Come From",
      dek: "Originality is less a lightning strike than a long, deliberate collection of inputs.",
      author: "Sofia Marchetti", tag: "Culture", accent: "#e06b2f", emoji: "🎨",
      date: "2026-05-06", claps: 661,
      body:
`Creativity is often imagined as a flash of inspiration, but the more accurate picture is recombination: new ideas are usually old ideas joined in unfamiliar ways. The wider and more varied your inputs, the more raw material you have to combine.

This is why so many breakthroughs come from the edges between fields. A biologist who reads about architecture, a programmer who studies music — the cross-pollination produces connections specialists rarely see. Originality is frequently a matter of unusual reading lists.

The implication is encouraging. Creativity is less a gift you are born with than a practice you can cultivate: collect widely, pay attention, and give ideas time to collide. Inspiration favors the well-stocked mind.`
    },
    {
      id: "seed-coffee", title: "The Science of a Better Cup of Coffee",
      dek: "Three variables do almost all the work — and none of them require expensive gear.",
      author: "Hiroshi Tanaka", tag: "Food", accent: "#a9742f", emoji: "☕",
      date: "2026-05-03", claps: 803,
      body:
`A good cup of coffee is mostly chemistry. Extraction — how much of the ground coffee dissolves into water — determines whether a cup tastes sour, balanced, or bitter. Get the variables right and even modest beans can shine.

Three factors do most of the work: grind size, water temperature, and time. Too coarse or too fast, and the coffee under-extracts into sourness; too fine or too slow, and it over-extracts into bitterness. The sweet spot is narrower than most people expect, which is why consistency matters.

The encouraging news is that none of this requires expensive equipment. A scale, fresh beans, and attention to the basics improve a cup more than any gadget. Better coffee is mostly a matter of measuring what you were already doing.`
    },
    {
      id: "seed-boredom", title: "The Surprising Upside of Boredom",
      dek: "The restless, empty moments we now fill with screens may be where the mind does its best work.",
      author: "Priya Nair", tag: "Psychology", accent: "#1f9e8a", emoji: "🧩",
      date: "2026-04-29", claps: 947,
      body:
`Boredom has a bad reputation, but psychologists increasingly see it as useful. The restless, unfocused state we try so hard to avoid is often where the mind wanders, makes connections, and generates ideas. Constant stimulation may be quietly crowding it out.

Studies suggest that people allowed to be bored before a creative task tend to perform better on it. The empty moments — waiting in line, walking without headphones — are when the brain processes and reorganizes in the background. We have filled almost all of them with screens.

Reclaiming a little boredom need not be dramatic. Leaving the phone in another room, taking a walk with nowhere to be, letting a dull moment simply be dull — these small acts return something we did not realize we had lost.`
    },
    {
      id: "seed-ai-hype", title: "How to Think Clearly About AI Hype",
      dek: "Resist both the breathless optimism and the reflexive dismissal, and ask narrower questions.",
      author: "Marcus Bell", tag: "Technology", accent: "#2f6db0", emoji: "🤖",
      date: "2026-04-25", claps: 1488,
      body:
`Every powerful new technology arrives wrapped in equal parts promise and exaggeration, and artificial intelligence is no exception. Thinking clearly about it means resisting both the breathless optimism and the reflexive dismissal, and asking narrower, more useful questions.

A good starting point is specificity: not "what can AI do?" but "what can this system do reliably, on this task, with what error rate?" Capabilities that look magical in a demo often prove uneven in practice — strong in some areas and surprisingly brittle in others.

The honest position is one of calibrated uncertainty. These tools are genuinely useful and genuinely limited, and the boundary moves quickly. Treating them as instruments to be evaluated, rather than oracles to be believed or feared, is the clearest way to think about a fast-moving field.`
    },
    {
      id: "seed-fourday", title: "The Case for the Four-Day Week",
      dek: "A growing number of companies are testing whether five days was ever the point.",
      author: "Helena Frost", tag: "Business", accent: "#1a8917", emoji: "🗓️",
      date: "2026-04-21", claps: 1255,
      body:
`The five-day week is a convention, not a law of nature — and a growing number of companies are testing whether it still makes sense. The early trials are striking: many report the same output in four days, with happier, healthier, more focused employees.

The mechanism is less about working faster than about working better. Given less time, teams cut low-value meetings, guard their attention, and protect deep work. Constraints, it turns out, can sharpen rather than diminish.

It is not a universal fix; some roles and industries don't fit the model neatly. But the experiments challenge a quiet assumption — that hours and value are the same thing. For knowledge work, at least, the link is looser than we long believed.`
    },
    {
      id: "seed-language", title: "What Learning a Language Does to the Brain",
      dek: "It does far more than add vocabulary — it reshapes how the mind works.",
      author: "Diego Santos", tag: "Science", accent: "#7a4fd0", emoji: "🗣️",
      date: "2026-04-17", claps: 712,
      body:
`Learning a new language does more than add vocabulary; it reshapes the brain. Neuroimaging studies show denser grey matter and stronger connectivity in bilingual brains, along with measurable gains in attention and task-switching.

The benefits extend beyond the practical. Speaking another language appears to delay the onset of age-related cognitive decline by several years on average. The constant, low-level effort of choosing between two systems seems to keep the mind limber.

Perhaps most striking is the shift in perspective. A new language is a new set of distinctions — concepts your first language never named. Learning one is less like installing software than like growing a second way of seeing.`
    },
    {
      id: "seed-difficultbook", title: "How to Read a Difficult Book",
      dek: "The hardest books reward a slower, stranger kind of reading than we were taught.",
      author: "Arthur Penn", tag: "Culture", accent: "#1f9e8a", emoji: "📖",
      date: "2026-04-13", claps: 588,
      body:
`We are taught to read for comprehension — smoothly, start to finish. But difficult books reward a different approach. The first read is for the shape of the argument; understanding every line on the first pass is neither necessary nor possible.

Active reading helps: arguing in the margins, summarizing each chapter in a sentence, looking up what you don't know. A hard book is a conversation, and conversations require participation. Passive reading slides off a demanding text like water off glass.

The deeper shift is one of patience. Some books are meant to be reread across years, yielding more each time as you bring more to them. Difficulty is not a flaw to be avoided but, often, the point.`
    },
    {
      id: "seed-moon", title: "Why We Keep Going Back to the Moon",
      dek: "Half a century on, the Moon is busy again — and this time we intend to stay.",
      author: "Lena Vostok", tag: "Science", accent: "#2f6db0", emoji: "🌙",
      date: "2026-04-09", claps: 1031,
      body:
`More than half a century after the first landing, the Moon is busy again. Space agencies and private companies alike are planning returns — not for flags and footprints, but for water ice, research, and a staging ground for journeys farther out.

The renewed interest is partly practical. The Moon's poles hold frozen water that could one day supply drinking water, breathable oxygen, and rocket fuel, dramatically lowering the cost of deep-space travel. A base there is a stepping stone, not a destination.

There is also something harder to quantify. The Moon remains the only other world humans have walked upon, and going back tests the technologies — and the resolve — that any future beyond Earth will require.`
    },
    {
      id: "seed-fewerthings", title: "On Doing Fewer Things, Better",
      dek: "When overwhelmed, the instinct is to add. The more effective move is to subtract.",
      author: "Sam Whitfield", tag: "Productivity", accent: "#c0392b", emoji: "🎯",
      date: "2026-04-05", claps: 1394,
      body:
`The instinct, when overwhelmed, is to do more — to add systems, hours, and commitments. The more effective move is usually the opposite: to do fewer things, and to do them well. Focus is a form of respect for your own attention.

Every yes is a quiet no to something else. Saying yes to everything scatters effort thinly across too many fronts, where it accomplishes little and satisfies less. A short list, pursued seriously, tends to outperform a long one pursued anxiously.

This is harder than it sounds, because saying no carries a social cost and a fear of missing out. But work of real depth is built by subtraction at least as much as addition. Less, chosen deliberately, is frequently more.`
    },
    {
      id: "seed-greenspace", title: "The Quiet Comeback of Urban Green Space",
      dek: "Cities are rediscovering that parks and trees are infrastructure, not decoration.",
      author: "Lucía Romero", tag: "Society", accent: "#e06b2f", emoji: "🌳",
      date: "2026-04-01", claps: 626,
      body:
`After decades of paving, cities are rediscovering the value of green space. Parks, street trees, and pocket gardens are no longer treated as decoration but as infrastructure — cooling streets, managing stormwater, and improving public health.

The evidence is substantial. Access to greenery is linked to lower stress, cleaner air, and stronger community ties. Trees alone can lower local temperatures by several degrees, a growing concern as cities heat up.

The challenge is equity. Green space has often been concentrated in wealthier neighborhoods, leaving others without. The most thoughtful planning now treats access to nature not as a luxury, but as something every resident is owed.`
    },
    {
      id: "seed-design-no", title: "Good Design Is Mostly About Saying No",
      dek: "Behind every clean interface is a long list of good ideas that were declined.",
      author: "Mei Chen", tag: "Design", accent: "#a9742f", emoji: "✏️",
      date: "2026-03-28", claps: 879,
      body:
`Good design is often imagined as adding the right features. More often, it is the discipline of leaving things out. Every element on a page or in a product competes for attention; the art is deciding what does not belong.

Saying no is difficult because each individual request is reasonable. The accumulated weight of a hundred reasonable additions, however, is clutter. The best designers act as editors, protecting the whole from the well-meaning parts.

The result, when it works, looks effortless — even obvious. That simplicity is not the absence of effort but its concentration. Behind every clean interface is a long list of good ideas that were, deliberately, declined.`
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

  // give seed articles a real (grayscale, editorial) cover photo if they don't have one;
  // the feed/reader tints it with the article's accent for a cohesive branded look.
  function withCover(a) {
    if (!a.cover) a.cover = "https://picsum.photos/seed/mid-" + a.id + "/1200/640?grayscale";
    return a;
  }

  function getAll() {
    const user = loadUser();
    const seed = SEED.map(withCover);
    return [...user, ...seed].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getById(id) { return getAll().find((a) => a.id === id) || null; }

  function addArticle({ title, dek, tag, body, author, accent, emoji }) {
    const article = {
      id: "u-" + Date.now().toString(36),
      title: (title || "Untitled").trim(),
      dek: (dek || "").trim(),
      tag: (tag || "General").trim(),
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
