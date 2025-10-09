# Quick Start Guide - Database Integration

## 🚀 Get Started in 5 Steps

### 1. Install Dependencies (if not done)
```bash
npm install
```

### 2. Start Development Server
```bash
netlify dev
```

**Important:** Use `netlify dev` instead of `npm run dev` to get database access!

### 3. Generate Your First Migration
```bash
npm run db:generate
```

### 4. Apply the Migration
```bash
npm run db:migrate
```

### 5. Test the API
Open http://localhost:8888/api/health in your browser

## 📝 Example: Using the Database

### In a Vue Component

```vue
<script setup>
// Fetch players
const { data: playersData, refresh } = await useFetch('/api/players')

// Add a new player
async function addPlayer() {
  try {
    await $fetch('/api/players', {
      method: 'POST',
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        faction: 'Space Marines'
      }
    })
    
    // Refresh the list
    await refresh()
  } catch (error) {
    console.error('Failed to add player:', error)
  }
}
</script>

<template>
  <div>
    <h2>Players</h2>
    <div v-if="playersData?.players">
      <div v-for="player in playersData.players" :key="player.id">
        {{ player.name }} - {{ player.faction }}
      </div>
    </div>
    
    <button @click="addPlayer">Add Test Player</button>
  </div>
</template>
```

### Creating More API Routes

**GET single player:**
`server/api/players/[id].get.ts`
```typescript
import { db } from '~/db'
import { players } from '~/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  
  const player = await db.select()
    .from(players)
    .where(eq(players.id, id))
    .limit(1)
  
  if (player.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Player not found'
    })
  }
  
  return { player: player[0] }
})
```

**UPDATE player:**
`server/api/players/[id].put.ts`
```typescript
import { db } from '~/db'
import { players } from '~/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  const body = await readBody(event)
  
  const updated = await db.update(players)
    .set({
      name: body.name,
      faction: body.faction
    })
    .where(eq(players.id, id))
    .returning()
  
  return { player: updated[0] }
})
```

**DELETE player:**
`server/api/players/[id].delete.ts`
```typescript
import { db } from '~/db'
import { players } from '~/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  
  await db.delete(players).where(eq(players.id, id))
  
  return { success: true }
})
```

## 🎯 Your 40k Escalation League Tables

I've created an example schema in `db/schema.example.ts` with tables for:
- **players** - League participants
- **leagues** - Different escalation leagues
- **armyLists** - Player army rosters per league
- **matches** - Game results and scores

To use this schema:
```bash
# Replace the current schema
cp db/schema.example.ts db/schema.ts

# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# View in GUI
npm run db:studio
```

## 🔄 Common Drizzle Queries

### Select All
```typescript
const all = await db.select().from(players)
```

### Select with WHERE
```typescript
import { eq } from 'drizzle-orm'

const player = await db.select()
  .from(players)
  .where(eq(players.email, 'john@example.com'))
```

### Select with JOIN
```typescript
import { eq } from 'drizzle-orm'

const playerMatches = await db.select()
  .from(matches)
  .innerJoin(players, eq(matches.player1Id, players.id))
  .where(eq(players.id, 1))
```

### Insert
```typescript
const newPlayer = await db.insert(players).values({
  name: 'Jane Doe',
  email: 'jane@example.com'
}).returning()
```

### Update
```typescript
import { eq } from 'drizzle-orm'

const updated = await db.update(players)
  .set({ faction: 'Tau Empire' })
  .where(eq(players.id, 1))
  .returning()
```

### Delete
```typescript
import { eq } from 'drizzle-orm'

await db.delete(players).where(eq(players.id, 1))
```

### Count
```typescript
import { count } from 'drizzle-orm'

const result = await db.select({ 
  count: count() 
}).from(players)
```

## 🌍 Environment Variables

### Local Development
When you run `netlify dev`, these are automatically injected:
- `NETLIFY_DATABASE_URL` ✅
- `NETLIFY_DATABASE_URL_UNPOOLED`

### Production (Netlify)
Same variables are automatically available in your Netlify Functions.

### No .env file needed!
Netlify manages everything for you.

## 📊 View Your Data

### Option 1: Drizzle Studio (Recommended)
```bash
npm run db:studio
```
Opens at http://localhost:4983

### Option 2: Neon Console
1. Go to https://app.netlify.com/projects/40k-escalation
2. Click "Databases"
3. Click "View in Neon Console"

## 🚨 Common Issues

### Issue: "Cannot find module '~/db'"
**Solution:** Run `npm install` first

### Issue: "Database connection failed"
**Solution:** Use `netlify dev` instead of `npm run dev`

### Issue: "Migration failed"
**Solution:** Check your schema syntax and run `npm run db:generate` again

### Issue: TypeScript errors in server routes
**Solution:** This is normal during development. Restart `netlify dev`

## 📦 Deployment

When you push to GitHub:
1. Netlify automatically builds your app
2. Runs any pending migrations (if configured)
3. Deploys your Netlify Functions
4. Everything connects automatically!

No extra configuration needed! 🎉

## 🔗 Useful Links

- Health check: http://localhost:8888/api/health (dev)
- Health check: https://40k-escalation.netlify.app/api/health (prod)
- Database GUI: `npm run db:studio`
- Netlify Dashboard: https://app.netlify.com/projects/40k-escalation

## Next Steps

1. ✅ Review the example schema in `db/schema.example.ts`
2. ✅ Customize it for your needs
3. ✅ Generate and run migrations
4. ✅ Create API routes for your operations
5. ✅ Build your Vue components
6. ✅ Push to GitHub and auto-deploy!

Happy coding! 🚀
