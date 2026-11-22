import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const html = readFileSync("index.html", "utf8");
for (const id of ["game", "begin", "scan", "jump", "touch", "count", "state", "hostiles", "healthFill", "staminaFill", "attack", "drive", "minimap", "minimapCanvas", "objectiveReadout", "credits", "shopToggle", "shopPanel", "shopCredits", "buyMedkit", "buyPulse", "buyArmor", "shopClose"]) {
  assert.match(html, new RegExp('id="' + id + '"'), "Missing required UI element: " + id);
}
for (const feature of [
  "three.module.js", "Genesis Collapse", "loadQorvyntRules", "npc_mira", "npc_kael", "npc_orin", "npc_sera", "QORVYNT_RULES.npc_threat", "QORVYNT_RULES.npc_player", "fragPositions", "pointerdown", "KeyW", "KeyF", "Space",
  "const obstacles=[]", "const blocked=(x,z)=>obstacles.some", "const enemies=[]", "function attack()",
  "HOSTILE NEUTRALIZED", "function updateMission()", "missionTitle", "missionText", "gameOver=false", "REDEPLOY", "damageCooldown", "healthFill", "staminaFill", "const wantsSprint=", "legs[0].rotation.x", "Genesis X-1", "function toggleDrive()", "activeWheels.forEach", "KeyG", "Vesper S-7", "bikeWheels", "activeVehicle.position.set", "function drawMinimap()", "FRONTIER RADAR", "drawMinimap();renderer.render", "function updateObjective()", "GENESIS FRAGMENT", "HOSTILE DRONE", "ANCIENT RUINS", "objectiveReadout", "FRONTIER BLACK MARKET", "Genesis Credits", "function refreshWallet()", "function reward(amount,reason)", "function buy(cost,apply,success)", "HOSTILE NEUTRALIZED", "pulseDamage", "armorLevel", "const lost=Math.floor(credits*.2)", "SAVE_KEY", "function saveGame()", "function loadGame()", "localStorage.setItem", "localStorage.getItem", "defeated.push", "loadGame();", "saveGame();", "localStorage.setItem", "localStorage.getItem", "EMBERFALL OUTPOST", "const settlers=[]", "function decideSettler(n,t)", "function updateSettlers(t,dt)", "TAKING COVER", "GATHERING AT CAMP", "function interactSettler()", "id=\"talk\"", "KeyH", "updateSettlers(t,dt)", "const wildlife=[]", "function updateWildlife(t,dt)", "FLEEING", "const warden=new THREE.Group()", "function updateWarden(t,dt)", "function damageWarden()", "WARDEN SHOCKWAVE", "WARDEN DEFEATED", "updateWildlife(t,dt)", "updateWarden(t,dt)", "wardenHP,wardenDefeated", "data.wardenDefeated===true", "collectedLoot", "const lootDrops=[]", "function spawnLoot(id,x,z,type)", "function updateLoot(dt,t)", "DRONE SALVAGE RECOVERED", "ANCIENT CORE LOOT RECOVERED", "updateLoot(dt,t)", "for(const d of lootDrops)", "id=\"worldConnection\"", "async function syncGenesisWorld()", "qorvynt-genesis-server.vercel.app/api/world", "WORLD SERVER · ONLINE", "WORLD SERVER · OFFLINE · LOCAL SIM"
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
