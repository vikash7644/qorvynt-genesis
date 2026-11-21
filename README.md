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
