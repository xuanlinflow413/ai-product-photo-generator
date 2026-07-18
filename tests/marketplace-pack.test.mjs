import assert from "node:assert/strict";
import test from "node:test";
import JSZip from "jszip";

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

test("output names are deterministic, ordered, and always JPG", () => {
  assert.equal(pack.marketplaceOutputName("My Product (Blue).png", 0), "01-my-product-blue.jpg");
  assert.equal(pack.marketplaceOutputName("!!!", 2), "03-product.jpg");
  assert.equal(pack.marketplaceRules.Amazon.size, 2000);
  assert.equal(pack.marketplaceRules.eBay.size, 1600);
});

test("normalized source-name collisions cannot overwrite files in a marketplace folder", () => {
  const names = ["photo.png", "photo.jpg", "Photo!!.webp", "PHOTO.jpeg"].map(pack.marketplaceOutputName);
  assert.deepEqual(names, ["01-photo.jpg", "02-photo.jpg", "03-photo.jpg", "04-photo.jpg"]);
  assert.equal(new Set(names).size, names.length);
});

test("output names truncate deterministically within the 255-character component limit", () => {
  const boundaryBase = "a".repeat(248);
  const boundaryName = pack.marketplaceOutputName(`${boundaryBase}.png`, 0);
  const twoHundredFiftyName = pack.marketplaceOutputName(`${"a".repeat(250)}.png`, 0);
  const overlongName = pack.marketplaceOutputName(`${"a".repeat(247)}-${"b".repeat(1000)}.png`, 24);

  assert.equal(boundaryName, `01-${boundaryBase}.jpg`);
  assert.equal(boundaryName.length, pack.MAX_MARKETPLACE_OUTPUT_NAME_LENGTH);
  assert.equal(twoHundredFiftyName, boundaryName);
  assert.ok(overlongName.length <= pack.MAX_MARKETPLACE_OUTPUT_NAME_LENGTH);
  assert.equal(Buffer.byteLength(overlongName, "ascii"), overlongName.length);
  assert.ok(!overlongName.endsWith("-.jpg"));
});

test("empty, Unicode, Windows, and POSIX-style source names become safe JPG components", () => {
  const cases = [
    ["", 0, "01-product.jpg"],
    ["目录/商品图像🌟.png", 1, "02-product.jpg"],
    ["C:\\catalog\\Hero:*?\"<>|.PNG", 2, "03-hero.jpg"],
    ["../../catalog/My Product.webp", 3, "04-my-product.jpg"],
  ];

  for (const [source, index, expected] of cases) {
    const output = pack.marketplaceOutputName(source, index);
    assert.equal(output, expected);
    assert.match(output, /^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/);
    assert.ok(output.length <= pack.MAX_MARKETPLACE_OUTPUT_NAME_LENGTH);
    assert.ok(!output.endsWith("-.jpg"));
  }
});

test("25 identical source names stay unique and match manifest ZIP entries", async () => {
  const names = Array.from({ length: pack.MAX_MARKETPLACE_FILES }, (_, index) =>
    pack.marketplaceOutputName("same-name.png", index),
  );
  assert.equal(new Set(names).size, pack.MAX_MARKETPLACE_FILES);
  assert.equal(names[0], "01-same-name.jpg");
  assert.equal(names.at(-1), "25-same-name.jpg");

  const manifest = { platforms: [{ platform: "Amazon", files: names.map((name) => ({ name })) }] };
  const zip = new JSZip();
  zip.file("manifest.json", JSON.stringify(manifest));
  const folder = zip.folder("amazon");
  assert.ok(folder);
  for (const name of names) folder.file(name, "image");

  const loaded = await JSZip.loadAsync(await zip.generateAsync({ type: "uint8array" }));
  const manifestFile = loaded.file("manifest.json");
  assert.ok(manifestFile);
  const loadedManifest = JSON.parse(await manifestFile.async("string"));
  const manifestNames = loadedManifest.platforms[0].files.map(({ name }) => name).sort();
  const zipNames = Object.keys(loaded.files)
    .filter((name) => name.startsWith("amazon/") && name.endsWith(".jpg"))
    .map((name) => name.slice("amazon/".length))
    .sort();

  assert.deepEqual(zipNames, manifestNames);
  assert.equal(zipNames.length, pack.MAX_MARKETPLACE_FILES);
});

test("pack success events are emitted once per prepared pack key", () => {
  assert.equal(pack.isNewPackEvent(null, "amazon:1:blob-1"), true);
  assert.equal(pack.isNewPackEvent("amazon:1:blob-1", "amazon:1:blob-1"), false);
  assert.equal(pack.isNewPackEvent("amazon:1:blob-1", "etsy:1:blob-2"), true);
});
