# Painting Progress (Per-Unit Model Counts)

## Overview
Painting progress is tracked on **army units** by storing model counts:
- `totalModels`
- `paintedModels`

Because armies are created per **phase**, painting progress is implicitly phase-scoped: the UI reads the army list for the current phase and calculates completion.

## Where it lives

### Army units payload
Each army stores a `units` array (JSON). Units support these fields:
- `name`
- `role` (varies by system)
- `points`
- `totalModels`
- `paintedModels`

### League store getter
The `paintingLeaderboard` getter in `app/stores/leagues.js`:
- Determines the current phase via `currentLeague.currentPhase`
- Finds each player’s army for that phase (`army.phase === currentPhase`)
- Computes model-based percentage and painted-points percentage

### UI component
`app/components/PaintingProgress.vue` renders the leaderboard.
It is used on the dashboard (`DashboardView.vue`).

## How to use
1. In the army list builder, add `totalModels` and `paintedModels` per unit.
2. The painting leaderboard updates automatically for the current phase.

## Notes
- There is no separate painting table or painting API.
- `Math.round(...)` is used only for numeric percentage/points rounding.
