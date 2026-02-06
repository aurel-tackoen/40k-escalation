# 🎨 Painting - Quick Reference (Current)

Painting progress is tracked via **army units**. Each unit can include `totalModels` and `paintedModels`, and all stats/leaderboards are derived from that.

## Where painting data lives

- Armies store `units` as JSON.
- Each unit can contain:
  - `totalModels`
  - `paintedModels`

## Leaderboard (phase-scoped)

- Leaderboards are calculated for a specific **phase** (typically the league's `currentPhase`).
- The dashboard passes the phase into the painting widget.

## Component usage

`PaintingProgress` expects:

```vue
<PaintingProgress
  :leaderboard="paintingLeaderboard"
  :currentPhase="league?.currentPhase || 1"
/>
```

## Common task: update a unit

When editing units in an army, set model counts like:

```js
unit.totalModels = 10
unit.paintedModels = 7
```

The UI will reflect derived completion automatically.

## Notes

- There is no dedicated painting-progress API or database table in the current architecture.
- Numeric rounding (e.g. `Math.round(...)`) is fine where you need it for display.
