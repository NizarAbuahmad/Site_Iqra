# iqrra.com

The marketing site. Static HTML, no build step. Vercel serves it; a push to
`main` deploys.

- `index.html` — the live page
- `download.html` — served at `/download`
- `editorial.html` — an alternate layout, kept for comparison
- `api/feedback.js` — receives the contact form
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
sender. Receiving does not: the domain has no MX records, so mail addressed to
anything `@iqrra.com` bounces. The form's from-address only sends.

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
