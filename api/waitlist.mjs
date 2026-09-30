// Receives the Android early-access form.
//
// First choice: store the address as a Resend contact, so the closed test on
// Google Play gets a LIST of tester addresses to paste into the Play console,
// and the invitation goes out as a Resend broadcast to that same list.
// Contacts are account-wide in Resend's current API (no audience id), and
// this form is the only thing that creates them, so the contact list IS the
// waitlist. Export it from the Resend dashboard when it is time to invite.
//
// Fallback: on 2026-09-30 the live contacts call was refused (502) while the
// contact form, which only SENDS, worked on the same key — a sending-only key
// cannot write contacts. Rather than lose the signup until the key is
// replaced, the address is mailed to FEEDBACK_TO the way the contact form
// mails messages. The response says which path was taken (`via`) and the
// server log carries Resend's reason, so a refused contact is diagnosable.
//
// Env: RESEND_API_KEY (required), FEEDBACK_TO (the fallback's destination).

const FROM = "اقرأ <feedback@iqrra.com>";
const MAX_EMAIL = 200;
// The same plausibility test feedback.mjs applies before it sets reply_to.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function resend(key, path, payload) {
  try {
    const r = await fetch(`https://api.resend.com${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: r.ok, status: r.status, text: r.ok ? "" : await r.text() };
  } catch (err) {
    return { ok: false, status: 0, text: String(err) };
  }
}

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

  const contact = await resend(key, "/contacts", { email, unsubscribed: false });
  if (contact.ok) return res.status(200).json({ ok: true, via: "contact" });
  // A second signup from the same address is not a failure — the address is
  // on the list, which is all the teacher wanted. Resend's OpenAPI spec does
  // not document the duplicate response, so match on the message.
  if (/already|exist|duplicate/i.test(contact.text)) {
    return res.status(200).json({ ok: true, via: "contact" });
  }
  console.error("waitlist: contacts refused", contact.status, contact.text);

  const to = process.env.FEEDBACK_TO;
  let mail = null;
  if (to) {
    mail = await resend(key, "/emails", {
      from: FROM,
      to: [to],
      reply_to: email,
      subject: `طلب دعوة لتطبيق أندرويد — ${email}`,
      text: [
        `سجّل هذا البريد في قائمة انتظار تطبيق أندرويد: ${email}`,
        "",
        "وصل بالبريد لأن تسجيل جهة الاتصال في Resend رُفض — انظر سجلّ الدالة. ",
        "أضفه إلى قائمة مختبري Play يدويًا إلى أن يُصلح ذلك.",
      ].join("\n"),
    });
    if (mail.ok) return res.status(200).json({ ok: true, via: "mail", upstream: contact.status });
    console.error("waitlist: fallback mail refused", mail.status, mail.text);
  }

  // Resend's own reasons ride along: the function log is not the first place
  // anyone looks, and a refusal that only says "send" cost a round of guessing.
  return res.status(502).json({
    error: "send",
    upstream: contact.status,
    reason: contact.text.slice(0, 300),
    mail: mail ? { status: mail.status, reason: mail.text.slice(0, 300) } : "FEEDBACK_TO unset",
  });
}
