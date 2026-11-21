import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const html = readFileSync("index.html", "utf8");
for (const id of ["game", "begin", "scan", "jump", "touch", "minimap", "count", "state"]) {
  assert.match(html, new RegExp('id="' + id + '"'), "Missing required UI element: " + id);
}
for (const feature of ["three.module.js", "Genesis Collapse", "FRONTIER RADAR", "fragPositions", "drawRadar", "pointerdown", "KeyW", "Space"]) {
  assert.ok(html.includes(feature), "Missing game feature marker: " + feature);
}
const match = html.match(/<script type="module">([\\s\\S]*?)<\\/script>/);
assert.ok(match, "Could not find the game module script");
const temp = join(tmpdir(), "qorvynt-genesis-check.mjs");
writeFileSync(temp, match[1]);
const check = spawnSync(process.execPath, ["--check", temp], { encoding: "utf8" });
unlinkSync(temp);
assert.equal(check.status, 0, check.stderr || "JavaScript syntax check failed");
console.log("QORVYNT Genesis smoke checks passed.");
