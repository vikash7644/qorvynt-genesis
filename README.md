# QORVYNT: Genesis

**A 3D open-world adventure prototype for Web and Android browsers.**

> Year 2197. The Genesis Collapse erased the old world. You awaken with no memories, carrying a living Genesis Core. Find five scattered fragments and uncover the signal hidden in the ruins.

## Play

The game is a browser-based 3D prototype powered by Three.js. It runs on desktop and mobile browsers; no app install or local build tools are required.

- Desktop: **WASD / Arrow keys** to move, **Shift** to sprint, **Space** to jump, **E** to scan.
- Touchscreen: use the on-screen joystick; tap **JUMP** and **SCAN**.
- Objective: explore the frontier and recover all five Genesis fragments.

## Run locally

Serve this folder with any static HTTP server, then open it in a modern browser. The Three.js module is loaded from jsDelivr, so an internet connection is required.

## Deploy to GitHub Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions**.
3. Push to `main`; the included workflow deploys the site.
4. Your game will be available at `https://vikash7644.github.io/qorvynt-genesis/` after the Pages deployment succeeds.

## Prototype scope

This is the first playable 3D vertical slice: procedural terrain, forest and rock scatter, distant mountain silhouettes, ancient ruins, a third-person explorer, camera follow, mobile touch controls, scan interaction, and collectible objectives. It is an early prototype, not a finished AAA-scale open world. Next milestones: proper character animation, terrain collision/pathing, sound, save/progression, quest system, optimized assets, and expanded world regions.

## License

MIT


## Combat prototype
- Three hostile drones patrol and pursue the player when nearby.
- Use `F` or the **PULSE** button at close range; each drone takes three hits to neutralize.
- The Genesis suit has a vitals bar and takes damage when a drone reaches melee range.


## Original vehicle prototype
- Added the original procedural **Genesis X-1** six-wheel frontier rover, built from Three.js geometry (not a borrowed game asset).
- Walk within 5.5 world units and press **G** or **DRIVE** to enter; press **G** or **EXIT** to leave.
- Driving uses faster movement, vehicle-follow camera framing, rotating wheels, collision clearance, and mobile touch controls.
- Exit the rover to use the scan interaction. This is an early prototype vehicle, not a finished production vehicle model.


## Genesis Credits and frontier economy
- Start with **250 Genesis Credits (GC)**, a fictional in-game currency with no real-money value.
- Recovering a Genesis fragment awards **75 GC**; neutralizing a hostile drone awards **50 GC**.
- Open the **SHOP** in-game to buy an Emergency Medkit (60 GC), Pulse Amplifier (180 GC), or Reinforced Armor (150 GC).
- A medkit restores 45 suit vitals, the pulse upgrade increases damage, and armor reduces incoming damage.
- If the suit fails, the player loses 20% of carried credits before redeployment. Credits and upgrades persist in this browser through local saves; see Persistent frontier saves below.


## Persistent frontier saves
Progress is saved locally in the browser using `localStorage`: Genesis Credits, pulse and armor upgrades, recovered fragments, and defeated drones survive a page reload. Save data is stored on the current browser/device only; it does not sync across devices. Clearing browser site data removes the local save. Redeploying resets defeated drones while keeping recovered fragments and purchased upgrades.


## Emberfall Outpost — autonomous survivors
- Discover a small three-cabin survivor settlement in the western frontier.
- Meet four named residents: Mira (field medic), Kael (scout), Orin (mechanic), and Sera (archivist).
- Residents make their own lightweight AI decisions: follow role-based daytime routines, gather near the campfire after dusk, rest when tired, watch the player when approached, and take cover when hostile drones come close.
- Walk near a resident and press **H** or **TALK** to learn their current role and decision.
- This is a first autonomous-NPC prototype using procedural Three.js characters and behavior state machines; it is not yet a full dialogue, quest, or generative-AI system.


## Living frontier and the Ancient Warden
- Seven roaming wildlife creatures forage across the terrain and flee when the explorer approaches.
- Once all five Genesis fragments are recovered and the three hostile drones are neutralized, the Ancient Warden awakens at the ruins.
- The Warden has a 24-point core, pursues the player, and launches a close-range shockwave. Pulse attacks damage it; defeating it awards 500 Genesis Credits.
- The minimap marks the awakened Warden. The encounter is a scripted first boss prototype, not yet a full multi-phase raid.

- The Warden's remaining core health and defeat state are also stored in the browser save, so a reload does not erase boss progress.
