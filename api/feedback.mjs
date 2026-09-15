// Receives the contact form and mails it on via Resend.
//
// Needs two environment variables on the Vercel project:
//   RESEND_API_KEY  — the same key the app uses
//   FEEDBACK_TO     — where to deliver. Deliberately not hardcoded: this
//                     repository is public and that is a personal address.
//
// iqrra.com is already a verified Resend sender, so the from-address below
// works without any further DNS. Replies go to the teacher when they leave
// an address, so hitting reply in your inbox reaches them directly.

const FROM = "اقرأ <feedback@iqrra.com>";
const MAX = { message: 4000, name: 200, contact: 200, context: 300 };

function clean(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

  // Honeypot: a field hidden from people, irresistible to bots. Answer 200 so
  // the bot believes it succeeded and does not retry with the field blank.
  if (clean(body.website, 100)) return res.status(200).json({ ok: true });

  const message = clean(body.message, MAX.message);
  if (message.length < 5) return res.status(400).json({ error: "message" });

  const name = clean(body.name, MAX.name);
  const contact = clean(body.contact, MAX.contact);
  const context = clean(body.context, MAX.context);

  const key = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_TO;
  if (!key || !to) {
    console.error("feedback: RESEND_API_KEY or FEEDBACK_TO is not set");
    return res.status(500).json({ error: "server" });
  }

  const rows = [
    ["الاسم", name || "—"],
    ["المدرسة أو المادة", context || "—"],
    ["للرد", contact || "—"],
  ]
    .map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(v)}</p>`)
    .join("");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        // Only when it is a plausible address — Resend rejects the whole
        // request on a malformed reply_to, which would lose the message.
        ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? { reply_to: contact } : {}),
        subject: `رسالة من معلّم عبر الموقع${name ? ` — ${name}` : ""}`,
        html: `${rows}<hr><div style="white-space:pre-wrap">${escapeHtml(message)}</div>`,
      }),
    });

    if (!r.ok) {
      console.error("feedback: resend returned", r.status, await r.text());
      return res.status(502).json({ error: "send" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("feedback: request failed", err);
    return res.status(502).json({ error: "send" });
  }
}
