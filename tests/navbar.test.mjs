import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const navbarSource = await readFile(
  new URL("../components/sections/navbar.tsx", import.meta.url),
  "utf8",
);
const footerSource = await readFile(
  new URL("../components/sections/footer.tsx", import.meta.url),
  "utf8",
);

test("desktop and mobile navigation expose the account sign-in entry", () => {
  assert.equal(
    [...navbarSource.matchAll(/href="\/account\/"/g)].length,
    2,
    "expected one desktop and one mobile account link",
  );
  assert.equal(
    [...navbarSource.matchAll(/>\s*Sign in\s*</g)].length,
    2,
    "expected both account links to have visible Sign in text",
  );
});

test("the mobile sign-in entry closes the menu and is not hidden", () => {
  assert.match(
    navbarSource,
    /href="\/account\/"[\s\S]*?onClick=\{\(\) => setMobileOpen\(false\)\}[\s\S]*?>\s*Sign in\s*</,
  );
  assert.doesNotMatch(
    navbarSource,
    /href="\/account\/"[^>]*className="[^"]*(?:hidden|invisible)[^"]*"/,
  );
});

test("footer navigation wraps on narrow mobile viewports", () => {
  assert.match(footerSource, /<nav className="[^"]*flex-wrap[^"]*"/);
});