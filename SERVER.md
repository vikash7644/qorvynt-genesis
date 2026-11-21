# Genesis World Server API

This repository includes a Vercel Functions API foundation in `/api`.

- `GET /api/health` — service health and capability flags.
- `GET /api/world` — world metadata, Emberfall settlement, NPC roster and server UTC day/night phase.

## Deployment

Link this GitHub repository to a Vercel project and deploy the production branch. The functions become available on the same origin as the game.

## Current scope and limitations

This is the first server API foundation, not yet an authoritative multiplayer server. Player saves, shared mutable world state, authentication and multiplayer are intentionally marked unavailable until a persistent database and identity model are configured. The browser game currently continues to run its local simulation.
