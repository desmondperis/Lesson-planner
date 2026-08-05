import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  html: join(root, "index.html"),
  css: join(root, "styles.css"),
  js: join(root, "app.js")
};

for (const path of Object.values(paths)) assert.ok(existsSync(path), `Missing ${path}`);

const html = readFileSync(paths.html, "utf8");
const css = readFileSync(paths.css, "utf8");
const js = readFileSync(paths.js, "utf8");

assert.match(html, /<link rel="stylesheet" href="styles\.css">/, "index.html must load styles.css");
assert.match(html, /<script src="app\.js"><\/script>/, "index.html must load app.js");
assert.doesNotMatch(html, /<style[\s>]/i, "Keep CSS in styles.css");
assert.equal((html.match(/<script(?![^>]+src=)[^>]*>/gi) || []).length, 0, "Keep application JavaScript in app.js");

for (const id of ["planner", "topic", "passage", "go", "clearForm", "status", "errbox", "sheetWrap", "chat"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Missing required #${id}`);
}

const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual([...new Set(duplicates)], [], `Duplicate HTML IDs: ${[...new Set(duplicates)].join(", ")}`);

assert.match(html, /id="status"[^>]+aria-live="polite"/, "Generation status must be announced");
assert.match(html, /id="errbox"[^>]+role="alert"/, "Errors must be announced");
assert.match(css, /\.skip-link\b/, "A visible-on-focus skip link is required");

for (const source of [html, css, js]) {
  assert.doesNotMatch(source, /(?:Ã.|Â.|â€)/, "Possible UTF-8 mojibake detected");
}

assert.match(js, /let\s+GEMINI_API_KEY\s*=\s*["']\s*["']/, "Do not commit a built-in Gemini API key");
for (const fn of ["run", "restorePlannerForm", "savePlannerForm", "clearPlannerInputs", "renderCard", "exportNow"]) {
  assert.match(js, new RegExp(`function\\s+${fn}\\s*\\(`), `Missing function ${fn}`);
}

const syntax = spawnSync(process.execPath, ["--check", paths.js], { encoding: "utf8" });
assert.equal(syntax.status, 0, syntax.stderr || "app.js failed the syntax check");

console.log("Smoke checks passed.");
