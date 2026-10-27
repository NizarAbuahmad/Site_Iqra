# iqrra.com

The marketing site. Static HTML, no build step. Vercel serves it; a push to
`main` deploys.

- `index.html` — the live page
- `editorial.html` — an alternate layout, kept for comparison
- `api/feedback.mjs` — receives the contact form
- `api/waitlist.mjs` — received the Android early-access form (removed from the
  page 2026-10-27, see below; the endpoint is kept). Stores the
  address as a Resend contact; if Resend refuses (a sending-only key cannot
  write contacts) it mails the address to `FEEDBACK_TO` instead, so nothing
  is lost. Check it with `node --test tests/waitlist.test.mjs`
- `tools-make-favicon.py` — regenerates the raster icons from `favicon.svg`
- `data/blog-posts.json`, `data/posts/`, `tools-build-blog.mjs` — the blog (below)

## Adding a blog post

Posts are generated, and the generated HTML is committed (no build on deploy).

1. Add an entry at the top of `data/blog-posts.json` (`slug`, `title`,
   `description`, `date`, `dateLabel`, `minutes`, `kicker`; and the
   `summary` — the 3-sentence «الخلاصة» box shown first, which search snippets
   and AI answers quote; optional `about`, `faq: [{q, a}]` as plain text, and
   `closing: {title, text}`).
2. Write the body as markup in `data/posts/<slug>.html`. The title, dates,
   summary box, contents list (built from the `<h2>`s), FAQ and closing panel
   are added around it by the generator.
3. `python tools-make-og-posts.py` — the post's 1200×630 share card,
   `img/og/<slug>.jpg`. Without it the build warns and the post shares the
   homepage card.
4. `node tools-build-blog.mjs`, then `node tools-build-curriculum.mjs` (the
   second one owns `sitemap.xml`, with a `<lastmod>` for blog URLs, and
   `llms.txt`, and reads the same JSON), and commit what they write.

The build also rewrites the «من المدونة» strip on the homepage (the newest
three posts), between the `blog:latest` markers in `index.html` — edit the data,
not that block. The curriculum build does the same for the hero's proof line
(grades · subjects · learning outcomes, from the published subjects), between
the `stats` markers. The FAQ is rendered from the same list as its structured data,
so the visible questions and the schema cannot drift. `100-prompts-for-teachers`
is the one bespoke post; every other slug uses the article template.

## The contact form needs two environment variables

Set both on the Vercel project (Settings → Environment Variables), or the form
answers 500 and every message a teacher writes is lost:

| | |
|---|---|
| `RESEND_API_KEY` | the same key the app uses |
| `FEEDBACK_TO` | the inbox that receives the messages |

`FEEDBACK_TO` is an environment variable rather than a line of code because
**this repository is public** and the destination is a personal address.

Sending works without further DNS — `iqrra.com` is already a verified Resend
sender. Receiving works too: the domain's MX records point at Zoho (checked
2026-09-30), so replies to `info@iqrra.com` arrive. The form's from-address
`feedback@iqrra.com` only sends.

## The Android app is on Google Play (since 2026-10-27)

Every Android link on the site goes straight to the store listing,
https://play.google.com/store/apps/details?id=com.iqra.teachingassistant — the header button on every page, the hero's
text link, the `#android` card on the home page, the FAQ and the blog posts. The
`#android` id stays on that card because older posts and shares link to it.

`/download` and `/app.apk` used to serve a sideloaded APK; both are now
temporary redirects to the listing in `vercel.json`, so old messages, slides and
QR codes still land on the store. `download.html` is gone. There is no APK
link to update after a build any more: Play delivers updates.

The early-access form is gone from the home page. `api/waitlist.mjs` and the
contacts it collected stay (the app's admin screen mails that list).

**Messaging the list (since 2026-10-25).** `api/_store.mjs` also copies every
signup into the app's `site_signups` table, and the app's admin screen
(app.iqrra.com → حسابي → لوحة الإدارة → المسجّلون → «راسل قائمة الانتظار») sends the
invite, the launch notice and later news to it. It records who was invited,
adds an unsubscribe link to every mail, and skips anyone who unsubscribed. That
screen is the only place that knows who unsubscribed — a Resend broadcast would
mail them again.

**What people agreed to.** Until the wording below went live the form promised
the address would be used «لإرسال دعوة التجربة وإشعار الإطلاق فقط». The app
enforces that: *news* mail reaches only people who signed up **after** this
wording (`UPDATES_CONSENT_FROM` in the app's `lib/siteMail.ts`, which stays
`null` — news disabled — until that date is set). Set it to the day this change
deploys. Anyone who signed up earlier gets the invite and the launch notice and
nothing else. Change the form's wording and that constant together.

If signups arrive in the inbox as «طلب دعوة لتطبيق أندرويد» emails rather
than as contacts, the key on Vercel is sending-only: create a full-access key
in Resend and replace `RESEND_API_KEY`. The function's log line
`waitlist: contacts refused` carries Resend's exact reason.

## The question assistant («اسأل إقرأ»)

A launcher in the bottom-left corner of the home page opens a small chat panel.
It is two files, `ask.js` and `ask.css`, loaded by two lines in `index.html`, with
no build step. It makes one call, `POST /api/site/ask` on the Iqrra API (the
address is the `ENDPOINT` constant at the top of `ask.js`; it is the same API
`api/_store.mjs` reports to). The API answers from a reviewed list of fixed
answers first, with no AI, and uses an AI only for what that list does not
cover; the page does not need to know which. The site stores nothing a visitor
types and sends none of it to analytics: the widget's root element carries
PostHog's `ph-no-capture` class, which stops autocapture from recording even the
fixed starter questions. The conversation (the last few turns
are sent along with each question) lives in the page's memory and is gone when
the page is reloaded.

- **Tests:** `node --test tests/*.test.mjs` runs the pure logic (what is sent,
  what a reply means, the copy), which `ask.js` exports for Node. Use the glob:
  on Node 22 `node --test tests/` fails with "Cannot find module". The DOM layer
  (panel layout, focus, Esc, phones) was checked in a real browser with the API
  stubbed; that script is not in the repo, and there is no automated browser
  test here.
- **Change the starter questions:** edit `CHIPS` in `ask.js`. Each one should be a
  question the API answers from its fixed answers (ask the API's owner), or it
  will cost an AI call.
- **If the API address changes:** edit `ENDPOINT`. The API only accepts calls from
  `https://www.iqrra.com` and `https://iqrra.com`, so a Vercel preview URL shows
  the friendly "couldn't answer" message instead of an answer. That is expected.
- **Switch it off without touching the API:** delete the `<link href="/ask.css">`
  and `<script src="/ask.js">` lines from `index.html` and push.
- **Privacy:** `privacy.html` §6 describes what happens to a question. Change it
  when the behaviour changes.
- **Look:** see the question assistant entry under Components in `DESIGN.md`. All
  its classes start with `iqchat-`, because the page already uses `.ask` for the
  suggestion card.
