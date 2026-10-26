# iqrra.com

The marketing site. Static HTML, no build step. Vercel serves it; a push to
`main` deploys.

- `index.html` — the live page
- `download.html` — served at `/download`
- `editorial.html` — an alternate layout, kept for comparison
- `api/feedback.mjs` — receives the contact form
- `api/waitlist.mjs` — receives the Android early-access form. Stores the
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

## The Android app is not linked from the site (since 2026-09-30)

The app is in Google Play's closed test, so nothing on the site points at
`/download` any more. Instead the home page collects an email (hero field and
`#android` card) and `api/waitlist.mjs` stores it as a Resend contact. Any
address is accepted: the list serves the closed test (Play admits testers by
Google account, so that address is *preferred* and asked for in the hint) and
the later launch announcement (any email works). Before pasting contacts into
the Play tester list, check each is a Google account and email the ones that
are not to ask for the address on their phone. When it is time to invite: export the contacts from the Resend
dashboard, paste them into the Play console's tester list, and send the invite
as a Resend broadcast to the same contacts. Once the app is on the store, swap
the card for a Play link.

If signups arrive in the inbox as «طلب دعوة لتطبيق أندرويد» emails rather
than as contacts, the key on Vercel is sending-only: create a full-access key
in Resend and replace `RESEND_API_KEY`. The function's log line
`waitlist: contacts refused` carries Resend's exact reason.

`/download` itself still works for anyone holding the link (and is still
`noindex`), so the procedure below still applies to it.

## After every Android build, change one line

`/download` is the only Android link that should ever appear anywhere — on
this site, in a message to a teacher, on a slide. It serves `download.html`,
which starts the download and explains how to install it. The file itself
comes from `/app.apk`, a redirect to the APK named in `vercel.json`.

EAS gives each build a **new artifact URL**, so that line goes stale on every
`eas build`. Nothing breaks visibly when it does: the page keeps serving the
previous binary, and the only symptom is teachers running an old app.

So when a build finishes, edit `destination` in `vercel.json` and push. That
is the whole procedure.

The redirect is deliberately **temporary** (`"permanent": false` → 307). A 301
would be cached by browsers indefinitely and would keep sending people to the
old APK even after this file changed — which is the exact failure the redirect
exists to prevent. Do not "tidy" it into a permanent one.

## The question assistant («اسأل إقرأ»)

A launcher in the bottom-left corner of the home page opens a small chat panel.
It is two files, `ask.js` and `ask.css`, loaded by two lines in `index.html`, with
no build step. It makes one call, `POST /api/site/ask` on the Iqrra API (the
address is the `ENDPOINT` constant at the top of `ask.js`; it is the same API
`api/_store.mjs` reports to). The API answers from a reviewed list of fixed
answers first, with no AI, and uses an AI only for what that list does not
cover; the page does not need to know which. The site stores nothing a visitor
types and sends none of it to analytics. The conversation (the last few turns
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
