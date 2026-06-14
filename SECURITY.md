# Midium — Security Notes & OWASP Top 10 Demo

> **Purpose of this document.** Midium is a teaching/demo project. The goal is a
> *medium* security posture: the obvious, important defences are in place
> (so it isn't trivially broken), **but a few classic weaknesses are left in on
> purpose** so they can be demonstrated and explained. Each section below gives
> (1) the **defence in place**, (2) the **residual weakness** that is still
> exploitable, (3) **how to demo the attack**, and (4) the **real fix**.
>
> ⚠️ This is an intentionally-vulnerable demo. Do **not** treat it as a
> production-hardened reference, and don't run the "attack" steps against any
> site you don't own.

---

## Architecture & threat model (30-second version)

- **Front end:** static HTML/CSS/vanilla JS on Vercel. No server of our own.
- **Back end:** Supabase (Postgres + Auth + Row Level Security). The browser
  talks to Supabase directly using the **public anon key**.
- **The key idea:** *the browser is fully untrusted.* Anything enforced only in
  JavaScript can be bypassed by a user with DevTools. The **real** security
  boundary is **Postgres Row Level Security (RLS)** + Supabase Auth. We lean on
  RLS for the things that matter (who can write what) and deliberately keep some
  *cosmetic* logic (the paywall, clap counts) client-side.

---

## Posture at a glance

| #   | OWASP 2021 category | Status | One-line summary |
|-----|---------------------|--------|------------------|
| A01 | Broken Access Control | 🟡 Mixed | RLS enforces write-ownership; **paywall is client-side (bypassable)**. |
| A02 | Cryptographic Failures | 🟡 Mixed | HTTPS/HSTS + bcrypt at Supabase; **JWT lives in localStorage**. |
| A03 | Injection | 🟢 / 🟡 | Parameterised queries + output-encoding; **CSP allows `unsafe-inline`**. |
| A04 | Insecure Design | 🟡 Mixed | RLS-first; **free-read counter trusts the client**. |
| A05 | Security Misconfiguration | 🟢 / 🟡 | Full security-header set; **unminified source + verbose logs**. |
| A06 | Vulnerable/Outdated Components | 🟢 | Pinned CDN versions + **Subresource Integrity**. |
| A07 | Auth Failures | 🟡 Depends | Supabase Auth + OAuth; **depends on dashboard settings (see checklist)**. |
| A08 | Software/Data Integrity | 🟢 | SRI on every third-party script. |
| A09 | Logging & Monitoring | 🔴 Gap | Supabase/Vercel logs only; **no app-level alerting**. |
| A10 | SSRF | 🟢 N/A | No server-side fetch of user URLs; static site. |

🟢 reasonably defended · 🟡 partial / intentional gap · 🔴 known gap

---

## A01 — Broken Access Control

**Defence in place**
- Postgres **RLS** on every table ([supabase/schema.sql](supabase/schema.sql)):
  public can *read*, but `insert`/`update`/`delete` are restricted to the owner
  via `auth.uid() = author_id` / `= user_id` / `= follower_id`.
- Route guard: protected pages add an `auth-gate` and **fail closed** — if the
  session isn't confirmed in 7s they redirect to login
  ([scripts/core/session.js](scripts/core/session.js)).
- **Open-redirect guard** on the post-login deep link: only same-origin paths
  are followed ([scripts/feed/feed.js](scripts/feed/feed.js)).

**Residual weakness (intentional)**
- The **paywall and membership flag are client-side only**
  ([scripts/feed/paywall.js](scripts/feed/paywall.js)). Membership is just
  `localStorage["midium-member"] === "true"`, and "5 free articles" is an array
  in `localStorage["midium-reads"]`.

**How to demo the attack** (DevTools → Console, on the live site):
```js
// 1) Become a "paying member" for free:
localStorage.setItem('midium-member', 'true'); location.reload();

// 2) Or reset the free-article counter and keep reading free forever:
localStorage.removeItem('midium-reads'); location.reload();
```
**Contrast — show RLS holding the line.** In the same console, try to edit
*someone else's* article directly through the DB client:
```js
await sb.from('articles').update({ title: 'HACKED' }).eq('id', '<another-users-article-id>');
// -> returns an error / 0 rows: RLS blocks it. The write boundary is real.
```

**Real fix:** entitlements and the free-article count must be checked
**server-side** (an Edge Function / a `memberships` table with RLS), and locked
article bodies must not be sent to non-members in the first place.

---

## A02 — Cryptographic Failures

**Defence in place**
- **HTTPS everywhere** + `Strict-Transport-Security` (HSTS) header
  ([vercel.json](vercel.json)).
- Passwords are hashed with **bcrypt by Supabase** — we never see or store them.
- Tokens travel over TLS; the **anon key is public by design** (it's safe to
  ship; RLS is what protects data).

**Residual weakness (intentional)**
- The session **JWT is stored in `localStorage`**, which is readable by any
  JavaScript on the page — so an XSS bug (see A03) could steal the session.
  A more secure design uses an `httpOnly` cookie the JS can't read.

**How to demo:** DevTools → Application → Local Storage → copy the
`sb-…-auth-token` value, paste the JWT into jwt.io, and read the claims. Explain
that with an XSS hole an attacker could exfiltrate exactly this.

**Real fix:** store the session in `Secure; HttpOnly; SameSite=Strict` cookies
(needs a small server/edge layer), keep token TTL short, and rotate refresh
tokens.

---

## A03 — Injection (SQL / XSS)

**Defence in place**
- **No SQL injection surface:** all DB access goes through Supabase/PostgREST
  with **parameterised** calls (`.eq()`, `.insert({...})`) — we never concatenate
  SQL strings.
- **Output encoding:** every piece of user text is HTML-escaped before it hits
  the DOM via the `esc()` helper used in
  [feed.js](scripts/feed/feed.js)/[article.js](scripts/feed/article.js)/[author.js](scripts/feed/author.js).
- **Field sanitisers at the data boundary**
  ([scripts/data/articles.js](scripts/data/articles.js)): `accent` must match a
  hex-colour regex, `emoji` is stripped of `<>&"'`, `cover`/in-body images must
  use a `data:image/` or `https?://` scheme allow-list.
- **Server-side length caps** as defence-in-depth — `CHECK` constraints in
  [supabase/schema.sql](supabase/schema.sql) reject oversized payloads even if
  the JS clamps are bypassed.

**Residual weakness (intentional)**
- The CSP allows **`script-src 'unsafe-inline'`** (see every page's `<meta>` CSP
  and [vercel.json](vercel.json)). Output is currently escaped, so there's no
  *live* stored-XSS via the normal fields — but the `unsafe-inline` allowance
  means that **the day any sink forgets to call `esc()`, injected inline script
  would execute.** That's the lesson: CSP is a safety net, and `unsafe-inline`
  pokes a hole in it.

**How to demo:**
1. Publish an article whose body contains `<img src=x onerror=alert(document.cookie)>`.
   Show it renders as **plain text** — escaping works.
2. Then open DevTools and show the CSP still contains `'unsafe-inline'`; explain
   that this is the gap a code regression would fall through. *(Want a live XSS
   for the demo? See "Optional: a planted XSS" at the bottom.)*

**Real fix:** drop `'unsafe-inline'` (use external scripts + CSP **hashes/nonces**),
keep escaping, and consider **Trusted Types**.

---

## A04 — Insecure Design

**Defence in place:** RLS-first design; least-privilege anon key; the dangerous
operations (writes) are all owner-checked in the DB.

**Residual weakness (intentional):** business logic that trusts the client —
the free-article counter, "one clap per article", and bookmarks all live in
`localStorage` and can be edited freely (see the A01 console snippets).

**Real fix:** move anything that grants value or enforces limits to the server,
and treat client state as a *cache*, never as the source of truth.

---

## A05 — Security Misconfiguration

**Defence in place** (response headers in [vercel.json](vercel.json), mirrored as
`<meta>` for local dev):
- `Content-Security-Policy` (incl. `object-src 'none'`, `base-uri 'self'`,
  `frame-ancestors 'none'`, `form-action 'self'`)
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, **HSTS**, `Cross-Origin-Opener-Policy`.

**Residual weakness (intentional):** the app JS is **unminified and
un-obfuscated**, and there are **verbose `console` messages** — so all business
logic (including the paywall) is readable in the Sources tab.

**How to demo:** run the live URL through
[securityheaders.com](https://securityheaders.com) (show the good grade), then
open DevTools → Sources and read [paywall.js](scripts/feed/paywall.js) to find
the bypass from A01.

**Real fix:** minify for production, strip debug logs, and tighten the CSP.

---

## A06 — Vulnerable & Outdated Components

**Defence in place:** very few dependencies, all loaded from a CDN with
**pinned exact versions + Subresource Integrity** (`integrity="sha384-…"
crossorigin="anonymous"`) on `@supabase/supabase-js@2.108.1`,
`canvas-confetti@1.9.3`, and `gsap@3.12.5` — see the `<script>` tags in
[index.html](index.html) / [pages/login.html](pages/login.html).

**Residual weakness:** pinning means **manual** updates — versions can drift out
of date if no one watches for advisories.

**How to demo (also proves A08):** change a single character inside any
`integrity="sha384-…"` value, reload, and watch the browser **refuse to run the
tampered script** (console: *"Failed to find a valid digest…"*). That's SRI
catching a compromised/altered CDN file.

**Real fix:** a dependency-update cadence (e.g. Dependabot if moved to an npm
build) plus periodic `npm audit`.

---

## A07 — Identification & Authentication Failures

**Defence in place:** Supabase Auth (bcrypt, built-in rate limiting), OAuth with
Google & Discord, and the fail-closed `auth-gate`.

**Residual weakness:** auth strength **depends on Supabase dashboard settings**
(see the checklist below). If email confirmation / leaked-password protection
are off, weak or breached passwords are accepted. The `isNewUser()` "welcome"
detection is a cosmetic client-side heuristic, not a security control.

**How to demo:** try to sign up with a known-breached password like
`password123`. If it's accepted, leaked-password protection is **off** — flip it
on in the dashboard and show the signup now rejected.

**Real fix:** the dashboard checklist below.

---

## A08 — Software & Data Integrity Failures

**Defence in place:** **SRI** on every third-party script (see A06); first-party
scripts are same-origin. Deploys are gated through GitHub → Vercel.

**Residual weakness:** no signed-release pipeline beyond Git/Vercel trust.

**Real fix:** already mostly addressed via SRI; add signed build artefacts if a
build step is introduced.

---

## A09 — Security Logging & Monitoring Failures

**Defence in place:** Supabase logs auth events and DB activity; Vercel logs
requests.

**Residual weakness (known gap):** there is **no app-level security logging or
alerting**. Failed logins, repeated RLS denials, and client errors (swallowed by
`try/catch`) don't raise any alarm.

**Real fix:** ship Supabase log drains / Vercel logs to a monitoring tool and
alert on anomalies (spikes in 401/403, RLS denials, rapid signups).

---

## A10 — Server-Side Request Forgery (SSRF)

**Defence in place:** there is **no server** that fetches user-supplied URLs, so
classic SSRF doesn't apply. `connect-src` is restricted to Supabase.

**Residual weakness (minor):** `img-src https:` lets a cover-image URL point
anywhere, so a malicious author could use a remote image as a **tracking pixel**
(readers' IP/User-Agent hit the attacker's server). This is a privacy leak, not
true SSRF.

**Real fix:** re-host uploaded images (Supabase Storage) and tighten `img-src`.

---

## ✅ Supabase dashboard checklist (do these in the console — not code)

These are the auth/config hardening steps that *can't* live in the repo. In the
Supabase dashboard for this project:

1. **Authentication → Providers → Email:** turn **"Confirm email" ON** (forces
   email verification before login).
2. **Authentication → Policies / Password:** enable **"Leaked password
   protection"** (HaveIBeenPwned check) and set a **minimum length ≥ 8** (ideally
   require a mix).
3. **Authentication → Attack protection:** enable **CAPTCHA** (hCaptcha/Turnstile)
   on sign-up/sign-in, and confirm **rate limits** are on.
4. **Authentication → URL Configuration:** set **Site URL** to the Vercel domain
   and keep the **Redirect allow-list** tight (`https://<app>.vercel.app/**`
   only; drop wildcards you don't need).
5. **Authentication → Sessions:** shorten **JWT expiry** and enable **refresh
   token rotation**.
6. **Run [supabase/schema.sql](supabase/schema.sql) again** so the new `CHECK`
   constraints + all RLS policies are applied (the file is idempotent).
7. Confirm **RLS is ON for every table** (Database → Tables → each table shows
   "RLS enabled").

> For the mentor demo you can leave 1–3 **off** first to show the weakness, then
> toggle them **on** live to show the fix.

---

## 🎬 Suggested 5-minute demo script

1. **Show the defences (1 min):** open DevTools → Network, load the site, point
   to the CSP/HSTS/X-Frame-Options response headers. Run the URL through
   securityheaders.com.
2. **Break the paywall (1 min):** read 5 articles, hit the wall, then
   `localStorage.setItem('midium-member','true')` → unlimited. *Lesson: never
   trust the client (A01/A04).*
3. **Show RLS holding (1 min):** try to `update` another user's article in the
   console → blocked. *Lesson: the real boundary is the database (A01).*
4. **SRI tamper (1 min):** corrupt one `integrity` hash → script refuses to load.
   *Lesson: supply-chain integrity (A06/A08).*
5. **Auth fix, live (1 min):** sign up with `password123` (accepted), enable
   leaked-password protection in the dashboard, retry → rejected. *Lesson: config
   matters (A07).*

---

## Optional: a planted, clearly-marked XSS (not enabled by default)

If your mentor wants a **live cross-site-scripting** demonstration (not just the
"escaping works" version above), I can add a single, clearly-commented
vulnerable sink (e.g. an article field rendered with `innerHTML` instead of
`esc()`), which — combined with the `unsafe-inline` CSP — would let
`<img src=x onerror=…>` execute. It would be fenced behind an obvious
`// DEMO-ONLY VULNERABILITY` marker and listed here so it can be removed in one
step. Say the word and I'll wire it in.
