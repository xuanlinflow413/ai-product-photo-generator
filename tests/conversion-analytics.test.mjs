import assert from "node:assert/strict";
import test from "node:test";

const analytics = await import("../lib/conversion-analytics.ts");

test("file counts are reduced to privacy-safe buckets", () => {
  assert.equal(analytics.fileCountBucket(1), "1");
  assert.equal(analytics.fileCountBucket(2), "2_5");
  assert.equal(analytics.fileCountBucket(6), "6_10");
  assert.equal(analytics.fileCountBucket(25), "11_25");
});

test("marketplace selections are normalized to a stable allowlisted value", () => {
  assert.equal(analytics.platformSelection(["Etsy", "Amazon", "etsy"]), "amazon_etsy");
  assert.equal(analytics.platformSelection(["eBay"]), "ebay");
  assert.throws(() => analytics.platformSelection([]), /supported marketplace/);
});

test("tracking is a no-op outside the browser", () => {
  assert.doesNotThrow(() => analytics.trackConversion({
    name: analytics.conversionEvents.textEditorExport,
    properties: { page_path: "/edit-text-in-product-image/", format: "png", result: "success" },
  }));
});