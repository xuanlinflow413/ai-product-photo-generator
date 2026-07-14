import assert from "node:assert/strict";
import test from "node:test";

const pack = await import("../lib/marketplace-pack.ts");

const file = (type = "image/jpeg", size = 1000, name = "Product Photo.PNG") => ({ type, size, name });

test("marketplace file selection accepts supported formats and caps at 25", () => {
  const result = pack.selectMarketplaceFiles([], Array.from({ length: 26 }, (_, index) => file("image/png", 1000, `photo-${index}.png`)));
  assert.equal(result.files.length, 25);
  assert.equal(result.accepted.length, 25);
  assert.equal(result.overflowCount, 1);
  assert.equal(result.invalidCount, 0);
});

test("marketplace file selection rejects unsupported MIME and oversized files", () => {
  const result = pack.selectMarketplaceFiles([], [file("image/gif"), file("image/jpeg", pack.MAX_MARKETPLACE_FILE_BYTES + 1)]);
  assert.equal(result.files.length, 0);
  assert.equal(result.invalidCount, 2);
  assert.match(pack.selectionMessage(result.invalidCount, result.overflowCount) ?? "", /PNG, JPG, or WebP/);
});

test("selection appends without exceeding the remaining capacity", () => {
  const current = Array.from({ length: 24 }, (_, index) => file("image/jpeg", 1000, `existing-${index}.jpg`));
  const result = pack.selectMarketplaceFiles(current, [file("image/webp"), file("image/png")]);
  assert.equal(result.files.length, 25);
  assert.equal(result.accepted.length, 1);
  assert.equal(result.overflowCount, 1);
});

test("output names are deterministic and always JPG", () => {
  assert.equal(pack.marketplaceOutputName("My Product (Blue).png", 0), "my-product-blue.jpg");
  assert.equal(pack.marketplaceOutputName("!!!", 2), "product-3.jpg");
  assert.equal(pack.marketplaceRules.Amazon.size, 2000);
  assert.equal(pack.marketplaceRules.eBay.size, 1600);
});

test("pack success events are emitted once per prepared pack key", () => {
  assert.equal(pack.isNewPackEvent(null, "amazon:1:blob-1"), true);
  assert.equal(pack.isNewPackEvent("amazon:1:blob-1", "amazon:1:blob-1"), false);
  assert.equal(pack.isNewPackEvent("amazon:1:blob-1", "etsy:1:blob-2"), true);
});
