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

import { storeSignup } from "./_store.mjs";

const FROM = "إقرأ <feedback@iqrra.com>";
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

  // Copy for the admin dashboard, before Resend so a refused send isn't lost.
  // `contact` may be a phone number; only a real address goes in `email`.
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  await storeSignup({
    kind: "contact",
    email: isEmail ? contact : "",
    name,
    message,
    context: [context, !isEmail && contact ? `للرد: ${contact}` : ""].filter(Boolean).join(" · "),
  });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_TO;
  if (!key || !to) {
    console.error("feedback: RESEND_API_KEY or FEEDBACK_TO is not set");
    return res.status(500).json({ error: "server" });
  }

  // Table layout and inline styles throughout: Gmail strips <style> blocks and
  // most clients ignore flex/grid. This is the shape that survives them.
  const row = (label, value, mono) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #EDF1F4;color:#5C6675;font-size:13px;width:150px;vertical-align:top">${label}</td>
          <td style="padding:10px 0;border-bottom:1px solid #EDF1F4;color:#0B1B33;font-size:15px;${mono ? "direction:ltr;text-align:right;" : ""}">${escapeHtml(value) || "—"}</td>
        </tr>`;

  const html = `<!doctype html>
<html lang="ar" dir="rtl"><body style="margin:0;padding:24px 12px;background:#F6F5F1;font-family:'Segoe UI',Tahoma,Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;width:100%;background:#fff;border:1px solid #E6E3DB;border-radius:16px;overflow:hidden">
    <tr>
      <td style="background:#0B1B33;padding:20px 24px">
        <span style="color:#fff;font-size:18px;font-weight:700">إقرأ</span>
        <span style="color:#34D6C6;font-size:13px;padding-right:8px">رسالة من الموقع</span>
      </td>
    </tr>
    <tr>
      <td style="padding:24px">
        <div style="background:#F6F5F1;border-right:3px solid #00A99D;border-radius:10px;padding:16px 18px;color:#0B1B33;font-size:16px;line-height:1.8;white-space:pre-wrap">${escapeHtml(message)}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:22px">
          ${row("الاسم", name)}
          ${row("المدرسة أو المادة", context)}
          ${row("للرد", contact, true)}
        </table>
        ${
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
            ? `<p style="margin:20px 0 0;font-size:13px;color:#5C6675">اضغط «رد» ليصل جوابك إلى المُرسل مباشرة.</p>`
            : `<p style="margin:20px 0 0;font-size:13px;color:#5C6675">لم يترك وسيلة للتواصل، فلا يمكن الرد على هذه الرسالة.</p>`
        }
      </td>
    </tr>
    <tr>
      <td style="background:#F6F5F1;padding:14px 24px;color:#5C6675;font-size:12px;text-align:center">
        أُرسلت من نموذج التواصل في iqrra.com
      </td>
    </tr>
  </table>
</body></html>`;

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
        // A plain-text alternative: readable where HTML is off, and an
        // HTML-only message scores worse with spam filters.
        text: [
          message,
          "",
          `الاسم: ${name || "—"}`,
          `المدرسة أو المادة: ${context || "—"}`,
          `للرد: ${contact || "—"}`,
        ].join("\n"),
        html,
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
