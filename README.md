# iqrra.com

The marketing site. Static HTML, no build step. Vercel serves it; a push to
`main` deploys.

- `index.html` — the live page
- `editorial.html` — an alternate layout, kept for comparison
- `tools-make-favicon.py` — regenerates the raster icons from `favicon.svg`

## After every Android build, change one line

`/download` is the only Android link that should ever appear anywhere — on
this site, in a message to a teacher, on a slide. It redirects to the APK
named in `vercel.json`.

EAS gives each build a **new artifact URL**, so that line goes stale on every
`eas build`. Nothing breaks visibly when it does: the page keeps serving the
previous binary, and the only symptom is teachers running an old app.

So when a build finishes, edit `destination` in `vercel.json` and push. That
is the whole procedure.

The redirect is deliberately **temporary** (`"permanent": false` → 307). A 301
would be cached by browsers indefinitely and would keep sending people to the
old APK even after this file changed — which is the exact failure the redirect
exists to prevent. Do not "tidy" it into a permanent one.
