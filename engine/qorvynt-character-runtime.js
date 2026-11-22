// QORVYNT Genesis character runtime — hierarchical bone rig + clip mixer.
// Rendering backend: Three.js. Gameplay chooses semantic states; this module owns pose playback.
export function createQorvyntCharacter(THREE, options = {}) {
  if (!THREE?.Group || !THREE?.Bone || !THREE?.AnimationMixer) {
    throw new TypeError("QORVYNT character runtime requires Three.js Group, Bone and AnimationMixer");
  }
  const root = new THREE.Group();
  root.name = options.name || "QORVYNT_Explorer";
  const suit = new THREE.MeshStandardMaterial({ color: 0x263b47, metalness: 0.55, roughness: 0.3 });
  const armor = new THREE.MeshStandardMaterial({ color: 0x405866, metalness: 0.42, roughness: 0.34 });
  const visor = new THREE.MeshStandardMaterial({ color: 0x80f5e8, emissive: 0x247e78, emissiveIntensity: 0.8, metalness: 0.7, roughness: 0.2 });
  const bones = new Map();
  const makeBone = (name, parent, x, y, z) => {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(x, y, z);
    (parent || root).add(bone);
    bones.set(name, bone);
    return bone;
  };
  const segment = (parent, name, radius, length, material, y = -length / 2) => {
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, Math.max(0.05, length - radius * 2), 5, 8), material);
    mesh.name = name;
    mesh.position.y = y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const hips = makeBone("Hips", root, 0, 1.0, 0);
  const spine = makeBone("Spine", hips, 0, 0.12, 0);
  const chest = segment(spine, "ChestArmor", 0.37, 0.76, suit, 0.24);
  chest.scale.set(1.15, 1, 0.82);
  const neck = makeBone("Neck", spine, 0, 0.58, 0);
  const head = makeBone("Head", neck, 0, 0.16, 0);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), armor);
  skull.name = "HeadMesh";
  skull.position.y = 0.12;
  skull.castShadow = true;
  head.add(skull);
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.1), visor);
  face.name = "Visor";
  face.position.set(0, 0.1, -0.3);
  head.add(face);

  const leftUpperArm = makeBone("LeftUpperArm", spine, -0.42, 0.42, 0);
  segment(leftUpperArm, "LeftArmArmor", 0.14, 0.52, armor, -0.27);
  const leftForearm = makeBone("LeftForearm", leftUpperArm, 0, -0.5, 0);
  segment(leftForearm, "LeftForearmArmor", 0.12, 0.48, suit, -0.24);
  const rightUpperArm = makeBone("RightUpperArm", spine, 0.42, 0.42, 0);
  segment(rightUpperArm, "RightArmArmor", 0.14, 0.52, armor, -0.27);
  const rightForearm = makeBone("RightForearm", rightUpperArm, 0, -0.5, 0);
  segment(rightForearm, "RightForearmArmor", 0.12, 0.48, suit, -0.24);

  const leftUpperLeg = makeBone("LeftUpperLeg", hips, -0.2, -0.12, 0);
  segment(leftUpperLeg, "LeftThighArmor", 0.17, 0.58, suit, -0.3);
  const leftLowerLeg = makeBone("LeftLowerLeg", leftUpperLeg, 0, -0.56, 0);
  segment(leftLowerLeg, "LeftShinArmor", 0.13, 0.55, armor, -0.28);
  const leftFoot = makeBone("LeftFoot", leftLowerLeg, 0, -0.53, -0.04);
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.42), suit);
  leftBoot.position.set(0, -0.04, -0.12); leftBoot.castShadow = true; leftFoot.add(leftBoot);

  const rightUpperLeg = makeBone("RightUpperLeg", hips, 0.2, -0.12, 0);
  segment(rightUpperLeg, "RightThighArmor", 0.17, 0.58, suit, -0.3);
  const rightLowerLeg = makeBone("RightLowerLeg", rightUpperLeg, 0, -0.56, 0);
  segment(rightLowerLeg, "RightShinArmor", 0.13, 0.55, armor, -0.28);
  const rightFoot = makeBone("RightFoot", rightLowerLeg, 0, -0.53, -0.04);
  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.42), suit);
  rightBoot.position.set(0, -0.04, -0.12); rightBoot.castShadow = true; rightFoot.add(rightBoot);

  const track = (path, times, values) => new THREE.NumberKeyframeTrack(path, times, values);
  const clip = (name, duration, tracks) => new THREE.AnimationClip(name, duration, tracks);
  const clips = [
    clip("idle", 2.0, [
      track("Spine.rotation[z]", [0, 1, 2], [0, 0.025, 0]),
      track("LeftUpperArm.rotation[x]", [0, 1, 2], [0.04, 0.08, 0.04]),
      track("RightUpperArm.rotation[x]", [0, 1, 2], [-0.04, -0.08, -0.04]),
      track("Head.rotation[x]", [0, 1, 2], [0, -0.025, 0])
    ]),
    clip("walk", 0.78, [
      track("LeftUpperLeg.rotation[x]", [0, 0.39, 0.78], [0.62, -0.62, 0.62]),
      track("RightUpperLeg.rotation[x]", [0, 0.39, 0.78], [-0.62, 0.62, -0.62]),
      track("LeftUpperArm.rotation[x]", [0, 0.39, 0.78], [-0.5, 0.5, -0.5]),
      track("RightUpperArm.rotation[x]", [0, 0.39, 0.78], [0.5, -0.5, 0.5]),
      track("Spine.rotation[z]", [0, 0.39, 0.78], [0.035, -0.035, 0.035])
    ]),
    clip("run", 0.48, [
      track("LeftUpperLeg.rotation[x]", [0, 0.24, 0.48], [0.9, -0.9, 0.9]),
      track("RightUpperLeg.rotation[x]", [0, 0.24, 0.48], [-0.9, 0.9, -0.9]),
      track("LeftUpperArm.rotation[x]", [0, 0.24, 0.48], [-0.78, 0.78, -0.78]),
      track("RightUpperArm.rotation[x]", [0, 0.24, 0.48], [0.78, -0.78, 0.78]),
      track("Spine.rotation[x]", [0, 0.24, 0.48], [0.08, 0.16, 0.08])
    ]),
    clip("jump", 0.72, [
      track("LeftUpperLeg.rotation[x]", [0, 0.22, 0.72], [0, -0.55, 0.12]),
      track("RightUpperLeg.rotation[x]", [0, 0.22, 0.72], [0, -0.55, 0.12]),
      track("LeftUpperArm.rotation[x]", [0, 0.22, 0.72], [0, -2.15, -0.1]),
      track("RightUpperArm.rotation[x]", [0, 0.22, 0.72], [0, -2.15, -0.1]),
      track("Spine.rotation[x]", [0, 0.22, 0.72], [0, -0.18, 0])
    ]),
    clip("attack", 0.52, [
      track("RightUpperArm.rotation[x]", [0, 0.16, 0.32, 0.52], [0, -1.85, 0.9, 0]),
      track("RightUpperArm.rotation[z]", [0, 0.16, 0.32, 0.52], [0, -0.35, 0.22, 0]),
      track("Spine.rotation[y]", [0, 0.16, 0.32, 0.52], [0, 0.2, -0.12, 0])
    ])
  ];
  const mixer = new THREE.AnimationMixer(root);
  const actions = new Map(clips.map((item) => [item.name, mixer.clipAction(item)]));
  for (const [name, action] of actions) {
    action.enabled = true;
    action.setLoop(name === "jump" || name === "attack" ? THREE.LoopOnce : THREE.LoopRepeat, name === "jump" || name === "attack" ? 1 : Infinity);
    action.clampWhenFinished = name === "jump" || name === "attack";
  }
  let active = null;
  const play = (name, fade = 0.16) => {
    const next = actions.get(name);
    if (!next || active === name) return false;
    const previous = active ? actions.get(active) : null;
    next.reset().play();
    if (previous) next.crossFadeFrom(previous, fade, true);
    active = name;
    return true;
  };
  root.userData.qorvyntRig = Object.freeze({ version: 1, bones: [...bones.keys()], clips: clips.map((item) => item.name) });
  play("idle", 0);
  return {
    root, bones, actions, clips, play,
    update(deltaSeconds) { mixer.update(Math.min(Math.max(deltaSeconds, 0), 0.05)); },
    get activeClip() { return active; },
    dispose() {
      mixer.stopAllAction();
      root.traverse((object) => { if (object.isMesh) object.geometry.dispose(); });
      suit.dispose(); armor.dispose(); visor.dispose();
    }
  };
}
