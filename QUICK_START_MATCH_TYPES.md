# 🎯 Quick Start: Game-Specific Match Types

## What You Need to Do

### 1. Apply Database Migration
```bash
npm run db:migrate
```
This adds `matchType`, `description`, and `matchConfig` fields to the `game_systems` table.

### 2. Seed Game Systems
Start your dev server:
```bash
npm run dev
```

Then seed game systems (one-time setup):
```bash
curl -X POST http://localhost:3000/api/seed-game-systems
```

**Or** in browser console:
```javascript
fetch('/api/seed-game-systems', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

This will populate:
- ✅ 5 game systems (with matchType & matchConfig)
- ✅ 139 factions
- ✅ 69 missions
- ✅ 43 unit types

### 3. Verify It Worked
```bash
curl http://localhost:3000/api/game-systems
```

You should see `matchType` and `matchConfig` in the response.

### 4. Test in the UI
1. Create a new league
2. Go to the Matches page
3. The form will automatically change based on your league's game system:
   - **40k/AoS/Horus Heresy** → Victory Points form (0-100)
   - **The Old World** → Percentage/Casualties form (army values + casualties)
   - **MESBG** → Scenario Objectives form (objective + completion)

## That's It! 🎉

The system will now:
- ✅ Show the correct match recording form based on game system
- ✅ Validate matches according to game-specific rules
- ✅ Display results correctly in the dashboard
- ✅ Export CSV with match type-specific columns

---

**Questions?** Check `guide/DATABASE_MATCH_TYPE_UPDATE.md` for details.
