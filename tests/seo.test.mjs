import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const robots = await readFile(new URL("../app/robots.ts", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");
const accountLayout = await readFile(new URL("../app/account/layout.tsx", import.meta.url), "utf8");
const loginLayout = await readFile(new URL("../app/login/layout.tsx", import.meta.url), "utf8");
const aiPage = await readFile(new URL("../app/ai-product-photo/page.tsx", import.meta.url), "utf8");

test("root metadata describes live marketplace and text workflows", () => {
  assert.doesNotMatch(layout, /AI product photo generator|Shopify product image generator|AI-generated product photos/i);
  assert.match(layout, /Prepare Amazon, Etsy, and eBay image packs locally/);
  assert.match(layout, /card: "summary"/);
});

test("private routes are not indexable and unsupported AI page is removed from sitemap", () => {
  assert.match(accountLayout, /index: false/);
  assert.match(loginLayout, /index: false/);
  assert.match(robots, /disallow: \["\/account\/", "\/login\/", "\/api\/"\]/);
  assert.doesNotMatch(sitemap, /ai-product-photo/);
  assert.match(aiPage, /index: false/);
});

test("sitemap uses a fixed content date instead of build-time freshness", () => {
  assert.match(sitemap, /const contentDate = "2026-07-18"/);
  assert.doesNotMatch(sitemap, /lastModified:\s*new Date\(\)/);
});
