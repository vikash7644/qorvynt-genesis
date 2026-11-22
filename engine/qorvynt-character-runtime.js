// QORVYNT Genesis character runtime — hierarchical bone rig + clip mixer.
// Rendering backend: Three.js. Gameplay chooses semantic states; this module owns pose playback.
export function createQorvyntCharacter(THREE, options = {}) {
  if (!THREE?.Group || !THREE?.Bone || !THREE?.AnimationMixer) {
    throw new TypeError("QORVYNT character runtime requires Three.js Group, Bone and AnimationMixer");
  }
  const root = new THREE.Group();
  root.name = options.name || "QORVYNT_Explorer";
  const profile = options.profile || {};
  const dimensions = profile.dimensions || {};
  const dimension = (name, fallback) => Number.isFinite(dimensions[name]) ? dimensions[name] : fallback;
  const rig = profile.rig || {};
  const boneName = (semantic, fallback) => rig[semantic] || fallback;
  const animation = { idle: profile.idle || {}, walk: profile.walk || {}, run: profile.run || {}, jump: profile.jump || {}, attack: profile.attack || {} };
  const clipDuration = (state, fallback) => Math.max(0.05, Number.isFinite(animation[state].duration_ms) ? animation[state].duration_ms / 1000 : fallback);
  const degrees = (value, fallback) => (Number.isFinite(value) ? value : fallback) * Math.PI / 180;
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

  const hips = makeBone(boneName("root", "Hips"), root, 0, dimension("hips_height", 1.0), 0);
  const spine = makeBone(boneName("spine", "Spine"), hips, 0, dimension("spine_height", 0.12), 0);
  const chest = segment(spine, "ChestArmor", dimension("chest_radius", 0.37), dimension("chest_length", 0.76), suit, 0.24);
  chest.scale.set(1.15, 1, 0.82);
  const neck = makeBone("Neck", spine, 0, 0.58, 0);
  const head = makeBone(boneName("head", "Head"), neck, 0, 0.16, 0);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(dimension("head_radius", 0.34), 18, 14), armor);
  skull.name = "HeadMesh";
  skull.position.y = 0.12;
  skull.castShadow = true;
  head.add(skull);
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.1), visor);
  face.name = "Visor";
  face.position.set(0, 0.1, -0.3);
  head.add(face);

  const leftUpperArm = makeBone(boneName("left_arm", "LeftUpperArm"), spine, -dimension("arm_span", 0.42), 0.42, 0);
  segment(leftUpperArm, "LeftArmArmor", dimension("upper_arm_radius", 0.14), dimension("upper_arm_length", 0.52), armor, -0.27);
  const leftForearm = makeBone(boneName("left_forearm", "LeftForearm"), leftUpperArm, 0, -dimension("upper_arm_length", 0.52) + 0.02, 0);
  segment(leftForearm, "LeftForearmArmor", dimension("forearm_radius", 0.12), dimension("forearm_length", 0.48), suit, -0.24);
  const rightUpperArm = makeBone(boneName("right_arm", "RightUpperArm"), spine, dimension("arm_span", 0.42), 0.42, 0);
  segment(rightUpperArm, "RightArmArmor", dimension("upper_arm_radius", 0.14), dimension("upper_arm_length", 0.52), armor, -0.27);
  const rightForearm = makeBone(boneName("right_forearm", "RightForearm"), rightUpperArm, 0, -dimension("upper_arm_length", 0.52) + 0.02, 0);
  segment(rightForearm, "RightForearmArmor", dimension("forearm_radius", 0.12), dimension("forearm_length", 0.48), suit, -0.24);

  const leftUpperLeg = makeBone(boneName("left_leg", "LeftUpperLeg"), hips, -dimension("leg_span", 0.2), -0.12, 0);
  segment(leftUpperLeg, "LeftThighArmor", dimension("upper_leg_radius", 0.17), dimension("upper_leg_length", 0.58), suit, -0.3);
  const leftLowerLeg = makeBone(boneName("left_shin", "LeftLowerLeg"), leftUpperLeg, 0, -dimension("upper_leg_length", 0.58) + 0.02, 0);
  segment(leftLowerLeg, "LeftShinArmor", dimension("lower_leg_radius", 0.13), dimension("lower_leg_length", 0.55), armor, -0.28);
  const leftFoot = makeBone(boneName("left_foot", "LeftFoot"), leftLowerLeg, 0, -dimension("lower_leg_length", 0.55) + 0.02, -0.04);
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(dimension("foot_width", 0.28), dimension("foot_height", 0.16), dimension("foot_depth", 0.42)), suit);
  leftBoot.position.set(0, -0.04, -0.12); leftBoot.castShadow = true; leftFoot.add(leftBoot);

  const rightUpperLeg = makeBone(boneName("right_leg", "RightUpperLeg"), hips, dimension("leg_span", 0.2), -0.12, 0);
  segment(rightUpperLeg, "RightThighArmor", dimension("upper_leg_radius", 0.17), dimension("upper_leg_length", 0.58), suit, -0.3);
  const rightLowerLeg = makeBone(boneName("right_shin", "RightLowerLeg"), rightUpperLeg, 0, -dimension("upper_leg_length", 0.58) + 0.02, 0);
  segment(rightLowerLeg, "RightShinArmor", dimension("lower_leg_radius", 0.13), dimension("lower_leg_length", 0.55), armor, -0.28);
  const rightFoot = makeBone(boneName("right_foot", "RightFoot"), rightLowerLeg, 0, -dimension("lower_leg_length", 0.55) + 0.02, -0.04);
  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.42), suit);
  rightBoot.position.set(0, -0.04, -0.12); rightBoot.castShadow = true; rightFoot.add(rightBoot);

  const track = (path, times, values) => new THREE.NumberKeyframeTrack(path, times, values);
  const clip = (name, duration, tracks) => new THREE.AnimationClip(name, duration, tracks);
  const idleDuration = clipDuration("idle", 2.0), walkDuration = clipDuration("walk", 0.78), runDuration = clipDuration("run", 0.48), jumpDuration = clipDuration("jump", 0.72), attackDuration = clipDuration("attack", 0.52);
  const times = (duration) => [0, duration / 2, duration];
  const idleTimes = times(idleDuration), walkTimes = times(walkDuration), runTimes = times(runDuration), jumpTimes = [0, jumpDuration * 0.31, jumpDuration], attackTimes = [0, attackDuration * 0.31, attackDuration * 0.62, attackDuration];
  const clips = [
    clip("idle", idleDuration, [
      track(boneName("spine", "Spine") + ".rotation[z]", idleTimes, [0, degrees(animation.idle.spine_sway, 1.4), 0]),
      track(boneName("left_arm", "LeftUpperArm") + ".rotation[x]", idleTimes, [degrees(animation.idle.arm_swing, 2), degrees(animation.idle.arm_swing, 4), degrees(animation.idle.arm_swing, 2)]),
      track(boneName("right_arm", "RightUpperArm") + ".rotation[x]", idleTimes, [-degrees(animation.idle.arm_swing, 2), -degrees(animation.idle.arm_swing, 4), -degrees(animation.idle.arm_swing, 2)]),
      track(boneName("head", "Head") + ".rotation[x]", idleTimes, [0, -0.025, 0])
    ]),
    clip("walk", walkDuration, [
      track(boneName("left_leg", "LeftUpperLeg") + ".rotation[x]", walkTimes, [degrees(animation.walk.leg_swing, 36), -degrees(animation.walk.leg_swing, 36), degrees(animation.walk.leg_swing, 36)]),
      track(boneName("right_leg", "RightUpperLeg") + ".rotation[x]", walkTimes, [-degrees(animation.walk.leg_swing, 36), degrees(animation.walk.leg_swing, 36), -degrees(animation.walk.leg_swing, 36)]),
      track(boneName("left_arm", "LeftUpperArm") + ".rotation[x]", walkTimes, [-degrees(animation.walk.arm_swing, 24), degrees(animation.walk.arm_swing, 24), -degrees(animation.walk.arm_swing, 24)]),
      track(boneName("right_arm", "RightUpperArm") + ".rotation[x]", walkTimes, [degrees(animation.walk.arm_swing, 24), -degrees(animation.walk.arm_swing, 24), degrees(animation.walk.arm_swing, 24)]),
      track(boneName("spine", "Spine") + ".rotation[z]", walkTimes, [degrees(animation.walk.spine_sway, 2), -degrees(animation.walk.spine_sway, 2), degrees(animation.walk.spine_sway, 2)])
    ]),
    clip("run", runDuration, [
      track(boneName("left_leg", "LeftUpperLeg") + ".rotation[x]", runTimes, [degrees(animation.run.leg_swing, 52), -degrees(animation.run.leg_swing, 52), degrees(animation.run.leg_swing, 52)]),
      track(boneName("right_leg", "RightUpperLeg") + ".rotation[x]", runTimes, [-degrees(animation.run.leg_swing, 52), degrees(animation.run.leg_swing, 52), -degrees(animation.run.leg_swing, 52)]),
      track(boneName("left_arm", "LeftUpperArm") + ".rotation[x]", runTimes, [-degrees(animation.run.arm_swing, 45), degrees(animation.run.arm_swing, 45), -degrees(animation.run.arm_swing, 45)]),
      track(boneName("right_arm", "RightUpperArm") + ".rotation[x]", runTimes, [degrees(animation.run.arm_swing, 45), -degrees(animation.run.arm_swing, 45), degrees(animation.run.arm_swing, 45)]),
      track(boneName("spine", "Spine") + ".rotation[x]", runTimes, [0, degrees(animation.run.spine_sway, 9), 0])
    ]),
    clip("jump", jumpDuration, [
      track(boneName("left_leg", "LeftUpperLeg") + ".rotation[x]", jumpTimes, [0, -degrees(animation.jump.leg_swing, 32), degrees(animation.jump.leg_swing, 7)]),
      track(boneName("right_leg", "RightUpperLeg") + ".rotation[x]", jumpTimes, [0, -degrees(animation.jump.leg_swing, 32), degrees(animation.jump.leg_swing, 7)]),
      track(boneName("left_arm", "LeftUpperArm") + ".rotation[x]", jumpTimes, [0, -degrees(animation.jump.arm_swing * 3.4, 125), -0.1]),
      track(boneName("right_arm", "RightUpperArm") + ".rotation[x]", jumpTimes, [0, -degrees(animation.jump.arm_swing * 3.4, 125), -0.1]),
      track(boneName("spine", "Spine") + ".rotation[x]", jumpTimes, [0, -degrees(animation.jump.spine_sway, 10), 0])
    ]),
    clip("attack", attackDuration, [
      track(boneName("right_arm", "RightUpperArm") + ".rotation[x]", attackTimes, [0, -degrees(animation.attack.arm_swing * 1.8, 106), degrees(animation.attack.arm_swing * 0.9, 52), 0]),
      track(boneName("right_arm", "RightUpperArm") + ".rotation[z]", attackTimes, [0, -0.35, 0.22, 0]),
      track(boneName("spine", "Spine") + ".rotation[y]", attackTimes, [0, degrees(animation.attack.spine_sway, 11), -degrees(animation.attack.spine_sway * 0.65, 7), 0])
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
    if (!next || (active === name && next.isRunning())) return false;
    const previous = active && active !== name ? actions.get(active) : null;
    next.reset().play();
    if (previous) next.crossFadeFrom(previous, fade, true);
    active = name;
    return true;
  };
  root.userData.qorvyntRig = Object.freeze({ version: 2, source: "QORVYNT", bones: [...bones.keys()], clips: clips.map((item) => item.name), dimensions: Object.freeze({ ...dimensions }), durations: Object.freeze({ idle: idleDuration, walk: walkDuration, run: runDuration, jump: jumpDuration, attack: attackDuration }) });
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
