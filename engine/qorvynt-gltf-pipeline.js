// QORVYNT Genesis GLTF/GLB character asset pipeline.
// Imports standards-based skinned characters and binds source animation clips to semantic states.
const DEFAULT_CLIP_ALIASES = Object.freeze({
  idle: ["idle", "stand", "breathing"],
  walk: ["walk", "walking", "locomotion_walk"],
  run: ["run", "running", "sprint"],
  jump: ["jump", "jump_start", "leap"],
  attack: ["attack", "pulse_attack", "melee", "strike"]
});

function normalizeName(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function assertAssetUrl(url) {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    throw new TypeError("QORVYNT character asset URL must be an absolute HTTP(S) URL");
  }
}

async function importGLTFLoader() {
  const sources = [
    "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js",
    "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js?bundle"
  ];
  let lastError;
  for (const source of sources) {
    try {
      const module = await import(source);
      if (module.GLTFLoader) return module.GLTFLoader;
      throw new Error("GLTFLoader export missing");
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error("Unable to load the GLTF/GLB importer: " + (lastError?.message || "CDN unavailable"));
}

function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse((node) => {
    if (!node.isMesh) return;
    if (node.geometry) geometries.add(node.geometry);
    const list = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of list) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value?.isTexture) textures.add(value);
      }
    }
  });
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
}

export async function loadQorvyntGLTFCharacter(THREE, url, options = {}) {
  if (!THREE?.Group || !THREE?.AnimationMixer || !THREE?.Box3 || !THREE?.Vector3) {
    throw new TypeError("QORVYNT GLTF pipeline requires Three.js Group, AnimationMixer, Box3 and Vector3");
  }
  assertAssetUrl(url);
  const GLTFLoader = await importGLTFLoader();
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url, options.onProgress);
  const model = gltf.scene || gltf.scenes?.[0];
  if (!model) throw new Error("GLTF asset contains no scene root");

  const skinnedMeshes = [];
  const boneNames = new Set();
  model.traverse((node) => {
    if (node.isSkinnedMesh && node.skeleton) {
      skinnedMeshes.push(node);
      for (const bone of node.skeleton.bones) boneNames.add(bone.name);
    }
  });
  if (!skinnedMeshes.length) {
    disposeObject(model);
    throw new Error("Character asset has no skinned mesh; export a rigged GLTF/GLB with skin weights");
  }
  const requiredBones = options.requiredBones || [];
  const missingBones = requiredBones.filter((name) => !boneNames.has(name));
  if (missingBones.length) {
    disposeObject(model);
    throw new Error("Character skeleton is missing required bones: " + missingBones.join(", "));
  }

  const wrapper = new THREE.Group();
  wrapper.name = options.name || model.name || "QORVYNT_GLTF_Character";
  wrapper.add(model);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  if (size.y <= 0 || !Number.isFinite(size.y)) {
    disposeObject(model);
    throw new Error("Character asset has invalid vertical bounds");
  }
  const targetHeight = Number.isFinite(options.targetHeight) ? options.targetHeight : 3;
  const scale = targetHeight > 0 ? targetHeight / size.y : 1;
  model.scale.multiplyScalar(scale);
  model.position.x -= center.x * scale;
  model.position.z -= center.z * scale;
  model.position.y -= bounds.min.y * scale;
  wrapper.userData.qorvyntRig = Object.freeze({
    version: 1,
    format: "glTF",
    skinnedMeshCount: skinnedMeshes.length,
    boneNames: [...boneNames],
    sourceAnimations: gltf.animations.map((clip) => clip.name)
  });

  const mixer = new THREE.AnimationMixer(wrapper);
  const aliases = { ...DEFAULT_CLIP_ALIASES, ...(options.clipAliases || {}) };
  const sourceClips = new Map(gltf.animations.map((clip) => [normalizeName(clip.name), clip]));
  const clips = new Map();
  const actions = new Map();
  for (const [semantic, candidates] of Object.entries(aliases)) {
    const names = [semantic, ...(Array.isArray(candidates) ? candidates : [candidates])];
    const match = names.map(normalizeName).map((name) => sourceClips.get(name)).find(Boolean);
    if (match) {
      clips.set(semantic, match);
      actions.set(semantic, mixer.clipAction(match));
    }
  }
  if (!actions.size) {
    disposeObject(model);
    throw new Error("No supported animation clips found; expected idle, walk, run, jump or attack");
  }
  for (const [name, action] of actions) {
    action.enabled = true;
    const oneShot = name === "jump" || name === "attack";
    action.setLoop(oneShot ? THREE.LoopOnce : THREE.LoopRepeat, oneShot ? 1 : Infinity);
    action.clampWhenFinished = oneShot;
  }

  let active = null;
  const play = (name, fade = 0.16) => {
    const next = actions.get(name);
    if (!next || (active === name && next.isRunning())) return false;
    const previous = active && active !== name ? actions.get(active) : null;
    next.reset().play();
    if (previous) next.crossFadeFrom(previous, Math.max(0, fade), true);
    active = name;
    return true;
  };
  const preferredIdle = actions.has("idle") ? "idle" : actions.keys().next().value;
  play(preferredIdle, 0);
  return {
    root: wrapper,
    mixer,
    clips,
    actions,
    boneNames,
    source: gltf,
    play,
    get activeClip() { return active; },
    update(deltaSeconds) { mixer.update(Math.min(Math.max(deltaSeconds, 0), 0.05)); },
    dispose() { mixer.stopAllAction(); disposeObject(model); }
  };
}

export function getQorvyntCharacterAssetContract() {
  return Object.freeze({
    formats: ["glTF 2.0", "GLB"],
    requiresSkinnedMesh: true,
    animationStates: Object.keys(DEFAULT_CLIP_ALIASES),
    supportsExternalClipAliases: true,
    defaultTargetHeight: 3
  });
}
