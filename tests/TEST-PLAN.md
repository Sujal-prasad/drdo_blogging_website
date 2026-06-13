# Midium — Test Plan (QA / SDET)

Two layers of coverage:

1. **Automated (logic/data)** — open **`/tests/tests.html`** via Live Server. It runs unit +
   integration tests for the article store and paywall **offline** (preview mode), snapshotting
   and restoring `localStorage` so your real data is untouched. Green = pass.
2. **Manual E2E (auth / DB / UI)** — the checklist below. These need a real browser + the live
   Supabase project, so they're verified by hand (and are the natural target for a future
   Playwright suite — see the end).

> Why not full automation now? The app is a no-build static site of browser-global modules
> tightly coupled to Supabase + the DOM. The pure logic is unit-testable as-is (done in
> `tests.js`); the rest is best covered by E2E against a **dedicated test Supabase project**.

---

## E2E checklist

### Auth
- [ ] Email **sign up** (with "Confirm email" off) logs in and shows the signup celebration.
- [ ] Email **sign in** with correct/incorrect password (wrong → friendly error).
- [ ] **Google** and **Discord** OAuth → land on feed with welcome overlay.
- [ ] **Sign out** → returns to login.
- [ ] **Session persists** across reloads.
- [ ] Open `/index.html` **logged out** → redirected to login (no flash of the feed).
- [ ] Open a **shared article URL logged out** → login → returns to *that article*.
- [ ] Open login while already signed in → "already signed in" → feed.

### Feed
- [ ] Cards render with cover, tag, author, reading time, claps.
- [ ] **Search** filters; **Sort** (Newest / Most-clapped / Quickest) reorders.
- [ ] **Tag** chips filter; **🔖 Saved** shows only bookmarks; **👥 Following** shows followed authors.
- [ ] Bookmark toggle on a card persists after reload.
- [ ] Skeletons appear briefly while the DB loads.

### Reader (reel)
- [ ] Article opens; scrolling **flows into the next** article.
- [ ] **Clap** works once then locks; reload keeps the clapped state.
- [ ] **Share** sheet opens; WhatsApp/Facebook/X/Telegram/LinkedIn links + copy-link work.
- [ ] **Bookmark** + **author name → author page**.
- [ ] **Comments**: post a response, see it; delete your own.
- [ ] Your own posts show **Edit** (→ composer) and **Delete** (styled dialog).

### Write / Edit
- [ ] Publish a new article → appears in the feed + in Supabase `articles` table.
- [ ] **Cover photo upload** + **in-body image** render in the reader.
- [ ] Draft autosaves; reopening restores it.
- [ ] `?edit=<id>` prefills and **Save changes** updates the post.

### Profile
- [ ] Change **display name** (persists); **theme** Light/Dark/System; **password** update.
- [ ] **Password strength bar** reacts as you type.
- [ ] Membership **cancel** / **join** use the styled dialog.

### Paywall (RazorPlay, simulated)
- [ ] Read 5 distinct articles → 6th is **blurred/teased** + checkout opens.
- [ ] **Scroll/Escape can't bypass** it (scroll locked, body text removed).
- [ ] Card / UPI / **Net-banking (bank page)** flows → pay → unlocks; confetti.
- [ ] Cancel membership → returns to free plan.

### Follow / authors
- [ ] Open an author page → see their posts + follower count.
- [ ] **Follow/Unfollow** updates the count; **Following** feed tab reflects it.

### Security
- [ ] Browser console shows **no CSP violations** in normal use.
- [ ] A comment containing `<script>` or `<img onerror>` renders as **plain text**.
- [ ] (Optional) Insert a row directly via the Supabase API with a crafted `cover`/`emoji`
      → the feed/reader render it **safely** (no script runs).

### Cross-cutting
- [ ] Dark mode across all pages; theme **toggle switch** slides.
- [ ] Mobile layout (≤ 600px) is usable.
- [ ] Deploy: Vercel build + **Supabase URL Configuration** updated for the live domain.

---

## Next step: automate E2E with Playwright
```bash
npm init -y && npm i -D @playwright/test && npx playwright install
```
Point tests at a **separate test Supabase project** (so prod data stays clean), script the
flows above, and run in CI. The current `tests/tests.js` can be lifted into Playwright/Vitest
once the modules expose ES exports.
