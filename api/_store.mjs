// Copies a waitlist / contact submission into the app's database, so the
// admin dashboard (app.iqrra.com/admin/signups) can count and export them.
// Resend stays the delivery path; this is a second copy, never a gate.
//
// The leading underscore keeps Vercel from deploying this file as a function.
//
// Env: SITE_INGEST_KEY (shared with the API's Cloud Run service). Unset means
// "not wired yet" and the copy is skipped silently. IQRAA_API_URL overrides
// the API origin.

const API = process.env.IQRAA_API_URL || "https://iqraa-api-613126375862.europe-west1.run.app";

/** Never throws and never waits more than 3 s: a visitor's signup must not
 *  fail or stall because the dashboard copy did. */
export async function storeSignup(row) {
  const key = process.env.SITE_INGEST_KEY;
  if (!key) return;
  try {
    const r = await fetch(`${API}/api/site/signups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-site-key": key },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) console.error("store-signup: api returned", r.status, await r.text());
  } catch (err) {
    console.error("store-signup: request failed", err);
  }
}
