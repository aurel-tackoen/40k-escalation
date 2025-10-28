# Token Utility - Share Token Generation & Validation

## Overview
Centralized utility for generating and validating secure share tokens used in league sharing functionality.

**Location**: `server/utils/tokens.ts`

## Functions

### `generateShareToken(length?: number): string`
Generates a cryptographically secure random token for share URLs.

**Parameters:**
- `length` (optional): Number of bytes (default: 16)

**Returns:**
- A hex string token of `length * 2` characters (16 bytes = 32 hex characters)

**Example:**
```typescript
import { generateShareToken } from '~/server/utils/tokens'

const token = generateShareToken() // Returns 32-character hex string
// Example: "98184fde9db9fa548e2bf5853c88414c"
```

### `isValidShareToken(token: string | null | undefined, expectedLength?: number): boolean`
Validates a share token format.

**Parameters:**
- `token`: The token to validate
- `expectedLength` (optional): Expected character length (default: 32)

**Returns:**
- `true` if token is valid format, `false` otherwise

**Validation Checks:**
1. Token exists (not null/undefined)
2. Token is a string
3. Token has expected length (default 32 characters)
4. Token contains only valid hex characters (0-9, a-f)

**Example:**
```typescript
import { isValidShareToken } from '~/server/utils/tokens'

isValidShareToken('abc123') // false (too short)
isValidShareToken('98184fde9db9fa548e2bf5853c88414c') // true
isValidShareToken(null) // false
isValidShareToken('zzzz...') // false (invalid hex)
```

## Usage in API Endpoints

### League Creation
`server/api/leagues/create.post.ts`
```typescript
import { generateShareToken } from '../../utils/tokens'

// Generate share token for private leagues
let shareToken = null
if (body.isPrivate) {
  shareToken = generateShareToken()
}
```

### Share URL Generation/Regeneration
`server/api/leagues/[id]/share-url.post.ts`
```typescript
import { generateShareToken } from '../../../utils/tokens'

// Generate new share token
const shareToken = generateShareToken()
```

### Token Validation (Info Endpoint)
`server/api/leagues/info-by-token/[token].get.ts`
```typescript
import { isValidShareToken } from '../../../utils/tokens'

if (!isValidShareToken(token)) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid share token'
  })
}
```

### Token Validation (Join Endpoint)
`server/api/leagues/join-by-token/[token].post.ts`
```typescript
import { isValidShareToken } from '../../../utils/tokens'

if (!isValidShareToken(token)) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid share token'
  })
}
```

## Token Format

### Length
- **Default**: 32 characters
- **Reason**: 16 bytes converted to hex = 32 hex characters

### Character Set
- **Allowed**: `0-9`, `a-f` (lowercase hex)
- **Example**: `98184fde9db9fa548e2bf5853c88414c`

### Security
- Uses Node.js `crypto.randomBytes()` for cryptographically secure random generation
- More secure than `Math.random()` which is not cryptographically secure

## Migration History

### Before (Inconsistent)
- League creation used: `Math.random().toString(36)` → ~22 chars ❌
- Regeneration used: `crypto.randomBytes(16).toString('hex')` → 32 chars ✅
- **Result**: Token length mismatch caused validation failures

### After (Consistent) ✅
- All endpoints use: `generateShareToken()` → 32 chars
- All validation uses: `isValidShareToken()` → expects 32 chars
- **Result**: Consistent token generation and validation

## Benefits

1. ✅ **Consistency** - All tokens are exactly 32 characters
2. ✅ **Security** - Uses cryptographically secure random generation
3. ✅ **Maintainability** - Single source of truth for token logic
4. ✅ **Validation** - Built-in format validation with clear rules
5. ✅ **Type Safety** - TypeScript types ensure proper usage
6. ✅ **Testability** - Easy to test token generation and validation

## Testing

```bash
# Test token generation
node -e "const crypto = require('crypto'); const token = crypto.randomBytes(16).toString('hex'); console.log('Length:', token.length, 'Token:', token)"
# Output: Length: 32 Token: 98184fde9db9fa548e2bf5853c88414c

# Test validation pattern
node -e "console.log(/^[0-9a-f]+$/i.test('98184fde9db9fa548e2bf5853c88414c'))"
# Output: true
```

## Related Files
- `server/utils/tokens.ts` - Utility implementation
- `server/api/leagues/create.post.ts` - Token generation on creation
- `server/api/leagues/[id]/share-url.post.ts` - Token regeneration
- `server/api/leagues/info-by-token/[token].get.ts` - Token validation (info)
- `server/api/leagues/join-by-token/[token].post.ts` - Token validation (join)
- `db/schema.ts` - `leagues.shareToken` column (varchar 32, unique)

## Future Enhancements
- [ ] Add token expiration timestamps
- [ ] Add token usage tracking (how many times used)
- [ ] Add token revocation mechanism
- [ ] Add rate limiting for token validation attempts
