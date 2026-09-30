// node --test tests/waitlist.test.mjs
//
// Lives outside api/ on purpose: Vercel deploys every file under api/ as a
// function, and a test is not one.
import { test } from "node:test";
import assert from "node:assert/strict";
import handler from "../api/waitlist.mjs";

const res = () => {
  const r = { code: 0, body: null };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
};
const post = (body) => ({ method: "POST", body });

// Records every Resend call and answers each path as told.
const stub = (answers) => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const path = new URL(url).pathname;
    calls.push({ path, body: JSON.parse(init.body) });
    const a = answers[path] ?? { ok: true };
    return { ok: a.ok, status: a.status ?? (a.ok ? 201 : 500), text: async () => a.text ?? "" };
  };
  return calls;
};

process.env.RESEND_API_KEY = "test-only";
process.env.FEEDBACK_TO = "inbox@example.com";

test("stores a plausible address as a contact, trimmed", async () => {
  const calls = stub({});
  const r = res();
  await handler(post({ email: " teacher@example.com " }), r);
  assert.equal(r.code, 200);
  assert.equal(r.body.via, "contact");
  assert.deepEqual(calls.map((c) => c.path), ["/contacts"]);
  assert.equal(calls[0].body.email, "teacher@example.com");
});

test("rejects an implausible address without calling Resend", async () => {
  const calls = stub({});
  const r = res();
  await handler(post({ email: "not an address" }), r);
  assert.equal(r.code, 400);
  assert.equal(calls.length, 0);
});

test("a repeat signup reads as success", async () => {
  stub({ "/contacts": { ok: false, status: 409, text: '{"message":"Contact already exists"}' } });
  const r = res();
  await handler(post({ email: "teacher@example.com" }), r);
  assert.equal(r.code, 200);
});

test("a refused contact is mailed to FEEDBACK_TO instead, never lost", async () => {
  const calls = stub({ "/contacts": { ok: false, status: 403, text: "restricted_api_key" } });
  const r = res();
  await handler(post({ email: "teacher@example.com" }), r);
  assert.equal(r.code, 200);
  assert.equal(r.body.via, "mail");
  assert.equal(r.body.upstream, 403);
  assert.deepEqual(calls.map((c) => c.path), ["/contacts", "/emails"]);
  const mail = calls[1].body;
  assert.deepEqual(mail.to, ["inbox@example.com"]);
  assert.equal(mail.reply_to, "teacher@example.com");
  assert.match(mail.text, /teacher@example\.com/);
});

test("when both paths fail the failure is reported, not swallowed", async () => {
  stub({
    "/contacts": { ok: false, status: 403, text: "restricted_api_key" },
    "/emails": { ok: false, status: 500, text: "boom" },
  });
  const r = res();
  await handler(post({ email: "teacher@example.com" }), r);
  assert.equal(r.code, 502);
  assert.equal(r.body.upstream, 403);
});

test("the honeypot answers 200 and never reaches Resend", async () => {
  const calls = stub({});
  const r = res();
  await handler(post({ email: "bot@example.com", website: "x" }), r);
  assert.equal(r.code, 200);
  assert.equal(calls.length, 0);
});
