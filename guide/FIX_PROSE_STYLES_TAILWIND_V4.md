# Fix: Custom Prose Styles for Tailwind v4

**Status**: ✅ Complete  
**Date**: October 17, 2025  
**Issue**: Tailwind Typography plugin doesn't work with Tailwind CSS v4

## Problem

The `@tailwindcss/typography` plugin was installed but doesn't work with Tailwind CSS v4 because:
1. Tailwind v4 uses a different configuration system (`@theme` in CSS)
2. The plugin system from v3 is not compatible with v4
3. The `prose` classes weren't being styled correctly

## Solution

Implemented custom prose styles directly in `main.css` using Tailwind v4's native CSS approach.

## Changes Made

### 1. Added Custom Prose Styles

**File**: `app/assets/css/main.css`

Added comprehensive prose styling with ~200 lines of custom CSS:

```css
.prose {
  color: rgb(209 213 219); /* gray-300 */
  max-width: 65ch;
  font-size: 1rem;
  line-height: 1.75;
  
  /* Headers with golden yellow */
  h1, h2, h3, h4, h5, h6 {
    color: var(--color-wh-gold);
    font-weight: 700;
  }
  
  /* Links */
  a {
    color: var(--color-wh-gold);
    text-decoration: underline;
  }
  
  /* Strong/Bold */
  strong {
    color: rgb(253 224 71); /* yellow-300 */
    font-weight: 700;
  }
  
  /* ... and more */
}
```

### 2. Updated DashboardView

**File**: `app/components/views/DashboardView.vue`

Simplified the prose class usage:

**Before**:
```vue
<div class="prose prose-invert prose-sm sm:prose-base max-w-none">
```

**After**:
```vue
<div class="prose prose-sm sm:prose-base max-w-none">
```

Removed `prose-invert` since our custom styles are already dark-themed.

### 3. Removed Unnecessary Files

- **Deleted**: `tailwind.config.js` (not needed with Tailwind v4)
- **Uninstalled**: `@tailwindcss/typography` package

## Prose Styles Included

### Typography Elements

#### Headers
- `h1` - 2.25em, golden yellow
- `h2` - 1.875em, golden yellow
- `h3` - 1.5em, golden yellow
- `h4` - 1.25em, golden yellow
- All headers: Bold, proper spacing

#### Text Formatting
- **Paragraphs** - Gray-300, 1.75 line-height
- **Strong/Bold** - Yellow-300, weight 700
- **Emphasis/Italic** - Italic style
- **Links** - Golden yellow, underlined, hover effect

#### Lists
- **Unordered lists** - Golden bullet markers
- **Ordered lists** - Golden numbered markers
- Proper indentation and spacing
- Nested list support

#### Code
- **Inline code** - Yellow-300 on gray-800 background
- **Code blocks** - Gray-800 background with scrolling
- Proper padding and border radius
- No backtick markers shown

#### Blockquotes
- Italic text in gray-400
- Golden left border (0.25rem)
- Left padding for offset
- Proper margins

#### Tables
- Full-width layout
- Golden headers
- Gray borders between rows
- Proper cell padding

#### Horizontal Rules
- Gray-600 color
- 3em top/bottom margins
- 1px border width

### Responsive Sizing

#### prose-sm
- Base: 0.875rem (14px)
- Scaled header sizes
- Mobile-optimized

#### prose-base  
- Base: 1rem (16px)
- Standard desktop size
- Smooth breakpoint transition

### Utility Classes

#### max-w-none
- Removes default max-width
- Allows full-width content
- Used in dashboard display

## Dark Theme Integration

All styles use the existing Warhammer 40k dark theme:

| Element | Color | Variable/Class |
|---------|-------|----------------|
| Headers | Golden Yellow | `var(--color-wh-gold)` |
| Body Text | Light Gray | `rgb(209 213 219)` |
| Strong | Yellow | `rgb(253 224 71)` |
| Links | Golden Yellow | `var(--color-wh-gold)` |
| Code BG | Dark Gray | `rgb(31 41 55)` |
| Borders | Mid Gray | `rgb(75 85 99)` |

## Advantages Over Plugin

### Better Integration
✅ **Native CSS** - Works perfectly with Tailwind v4  
✅ **Custom colors** - Uses existing theme variables  
✅ **No conflicts** - No plugin compatibility issues  
✅ **Full control** - Every style customizable

### Performance
✅ **Smaller bundle** - No extra plugin code  
✅ **Faster builds** - No plugin processing  
✅ **Direct styles** - No runtime overhead

### Maintainability
✅ **Clear code** - All styles in one place  
✅ **Easy to modify** - Simple CSS updates  
✅ **Version independent** - No plugin updates needed

## Markdown Rendering Example

### Input (Markdown)
```markdown
## Victory Points System

Each match awards Victory Points:
- **Primary Objectives:** Up to 45 VP
- **Secondary Objectives:** Up to 15 VP per objective

> **Tiebreaker:** Rankings determined by total VP.

Visit [Warhammer Community](https://warhammer-community.com)
```

### Output (Styled HTML)
- **H2** header in golden yellow
- Paragraphs in light gray
- **Bold text** in brighter yellow
- Bullet points with golden markers
- **Blockquote** with golden left border and italic text
- **Link** in golden yellow with underline

## Testing Checklist

- [x] Headers render with correct sizes
- [x] Headers use golden yellow color
- [x] Bold text highlighted in yellow
- [x] Lists have golden markers
- [x] Code blocks styled correctly
- [x] Blockquotes with left border
- [x] Links clickable and styled
- [x] Tables render properly
- [x] Responsive sizing works (sm/base)
- [x] Dark theme integration perfect
- [x] No layout issues
- [x] Zero lint errors (JS/Vue)

## Files Modified

1. **Added styles**: `app/assets/css/main.css` (+200 lines)
2. **Simplified**: `app/components/views/DashboardView.vue` (removed prose-invert)
3. **Deleted**: `tailwind.config.js`
4. **Uninstalled**: `@tailwindcss/typography`

## CSS Lint Warnings (Expected)

The following ESLint warnings are **expected and safe to ignore**:
- `Unknown at rule @source` - Tailwind v4 syntax
- `Unknown at rule @theme` - Tailwind v4 syntax
- `Unknown at rule @apply` - Tailwind utility

These are valid Tailwind CSS v4 features that ESLint doesn't recognize.

## Before/After Comparison

### Before
- ❌ Prose styles not working
- ❌ Required plugin that doesn't support v4
- ❌ Extra config file needed
- ❌ Default colors didn't match theme

### After
- ✅ Prose styles working perfectly
- ✅ Native CSS implementation
- ✅ No config file needed
- ✅ Perfect theme integration
- ✅ Smaller bundle size
- ✅ Better maintainability

## Example Rendered Output

When a league organizer writes:

```markdown
# League Rules

## Scoring
- **Win:** 3 points
- **Draw:** 1 point

> Play fair and have fun!
```

Players see:
- Large golden "League Rules" title
- Medium golden "Scoring" header
- Bullet list with golden markers
- Bold "Win" and "Draw" in bright yellow
- Blockquote with golden left border and italic text
- All text properly spaced and sized

## Summary

Successfully implemented custom prose styles for Tailwind CSS v4, providing beautiful markdown rendering with perfect dark theme integration. The solution is lighter, faster, and more maintainable than using the typography plugin.

**Result**: Markdown rules now render beautifully on the dashboard! ✨
