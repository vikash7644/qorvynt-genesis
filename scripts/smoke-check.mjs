import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const html = readFileSync("index.html", "utf8");
const characterSource = readFileSync("world/character_animation.qv", "utf8");
const characterRuntime = readFileSync("engine/qorvynt-character-runtime.js", "utf8");
const gltfPipeline = readFileSync("engine/qorvynt-gltf-pipeline.js", "utf8");
const qorvyntAuthoring = readFileSync("engine/qorvynt-authoring.js", "utf8");
const characterLab = readFileSync("character-lab.html", "utf8");
for (const marker of ["parseQorvyntAuthoring", "loadQorvyntCharacterProfile", "explorer_asset_pipeline", "clip_aliases"]) assert.ok(qorvyntAuthoring.includes(marker), "Missing QORVYNT authoring runtime feature: " + marker);
for (const marker of ["createQorvyntCharacter", "AnimationMixer", "LeftUpperLeg", "RightUpperLeg", "LeftUpperArm", "RightUpperArm", '"idle"', '"walk"', '"run"', '"jump"', '"attack"', "crossFadeFrom", "qorvyntRig"]) assert.ok(characterRuntime.includes(marker), "Missing character runtime feature: " + marker);
for (const marker of ["loadQorvyntGLTFCharacter", "GLTFLoader", "isSkinnedMesh", "skeleton.bones", "clipAliases", "crossFadeFrom", "disposeObject", "glTF 2.0"]) assert.ok(gltfPipeline.includes(marker), "Missing GLTF pipeline feature: " + marker);
for (const marker of ['accept=".glb', 'loadQorvyntGLTFCharacter', 'createObjectURL', 'Auto rotate', 'ANIMATION STATES', 'not uploaded to a server']) assert.ok(characterLab.includes(marker), "Missing character lab feature: " + marker);
for (const marker of ["humanoid_rig", "idle_clip", "walk_clip", "run_clip", "jump_clip", "attack_clip", "explorer_character", "required_bones", "clip_aliases"]) assert.ok(characterSource.includes(marker), "Missing QORVYNT character authoring marker: " + marker);
for (const id of ["game", "begin", "scan", "jump", "touch", "count", "state", "hostiles", "healthFill", "staminaFill", "attack", "drive", "characterAsset", "minimap", "minimapCanvas", "objectiveReadout", "credits", "shopToggle", "shopPanel", "shopCredits", "buyMedkit", "buyPulse", "buyArmor", "shopClose"]) {
  assert.match(html, new RegExp('id="' + id + '"'), "Missing required UI element: " + id);
}
for (const feature of [
  "three.module.js", "loadQorvyntCharacterProfile", "qorvyntCharacterProfilePromise", "qorvyntProfile.asset.required_bones", "QORVYNT PROFILE APPLIED", "loadQorvyntGLTFCharacter(THREE,objectUrl", "activeCharacter.play('attack'", "activeCharacter.update(dt)", "QORVYNT PROFILE APPLIED", "Genesis Collapse", "loadQorvyntRules", "npc_mira", "npc_kael", "npc_orin", "npc_sera", "QORVYNT_RULES.npc_threat", "QORVYNT_RULES.npc_player", "fragPositions", "pointerdown", "KeyW", "KeyF", "Space",
  "const obstacles=[]", "const blocked=(x,z)=>obstacles.some", "const enemies=[]", "function attack()",
  "HOSTILE NEUTRALIZED", "function updateMission()", "missionTitle", "missionText", "gameOver=false", "REDEPLOY", "damageCooldown", "healthFill", "staminaFill", "const wantsSprint=", "legs[0].rotation.x", "Genesis X-1", "function toggleDrive()", "activeWheels.forEach", "KeyG", "Vesper S-7", "bikeWheels", "activeVehicle.position.set", "function drawMinimap()", "FRONTIER RADAR", "drawMinimap();renderer.render", "function updateObjective()", "GENESIS FRAGMENT", "HOSTILE DRONE", "ANCIENT RUINS", "objectiveReadout", "FRONTIER BLACK MARKET", "Genesis Credits", "function refreshWallet()", "function reward(amount,reason)", "function buy(cost,apply,success)", "HOSTILE NEUTRALIZED", "pulseDamage", "armorLevel", "const lost=Math.floor(credits*.2)", "SAVE_KEY", "function saveGame()", "function loadGame()", "localStorage.setItem", "localStorage.getItem", "defeated.push", "loadGame();", "saveGame();", "localStorage.setItem", "localStorage.getItem", "EMBERFALL OUTPOST", "const settlers=[]", "function decideSettler(n,t)", "function updateSettlers(t,dt)", "TAKING COVER", "GATHERING AT CAMP", "function interactSettler()", "id=\"talk\"", "KeyH", "updateSettlers(t,dt)", "const wildlife=[]", "function updateWildlife(t,dt)", "FLEEING", "const warden=new THREE.Group()", "function updateWarden(t,dt)", "function damageWarden()", "WARDEN SHOCKWAVE", "WARDEN DEFEATED", "updateWildlife(t,dt)", "updateWarden(t,dt)", "wardenHP,wardenDefeated", "data.wardenDefeated===true", "collectedLoot", "const lootDrops=[]", "function spawnLoot(id,x,z,type)", "function updateLoot(dt,t)", "DRONE SALVAGE RECOVERED", "ANCIENT CORE LOOT RECOVERED", "updateLoot(dt,t)", "for(const d of lootDrops)", "id=\"worldConnection\"", "async function syncGenesisWorld()", "qorvynt-genesis-server.vercel.app/api/world", "WORLD SERVER · ONLINE", "WORLD SERVER · OFFLINE · LOCAL SIM"
]) {
  assert.ok(html.includes(feature), "Missing game feature marker: " + feature);
}
const labModuleStart = characterLab.indexOf('<script type="module">');
const labModuleEnd = characterLab.indexOf("</script>", labModuleStart);
assert.ok(labModuleStart >= 0 && labModuleEnd > labModuleStart, "Could not find character lab module script");
const labModuleTemp = join(tmpdir(), "qorvynt-character-lab-check.mjs");
writeFileSync(labModuleTemp, characterLab.slice(labModuleStart + '<script type="module">'.length, labModuleEnd));
const labModuleCheck = spawnSync(process.execPath, ["--check", labModuleTemp], { encoding: "utf8" });
unlinkSync(labModuleTemp);
assert.equal(labModuleCheck.status, 0, labModuleCheck.stderr || "Character lab JavaScript syntax check failed");
const authoringTemp = join(tmpdir(), "qorvynt-authoring-check.mjs");
writeFileSync(authoringTemp, qorvyntAuthoring);
const authoringCheck = spawnSync(process.execPath, ["--check", authoringTemp], { encoding: "utf8" });
unlinkSync(authoringTemp);
assert.equal(authoringCheck.status, 0, authoringCheck.stderr || "QORVYNT authoring runtime syntax check failed");
const gltfTemp = join(tmpdir(), "qorvynt-gltf-pipeline-check.mjs");
writeFileSync(gltfTemp, gltfPipeline);
const gltfCheck = spawnSync(process.execPath, ["--check", gltfTemp], { encoding: "utf8" });
unlinkSync(gltfTemp);
assert.equal(gltfCheck.status, 0, gltfCheck.stderr || "GLTF pipeline JavaScript syntax check failed");
const runtimeTemp = join(tmpdir(), "qorvynt-character-runtime-check.mjs");
writeFileSync(runtimeTemp, characterRuntime);
const runtimeCheck = spawnSync(process.execPath, ["--check", runtimeTemp], { encoding: "utf8" });
unlinkSync(runtimeTemp);
assert.equal(runtimeCheck.status, 0, runtimeCheck.stderr || "Character runtime JavaScript syntax check failed");
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
const authoringTests = spawnSync(process.execPath, ["scripts/qorvynt-authoring.test.mjs"], { encoding: "utf8" });
assert.equal(authoringTests.status, 0, authoringTests.stderr || authoringTests.stdout || "QORVYNT authoring tests failed");
const gltfTests = spawnSync(process.execPath, ["scripts/gltf-pipeline.test.mjs"], { encoding: "utf8" });
assert.equal(gltfTests.status, 0, gltfTests.stderr || gltfTests.stdout || "GLTF pipeline unit tests failed");
console.log("QORVYNT Genesis smoke checks passed.");
