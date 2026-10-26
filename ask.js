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

  // Arabic, Arabic Supplement, and the two presentation-form blocks (text pasted
  // from some sources arrives as already-joined forms).
  function hasArabic(text) { return /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(str(text)); }

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
    var valid = [];
    // Filter FIRST, then keep the last HISTORY_MAX valid turns, so a junk entry
    // never takes a slot from a real earlier turn.
    (Array.isArray(turns) ? turns : []).forEach(function (turn) {
      if (!turn || typeof turn !== "object") return;
      if (turn.role !== "user" && turn.role !== "assistant") return;
      if (typeof turn.content !== "string") return;
      var content = turn.content.trim();
      if (!content) return;
      valid.push({ role: turn.role, content: content.slice(0, turn.role === "user" ? MESSAGE_MAX : REPLY_MAX) });
    });
    return { message: normalizeMessage(message), history: valid.slice(-HISTORY_MAX) };
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

  // ── DOM layer ───────────────────────────────────────────────────────────────
  // Only in a browser. Node (the tests) stops here.
  if (typeof document === "undefined") return;

  // Hand-built icons, as DESIGN.md requires (no emoji, no icon font).
  var BUBBLE = "M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z";
  var CLOSE = "M6 6l12 12M18 6L6 18";

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(pathData) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var path = document.createElementNS(ns, "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
    return svg;
  }

  function init() {
    if (document.getElementById("iqchat")) return;

    var turns = [];      // earlier question/answer pairs, in this page's memory only
    var busy = false;

    var box = el("div", "iqchat");
    box.id = "iqchat";

    var launcher = el("button", "iqchat-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "اسأل إقرأ");
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "iqchat-panel");
    launcher.appendChild(icon(BUBBLE));

    var panel = el("section", "iqchat-panel");
    panel.id = "iqchat-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "iqchat-title");

    var head = el("div", "iqchat-head");
    var title = el("h2", "iqchat-title", "اسأل إقرأ");
    title.id = "iqchat-title";
    var closeButton = el("button", "iqchat-close");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "إغلاق");
    closeButton.appendChild(icon(CLOSE));
    head.appendChild(title);
    head.appendChild(closeButton);

    var log = el("div", "iqchat-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.setAttribute("aria-relevant", "additions");

    var chips = el("div", "iqchat-chips");
    CHIPS.forEach(function (text) {
      var chip = el("button", "iqchat-chip", text);
      chip.type = "button";
      chip.addEventListener("click", function () { send(text); });
      chips.appendChild(chip);
    });

    var form = el("form", "iqchat-form");
    form.setAttribute("autocomplete", "off");
    var label = el("label", "iqchat-label", "اكتب سؤالك");
    label.setAttribute("for", "iqchat-input");
    var row = el("div", "iqchat-row");
    var input = el("input", "iqchat-input");
    input.id = "iqchat-input";
    input.type = "text";
    input.name = "q";
    input.maxLength = MESSAGE_MAX;
    input.setAttribute("dir", "auto");
    input.setAttribute("enterkeyhint", "send");
    input.setAttribute("autocomplete", "off");
    var sendButton = el("button", "iqchat-send", "إرسال");
    sendButton.type = "submit";
    row.appendChild(input);
    row.appendChild(sendButton);
    form.appendChild(label);
    form.appendChild(row);

    var fine = el("p", "iqchat-fine");
    fine.appendChild(document.createTextNode("تُعالَج الأسئلة التي لا تغطيها الإجابات الجاهزة بواسطة مزوّد ذكاء اصطناعي، فلا تكتب بيانات شخصية. "));
    var privacy = el("a", null, "الخصوصية");
    privacy.href = "/privacy";
    fine.appendChild(privacy);

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(chips);
    panel.appendChild(form);
    panel.appendChild(fine);
    box.appendChild(launcher);
    box.appendChild(panel);
    document.body.appendChild(box);

    function setOpen(open, moveFocus) {
      panel.hidden = !open;
      launcher.setAttribute("aria-expanded", open ? "true" : "false");
      if (!moveFocus) return;
      if (open) input.focus(); else launcher.focus();
    }

    function addMessage(className, text) {
      var message = el("div", "iqchat-msg " + className);
      message.setAttribute("dir", "auto");     // an English answer sits left-aligned inside this RTL page
      message.textContent = text;
      log.appendChild(message);
      log.scrollTop = log.scrollHeight;
      return message;
    }

    function addNotice(text, lang) {
      var message = el("div", "iqchat-msg iqchat-notice");
      message.setAttribute("dir", "auto");
      message.appendChild(document.createTextNode(text));
      var line = el("p");
      var link = el("a", null, lang === "en" ? "Leave a note" : "اكتب اقتراحك");
      link.href = "#feedback";                  // the page opens the suggestion form on this hash
      link.addEventListener("click", function () { setOpen(false, false); });
      line.appendChild(link);
      message.appendChild(line);
      log.appendChild(message);
      log.scrollTop = log.scrollHeight;
    }

    function send(raw) {
      var message = normalizeMessage(raw);
      if (!message || busy) return;
      busy = true;
      sendButton.disabled = true;
      log.setAttribute("aria-busy", "true");
      chips.hidden = true;
      addMessage("iqchat-user", message);
      input.value = "";

      var lang = langOf(message);
      var typing = addMessage("iqchat-bot iqchat-typing", lang === "en" ? "Typing…" : "جارٍ الكتابة…");

      var controller = typeof AbortController === "function" ? new AbortController() : null;
      var timer = setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT_MS);

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequest(message, turns)),
        credentials: "omit",
        signal: controller ? controller.signal : undefined
      })
        .then(function (response) {
          return response.json().then(
            function (body) { return { status: response.status, body: body }; },
            function () { return { status: response.status, body: null }; }
          );
        })
        .catch(function () { return { status: 0, body: null }; })
        .then(function (result) {
          clearTimeout(timer);
          if (typing.parentNode) typing.parentNode.removeChild(typing);
          var outcome = interpret(result.status, result.body, lang);
          if (outcome.kind === "answer") {
            addMessage("iqchat-bot", outcome.text);
            turns.push({ role: "user", content: message }, { role: "assistant", content: outcome.text });
          } else {
            addNotice(outcome.text, lang);
          }
          busy = false;
          sendButton.disabled = false;
          log.removeAttribute("aria-busy");
          input.focus();
        });
    }

    launcher.addEventListener("click", function () { setOpen(true, true); });
    closeButton.addEventListener("click", function () { setOpen(false, true); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) setOpen(false, true);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      send(input.value);
    });

    addMessage("iqchat-bot", "أهلًا بك! اسألني عن إقرأ، أو اختر سؤالًا من الأسفل.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : this);
