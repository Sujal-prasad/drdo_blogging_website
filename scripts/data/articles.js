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
`Everything around us is built to celebrate the start. We announce the diet, post the launch, buy the blank notebook that feels thick with promise. Starting is easy, partly because the thing you're starting doesn't exist yet — and so it's perfect. No bugs, no awkward feedback, no logistics. Finishing is the opposite. It's the point where the version in your head collides with what you can actually pull off, and that collision is quiet, unglamorous, and increasingly rare in a culture that rewards the pivot over the follow-through.

## Why finishing feels so hard

There's a real reason the last stretch hurts. Taking something from ninety percent to done means letting go of the flattering version in your head and accepting the compromised one in your hands. Programmers even have a name for it — the ninety-ninety rule, coined by Tom Cargill at Bell Labs: the first 90% of the code takes the first 90% of the time, and the last 10% takes the other 90%. The end of almost any project is mostly edge cases, cleanup, and small fixes nobody will notice, which is exactly where the motivation tends to drain out.

## The hidden cost of open loops

Unfinished work doesn't just sit on a shelf; it sits in your head. In the 1920s the psychologist Bluma Zeigarnik noticed that waiters could recall unpaid orders in detail but forgot them the moment the bill was settled. We hold open tasks in a kind of mental tab that closed ones don't get. A dozen half-done projects quietly charge rent on your attention, each one a small reminder that you didn't follow through. Finishing isn't only about output, then. It's about getting your head back.

## Redefining what "done" means

People who finish things aren't necessarily more disciplined. They just have a looser grip on the word "done." Done isn't perfect; done is shipped. A flawed thing out in the world teaches you more in a week than a perfect thing on your hard drive teaches you in a year, because the world actually answers back — readers, users, numbers — while your imagination only ever agrees with you. So the advice ends up being almost boring: start fewer things, sit through the dull middle, and let the work end.`
    },
    {
      id: "seed-editing", title: "Why the Best Writers Are Ruthless Editors",
      dek: "Good writing is mostly rewriting — and rewriting is mostly deleting.",
      author: "Oliver Hanson", tag: "Culture", accent: "#1f9e8a", emoji: "✒️",
      date: "2026-06-10", claps: 988,
      body:
`Ask casual readers what makes great writing and they point to the surface: the vocabulary, the clever metaphor, the line that seems to have arrived fully formed. Ask working writers and they point to something you can't see on the page — the editing. The image of the genius who bleeds perfect prose onto a first draft is mostly a flattering myth. Good writing is rewriting; the first draft just gets words down so there's something to fix.

A first draft has one job: to exist. It's raw clay. Beginners often read their messy opening attempt as proof they're frauds, not realizing a bad first draft is the normal starting point for nearly everyone who has ever written well. Hemingway said he rewrote the ending of *A Farewell to Arms* thirty-nine times; asked what had stumped him, he answered, "Getting the words right." The work is the rewriting.

The real change happens with the delete key. Editing means cutting the clever sentence that flatters you but stalls the reader, and collapsing three wandering paragraphs into the one that lands. "Murder your darlings" — Arthur Quiller-Couch's line, since borrowed by everyone — survives because it's hard advice to take. The sentences we're proudest of are often the ones doing the least work: decoration we've mistaken for structure.

And editing isn't grammar tidying; it's where the thinking actually happens. Muddy writing usually isn't a vocabulary problem, it's a thinking problem, and you can't hide unresolved thinking behind jargon once you force a sentence to be exact. Compression makes you find out what you actually believe. That's the real reason handing the job to a chatbot is a bad trade: it saves you the typing and skips the part where you'd have worked out what you think.`
    },
    {
      id: "seed-walking", title: "What History's Great Thinkers Knew About Walking",
      dek: "From Aristotle to Darwin, the same humble habit keeps showing up behind big ideas.",
      author: "Beatrix Lowe", tag: "Health", accent: "#1a8917", emoji: "🚶",
      date: "2026-06-09", claps: 1175,
      body:
`Behind Down House, his home in Kent, Charles Darwin kept a gravel path he called the "sandwalk" and treated it as a thinking room. He walked it several times a day while working through the problems of evolution, and he'd lay out a small pile of flints at one end, kicking one aside each lap so he never had to break concentration to count. He seemed to know his mind worked best when his body was moving.

## A habit shared across the centuries

He was in good company. Immanuel Kant's afternoon walks through Königsberg were supposedly so punctual that neighbors set their clocks by him. Aristotle taught while pacing, which is why his school was called the Peripatetic — Greek for "walking about." Thoreau wrote a whole essay on the virtue of sauntering, and Kierkegaard said he had "walked himself into his best thoughts." When the same habit turns up this often across centuries, it stops looking like coincidence.

## What the brain scans reveal

Research has caught up to the intuition. A 2014 Stanford study by Marily Oppezzo and Daniel Schwartz found that walking — on a treadmill indoors or outside in the air — raised people's scores on tests of creative, divergent thinking, and the lift carried over for a while after they sat back down. The likely reason is mechanical: the steady, semi-automatic rhythm of walking occupies just enough of the motor system to loosen the grip of the planning, self-conscious mind and let looser associations surface.

## The prescription for being stuck

Walking also produces "optic flow," the gentle streaming of the world past you as you move, which seems to calm some of the brain's stress circuitry. A walk with no destination and nothing in your ears is one of the last ordinary forms of undirected thought we have left — and we keep paving it over with a screen at every queue and red light. The old prescription still holds: when you're stuck, leave the phone on the desk, go outside, and let your feet do some of the thinking.`
    },
    {
      id: "seed-attention", title: "Designing Technology That Respects Your Time",
      dek: "The best products give your attention back instead of competing for more of it.",
      author: "Maya Iyer", tag: "Technology", accent: "#2f6db0", emoji: "⏳",
      date: "2026-06-08", claps: 642,
      body:
`For most of the last two decades, software was built around one number: engagement. Time on site, sessions per day, scroll depth, notifications opened — that was the scoreboard, and teams optimized hard for it. The predictable result is a generation of apps tuned by very capable people to be difficult to put down. We handed over a lot of attention in exchange for infinite scrolls and the small, unreliable rewards that keep a slot machine interesting.

As the fatigue with all that sets in, a quieter idea is gaining ground among designers. "Calm technology" — a phrase coined by Mark Weiser and John Seely Brown at Xerox PARC in the 1990s — starts from a different question: not how do we capture attention, but how do we hand it back as fast as possible?

In practice that looks unlike the apps we're used to. Quiet defaults, where interruptions are opt-in. Notifications gathered into one digest instead of a buzz every few minutes. Interfaces built to help you finish the task and leave, rather than linger. No invented streaks, no red dots manufacturing urgency that wasn't there.

None of this is anti-technology; it's pro-intention. A tool that respects your time earns a steadier kind of loyalty — the kind that outlasts novelty. As more people start noticing where their hours actually go, patience is wearing thin for apps that behave like needy toddlers. The companies that win the next decade may be the ones secure enough to ask for less of our time, not more.`
    },
    {
      id: "seed-forget", title: "The Science of Why We Forget What We Read",
      dek: "Memory is built through retrieval, not exposure — and that should change how we read.",
      author: "Daniel Hart", tag: "Science", accent: "#7a4fd0", emoji: "🧠",
      date: "2026-06-05", claps: 980,
      body:
`We carry a comfortable illusion about reading. Read a good nonfiction book slowly, nod along, highlight the sharp bits in yellow, and it feels like the ideas are now safely yours. The research disagrees. Within days of finishing, most of what we read passively is gone. Hermann Ebbinghaus first mapped this in the 1880s by memorizing nonsense syllables and tracking how quickly he lost them — the "forgetting curve" that later studies have largely borne out.

The trap even has a name: the illusion of fluency. Because a well-written passage makes sense as your eyes move over it, the brain mistakes "this is clear" for "I know this." But recognizing something on the page is not the same as recalling it cold. The brain is thrifty; it lets go of whatever it doesn't treat as important, and quietly reading along never flags importance.

What actually slows the curve is retrieval — the slightly uncomfortable work of pulling an idea back out of your own head without looking. Shutting the book and saying the chapter's argument out loud, or writing it in your own words, does far more for retention than reading it a third time. Spreading those attempts across days, what researchers call spaced repetition, strengthens the memory further. Roediger and Karpicke's experiments on the "testing effect" are the standard reference here.

The practical version is humbling: to learn more, read less and recall more. Keep something nearby that forces you to restate ideas plainly instead of just collecting quotes. The point of a good book was never to be able to say you finished it. It's to be changed by it — and that part only happens through the friction of trying to remember.`
    },
    {
      id: "seed-commonplace", title: "In Praise of the Commonplace Book",
      dek: "A centuries-old habit for thinking on paper is quietly making a comeback.",
      author: "Eleanor Briggs", tag: "Culture", accent: "#1f9e8a", emoji: "📚",
      date: "2026-06-02", claps: 415,
      body:
`Long before bookmarking apps and seventy open tabs, serious readers kept a commonplace book: a personal, handwritten anthology of quotations, stray thoughts, overheard lines, and ideas worth keeping. Marcus Aurelius's private version essentially became the *Meditations*. Erasmus, Milton, and Virginia Woolf all kept their own. John Locke was devoted enough to publish a method for indexing the entries.

The recent revival isn't really nostalgia; it's a response to overload. We read more in a week than our great-grandparents read in years and keep almost none of it. A commonplace book interrupts that. It turns reading from a stream that rushes past into something you can return to — and copying a passage out by hand slows you down just enough to actually think about it, running the author's words through your own hand.

Fill the pages over months and something unplanned happens: themes surface on their own. You start to notice odd, useful connections — a line of Stoic philosophy beside a note on architecture beside a thought you had on the train. The book stops being a pile of quotes and becomes a rough map of your own attention: the things you keep circling back to.

You don't need a leather notebook or a perfectly tagged app. Fussing over the ideal system is usually procrastination wearing a productive face. A cheap notebook, the date, and one sentence that made you stop is enough to begin. The habit is small and unglamorous, but it compounds, and over time it changes how you read everything.`
    },
    {
      id: "seed-teams", title: "How Great Teams Make Decisions",
      dek: "Speed and quality are not opposites — the best teams deliberately design for both.",
      author: "Rohan Mehta", tag: "Business", accent: "#1a8917", emoji: "🧭",
      date: "2026-05-29", claps: 1203,
      body:
`Most teams slow down for the wrong reasons. As a company grows, it starts treating every choice like a permanent one, pushing a small reversible experiment through the same heavy approval process it would use for a bet-the-company move. That confuses caution with rigor, and it ends in analysis paralysis — a state where doing nothing feels safer than trying something and being wrong.

Jeff Bezos's old Amazon shareholder letters offer a cleaner way to sort decisions: by whether they can be undone. Type 2 decisions are two-way doors. Walk through, find it was a mistake, walk back, lose a little time. These should be made quickly, at maybe seventy percent of the information you'd like, by the people closest to the work. Type 1 decisions are one-way doors — an acquisition, a core architecture choice — and those deserve slow, careful, written deliberation. Most teams' real error is running their Type 2 decisions as if they were Type 1.

The other ingredient is the habit Intel's Andy Grove called "disagree and commit." Chasing full consensus feels collegial, but it slows everything to the pace of the most hesitant person in the room and sands bold ideas down into compromises nobody actually believes in.

Strong teams argue hard in the room — challenging the most senior person, fighting over the data without ego. But once the call is made, everyone executes, including the people who lost the argument; they don't quietly wait for it to fail so they can say they were right. Clear direction, not forced agreement, is what lets capable people move fast without wrecking trust.`
    },
    {
      id: "seed-cities", title: "How Cities Are Redesigning Themselves Around People",
      dek: "From car-first to people-first: the slow, deliberate return of the walkable city.",
      author: "Lucía Romero", tag: "Society", accent: "#e06b2f", emoji: "🏙️",
      date: "2026-05-25", claps: 738,
      body:
`For most of the last century, planners in nearly every big city optimized for one thing: moving cars quickly. Tight old street grids were widened into multi-lane arterials, surface parking lots spread, and neighborhoods were spaced out for the windshield rather than the pedestrian. The costs — congestion, bad air, pedestrian deaths, a kind of civic loneliness — arrived slowly enough that they started to feel like the normal price of modern life.

Lately a different idea has taken hold. The "15-minute city," associated with the urbanist Carlos Moreno, proposes something almost obvious: most of what you need day to day — groceries, a school, a clinic, work, a park — should sit within a short walk or bike ride of home. It's a direct rejection of the hour-long commute.

You can watch the shift happening. Paris, under mayor Anne Hidalgo, pulled out tens of thousands of parking spaces and built hundreds of kilometres of protected bike lanes. Barcelona's "superblocks" route through-traffic around clusters of streets, turning old intersections into small plazas. Even car-first North American cities are scrapping parking minimums and putting wide roads on "diets."

None of it is easy — the politics of a single traffic lane can get ugly, and shop owners often fear losing street parking, even though study after study finds that walkable streets tend to lift local sales. But the idea underneath is old: a city is first of all a place for the people who live in it. Build it around the human pace instead of the engine and you usually end up somewhere people actually want to be.`
    },
    {
      id: "seed-energy", title: "Understanding the New Wave of Clean Energy",
      dek: "Solar, storage, and smarter grids are changing faster than most forecasts predicted.",
      author: "Amara Okafor", tag: "Science", accent: "#e0a800", emoji: "🌍",
      date: "2026-05-20", claps: 854,
      body:
`Energy transitions are usually slow. The shift from wood to coal, then coal to oil, each took the better part of a century. That history is exactly why the speed of the last decade caught so many analysts off guard. Following "Swanson's Law" — solar module prices fall about 20% for every doubling of volume shipped — the cost of solar has dropped roughly 90% since 2010, and lithium-ion battery storage has followed almost the same curve.

Technologies once written off as boutique environmentalism for the wealthy are now simply the cheapest option. In a lot of markets, building new solar or wind is cheaper than running an already paid-off coal plant. The economic argument is basically settled; manufacturing scale won it.

So the hard problem now isn't making clean power — it's timing. Grid operators talk about the "duck curve": solar floods the grid around midday when demand is low, then falls away near 6pm just as people get home and plug in. The next frontier is flexibility — moving energy through time and across distance.

That means utility-scale batteries that soak up the midday surplus and release it at dusk; software that matches supply to demand minute by minute, and might pay your car to power your house during a spike; and long transmission lines that carry wind from open plains to still, cloudy coasts. In effect we're rebuilding a one-way grid designed in the 1950s into a two-way, responsive network — one of the largest engineering jobs ever attempted.`
    },
    {
      id: "seed-sleep", title: "What the Latest Research Says About Sleep",
      dek: "We spent years trying to need less of it. The science keeps insisting otherwise.",
      author: "Nadia Rahman", tag: "Health", accent: "#2f6db0", emoji: "😴",
      date: "2026-05-18", claps: 1106,
      body:
`For years, hustle culture treated sleep as wasted time — something to hack, trim, and brag about going without. "I'll sleep when I'm dead" was worn as a badge of honour. Twenty years of sleep research point firmly the other way. Chronic short sleep isn't toughness; it's slow damage.

## What actually happens while you sleep

Sleep isn't the absence of activity; it's a shift to a different kind of work. While you're out, the brain's glymphatic system opens up and clears metabolic waste — including the amyloid-beta linked to Alzheimer's — that builds up while you're awake. It's also when the day's experiences get replayed and filed into long-term memory, and when REM sleep seems to strip the raw emotional charge off hard memories, a sort of overnight processing. Cut sleep to win back an hour of email and you're undercutting the very faculties you stayed up to use.

## Consistency beats a "perfect" eight hours

The most reliable findings are also the least sellable, which is why nobody markets them. Consistency matters more than the occasional perfect eight hours. Going to bed and waking at roughly the same time every day — weekends included — does more to steady your body clock than anything else, and spares you the fog of "social jetlag."

## The boring basics that win

Bright daylight outdoors within an hour of waking, and dim, blue-light-free evenings, do most of the heavy lifting. No supplement, smart mattress, or wearable reliably beats that. A cool, dark room, a steady schedule, and a real wind-down routine outperform almost everything sold to "optimise" your sleep.`
    },
    {
      id: "seed-objects", title: "The Hidden History of Everyday Objects",
      dek: "The things we handle without thinking each carry a long and unlikely story.",
      author: "Thomas Vale", tag: "History", accent: "#7a4fd0", emoji: "🗝️",
      date: "2026-05-15", claps: 524,
      body:
`The ordinary objects we handle without a thought each carry a long, strange history. We tend to assume a paperclip or a soda can simply arrived in its finished form. Take the wooden pencil. In his 1958 essay "I, Pencil," the economist Leonard Read pointed out that no single person on earth knows how to make one from scratch — it takes graphite from one continent, cedar from another, pumice for the eraser, and a manufacturing process that took engineers generations to work out.

Or the zipper. It looks inevitable now, but it took decades of jamming prototypes, public skepticism, and dogged iteration by an engineer named Gideon Sundback before it worked reliably enough to catch on in the 1920s. Before that, people spent a surprising share of their lives doing up buttons and hooks.

Tracing these lineages is a good antidote to the myth of the lone genius. We love the story of the solitary inventor struck by inspiration in a garage. The reality is messier and more collective: most things we use are the sum of countless small improvements by mostly anonymous toolmakers, refined over generations as each one fixed some little failure or annoyance.

There's a useful lesson in that for anyone who makes things. The designs that look obvious in hindsight almost never looked obvious to the people working them out. Real mastery rarely shows up as a sudden flash of brilliance. More often it's the patient removal of friction, year after year, until what's left feels like it was always there.`
    },
    {
      id: "seed-habits", title: "How Small Habits Compound Into Careers",
      dek: "The flat part of the curve is where most people quit — and where everything is decided.",
      author: "Grace Lin", tag: "Productivity", accent: "#1a8917", emoji: "🌱",
      date: "2026-05-12", claps: 1342,
      body:
`When we look at people at the top of a field, we tend to hunt for the big break — the bold decision, the viral moment, the natural gift that supposedly launched them. But careers and bodies of work are rarely made by single dramatic moments. They're shaped by small habits repeated over a long time.

It's the half hour of practice before everyone's awake. The dull follow-through on the emails other people ignore. The willingness to do the unglamorous work well when nobody's watching and no applause is coming. Those efforts compound quietly, like a glacier shaping a valley — imperceptible day to day, enormous over years. From the outside, much later, it gets called talent.

The hard part is that the compounding is invisible in the short term. James Clear calls this stretch the "plateau of latent potential." A month of honest effort at the gym or the desk can show nothing on the surface; a decade of the same effort produces a different life. Most people quit somewhere on the flat part of the curve, reading slow early progress as proof it isn't working.

The most sustainable move is to lower the bar for consistency and raise it for quality. A ten-minute habit you can keep on your worst day beats a two-hour routine you abandon by Friday. Perfectionism is the enemy of compounding. Show up, do the small thing well, and let time do the heavy lifting.`
    },
    {
      id: "seed-investing", title: "The Underrated Power of Boring Investing",
      dek: "The most reliable financial advice rarely makes headlines, because there's nothing to sell.",
      author: "Victor Adeyemi", tag: "Finance", accent: "#c0392b", emoji: "📊",
      date: "2026-05-09", claps: 1789,
      body:
`The most reliable investing advice there is happens to be the most boring, and it fits on an index card: spend less than you earn, put the difference into broad, low-cost index funds every month, and then leave it alone for a few decades.

That dull formula is the backbone of a lot of quiet wealth, yet it rarely makes magazine covers or trends online — because there's nothing exciting about it and almost no money in it for the industry. The financial-entertainment machine, the pundits and trading apps and crypto promoters, runs on making you feel you're missing the next big move. Complexity is the product; it justifies the fees.

In markets, excitement is usually a cost. Frequent trading, chasing hot themes, and trying to time the top and bottom tend to quietly erode returns through fees, taxes, and panicked decisions at the worst moments. The retail investor's worst enemy is rarely a bear market — it's their own impatience during a bull one.

None of this guarantees any particular outcome, and circumstances differ. But the evidence is remarkably consistent: a simple, patient, low-cost approach beats most active strategies over a twenty-year horizon. As Jack Bogle, who built the first index fund, put it: "Don't look for the needle in the haystack. Just buy the haystack." In long-term investing, boring is a feature, not a flaw.`
    },
    {
      id: "seed-creativity", title: "Where Creative Ideas Actually Come From",
      dek: "Originality is less a lightning strike than a long, deliberate collection of inputs.",
      author: "Sofia Marchetti", tag: "Culture", accent: "#e06b2f", emoji: "🎨",
      date: "2026-05-06", claps: 661,
      body:
`Movies have sold us a bad story about creativity: the lightning bolt of inspiration that strikes a lone genius at 3am. A more accurate and less romantic picture is what's sometimes called combinatorial creativity. New ideas are rarely conjured from nothing; they're usually old ideas joined in a way nobody had tried before.

Steve Jobs put it plainly: "Creativity is just connecting things." If that's true, the range of what you take in matters enormously — the wider your inputs, the more you have to combine. You can't build something unusual out of the same bricks everyone in your field is using. Read only the same business books as your competitors and you'll arrive at the same ideas they do.

It's why so many breakthroughs come from the messy edges between fields. A biologist who reads about architecture, or a programmer who spends a year on music theory, tends to make the kind of sideways connection a narrow specialist rarely sees. A lot of what we call originality is really just an unusual reading list left to collide with itself.

That's encouraging for those of us who don't feel like born geniuses. Creativity looks less like a gift you're issued at birth and more like a practice you can build: collect widely, pay attention to things outside your lane, take notes, and give ideas time to bump into each other. Inspiration tends to favour the well-stocked mind.`
    },
    {
      id: "seed-coffee", title: "The Science of a Better Cup of Coffee",
      dek: "Three variables do almost all the work — and none of them require expensive gear.",
      author: "Hiroshi Tanaka", tag: "Food", accent: "#a9742f", emoji: "☕",
      date: "2026-05-03", claps: 803,
      body:
`Good coffee is less an art than a bit of applied chemistry. It comes down to extraction — how much of the soluble flavour locked inside the ground coffee dissolves into the water. That ratio decides almost everything: whether the cup is sour, balanced and sweet, or bitter and ashy. Get it right and cheap supermarket beans can taste good; get it wrong and you can waste the most expensive beans on the shelf.

Three things do most of the work: grind size, water temperature, and contact time. If the grind is too coarse or the water runs through too fast, the coffee under-extracts — the water only pulls the bright, acidic compounds, and you get something sour and hollow. Grind too fine or brew too long and it over-extracts, dragging out harsh tannins for a bitter, drying cup.

The sweet spot in between — enough to pull the sugars and balance the acidity — is narrower than most people expect, which is exactly why consistency matters.

The good news is that none of this needs an expensive Italian machine. A cheap kitchen scale to weigh your coffee and water, beans roasted within the last month or so, and a bit of attention to those three variables will do far more than any new gadget. Better coffee is mostly a matter of measuring what you were already doing by guesswork, and adjusting on purpose.`
    },
    {
      id: "seed-boredom", title: "The Surprising Upside of Boredom",
      dek: "The restless, empty moments we now fill with screens may be where the mind does its best work.",
      author: "Priya Nair", tag: "Psychology", accent: "#1f9e8a", emoji: "🧩",
      date: "2026-04-29", claps: 947,
      body:
`Boredom has a terrible reputation now. We treat it as a void to be filled the instant it appears — the smallest lull in a lift or a checkout line and the phone is out. But psychologists increasingly see boredom not as a malfunction but as a useful state.

That restless, under-stimulated feeling we rush to kill is exactly what switches on the brain's "default mode network" — the background mode where the mind wanders, works through problems, and turns recent input into something new. Feed yourself constant frictionless stimulation from the moment you wake and you crowd that processing out. It's easy to mistake distraction for rest.

Experiments back this up. People asked to do something dull — copying numbers, sorting beans — before a creative task tend to come up with more ideas than people given something engaging first. The in-between moments of a day — staring out a train window, folding laundry, walking without a podcast — are when the brain quietly reorganizes itself. We've paved over most of those gaps with a feed.

Getting some of it back doesn't require a silent retreat. It can be as small as leaving the phone on the counter while your coffee brews, taking a short walk with nothing in your ears, or letting a dull minute in a waiting room stay dull. It's harder than it sounds at first, but it hands back a kind of mental room you didn't notice you'd lost.`
    },
    {
      id: "seed-ai-hype", title: "How to Think Clearly About AI Hype",
      dek: "Resist both the breathless optimism and the reflexive dismissal, and ask narrower questions.",
      author: "Marcus Bell", tag: "Technology", accent: "#2f6db0", emoji: "🤖",
      date: "2026-04-25", claps: 1488,
      body:
`Every genuinely powerful new technology shows up wrapped in equal parts real promise and financially-motivated exaggeration, and AI might be the cleanest example yet. The noise right now is loud in both directions. Thinking clearly about it means resisting both the evangelists promising AGI by next quarter and the skeptics waving it off as fancy autocorrect.

The way through is to ask narrower questions. Drop the sweeping ones — "will AI replace all knowledge work?" — and ask the boring, specific one instead: what can this particular model do reliably, today, on this exact task, and how often does it get it wrong?

Things that look like magic in a curated two-minute demo are usually uneven and frustrating once you put them into real workflows. Today's language models are a study in contrasts — strong at things that sound hard, like drafting code or passing exams, and oddly brittle at things that sound easy, like basic counting, spatial reasoning, or staying factually consistent across a long answer.

The honest position is calibrated uncertainty. These tools are genuinely useful and genuinely limited, and the line between the two keeps moving week to week. Treating them as flawed instruments to be tested and used for specific leverage — rather than oracles to worship or fear — is the clearest way through a noisy field.`
    },
    {
      id: "seed-fourday", title: "The Case for the Four-Day Week",
      dek: "A growing number of companies are testing whether five days was ever the point.",
      author: "Helena Frost", tag: "Business", accent: "#1a8917", emoji: "🗓️",
      date: "2026-04-21", claps: 1255,
      body:
`The Monday-to-Friday, forty-hour week feels like a law of nature, but it's a fairly recent invention — popularized about a century ago by Henry Ford to run factory lines, not knowledge workers staring at screens. A growing number of companies are now testing whether that industrial rhythm still makes sense for work that's mostly cognitive.

The results from large trials in the UK, Iceland, and elsewhere are strikingly consistent. Most participating companies keep output and revenue roughly the same on four days as on five — but with happier, healthier, more focused staff. Burnout falls, sick days drop, and people are far less likely to leave.

The mechanism isn't making tired people type faster; it's cutting waste. Give a team less time and they get honest about priorities. Parkinson's Law says work expands to fill the time available — these trials suggest the reverse holds too. With 32 hours, teams kill the recurring status meetings that could have been an email, guard their attention, and protect blocks for what Cal Newport calls "deep work." Tighter constraints sharpened focus instead of dulling output.

It isn't a fix for everything. Shift work, 24/7 support, and a lot of frontline roles don't fold neatly into 32 hours without more hiring. But the experiments puncture a quiet, old assumption — that hours visibly spent at a desk and value actually created are the same thing. For knowledge work, at least, that link is broken.`
    },
    {
      id: "seed-language", title: "What Learning a Language Does to the Brain",
      dek: "It does far more than add vocabulary — it reshapes how the mind works.",
      author: "Diego Santos", tag: "Science", accent: "#7a4fd0", emoji: "🗣️",
      date: "2026-04-17", claps: 712,
      body:
`Learning a second language as an adult is humbling — for a while you feel like a toddler again. But pushing through does more than add vocabulary; it reshapes the brain. fMRI studies find that bilingual brains tend to have denser grey matter in regions tied to executive function and stronger connections in the white-matter tracts that link them.

The reason is oddly simple. A bilingual brain never fully switches one language off; both stay active and compete, so it has to keep suppressing the one you're not using. That constant, invisible effort works like resistance training, and the gains show up elsewhere — sharper focus, a better knack for tuning out distraction, smoother switching between unrelated tasks.

The benefits reach into long-term health too. Speaking more than one language builds what researchers call "cognitive reserve," a buffer of redundant neural pathways. Large studies have linked it to a delay in the onset of Alzheimer's symptoms — on the order of four to five years, better than any drug currently available. It doesn't prevent the disease; the brain just seems to cope for longer.

Maybe the most interesting part is the shift in perspective. Another language isn't a word-for-word swap for the things you already name; it carries distinctions, shades of feeling, and frameworks your first language never needed. Learning one is less like installing an app and more like growing a second way of seeing the world.`
    },
    {
      id: "seed-difficultbook", title: "How to Read a Difficult Book",
      dek: "The hardest books reward a slower, stranger kind of reading than we were taught.",
      author: "Arthur Penn", tag: "Culture", accent: "#1f9e8a", emoji: "📖",
      date: "2026-04-13", claps: 588,
      body:
`In school we're taught to read one way: start on page one, move steadily down the page, and go straight through to the end. That works fine for thrillers and light nonfiction. But dense or genuinely difficult books resist it. Kant, Joyce, a thick history — they reward a slower, stranger kind of reading than the one we were trained in.

In his classic guide *How to Read a Book*, Mortimer Adler argued that the first pass at a hard text should just be "inspectional" — you're trying to find the shape of the argument, not decode every sentence. Expecting to understand every clause and reference on the first read isn't just unrealistic, it's unnecessary. When you hit a wall, don't stop and agonize; push on, take what meaning you can, and trust that later pages will light up the earlier ones.

Then comes the harder part Adler called analytical reading. You can't do it leaning back. It means arguing with the author in the margins, stopping at the end of a brutal chapter to put its point in one plain sentence, and keeping a dictionary open without embarrassment. A hard book isn't a broadcast washing over you; it's a demanding conversation across time, and a conversation needs you to take part.

Underneath all of it is patience. The internet has trained us to want the instant takeaway and the bullet summary. But some books are meant to be reread across decades, giving up different lessons each time because you bring an older, more bruised version of yourself to them. In those cases the difficulty isn't a flaw to route around — the friction is the point.`
    },
    {
      id: "seed-moon", title: "Why We Keep Going Back to the Moon",
      dek: "Half a century on, the Moon is busy again — and this time we intend to stay.",
      author: "Lena Vostok", tag: "Science", accent: "#2f6db0", emoji: "🌙",
      date: "2026-04-09", claps: 1031,
      body:
`More than fifty years after Apollo left the last footprints in the lunar dust, the Moon is busy again. NASA and the ESA, fast-rising programs in China and India, and a competitive crowd of private space companies are all planning to go back. But this isn't the Cold War race. We're no longer spending billions to plant a flag, grab a few hundred pounds of rock, and make a point to a rival. This time the goal is to stay.

A lot of the new interest comes down to geology. Years of orbital data have confirmed that the permanently shadowed craters near the Moon's south pole hold large amounts of frozen water. In the weight-obsessed economics of spaceflight, water is close to a universal currency. You can purify it to drink, but more importantly you can split it into hydrogen and oxygen — breathable air and rocket fuel. Making fuel on the Moon, where the gravity well is shallow, sharply lowers the cost of going further. A lunar base isn't the destination so much as the gas station on the way to one.

Beyond the economics and the engineering, there's something harder to put a number on. The Moon is still the only other world humans have set foot on. Going back, building habitats, and learning to survive the radiation, the two-week freezing nights, and the abrasive, lung-damaging dust pushes our technology to its limits. It's the proving ground for everything a trip to Mars — or anywhere past it — would demand.`
    },
    {
      id: "seed-fewerthings", title: "On Doing Fewer Things, Better",
      dek: "When overwhelmed, the instinct is to add. The more effective move is to subtract.",
      author: "Sam Whitfield", tag: "Productivity", accent: "#c0392b", emoji: "🎯",
      date: "2026-04-05", claps: 1394,
      body:
`When life gets overwhelming, the instinct is to do more: download a new productivity app, wake up an hour earlier, commit to some system that promises to save us. We try to out-work our own exhaustion. The more effective move — and the scarier one — is usually the opposite: subtract. Do fewer things, and do them with more care. Real focus is a form of respect for your own limited attention.

We forget the basic arithmetic of time: every "yes" to a mediocre commitment is a quiet "no" to something that matters more. Say yes to everything out of guilt or ambition and your effort spreads thin across a dozen fronts, so you finish little of substance and feel worn out by all of it. The Pareto principle — that roughly 80% of results come from 20% of the effort — is really a prompt to find the vital few and drop the rest. A short, fiercely guarded list of priorities tends to beat a sprawling to-do list carried around with low-grade dread.

This is much harder to do than to say. "No" comes with real social friction — people are disappointed, you miss the occasional opportunity. But anything with real depth — a career, a relationship, a body of work — is built through subtraction as much as addition. The sculptor doesn't add clay; they chip away everything that isn't the statue. A life of less, chosen on purpose and protected, is usually more.`
    },
    {
      id: "seed-greenspace", title: "The Quiet Comeback of Urban Green Space",
      dek: "Cities are rediscovering that parks and trees are infrastructure, not decoration.",
      author: "Lucía Romero", tag: "Society", accent: "#e06b2f", emoji: "🌳",
      date: "2026-04-01", claps: 626,
      body:
`After decades of paving over open ground for parking and traffic, a lot of cities are changing their minds. Planners are rediscovering that green space has real, measurable value. Parks, continuous street-tree canopies, and small pocket gardens are no longer written off by budget committees as decoration or a "nice to have" — they're being treated as infrastructure.

The evidence is hard to argue with. Regular access to greenery is linked to lower stress, cleaner local air, and stronger neighbourhood ties. Mechanically, mature trees are remarkable machines: a good canopy can drop a neighbourhood's temperature by several degrees through shade and the water vapour it releases. That cooling — "evapotranspiration" — is becoming a matter of life and death as urban heat islands make summer heatwaves deadlier. Unpaved earth also soaks up storm runoff, sparing cities millions in flood damage when aging drains can't cope.

The harder problem now isn't convincing officials it works; it's fairness. Historically, the best parks and tree cover have clustered in wealthier neighbourhoods, leaving poorer, formerly redlined areas as concrete heat traps with higher asthma rates. The better planning happening today treats access to nature not as a luxury that lifts property values, but as a basic public-health standard every resident is owed.`
    },
    {
      id: "seed-design-no", title: "Good Design Is Mostly About Saying No",
      dek: "Behind every clean interface is a long list of good ideas that were declined.",
      author: "Mei Chen", tag: "Design", accent: "#a9742f", emoji: "✏️",
      date: "2026-03-28", claps: 879,
      body:
`To beginners, good design looks like adding the right features to solve a problem. To people who've done it for years, it's mostly the unglamorous, unpopular work of leaving things out. Every element on a page, every button on a device, every line of help text competes for a sliver of the user's attention. Hick's Law captures the cost: the more options you present, the longer each decision takes. So the real work isn't deciding what you can build — it's deciding what doesn't belong.

Saying no is hard in a company because each request, on its own, is reasonable. A banner to lift sales, a dropdown for power users, a disclaimer at the bottom — none of it seems harmful alone. But a hundred reasonable additions stacked together are exactly what produce clutter and a product nobody can navigate. The best designers act less like decorators and more like editors, protecting the whole from the well-meaning feature requests of every separate team.

When the subtraction works, the result looks effortless — even obvious. But that simplicity isn't the absence of effort; it's effort concentrated. Dieter Rams summed up his ten principles as "less, but better." Behind every clean interface you like using is a long, unseen list of perfectly good ideas that were turned down to keep it clear.`
    }
  ];

  /* =========================================================
     Live mode (Supabase keys set): user posts live in the DB.
     Preview mode (no keys): posts fall back to localStorage.
     Claps + "already clapped" stay client-side either way.
     ========================================================= */
  const live = window.isSupabaseConfigured();
  let dbArticles = [];   // loaded from Supabase
  let myUserId = null;

  /* ---- localStorage (preview fallback + claps) ---- */
  function loadUser() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (_) { return []; } }
  function saveUser(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
  function loadClaps() { try { return JSON.parse(localStorage.getItem(CLAPS_KEY)) || {}; } catch (_) { return {}; } }

  function readingTime(text) {
    const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  // Real, topical photos only for the articles where a photo genuinely helps.
  // Everything else uses a clean designed colour cover (rendered from `accent`),
  // which reads as deliberate rather than random stock. `lock` keeps each photo
  // stable instead of changing on every load.
  const COVER_PHOTOS = {
    "seed-walking":    "https://loremflickr.com/1200/640/forest?lock=21",
    "seed-cities":     "https://loremflickr.com/1200/640/city?lock=22",
    "seed-energy":     "https://loremflickr.com/1200/640/solar?lock=23",
    "seed-coffee":     "https://loremflickr.com/1200/640/coffee?lock=24",
    "seed-moon":       "https://loremflickr.com/1200/640/moon?lock=25",
    "seed-greenspace": "https://loremflickr.com/1200/640/park?lock=26",
    "seed-sleep":      "https://loremflickr.com/1200/640/bedroom?lock=27"
  };
  function withCover(a) {
    if (!a.cover && COVER_PHOTOS[a.id]) a.cover = COVER_PHOTOS[a.id];
    return a;
  }

  // sanitize user-controlled fields that end up in HTML/inline-styles (anti-XSS)
  function safeAccent(c) { return (typeof c === "string" && /^#[0-9a-fA-F]{3,8}$/.test(c)) ? c : "#1a8917"; }
  function safeCover(c)  { return (typeof c === "string" && /^(data:image\/|https?:\/\/)/.test(c)) ? c : null; }
  function safeEmoji(e)  { return (typeof e === "string" ? e.replace(/[<>&"']/g, "").slice(0, 12) : "") || "📝"; }

  function rowToArticle(r) {
    return {
      id: r.id, title: r.title, dek: r.dek || "", tag: r.tag || "General",
      author: r.author_name || "Anonymous", authorId: r.author_id || null,
      accent: safeAccent(r.accent), emoji: safeEmoji(r.emoji),
      cover: safeCover(r.cover), body: r.body || "",
      date: r.created_at, claps: 0,
      userPost: !!myUserId && r.author_id === myUserId,
      readingTime: readingTime(r.body)
    };
  }

  // hydrate DB articles — call (and await) before rendering on each page
  async function load() {
    if (!live || !window.sb) { dbArticles = []; return; }
    try {
      const { data: { user } } = await window.sb.auth.getUser();
      myUserId = user ? user.id : null;
      const { data, error } = await window.sb
        .from("articles").select("*").order("created_at", { ascending: false });
      if (error) { console.warn("[articles] load:", error.message); dbArticles = []; }
      else dbArticles = (data || []).map(rowToArticle);
    } catch (_) { dbArticles = []; }
  }

  function getAll() {
    const mine = live ? dbArticles : loadUser();
    const seed = SEED.map(withCover);
    return [...mine, ...seed].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getById(id) { return getAll().find((a) => a.id === id) || null; }

  async function addArticle({ title, dek, tag, body, author, accent, emoji, cover }) {
    const clean = {
      title: (title || "Untitled").trim().slice(0, 200),
      dek: (dek || "").trim().slice(0, 300),
      tag: (tag || "General").trim().slice(0, 40),
      author: (author || "You").trim().slice(0, 80),
      accent: safeAccent(accent), emoji: safeEmoji(emoji), cover: safeCover(cover),
      body: (body || "").trim().slice(0, 4000000) // cap (~4MB) to prevent abuse
    };
    if (live && window.sb) {
      const { data: { user } } = await window.sb.auth.getUser();
      const { data, error } = await window.sb.from("articles").insert({
        author_id: user ? user.id : null, author_name: clean.author,
        title: clean.title, dek: clean.dek, tag: clean.tag,
        accent: clean.accent, emoji: clean.emoji, cover: clean.cover, body: clean.body
      }).select().single();
      if (error) throw error;
      const art = rowToArticle(data);
      dbArticles.unshift(art);
      return art;
    }
    // preview fallback
    const article = Object.assign({ id: "u-" + Date.now().toString(36) }, clean,
      { date: new Date().toISOString(), claps: 0, userPost: true, readingTime: readingTime(clean.body) });
    const u = loadUser(); u.unshift(article); saveUser(u);
    return article;
  }

  async function updateArticle(id, { title, dek, tag, body, accent, emoji, cover }) {
    const patch = {
      title: (title || "Untitled").trim().slice(0, 200),
      dek: (dek || "").trim().slice(0, 300),
      tag: (tag || "General").trim().slice(0, 40),
      accent: safeAccent(accent), emoji: safeEmoji(emoji), cover: safeCover(cover),
      body: (body || "").trim().slice(0, 4000000)
    };
    if (live && window.sb) {
      const { data, error } = await window.sb.from("articles").update(patch).eq("id", id).select().single();
      if (error) throw error;
      const art = rowToArticle(data);
      const i = dbArticles.findIndex((a) => a.id === id);
      if (i >= 0) dbArticles[i] = art; else dbArticles.unshift(art);
      return art;
    }
    const u = loadUser(); const i = u.findIndex((a) => a.id === id);
    if (i >= 0) { Object.assign(u[i], patch, { readingTime: readingTime(patch.body) }); saveUser(u); return u[i]; }
    return null;
  }

  async function deleteArticle(id) {
    if (live && window.sb) {
      const { error } = await window.sb.from("articles").delete().eq("id", id);
      if (error) console.warn("[articles] delete:", error.message);
      dbArticles = dbArticles.filter((a) => a.id !== id);
      return;
    }
    saveUser(loadUser().filter((a) => a.id !== id));
  }

  function getByAuthor(authorId) { return getAll().filter((a) => a.authorId && a.authorId === authorId); }
  function getByAuthorName(name) { return getAll().filter((a) => a.author === name); }

  // related stories: same tag first, then same author, then anything recent
  function getRelated(article, n = 3) {
    if (!article) return [];
    const rest = getAll().filter((a) => a.id !== article.id);
    const sameTag    = rest.filter((a) => a.tag === article.tag);
    const sameAuthor = rest.filter((a) => a.tag !== article.tag && a.author === article.author);
    const others     = rest.filter((a) => a.tag !== article.tag && a.author !== article.author);
    const out = [], seen = new Set();
    for (const a of [...sameTag, ...sameAuthor, ...others]) {
      if (out.length >= n) break;
      if (seen.has(a.id)) continue;
      seen.add(a.id); out.push(a);
    }
    return out;
  }

  /* ---- follows (client-side, keyed by author name) ---- */
  const FOLLOWS_KEY = "midium-follows";
  function getFollowedAuthors() { try { return JSON.parse(localStorage.getItem(FOLLOWS_KEY)) || []; } catch (_) { return []; } }
  function isFollowingAuthor(name) { return getFollowedAuthors().includes(name); }
  function toggleFollowAuthor(name) {
    const f = getFollowedAuthors(); const i = f.indexOf(name);
    if (i >= 0) f.splice(i, 1); else f.unshift(name);
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(f));
    return i < 0; // true if now following
  }

  /* ---- bookmarks (reading list — client-side) ---- */
  const BOOKMARKS_KEY = "midium-bookmarks";
  function getBookmarks() { try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || []; } catch (_) { return []; } }
  function isBookmarked(id) { return getBookmarks().includes(id); }
  function toggleBookmark(id) {
    const b = getBookmarks(); const i = b.indexOf(id);
    if (i >= 0) b.splice(i, 1); else b.unshift(id);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(b));
    return i < 0; // true if now bookmarked
  }

  /* ---- claps (client-side; one per article per device) ---- */
  const CLAPPED_KEY = "midium-clapped";
  function loadClapped() { try { return JSON.parse(localStorage.getItem(CLAPPED_KEY)) || []; } catch (_) { return []; } }
  function hasClapped(id) { return loadClapped().includes(id); }

  function clapsFor(article) {
    const o = loadClaps();
    return o[article.id] !== undefined ? o[article.id] : (article.claps || 0);
  }
  function countFor(id) {
    const a = getAll().find((x) => x.id === id);
    return a ? clapsFor(a) : 0;
  }
  function clap(id) {
    if (hasClapped(id)) return countFor(id);
    const c = loadClapped(); c.push(id); localStorage.setItem(CLAPPED_KEY, JSON.stringify(c));
    const o = loadClaps();
    o[id] = countFor(id) + 1;
    localStorage.setItem(CLAPS_KEY, JSON.stringify(o));
    return o[id];
  }

  function allTags() { return [...new Set(getAll().map((a) => a.tag))]; }

  return {
    SEED, load, getAll, getById, addArticle, updateArticle, deleteArticle,
    getByAuthor, getByAuthorName, getRelated, getFollowedAuthors, isFollowingAuthor, toggleFollowAuthor,
    getBookmarks, isBookmarked, toggleBookmark,
    clap, clapsFor, hasClapped, allTags, readingTime
  };
})();