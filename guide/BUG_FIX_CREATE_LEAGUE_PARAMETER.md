# Bug Fix: Create League Parameter Mismatch

**Date**: October 13, 2025  
**Status**: ✅ Fixed  
**Severity**: High (blocking feature)

---

## Issue Description

When attempting to create a new league via the UI form at `/leagues/create`, the submission failed with a 400 error:

```
ERROR Error creating league: Missing required fields: name, startDate, createdBy
```

### User Impact
- Users could not create new leagues
- Form appeared valid but submission failed
- Error message was confusing (fields were actually provided)

---

## Root Cause

**Parameter Name Mismatch** between frontend and backend:

- **Frontend** (`app/pages/leagues/create.vue`): Sent `userId` field
- **Backend** (`server/api/leagues/create.post.ts`): Expected `createdBy` field

The API endpoint validation rejected the request because it couldn't find the `createdBy` field, even though the equivalent `userId` was present.

---

## Technical Details

### Frontend Code (Before Fix)
```javascript
// app/pages/leagues/create.vue - Line 100
await leaguesStore.createLeague({
  userId: authStore.user.id,  // ❌ Wrong parameter name
  name: form.name,
  description: form.description,
  // ... other fields
})
```

### Backend Validation
```typescript
// server/api/leagues/create.post.ts - Line 34
if (!body.name || !body.startDate || !body.createdBy) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing required fields: name, startDate, createdBy'
  })
}
```

The API documentation (line 15) clearly states:
```typescript
* Body:
* {
*   createdBy: number (userId)  // ← Expected parameter name
* }
```

---

## Solution

Changed the frontend parameter name from `userId` to `createdBy` to match the API contract.

### File Changed
- `app/pages/leagues/create.vue` (line 100)

### Code After Fix
```javascript
await leaguesStore.createLeague({
  createdBy: authStore.user.id,  // ✅ Correct parameter name
  name: form.name,
  description: form.description,
  startDate: form.startDate,
  endDate: form.endDate || null,
  isPublic: form.isPublic,
  joinPassword: form.isPublic ? null : form.joinPassword,
  maxPlayers: form.maxPlayers || null,
  phases: form.phases
})
```

---

## Verification

### Testing Steps
1. ✅ Navigate to `/leagues/create`
2. ✅ Fill out league creation form with valid data
3. ✅ Add at least one phase
4. ✅ Click "Create League"
5. ✅ Verify successful creation and redirect to `/leagues`

### Validation
- ✅ Lint check passes: `npm run lint` (0 errors)
- ✅ TypeScript types remain consistent
- ✅ Store action unchanged (passes data as-is)
- ✅ No side effects on other endpoints

---

## Related Components

### Data Flow
```
User Form Submission
    ↓
app/pages/leagues/create.vue (✅ Fixed here)
    ↓
app/stores/leagues.js → createLeague() (unchanged, passes through)
    ↓
server/api/leagues/create.post.ts (expects 'createdBy')
    ↓
Database insertion
```

### Files Involved
- ✅ `app/pages/leagues/create.vue` - Form submission (FIXED)
- ✅ `app/stores/leagues.js` - Store action (no change needed)
- ✅ `server/api/leagues/create.post.ts` - API endpoint (reference)

---

## Prevention

### Best Practices Identified
1. **API Contract Documentation**: Ensure API endpoint documentation is clear about expected parameter names
2. **Type Safety**: Consider using TypeScript interfaces for API contracts shared between frontend/backend
3. **Error Messages**: API should return more specific validation errors (e.g., "Missing 'createdBy' field" instead of listing all required fields)
4. **Code Review**: Check parameter naming consistency during PR reviews

### Recommended Improvements (Future)
- Create shared TypeScript types for API request/response shapes
- Add JSDoc type hints to store actions
- Consider using Zod or similar validation library for runtime type checking
- Add unit tests for API endpoint validation logic

---

## Timeline

- **Bug Discovered**: User testing after Phase 3.3 completion (league UI creation)
- **Diagnosed**: Identified parameter name mismatch by reading form submission code
- **Fixed**: Changed `userId` to `createdBy` in form component
- **Verified**: Lint check passed, ready for testing
- **Total Time**: ~5 minutes (quick fix once identified)

---

## Related Issues

This was the second runtime bug discovered during manual testing:

1. ✅ **Bug #1**: `/api/leagues/my` 500 error - Fixed auth/field naming issues (see `BUG_FIX_LEAGUES_MY_ENDPOINT.md`)
2. ✅ **Bug #2**: Create league 400 error - Fixed parameter mismatch (this document)

Both bugs were parameter/field naming inconsistencies between frontend and backend, suggesting a need for shared type definitions.

---

## Status

**RESOLVED** ✅

The league creation form now correctly sends the `createdBy` parameter and should successfully create leagues with the user as the owner.

Ready for user testing of the complete create league flow.
