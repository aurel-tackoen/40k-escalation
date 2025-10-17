# Feature: Editable League Rules

**Status**: ✅ Complete  
**Date**: October 17, 2025

## Overview

League organizers can now define custom rules that are stored in the database and displayed to all league members on the dashboard. Previously, rules were hardcoded in the UI.

## Changes Made

### 1. Database Schema Update

**File**: `db/schema.ts`

Added a new `rules` field to the `leagues` table:

```typescript
export const leagues = pgTable('leagues', {
  // ... existing fields
  rules: text(), // Custom league rules set by organizer
  // ... rest of fields
});
```

**Migration**: `migrations/0014_spotty_junta.sql`
```sql
ALTER TABLE "leagues" ADD COLUMN "rules" text;
```

### 2. API Updates

#### Create League Endpoint
**File**: `server/api/leagues/create.post.ts`

- Added `rules` field to league creation
- Accepts optional `rules` parameter in request body
- Sets rules to `null` if not provided

```typescript
const [newLeague] = await db.insert(leagues).values({
  // ... existing fields
  rules: body.rules || null,
  // ... rest of fields
}).returning()
```

#### Update League Endpoint
**File**: `server/api/leagues/[id].patch.ts`

- Added `rules` field to updateable fields
- Organizers/owners can update rules via PATCH request

```typescript
const { userId, name, description, rules, gameSystemId, ... } = body

// Build update object with only provided fields
if (rules !== undefined) updateData.rules = rules
```

### 3. League Setup View

**File**: `app/components/views/LeagueSetupView.vue`

#### Added Default Rules Template

```javascript
const DEFAULT_RULES = `VICTORY POINTS SYSTEM
• Primary Objectives: Up to 45 Victory Points
• Secondary Objectives: Up to 15 Victory Points per objective (max 3)
• Match Results: Win = 3 League Points, Draw = 1 League Point, Loss = 0 League Points

ARMY BUILDING RULES
• Players must stay within the point limit for each round
• Army lists should be submitted before each round begins
• Players may modify their army between rounds
• All models must be WYSIWYG (What You See Is What You Get)

MATCH REQUIREMENTS
• Each player must play at least one match per round
• Matches should be completed within the round timeframe
• Results must be reported within 48 hours of completion
• Disputes should be resolved by the league organizer

LEAGUE STANDINGS
• Ranked by total wins, then by total Victory Points scored
• Ties broken by head-to-head record
• Final standings determine league champion`
```

#### Replaced Static Display with Editable Textarea

**Before**: 4 separate `<div>` sections with hardcoded rule text

**After**: Single editable textarea with:
- 20 rows for comfortable editing
- Monospace font for better formatting
- Default rules pre-populated
- "Reset to Default Rules" button
- Helpful instructions for organizers

```vue
<textarea
  v-model="editableLeague.rules"
  rows="20"
  class="input-field font-mono text-sm"
  placeholder="Enter league rules..."
></textarea>

<button
  @click="editableLeague.rules = DEFAULT_RULES"
  class="btn-secondary flex items-center gap-2 text-sm"
>
  <RefreshCw :size="16" />
  <span>Reset to Default Rules</span>
</button>
```

#### Auto-Initialize Rules

Added logic to set default rules if none exist:

```javascript
// Initialize rules on mount
onMounted(() => {
  if (!editableLeague.value.rules) {
    editableLeague.value.rules = DEFAULT_RULES
  }
})

// Set default rules when league changes
watch(() => props.league, (newLeague) => {
  editableLeague.value = normalizeDates(newLeague)
  if (!editableLeague.value.rules) {
    editableLeague.value.rules = DEFAULT_RULES
  }
}, { deep: true })
```

### 4. Dashboard View

**File**: `app/components/views/DashboardView.vue`

Added new "League Rules" section that displays custom rules:

```vue
<!-- League Rules -->
<div v-if="league?.rules" class="card">
  <div class="flex items-center gap-2 mb-4">
    <SettingsIcon :size="24" class="text-yellow-500" />
    <h3 class="text-xl sm:text-2xl font-serif font-bold text-yellow-500">League Rules</h3>
  </div>
  <div class="bg-gray-700 p-6 rounded-lg">
    <pre class="text-gray-300 whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed">{{ league.rules }}</pre>
  </div>
</div>
```

**Features**:
- Only displays if rules exist (`v-if="league?.rules"`)
- Settings icon for visual consistency
- `<pre>` tag preserves formatting (line breaks, spacing)
- `whitespace-pre-wrap` ensures text wraps on small screens
- Positioned between league overview and standings/painting sections

## User Experience

### For League Organizers

1. **Creating a League**: Default rules are automatically populated
2. **Editing Rules**: Navigate to Settings → League Rules section
3. **Customization**: Full textarea to write custom rules
4. **Reset Option**: One-click button to restore default template
5. **Saving**: Rules saved with other league settings

### For League Members

1. **Viewing Rules**: Rules displayed prominently on dashboard
2. **Always Available**: Rules visible at all times when viewing league
3. **Easy Reading**: Formatted text with proper line breaks

## Migration Path

### For Existing Leagues

Existing leagues without rules will:
1. Have `rules` field set to `null` in database
2. Auto-populate with default rules when organizer visits Settings page
3. Continue working without any issues

### Database Migration

```bash
npm run db:generate  # Generate migration
npm run db:migrate   # Apply to database
```

Migration is **safe** and **non-breaking**:
- Adds nullable column
- No existing data affected
- Backwards compatible

## API Usage Examples

### Create League with Custom Rules

```javascript
const response = await $fetch('/api/leagues/create', {
  method: 'POST',
  body: {
    name: 'My League',
    gameSystemId: 1,
    startDate: '2025-01-01',
    createdBy: userId,
    rules: 'My custom rules here...',
    rounds: [/* ... */]
  }
})
```

### Update League Rules

```javascript
const response = await $fetch(`/api/leagues/${leagueId}`, {
  method: 'PATCH',
  body: {
    userId: userId,
    rules: 'Updated rules text...'
  }
})
```

### Fetch League with Rules

```javascript
const response = await $fetch(`/api/leagues/${leagueId}`)
// response.data.rules contains the rules text
```

## Technical Details

### Database Column

- **Type**: `text` (PostgreSQL)
- **Nullable**: Yes (default `null`)
- **Size**: Unlimited (text type supports up to 1GB)

### Performance

- No impact on query performance
- Rules loaded with league data (no additional queries)
- Text field efficiently indexed by PostgreSQL

### Validation

- No character limits (use text field)
- No special validation required
- Sanitized by Vue's text binding (XSS protection)

## Future Enhancements

Possible improvements for future versions:

1. **Rich Text Editor**: Replace textarea with WYSIWYG editor
2. **Templates**: Pre-defined rule templates for different game types
3. **Version History**: Track rule changes over time
4. **Rule Categories**: Organize rules into collapsible sections
5. **Markdown Support**: Allow markdown formatting for better styling
6. **Rule Acknowledgment**: Players must acknowledge rules when joining

## Testing Checklist

- [x] Database migration applied successfully
- [x] Lint errors fixed (zero errors)
- [x] Default rules populate correctly
- [x] Reset button works
- [x] Rules save with league settings
- [x] Rules display on dashboard
- [x] Rules hidden if not set
- [x] API endpoints accept rules field
- [x] Backwards compatible with existing data

## Files Modified

1. `db/schema.ts` - Added rules field
2. `migrations/0014_spotty_junta.sql` - Database migration
3. `server/api/leagues/create.post.ts` - Create endpoint
4. `server/api/leagues/[id].patch.ts` - Update endpoint
5. `app/components/views/LeagueSetupView.vue` - Edit UI
6. `app/components/views/DashboardView.vue` - Display UI

## Summary

This feature empowers league organizers to customize their league rules while maintaining a sensible default template. The implementation is clean, backwards compatible, and follows the existing codebase patterns.

**Key Benefits**:
- ✅ Fully editable by organizers
- ✅ Visible to all league members
- ✅ Database-backed persistence
- ✅ Default template provided
- ✅ Zero breaking changes
- ✅ Zero lint errors
