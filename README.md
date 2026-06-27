# Midium — a Medium-style reading platform

A modern reading/blogging website (Medium clone) built with **vanilla HTML, CSS, and
JavaScript** plus a few best-in-class libraries. The focus is a distinctive, crafted
UI/UX — not a generic template.

> **This is built to be a real product, not a throwaway demo.**
> The app ships with a **Preview mode** that only kicks in *before* you've connected
> Supabase — so you can see the full UI and all animations working immediately, with
> zero setup. The moment you paste real Supabase keys into `scripts/config.js`, it
> becomes the live product: real accounts, real sessions, real redirects.

---

## ✨ What's built so far (Phase 1 — Authentication)

- **Split editorial layout** with a signature mascot — **a cat reading a book** whose
  **eyes follow your cursor**, and who **lifts the book to hide its eyes** when you focus
  the password field.
- **Sign in / Sign up** in one page with an animated segmented toggle.
- **Auth methods:** Email + password, **Google**, and **Discord** — wired to Supabase,
  all free. *(Phone/SMS needs a paid provider; Facebook and GitHub OAuth were dropped to
  keep setup simple.)*
- **Smart redirects:** already-logged-in users skip the form; new vs returning users
  are routed correctly ("you already have an account → switch to sign in").
- **Distinct success animations:** an elegant *"Welcome back"* puff for **login**, and a
  grand emoji-confetti celebration for **signup**.
- **Dark mode:** persistent, no-flash, respects the OS preference on first visit.
- **Premium polish:** animated aurora backdrop, GSAP staggered entrance, password
  **reveal toggle**, **caps-lock warning**, live **password-strength meter**, and a
  rotating headline ticker.

## ✨ Reading & writing (Phase 2 — started)

- **Feed** (`index.html`): article cards with cover, tag, author, reading time & claps,
  plus a **search box** and **tag-chip filters**.
- **Write your own** (`write.html`): a clean composer — title, subtitle, topic, cover
  colour + icon, live **reading-time**, and **auto-saved drafts**. Hit **Publish** and it
  appears in the feed immediately.
- **Reader** (`article.html`): full article view with a **clap** button; you can **delete**
  your own posts.
- **Storage:** a set of sample articles ships in `scripts/data/articles.js`; your posts
  are saved in the browser (`localStorage`) — no backend needed, works in preview mode.

---

## 📁 Folder structure

```
drdo_blogging_website/
├── index.html              # Feed (home + OAuth landing; kept at root)
├── pages/                  # all other routes (root-absolute paths, so depth is safe)
│   ├── login.html          # Auth page (sign in / sign up)
│   ├── write.html          # Composer (cover + in-body photo upload; ?edit=<id> to edit)
│   ├── article.html        # Reel-style reader + comments/responses
│   ├── author.html         # Author profile (their posts + follow)
│   └── profile.html        # Profile/settings (name, appearance, password, membership)
├── supabase/schema.sql     # DB tables + RLS (run in Supabase SQL editor)
├── README.md
├── .vscode/settings.json   # Live Server tweaks (stop self-refresh)
├── styles/  (base.css · auth.css · app.css)
├── scripts/
│   ├── config.js           # 🔑 YOUR Supabase keys + HOME_PATH / LOGIN_PATH
│   ├── core/
│   │   ├── supabase-client.js   # Shared Supabase client (or preview fallback)
│   │   ├── session.js           # Auth guard + display name + deep-link return
│   │   ├── theme.js             # Theme switch + persistence
│   │   └── ui.js                # Shared styled confirm dialog (UI.confirm)
│   ├── auth/                # auth.js · mascot-eyes.js · interactions.js
│   ├── data/
│   │   ├── articles.js          # Articles store (Supabase + bookmarks + claps)
│   │   └── social.js            # Comments + follows (Supabase)
│   └── feed/
│       ├── feed.js              # Feed: search, tag filter, sort, bookmarks, membership
│       ├── write.js             # Composer (publish/edit, photo upload, autosave)
│       ├── article.js           # Reel reader (scroll-to-next, clap-once, share, comments)
│       ├── paywall.js           # 5-free paywall + RazorPlay checkout (+ bank page)
│       ├── author.js            # Author profile page + follow
│       └── profile.js           # Profile/settings logic
└── assets/img/
```

HTML pages live at the root as route entry points (keeps links and OAuth redirects
simple); everything else is grouped by **type → feature** so it scales cleanly when we
add the feed, reels, and payment modules.

---

## ▶️ How to run it

1. Install the **Live Server** VS Code extension (see list below).
2. Right-click `login.html` → **"Open with Live Server"**.
3. It opens at `http://127.0.0.1:5500/login.html`.

> ⚠️ Always run via Live Server (an `http://localhost` URL) — **not** by double-clicking
> the file (`file://`). Google OAuth requires a real HTTP origin to work.

Until you add Supabase keys you'll see a **Preview mode** banner — that's expected.

---

## 🧩 Recommended VS Code extensions

### Essential
| Extension | Publisher | Why |
|---|---|---|
| **Live Server** | Ritwick Dey | Runs the site at `localhost` with auto-reload. Required for OAuth + article APIs. |
| **Prettier – Code formatter** | Prettier | Consistent HTML/CSS/JS formatting on save. |
| **ESLint** | Microsoft | Catches JS mistakes as you type. |

### Strongly recommended (great for a UI/UX workflow)
| Extension | Publisher | Why |
|---|---|---|
| **Color Highlight** | Sergii Naumov | Shows every CSS color inline — invaluable for design work. |
| **CSS Peek** | Pranay Prakash | Jump from a class in HTML straight to its CSS rule. |
| **Auto Rename Tag** | Jun Han | Renames the paired HTML tag automatically. |
| **Path Intellisense** | Christian Kohler | Autocompletes file paths — handy with our folder structure. |
| **Error Lens** | Alexander | Shows errors/warnings inline next to the code. |
| **Image preview / Gutter Preview** | Kiss Tamás | Preview images and assets in the gutter. |

### Nice-to-have
| Extension | Why |
|---|---|
| **GitLens** | Rich git history & blame. |
| **Material Icon Theme** | Clearer file icons. |
| **indent-rainbow** | Easier-to-read nesting. |
| **CodeSnap** | Beautiful code screenshots for sharing designs. |

> There's no required Supabase extension — it's all done via the JS SDK loaded from a CDN.

---

## 🔑 Connecting Supabase (turns Preview mode into the live product)

1. Go to **https://supabase.com**, sign up, and **create a new project** (free tier is fine).
2. In the project: **Settings (gear) → API**.
   - Copy **Project URL** → paste into `SUPABASE_URL` in `scripts/config.js`.
   - Copy the **`anon` `public`** key → paste into `SUPABASE_ANON_KEY`.
   - ⚠️ **Never** use the `service_role` (secret) key in frontend code.
3. **Email auth** works out of the box. For local testing you may want to disable
   "Confirm email" under **Authentication → Providers → Email** so signups log in instantly.
4. **Google login:** Supabase → **Authentication → Providers → Google** → enable.
   - Create OAuth credentials at **console.cloud.google.com** (APIs & Services → Credentials).
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
   - Paste the Client ID & Secret into Supabase.
5. **Discord login:** create an app at **discord.com/developers/applications** → OAuth2 →
   add redirect `https://<your-project-ref>.supabase.co/auth/v1/callback` → copy the
   Client ID + Client Secret → paste into Supabase → Providers → Discord → enable → save.

> 💸 Everything above is on Supabase's **free tier**. Phone/SMS login was deliberately
> skipped — it's the one auth method that needs a paid SMS provider.

When keys are present, the Preview banner disappears and real accounts/sessions work.

---

## 🗺️ Roadmap

### Phase 2 — Article feed + filtering *(in progress)*
**No APIs, no scraping.** The site ships with a set of well-written sample articles in a
local data file, and anyone can publish their own (saved to `localStorage`):

```
scripts/data/articles.js   # an array of article objects
```

Each article object looks roughly like:

```js
{
  id, title, dek, author, tag, readingTime,
  accent, emoji,   // build the card/cover (a CSS gradient + icon, no external fetch)
  claps, date,
  body             // the full article text (blank line = new paragraph)
}
```

The feed renders these as cards, with a **search box** and **tag-chip filters** running
entirely client-side. Still to add: sorting by **reading time**, **popularity (claps)**,
and **recency**. Just append to the array to add more seed content.

### Phase 3 — Paywall (RazorPlay) + **simulated** payments ✅ *(built)*
- First **5 articles free** (counted only when an article is actually **viewed**); the next
  one is **blurred** with a tasteful **RazorPlay** membership prompt. Your own posts are
  always free.
- Payment is **fully simulated** (front-end only — no real gateway, no keys, no charges):
  a checkout with **Card / UPI / Net-banking** tabs, input validation, a "processing…"
  spinner, and a success animation.
  - **Net-banking** opens a realistic **mock bank page** (bank login → confirm payment → pay).
- A pill under each article byline shows **"N of 5 free articles left"** or **"★ Member."**
- **Cancel membership:** when you're a member, a **★ Member** button appears in the feed
  topbar — click it to cancel (resets you to the free plan).
- Code: `scripts/feed/paywall.js`.
- *To reset for testing:* cancel membership, or clear the `midium-member` / `midium-reads`
  keys (DevTools → Application → Local Storage).

### Phase 4 — Reel-style reading ✅ *(built)*
- The **reader itself is the "reel."** Open any article and it flows into the **next one as
  you scroll** (continuous, auto-loading), rather than being a separate page.
- Each article counts toward the free limit **only when scrolled into view**, so pre-loading
  the next story never wastes a free read. The paywall stops you at the limit until you join.
- Cover art: every article now has a real **editorial cover photo** tinted with its accent
  colour (in feed cards and the reader), with emojis used as accents.

### Phase 5 — Real database (Supabase) ✅
Published **articles, comments, and follows live in Supabase** (`supabase/schema.sql` →
run it in the SQL Editor; re-run after pulling new tables), shared across all users and
devices, with Row-Level Security. Sample "house" articles, bookmarks, claps, reads, and
membership stay client-side (the simulated paywall) and can move to the DB later.

### Phase 5.5 — Community & feed features ✅
- **Sort the feed** — Newest / Most clapped / Quickest read.
- **Bookmarks / reading list** — tap 🔖 on any card or in the reader; a **Saved** filter.
- **Edit your own posts** — `write.html?edit=<id>` (an "Edit" link shows on your posts).
- **Comments / responses** — under each real article (post + delete your own).
- **Follow authors + author pages** — click an author's name anywhere → their profile
  (`author.html`) with their posts, follower count, and a **Follow** button.

### Phase 6 — Deploy to Vercel *(planned — do last)*
The site is fully static, so Vercel deploys it with **no build step**:
1. Push to GitHub → import the repo at **vercel.com** (Framework preset **Other**, no build
   command, output dir `./`). Or use the **Vercel CLI**: `vercel` then `vercel --prod`.
2. ⚠️ **Update Supabase → Authentication → URL Configuration** for the live domain: set
   **Site URL** to `https://<your-app>.vercel.app` and add `https://<your-app>.vercel.app/**`
   to **Redirect URLs**. (OAuth provider callbacks don't change — they point to Supabase.)
3. The **anon key** in `scripts/config.js` is public by design (safe to ship) — no env vars
   needed. Never commit a `service_role` key.
4. Optional: add a `vercel.json` + `.gitignore` for a zero-config import.

---
# DRDO Midium Unlock - Educational Security Extension

## Overview

This Chrome extension demonstrates a real-world paywall bypass vulnerability for educational and security research purposes. It's designed specifically for the DRDO internship project to showcase:

- Client-side vs server-side security boundaries
- Extension architecture and capabilities
- Ethical hacking principles
- Security vulnerability demonstration

## 🎯 Purpose

**Educational Use Only**: This extension is intended for authorized DRDO security research and educational demonstrations. It showcases how paywall protection mechanisms can be bypassed for security analysis.

## 🛠️ Installation

### 1. Install the Extension

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the `drdo-blogging-website/midium-unlock` directory

### 2. Configure Proxy Server

1. Install Node.js if not already installed
2. Navigate to the proxy-server directory:
   ```bash
   cd drdo-blogging-website/midium-unlock
   npm install
   node proxy-server.js
   
## 🔒 Security

- **XSS:** all user-supplied text (titles, deks, authors, comments, bodies) is
  HTML-escaped before rendering. The article `emoji`, `accent`, and `cover` are
  **sanitized at the data boundary** (`rowToArticle`) — accent must be a hex colour, cover
  must be a `data:image/` or `https://` URL, emoji is stripped of markup — so a malicious
  row can't inject. In-body images only render for `data:image/` / `http(s)` schemes.
- **Content-Security-Policy:** every page ships a CSP meta tag — scripts only from self +
  jsDelivr, connections only to Supabase, `object-src 'none'`, `base-uri 'self'`,
  `frame-ancestors 'none'` (blocks clickjacking + limits exfiltration even if something slips through).
- **SQL injection:** not applicable — the app never builds raw SQL. All data access goes
  through the Supabase JS client (PostgREST), which **parameterizes every query**. Access is
  further constrained by **Row-Level Security** (users can only insert/update/delete their own rows).
- **CSRF:** not applicable — sessions are **JWT bearer tokens in the `Authorization` header**
  (localStorage), not cookies, so a cross-site request can't ride along with credentials.
  OAuth uses Supabase's `state`/PKCE handling.
- **Abuse limits:** article/comment fields are length-capped (title/dek/tag/author, body ≤ ~4 MB).
- **Keys:** only the public **anon** key is in the frontend; the `service_role` key is never used client-side.

### OWASP Top 10 (2021) coverage
| # | Risk | How it's handled |
|---|---|---|
| A01 | Broken Access Control | **Row-Level Security** on every table; insert/update/delete restricted to the owning user (`with check`). The client auth-gate is UX only — the real boundary is RLS. |
| A02 | Cryptographic Failures | HTTPS everywhere (Supabase + Vercel); passwords hashed by Supabase; no custom crypto; only the public anon key client-side. |
| A03 | Injection | No raw SQL (PostgREST parameterizes); output escaping + field sanitization + CSP for XSS. |
| A04 | Insecure Design | Auth + access enforced server-side via RLS. *Known by design:* the **paywall is simulated/client-side** — a real one must gate `body` server-side. |
| A05 | Security Misconfiguration | RLS enabled on all tables; CSP; least-privilege anon key; no debug endpoints. |
| A06 | Vulnerable Components | Few deps, pinned CDN versions; supabase-js on `@2` for patches. |
| A07 | Auth Failures | Supabase Auth (hashing, OAuth, email confirm, rate-limits). **Enable in the dashboard:** Leaked-Password Protection, email confirmation, and (optionally) CAPTCHA. |
| A08 | Data Integrity Failures | Static assets from trusted CDNs; consider adding **SRI** hashes + pinning exact versions. |
| A09 | Logging/Monitoring | Use Supabase's Auth logs / dashboard. |
| A10 | SSRF | N/A — no server-side fetches from user input. |

**Recommended Supabase dashboard settings** (Authentication → … ): turn on **Confirm email**,
**Leaked Password Protection**, a sensible **minimum password length**, and **rate limiting /
CAPTCHA** for sign-ups. These are config toggles, not code.

## 🧪 Testing
- **Automated (logic/data):** open **`/tests/tests.html`** in Live Server — unit + integration
  tests for the article store and paywall, run **offline** (preview mode), with `localStorage`
  snapshot/restore so real data is safe. Covers reading-time, paywall gating, input
  sanitization (XSS-safe), clap-once, bookmarks, and CRUD.
- **E2E (Playwright):** scaffolded — runs against a tiny built-in static server (no extra deps).
  ```bash
  npm install            # gets @playwright/test
  npx playwright install # browser binaries (first time)
  npm run test:e2e       # runs tests/e2e/*.spec.js
  ```
  Specs that pass **with no credentials**: login render, theme toggle, **logged-out redirect**
  to login, and the logic suite (run inside a real browser). Authenticated flows (publish,
  clap, paywall) are in `tests/e2e/authed.example.spec.js` as a template — enable them with a
  **dedicated test Supabase project** + test account (never prod).
- **Manual E2E:** **`tests/TEST-PLAN.md`** — full click-through checklist for everything that
  needs the live app + Supabase.

## 🛠️ Tech & libraries (all via CDN — no build step)
- **Supabase JS v2** — auth & (later) database.
- **GSAP** — entrance, mascot, and success animations.
- **canvas-confetti** — celebration effects.
- **Inter** (Google Fonts) + Georgia — type pairing.
