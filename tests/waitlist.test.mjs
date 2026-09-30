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

process.env.RESEND_API_KEY = "test-only";

test("stores a plausible address as a contact, trimmed", async () => {
  let sent;
  globalThis.fetch = async (url, init) => {
    sent = { url, body: JSON.parse(init.body) };
    return { ok: true };
  };
  const r = res();
  await handler(post({ email: " teacher@example.com " }), r);
  assert.equal(r.code, 200);
  assert.equal(sent.url, "https://api.resend.com/contacts");
  assert.equal(sent.body.email, "teacher@example.com");
});

test("rejects an implausible address without calling Resend", async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; return { ok: true }; };
  const r = res();
  await handler(post({ email: "not an address" }), r);
  assert.equal(r.code, 400);
  assert.equal(called, false);
});

test("a repeat signup reads as success", async () => {
  globalThis.fetch = async () => ({
    ok: false, status: 409, text: async () => '{"message":"Contact already exists"}',
  });
  const r = res();
  await handler(post({ email: "teacher@example.com" }), r);
  assert.equal(r.code, 200);
});

test("any other Resend failure is reported, not swallowed", async () => {
  globalThis.fetch = async () => ({ ok: false, status: 500, text: async () => "boom" });
  const r = res();
  await handler(post({ email: "teacher@example.com" }), r);
  assert.equal(r.code, 502);
});

test("the honeypot answers 200 and never reaches Resend", async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; return { ok: true }; };
  const r = res();
  await handler(post({ email: "bot@example.com", website: "x" }), r);
  assert.equal(r.code, 200);
  assert.equal(called, false);
});
