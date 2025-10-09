# Database Setup Guide - Netlify + Neon

## Overview

Your project is now connected to a Netlify-managed Neon PostgreSQL database with Drizzle ORM.

## What Netlify Created

### 1. Database Connection
- **Provider**: Neon (Postgres-compatible)
- **Managed by**: Netlify
- **Environment Variables**: Automatically injected
  - `NETLIFY_DATABASE_URL` - Connection pooled URL (use this for serverless)
  - `NETLIFY_DATABASE_URL_UNPOOLED` - Direct connection (for migrations only)

### 2. Files Created

```
db/
  ├── schema.ts      # Database schema (Drizzle)
  └── index.ts       # Database client setup
drizzle.config.ts    # Drizzle Kit configuration
```

### 3. Package.json Scripts

```json
{
  "db:generate": "drizzle-kit generate",      // Generate migrations from schema
  "db:migrate": "netlify dev:exec drizzle-kit migrate", // Run migrations
  "db:studio": "netlify dev:exec drizzle-kit studio"    // Open database GUI
}
```

## Architecture

### Local Development
```
Your Code → Nuxt Dev Server → Netlify CLI → Neon Database
                               (injects env vars)
```

### Production (Netlify)
```
Your SPA → Netlify Functions → Neon Database
           (auto-scaled)      (auto-scaled)
```

## Environment Variables

### Automatic (Netlify-injected)
These are automatically available in both dev and production:
- `NETLIFY_DATABASE_URL` - **Use this for all queries**
- `NETLIFY_DATABASE_URL_UNPOOLED` - For migrations only

### No .env file needed!
Netlify CLI automatically injects these when running `netlify dev` or in production.

## Database Workflow

### 1. Define Your Schema

Edit `db/schema.ts`:

```typescript
import { integer, pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';

// Example: 40k Escalation League Tables
export const players = pgTable('players', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    faction: varchar({ length: 100 }),
    createdAt: timestamp().defaultNow()
});

export const matches = pgTable('matches', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    player1Id: integer().references(() => players.id).notNull(),
    player2Id: integer().references(() => players.id).notNull(),
    player1Score: integer().notNull().default(0),
    player2Score: integer().notNull().default(0),
    round: integer().notNull(),
    playedAt: timestamp().defaultNow()
});

export const armies = pgTable('armies', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    playerId: integer().references(() => players.id).notNull(),
    name: varchar({ length: 255 }).notNull(),
    faction: varchar({ length: 100 }).notNull(),
    pointsLimit: integer().notNull(),
    roster: text() // JSON string of units
});
```

### 2. Generate Migration

```bash
npm run db:generate
```

This creates SQL migration files in `migrations/` folder.

### 3. Apply Migration

**Local:**
```bash
npm run db:migrate
```

**Production:**
Migrations run automatically on Netlify deploy, OR run manually:
```bash
netlify deploy --build
```

### 4. View Database (Optional)

```bash
npm run db:studio
```

Opens Drizzle Studio at http://localhost:4983

## Using the Database in Your Code

### In Server API Routes

Create `server/api/players.get.ts`:

```typescript
import { db } from '~/db'
import { players } from '~/db/schema'

export default defineEventHandler(async (event) => {
  try {
    const allPlayers = await db.select().from(players)
    return { players: allPlayers }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch players'
    })
  }
})
```

Create `server/api/players.post.ts`:

```typescript
import { db } from '~/db'
import { players } from '~/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    const newPlayer = await db.insert(players).values({
      name: body.name,
      email: body.email,
      faction: body.faction
    }).returning()
    
    return { player: newPlayer[0] }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create player'
    })
  }
})
```

### In Your Vue Components

```vue
<script setup>
const { data: players, error } = await useFetch('/api/players')

async function addPlayer(player) {
  await $fetch('/api/players', {
    method: 'POST',
    body: player
  })
  // Refresh data
  refreshNuxtData()
}
</script>

<template>
  <div>
    <div v-for="player in players?.players" :key="player.id">
      {{ player.name }} - {{ player.faction }}
    </div>
  </div>
</template>
```

## Important Differences: Local vs Production

| Aspect | Local (`netlify dev`) | Production (Netlify) |
|--------|----------------------|---------------------|
| **Database** | Same Neon instance | Same Neon instance |
| **Env Vars** | Injected by Netlify CLI | Injected by Netlify platform |
| **API Routes** | Node.js process | Serverless functions |
| **Connection** | Pooled via Neon | Pooled via Neon |
| **Cold Starts** | No | Yes (1-2s first request) |
| **Scaling** | N/A | Automatic (0-1000s) |

## Key Points

### ✅ DO:
- Use `NETLIFY_DATABASE_URL` for all queries
- Use `db:migrate` for migrations
- Use Drizzle ORM for type-safe queries
- Run `netlify dev` instead of `npm run dev` for full database access
- Keep schema changes in version control

### ❌ DON'T:
- Edit migration files manually
- Use `NETLIFY_DATABASE_URL_UNPOOLED` for queries (only migrations)
- Commit `.env` files (not needed!)
- Use long-running connections (serverless = short-lived)

## Development Commands

```bash
# Start dev server with database access
netlify dev

# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database GUI
npm run db:studio

# Check database status
npx netlify db status
```

## Netlify Deploy

When you push to GitHub:
1. Netlify auto-builds your Nuxt app
2. Server routes become Netlify Functions
3. Functions automatically get `NETLIFY_DATABASE_URL`
4. Functions connect to Neon database
5. Everything just works! ✨

## Database Administration

View/manage your database:
1. **Drizzle Studio**: `npm run db:studio` (local GUI)
2. **Neon Console**: https://console.neon.tech (Netlify-managed)
3. **Netlify Dashboard**: https://app.netlify.com/projects/40k-escalation

## Next Steps

1. ✅ **Design your schema** in `db/schema.ts`
2. ✅ **Generate migration**: `npm run db:generate`
3. ✅ **Apply migration**: `npm run db:migrate`
4. ✅ **Create API routes** in `server/api/`
5. ✅ **Use in components** with `useFetch()`
6. ✅ **Push to GitHub** - Netlify auto-deploys!

## Troubleshooting

### "Connection Error" locally
Run `netlify dev` instead of `npm run dev`

### "Database not found" 
Check status: `npx netlify db status`

### Migrations not applying
Use unpooled URL: `NETLIFY_DATABASE_URL_UNPOOLED=... npm run db:migrate`

### Type errors with Drizzle
Run `npm run db:generate` to regenerate types

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Netlify Database Docs](https://docs.netlify.com/databases/)
- [Neon Docs](https://neon.tech/docs)
- [Nuxt Server Routes](https://nuxt.com/docs/guide/directory-structure/server)
