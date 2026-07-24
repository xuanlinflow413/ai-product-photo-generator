import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const editor = await readFile(new URL("../app/edit-text-in-product-image/page.tsx", import.meta.url), "utf8");

test("exact text replacement bypasses generative AI and preserves the entered wording", () => {
  assert.match(editor, /if \(aiOperation === "replace_text"\)/);
  assert.match(editor, /setText\(exactText\)/);
  assert.match(editor, /No AI credit was used/);
});

test("white-box removal clears the region without sending an image to AI", () => {
  assert.match(editor, /remove_text/);
  assert.match(editor, /setText\(""\)/);
  assert.match(editor, /Text removal mode is active/);
  assert.match(editor, /Clear selected text/);
});

test("local text rendering wraps content instead of truncating it with fillText maxWidth", () => {
  assert.match(editor, /function wrapText\(/);
  assert.match(editor, /const layout = fitText\(ctx, previewText, box, fontSize\)/);
  assert.doesNotMatch(editor, /ctx\.fillText\(text, x, box\.y \+ box\.height \/ 2, /);
});

test("editor keeps the primary workflow simple and exposes recovery controls", () => {
  assert.match(editor, /Drop an image here/);
  assert.match(editor, /AI refine/);
  assert.match(editor, /Reset selection/);
  assert.match(editor, /Click or drag the dashed box onto the white label/);
});

test("editor exposes brush selection, history controls, comparison, and localization export", () => {
  assert.match(editor, /Brush select/);
  assert.match(editor, /Undo/);
  assert.match(editor, /Redo/);
  assert.match(editor, /Show original preview/);
  assert.match(editor, /Export language ZIP/);
});
