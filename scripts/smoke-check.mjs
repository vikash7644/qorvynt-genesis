import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const html = readFileSync("index.html", "utf8");
for (const id of ["game", "begin", "scan", "jump", "touch", "count", "state", "hostiles", "healthFill", "staminaFill", "attack", "drive"]) {
  assert.match(html, new RegExp('id="' + id + '"'), "Missing required UI element: " + id);
}
for (const feature of [
  "three.module.js", "Genesis Collapse", "fragPositions", "pointerdown", "KeyW", "KeyF", "Space",
  "const obstacles=[]", "const blocked=(x,z)=>obstacles.some", "const enemies=[]", "function attack()",
  "HOSTILE NEUTRALIZED", "function updateMission()", "missionTitle", "missionText", "gameOver=false", "REDEPLOY", "damageCooldown", "healthFill", "staminaFill", "const wantsSprint=", "legs[0].rotation.x", "Genesis X-1", "function toggleDrive()", "activeWheels.forEach", "KeyG", "Vesper S-7", "bikeWheels", "activeVehicle.position.set"
]) {
  assert.ok(html.includes(feature), "Missing game feature marker: " + feature);
}
const openTag = '<script type="module">';
const start = html.indexOf(openTag);
const end = html.indexOf("</script>", start + openTag.length);
assert.ok(start >= 0 && end > start, "Could not find the game module script");
const moduleSource = html.slice(start + openTag.length, end);
const temp = join(tmpdir(), "qorvynt-genesis-check.mjs");
writeFileSync(temp, moduleSource);
const check = spawnSync(process.execPath, ["--check", temp], { encoding: "utf8" });
unlinkSync(temp);
assert.equal(check.status, 0, check.stderr || "JavaScript syntax check failed");
console.log("QORVYNT Genesis smoke checks passed.");
