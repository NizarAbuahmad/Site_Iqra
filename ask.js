/**
 * «اسأل إقرأ» — the question assistant on the home page.
 *
 * One call: POST /api/site/ask on the Iqrra API (a reviewed list of fixed
 * answers first, an AI only for what that list does not cover; the page does not
 * need to know which). Everything the visitor sees is put into the page with
 * textContent, never as markup, so nothing the server sends can become HTML.
 *
 * The file has two halves. `core` is pure (what to send, what a reply means, the
 * copy) and is exported for Node, where tests/ask.test.mjs imports it. The DOM
 * layer below it runs only in a browser. History lives in this page's memory
 * and is gone on reload; nothing is stored and nothing is sent to analytics.
 */
(function (root) {
  "use strict";

  // The API the site's forms already report to (api/_store.mjs). One constant,
  // so a change of address is one line.
  var ENDPOINT = "https://iqraa-api-613126375862.europe-west1.run.app/api/site/ask";

  // The API's own limits (a 400 beyond them), so the page never sends more.
  var MESSAGE_MAX = 300;
  var REPLY_MAX = 1200;
  var HISTORY_MAX = 4;

  // The server waits up to 5 s for its facts and 20 s for the model; this is
  // that plus a margin. Past it the visitor gets the "unavailable" notice.
  var TIMEOUT_MS = 25000;

  var EMAIL = "info@iqrra.com";

  // Each of these gets a fixed answer on the API side without any AI.
  var CHIPS = ["ما هو إقرأ؟", "ما الصفوف والمواد؟", "هل هو مجاني؟"];

  var TEXT = {
    ar: {
      unavailable: "تعذّر الحصول على إجابة الآن. يمكنك مراسلتنا على " + EMAIL + " أو كتابة اقتراحك عبر النموذج في الصفحة.",
      limited: "وصلت إلى الحد المؤقت للأسئلة. حاول بعد قليل، أو راسلنا على " + EMAIL + ".",
      rejected: "تعذّر فهم الرسالة. جرّب إعادة صياغتها بجملة أقصر."
    },
    en: {
      unavailable: "I couldn't get an answer just now. You can write to us at " + EMAIL + " or leave a note using the form on the page.",
      limited: "You've reached the temporary limit on questions. Try again in a little while, or write to us at " + EMAIL + ".",
      rejected: "I couldn't understand that message. Try rephrasing it in a shorter sentence."
    }
  };

  function str(v) { return v == null ? "" : String(v); }

  function hasArabic(text) { return /[؀-ۿ]/.test(str(text)); }

  // The language of a message: Arabic when it has any Arabic letter, English when
  // it has text without one, Arabic when it is empty (the page is Arabic).
  function langOf(text) {
    var s = str(text).trim();
    return s && !hasArabic(s) ? "en" : "ar";
  }

  function normalizeMessage(text) { return str(text).trim().slice(0, MESSAGE_MAX); }

  // The request body. `turns` are the EARLIER turns only. Anything the API would
  // refuse (another role, empty text) is dropped here, so one odd entry can
  // never make a whole question fail with a 400.
  function buildRequest(message, turns) {
    var history = [];
    (turns || []).slice(-HISTORY_MAX).forEach(function (turn) {
      if (!turn || typeof turn !== "object") return;
      if (turn.role !== "user" && turn.role !== "assistant") return;
      var content = str(turn.content).trim();
      if (!content) return;
      history.push({ role: turn.role, content: content.slice(0, turn.role === "user" ? MESSAGE_MAX : REPLY_MAX) });
    });
    return { message: normalizeMessage(message), history: history };
  }

  // What a reply means for the visitor. Either an answer, or ONE friendly notice;
  // never a status code, a reason code or a raw error.
  function interpret(status, body, lang) {
    var l = lang === "en" ? "en" : "ar";
    var b = body && typeof body === "object" ? body : {};
    if (status === 200 && b.answered === true && typeof b.content === "string" && b.content.trim()) {
      return { kind: "answer", text: b.content.trim(), source: b.source === "curated" ? "curated" : "ai" };
    }
    if (status === 200 && b.answered === false) {
      var fixed = b.fallback && typeof b.fallback === "object" ? b.fallback[l] : null;
      return {
        kind: "notice",
        text: typeof fixed === "string" && fixed.trim() ? fixed.trim() : TEXT[l].unavailable,
        reason: typeof b.reason === "string" ? b.reason : "unavailable"
      };
    }
    if (status === 429) return { kind: "notice", text: TEXT[l].limited, reason: "rate_limited" };
    if (status === 400) return { kind: "notice", text: TEXT[l].rejected, reason: "rejected" };
    return { kind: "notice", text: TEXT[l].unavailable, reason: "unavailable" };
  }

  var core = {
    ENDPOINT: ENDPOINT,
    MESSAGE_MAX: MESSAGE_MAX,
    REPLY_MAX: REPLY_MAX,
    HISTORY_MAX: HISTORY_MAX,
    TIMEOUT_MS: TIMEOUT_MS,
    EMAIL: EMAIL,
    CHIPS: CHIPS,
    hasArabic: hasArabic,
    langOf: langOf,
    normalizeMessage: normalizeMessage,
    buildRequest: buildRequest,
    interpret: interpret
  };

  if (typeof module !== "undefined" && module.exports) module.exports = core;
  else root.IqrraAsk = core;

  // DOM layer: added below. Nothing above this line touches the page.
})(typeof window !== "undefined" ? window : this);
