# MatchCard Component - Final Redesign

## Overview
The MatchCard component has been completely redesigned to match the visual consistency and quality of other card components in the application (PlayersView, ArmyListsView, DashboardView).

## Design Principles Applied

### 1. **Consistent Card Shell**
```vue
<div class="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden 
     hover:border-yellow-500 transition-all duration-200 
     hover:shadow-lg hover:shadow-yellow-500/10 flex flex-col h-full">
```
- Gray 700 background with gray 600 border
- Yellow 500 hover state with glow effect
- Smooth transitions (200ms)
- Full height flex container for equal card heights in grid

### 2. **Three-Section Vertical Layout**

#### **Header Section** (Match Info)
- **Phase badge**: Yellow 500/20 background with yellow 400 text
- **Date**: Gray 400 text
- **Mission**: Yellow gradient badge (consistent with other components)
- **Quality badge**: Conditional (Close Game, Decisive Victory, etc.)
- **Delete button**: Positioned top-right (only if `showDelete` and `canDelete`)
- **Border**: Gray 600 bottom border separator

#### **Scoreboard Section** (Main Content - flex-1)
- **3-column grid layout**: `grid-cols-[1fr_auto_1fr]`
- **Player cards**: 
  - Gray 800 background with gray 600 border
  - Green border + green 900/10 background for winner
  - Player name (base font, semibold)
  - Faction (xs text, gray 400)
  - **Score**: 3xl font, yellow 500, bold
  - Win streak badge (if present): Red theme with Flame icon

- **VS Divider** (center):
  - Yellow 500 Swords icon (24px)
  - Trophy icon (green theme) for winner
  - Handshake icon (yellow theme) for draw

#### **Footer Section** (Notes)
- Only visible if notes exist
- Gray 800 background card with border
- Italic gray 400 text
- Quotes around notes

### 3. **Visual Hierarchy**
- **Primary focus**: Scores (3xl, yellow 500, bold)
- **Secondary**: Player names (base, semibold)
- **Tertiary**: Factions, dates, notes (xs, gray 400)
- **Accents**: Badges and icons for visual interest

### 4. **Grid-Optimized Design**
Perfect for responsive grids:
```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <MatchCard ... />
</div>
```

- **Mobile**: Full width, vertical card
- **Tablet (md)**: 2 columns
- **Desktop (lg)**: 3 columns
- **Consistent heights**: `h-full` ensures uniform card heights per row

## Component Props

```javascript
{
  match: Object,                    // Match data
  getPlayerName: Function,          // Player name lookup
  getPlayerFaction: Function,       // Player faction lookup
  formatDate: Function,             // Date formatting
  getMatchQualityBadge: Function,   // Optional: Quality badge logic
  getPlayerStreak: Function,        // Optional: Win streak data
  showDelete: Boolean,              // Show delete button
  canDelete: Boolean                // Enable delete action
}
```

## Visual Features

### Winner Highlighting
- Green border (`border-green-500`)
- Green tinted background (`bg-green-900/10`)
- Applied to winner's player card

### Win Streak Badges
- Red theme: `bg-red-900/30 text-red-400 border border-red-500/50`
- Flame icon with count
- Full text: "X Win Streak"

### Match Quality Badges
- 🔥 **Decisive Victory**: Point differential > 30
- ⚔️ **Close Game**: Point differential ≤ 10
- Custom classes passed from parent component

### Hover Effects
- Border: Gray 600 → Yellow 500
- Shadow: Yellow 500/10 glow
- Smooth 200ms transition

## Implementation Examples

### MatchesView (with delete)
```vue
<MatchCard
  :match="match"
  :get-player-name="getPlayerName"
  :get-player-faction="getPlayerFaction"
  :format-date="formatDate"
  :get-match-quality-badge="getMatchQualityBadge"
  :get-player-streak="getPlayerStreak"
  :show-delete="true"
  :can-delete="canDeleteMatch(match)"
  @delete="confirmDeleteMatch"
/>
```

### DashboardView (read-only)
```vue
<MatchCard
  :match="match"
  :get-player-name="getPlayerName"
  :get-player-faction="getPlayerFaction"
  :format-date="formatDate"
  :get-match-quality-badge="getMatchQualityBadge"
  :get-player-streak="getPlayerStreak"
  :show-delete="false"
/>
```

## Style Consistency Checklist

✅ **Card shell**: Gray 700 bg, gray 600 border, yellow hover  
✅ **Header section**: Consistent badge styling (yellow 500/20)  
✅ **Content cards**: Gray 800 nested cards with borders  
✅ **Font sizes**: 3xl scores, base names, xs metadata  
✅ **Icon sizes**: 24px primary (Swords), 14px badges, 12px streaks  
✅ **Spacing**: p-4 sections, p-3 nested cards, gap-3 grid  
✅ **Colors**: Yellow primary, green success, red danger, gray neutrals  
✅ **Transitions**: 200ms duration for all hover effects  

## Design Inspiration Sources

- **PlayersView cards**: Player profile cards with stats
- **ArmyListsView cards**: Army list cards with painting progress
- **DashboardView cards**: Info cards with icon headers

All components now share the same visual language and quality standards.

---

**Status**: ✅ Production Ready  
**Lint Errors**: 0  
**Last Updated**: January 2025
