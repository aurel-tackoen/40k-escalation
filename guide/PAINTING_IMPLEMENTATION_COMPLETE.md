# 🎨 Painting Progress - Implementation Notes (Current)

This project tracks painting progress **via army units**, not via a dedicated painting table.

## ✅ Source of truth

- Painting data lives on each army's `units` JSON.
- Each unit can include:
  - `totalModels`
  - `paintedModels`

## ✅ Calculations

- Painting calculations are derived at runtime using the painting composable(s) (e.g. `usePaintingStats`).
- Percentages/points use numeric rounding where appropriate (e.g. `Math.round(...)`).

## ✅ Leaderboard behavior

- Leaderboards are **phase-scoped**.
- The current phase is taken from the active league (e.g. `currentPhase`).
- The dashboard embeds the painting leaderboard UI by passing:
  - `leaderboard`
  - `currentPhase`

## ✅ UI

- The painting leaderboard is rendered by the `PaintingProgress` component.
- Progress bars and "fully painted" callouts are driven purely from derived stats.

## ✅ Notes

- There is no separate painting-progress API or dedicated painting-progress database table in the current architecture.
- If you want to add a dedicated painting page later, it should read from the same army-unit model counts to avoid duplication.
