import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const loginSource = await readFile(
  new URL("../app/login/page.tsx", import.meta.url),
  "utf8",
);

test("login page keeps the production Google OAuth contract", () => {
  assert.match(loginSource, /https:\/\/auth\.editimages\.app\/api\/auth\/google/);
  assert.match(loginSource, /returnUrl: "https:\/\/editimages\.app\/login\/"/);
  assert.match(loginSource, />\s*Continue with Google\s*</);
});

test("login page exposes branded navigation and accessible status", () => {
  assert.match(loginSource, /<Camera[\s\S]*?<span className="text-lg">EditImages<\/span>/);
  assert.match(loginSource, /Back to home/);
  assert.match(loginSource, /role="status" aria-live="polite"/);
  assert.match(loginSource, /Sign-in is temporarily unavailable\. Please try again\./);
  assert.doesNotMatch(loginSource, /setMessage\(error instanceof Error \? error\.message/);
});

test("login page has visible keyboard focus and narrow viewport safeguards", () => {
  assert.ok([...loginSource.matchAll(/focus-visible:ring-2/g)].length >= 3);
  assert.match(loginSource, /overflow-x-hidden/);
  assert.match(loginSource, /w-full max-w-\[440px\]/);
});