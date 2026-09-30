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
`/download` any more. Instead the home page's `#android` card collects the
Google-account address a teacher uses on their phone — the closed test admits
testers by that account — and `api/waitlist.mjs` stores it as a Resend
contact. When it is time to invite: export the contacts from the Resend
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
