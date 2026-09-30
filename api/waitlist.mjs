// Receives the Android early-access form and stores the address as a Resend
// contact. One env var, RESEND_API_KEY — the same key api/feedback.mjs uses.
//
// Why a contact and not a message to the inbox: the closed test on Google Play
// needs a LIST of tester addresses to paste into the Play console, and the
// invitation itself goes out as a Resend broadcast to that same list. One
// email per signup would have to be collected back out of an inbox by hand.
//
// Contacts are account-wide in Resend's current API (no audience id), and this
// form is the only thing that creates them, so the contact list IS the
// waitlist. Export it from the Resend dashboard when it is time to invite.

const MAX_EMAIL = 200;
// The same plausibility test feedback.mjs applies before it sets reply_to.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

  // Honeypot, as in feedback.mjs: answer 200 so the bot does not retry.
  if (typeof body.website === "string" && body.website.trim()) {
    return res.status(200).json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().slice(0, MAX_EMAIL) : "";
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "email" });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("waitlist: RESEND_API_KEY is not set");
    return res.status(500).json({ error: "server" });
  }

  try {
    const r = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    if (r.ok) return res.status(200).json({ ok: true });

    // A second signup from the same address is not a failure — the address
    // is on the list, which is all the teacher wanted. Resend's OpenAPI spec
    // does not document the duplicate response, so match on the message.
    const text = await r.text();
    if (/already|exist|duplicate/i.test(text)) return res.status(200).json({ ok: true });

    console.error("waitlist: resend returned", r.status, text);
    return res.status(502).json({ error: "send" });
  } catch (err) {
    console.error("waitlist: request failed", err);
    return res.status(502).json({ error: "send" });
  }
}
