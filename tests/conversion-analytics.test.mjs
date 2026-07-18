import assert from "node:assert/strict";
import test from "node:test";

const analytics = await import("../lib/conversion-analytics.ts");

test("file counts are reduced to privacy-safe buckets", () => {
  assert.equal(analytics.fileCountBucket(1), "1");
  assert.equal(analytics.fileCountBucket(2), "2_5");
  assert.equal(analytics.fileCountBucket(6), "6_10");
  assert.equal(analytics.fileCountBucket(25), "11_25");
  assert.equal(analytics.fileCountBucket(26), "11_25");
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

test("Plausible maps every conversion and splits pricing CTAs into their funnel event", () => {
  const cases = [
    [{ name: analytics.conversionEvents.seoPrimaryCtaClick, properties: { page_path: "/replace-text-on-product-image/", source_page: "direct", cta_id: "guide_hero_editor" } }, "seo_primary_cta_click"],
    [{ name: analytics.conversionEvents.seoPrimaryCtaClick, properties: { page_path: "/", source_page: "/", cta_id: "pricing_free_tools" } }, "pricing_cta_click"],
    [{ name: analytics.conversionEvents.seoPrimaryCtaClick, properties: { page_path: "/", source_page: "/", cta_id: "pricing_subscribe" } }, "pricing_cta_click"],
    [{ name: analytics.conversionEvents.textEditorFileSelected, properties: { page_path: "/edit-text-in-product-image/", file_count_bucket: "1", result: "success" } }, "text_editor_file_selected"],
    [{ name: analytics.conversionEvents.textEditorExport, properties: { page_path: "/edit-text-in-product-image/", format: "png", result: "success" } }, "text_editor_export"],
    [{ name: analytics.conversionEvents.marketplaceFilesSelected, properties: { page_path: "/marketplace-image-fixer/", file_count_bucket: "2_5", result: "success" } }, "marketplace_files_selected"],
    [{ name: analytics.conversionEvents.marketplacePackPrepared, properties: { page_path: "/marketplace-image-fixer/", platform_selection: "amazon_etsy", file_count_bucket: "2_5", result: "success" } }, "marketplace_pack_prepared"],
    [{ name: analytics.conversionEvents.marketplaceZipExport, properties: { page_path: "/marketplace-image-fixer/", platform_selection: "amazon_etsy", file_count_bucket: "2_5", result: "success" } }, "marketplace_zip_export"],
    [{ name: analytics.conversionEvents.earlyAccessSubmit, properties: { page_path: "/", result: "success" } }, "early_access_submit"],
  ];
  assert.deepEqual(cases.map(([event]) => analytics.plausibleEventFor(event).name), cases.map(([, name]) => name));
});

test("Plausible projection drops sensitive and unknown runtime fields", () => {
  const projected = analytics.plausibleEventFor({
    name: analytics.conversionEvents.textEditorFileSelected,
    properties: {
      page_path: "/edit-text-in-product-image/",
      file_count_bucket: "1",
      result: "success",
      filename: "private-product.jpg",
      email: "seller@example.com",
      query: "?token=secret",
      text: "private label copy",
    },
  });
  assert.deepEqual(projected.props, { page_path: "/edit-text-in-product-image/", file_count_bucket: "1", result: "success" });
});

test("marketplace projections expose only fixed enum properties", () => {
  const projected = analytics.plausibleEventFor({
    name: analytics.conversionEvents.marketplaceZipExport,
    properties: {
      page_path: "/marketplace-image-fixer/",
      platform_selection: "amazon_etsy_ebay",
      file_count_bucket: "11_25",
      result: "success",
      filename: "private-catalog.jpg",
      blob: "blob:https://editimages.app/private",
      error: "private free text",
    },
  });
  assert.deepEqual(projected.props, {
    page_path: "/marketplace-image-fixer/",
    platform_selection: "amazon_etsy_ebay",
    file_count_bucket: "11_25",
    result: "success",
  });
});

test("resource CTA projections expose only the page and fixed CTA id", () => {
  const projected = analytics.plausibleEventFor({
    name: analytics.conversionEvents.resourceCtaClick,
    properties: {
      page_path: "/resources/",
      cta_id: "resource_marketplace_tool",
      destination: "/marketplace-image-fixer/",
      label: "private campaign label",
    },
  });
  assert.deepEqual(projected, {
    name: "resource_cta_click",
    props: {
      page_path: "/resources/",
      cta_id: "resource_marketplace_tool",
    },
  });
});
