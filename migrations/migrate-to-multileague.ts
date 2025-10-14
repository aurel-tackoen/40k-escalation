import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Standalone Migration Script for Multi-League Refactor
 *
 * Run with: node --loader ts-node/esm scripts/migrate-to-multileague.ts
 * Or: npm run migrate:multileague (if added to package.json)
 *
 * This script:
 * 1. Adds new columns as NULLABLE first
 * 2. Populates data
 * 3. Makes columns NOT NULL
 *
 * Safe to run multiple times (idempotent)
 */

async function main() {
  console.log('🚀 Starting Multi-League Migration\n')

  // Get database connection
  const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables')
    console.error('Make sure .env file exists with DATABASE_URL set')
    process.exit(1)
  }

  console.log('✅ Database connection configured')
  console.log(`📍 Endpoint: ${databaseUrl.split('@')[1]?.split('/')[0] || 'unknown'}\n`)

  const sql = neon(databaseUrl)

  try {
    // Step 1: Add columns as NULLABLE
    console.log('📊 Step 1: Adding new columns as nullable...')
    console.log('─────────────────────────────────────────\n')

    try {
      await sql`
        ALTER TABLE leagues 
        ADD COLUMN IF NOT EXISTS "createdBy" integer REFERENCES users(id)
      `
      console.log('✅ Added createdBy to leagues')
    } catch (error) {
      if (error instanceof Error && !error.message.includes('already exists')) {
        console.error('⚠️  Error adding createdBy:', error.message)
      } else {
        console.log('ℹ️  createdBy column already exists')
      }
    }

    try {
      await sql`
        ALTER TABLE leagues 
        ADD COLUMN IF NOT EXISTS "isPublic" boolean DEFAULT true,
        ADD COLUMN IF NOT EXISTS "joinPassword" varchar(255),
        ADD COLUMN IF NOT EXISTS "maxPlayers" integer,
        ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'active'
      `
      console.log('✅ Added league management columns (isPublic, joinPassword, maxPlayers, status)')
    } catch (error) {
      if (error instanceof Error && !error.message.includes('already exists')) {
        console.error('⚠️  Error adding league columns:', error.message)
      } else {
        console.log('ℹ️  League management columns already exist')
      }
    }

    try {
      await sql`
        ALTER TABLE players 
        ADD COLUMN IF NOT EXISTS "leagueId" integer REFERENCES leagues(id) ON DELETE CASCADE
      `
      console.log('✅ Added leagueId to players')
    } catch (error) {
      if (error instanceof Error && !error.message.includes('already exists')) {
        console.error('⚠️  Error adding leagueId to players:', error.message)
      } else {
        console.log('ℹ️  leagueId column already exists in players')
      }
    }

    try {
      await sql`
        ALTER TABLE armies 
        ADD COLUMN IF NOT EXISTS "leagueId" integer REFERENCES leagues(id) ON DELETE CASCADE
      `
      console.log('✅ Added leagueId to armies')
    } catch (error) {
      if (error instanceof Error && !error.message.includes('already exists')) {
        console.error('⚠️  Error adding leagueId to armies:', error.message)
      } else {
        console.log('ℹ️  leagueId column already exists in armies')
      }
    }

    try {
      await sql`
        ALTER TABLE players DROP CONSTRAINT IF EXISTS players_email_unique
      `
      console.log('✅ Removed email unique constraint from players')
    } catch {
      console.log('ℹ️  Email constraint already removed or never existed')
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS league_memberships (
          id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          "leagueId" integer NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
          "userId" integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          "playerId" integer REFERENCES players(id) ON DELETE CASCADE,
          role varchar(50) DEFAULT 'player' NOT NULL,
          "joinedAt" timestamp DEFAULT now() NOT NULL,
          status varchar(50) DEFAULT 'active' NOT NULL
        )
      `
      console.log('✅ Created league_memberships table')
    } catch (error) {
      if (error instanceof Error && !error.message.includes('already exists')) {
        console.error('⚠️  Error creating league_memberships:', error.message)
      } else {
        console.log('ℹ️  league_memberships table already exists')
      }
    }

    console.log('\n📊 Step 2: Populating data...')
    console.log('─────────────────────────────────────────\n')

    // Get or create default league
    const leagues = await sql`SELECT * FROM leagues LIMIT 1`
    let leagueId: number

    if (leagues.length === 0) {
      console.log('🆕 No league found, creating default league...')

      // Get first user to set as owner
      const users = await sql`SELECT * FROM users LIMIT 1`

      if (users.length === 0) {
        console.error('❌ No users found. Please create a user first.')
        console.error('   You can create a user by signing up through the app.')
        process.exit(1)
      }

      const [newLeague] = await sql`
        INSERT INTO leagues (name, description, "startDate", "currentRound", "createdBy", "isPublic", status)
        VALUES ('Default Escalation League', 'Migrated from single-league system', '2025-01-01', 1, ${users[0].id}, true, 'active')
        RETURNING *
      `
      leagueId = newLeague.id
      console.log(`✅ Created default league (ID: ${leagueId}, Owner: User ${users[0].id})`)
    } else {
      leagueId = leagues[0].id
      console.log(`✅ Using existing league: "${leagues[0].name}" (ID: ${leagueId})`)

      // Set createdBy if not set
      if (!leagues[0].createdBy) {
        const users = await sql`SELECT * FROM users LIMIT 1`
        if (users.length > 0) {
          await sql`
            UPDATE leagues 
            SET "createdBy" = ${users[0].id}
            WHERE id = ${leagueId}
          `
          console.log(`✅ Set league owner to User ${users[0].id}`)
        }
      }
    }

    // Update players with leagueId
    const playersWithoutLeague = await sql`
      SELECT * FROM players WHERE "leagueId" IS NULL
    `

    if (playersWithoutLeague.length > 0) {
      await sql`
        UPDATE players 
        SET "leagueId" = ${leagueId}
        WHERE "leagueId" IS NULL
      `
      console.log(`✅ Updated ${playersWithoutLeague.length} players with leagueId`)
    } else {
      console.log('ℹ️  All players already have leagueId')
    }

    // Update armies with leagueId
    const armiesWithoutLeague = await sql`
      SELECT * FROM armies WHERE "leagueId" IS NULL
    `

    if (armiesWithoutLeague.length > 0) {
      await sql`
        UPDATE armies 
        SET "leagueId" = ${leagueId}
        WHERE "leagueId" IS NULL
      `
      console.log(`✅ Updated ${armiesWithoutLeague.length} armies with leagueId`)
    } else {
      console.log('ℹ️  All armies already have leagueId')
    }

    // Create league memberships
    const playersWithUsers = await sql`
      SELECT DISTINCT p.id, p."userId", p."leagueId"
      FROM players p
      WHERE p."userId" IS NOT NULL
    `

    let membershipsCreated = 0
    const processedUsers = new Set<string>()

    for (const player of playersWithUsers) {
      const membershipKey = `${player.userId}-${player.leagueId}`

      if (processedUsers.has(membershipKey)) {
        continue
      }

      // Check if membership exists
      const existing = await sql`
        SELECT * FROM league_memberships 
        WHERE "userId" = ${player.userId} 
        AND "leagueId" = ${player.leagueId}
        LIMIT 1
      `

      if (existing.length === 0) {
        const role = membershipsCreated === 0 ? 'owner' : 'player'

        await sql`
          INSERT INTO league_memberships ("leagueId", "userId", "playerId", role, status)
          VALUES (${player.leagueId}, ${player.userId}, ${player.id}, ${role}, 'active')
        `

        membershipsCreated++
        processedUsers.add(membershipKey)

        if (role === 'owner') {
          console.log(`👑 Created OWNER membership for User ${player.userId}`)
        }
      }
    }

    if (membershipsCreated > 0) {
      console.log(`✅ Created ${membershipsCreated} league memberships`)
    } else {
      console.log('ℹ️  All memberships already exist')
    }

    console.log('\n📊 Step 3: Adding NOT NULL constraints...')
    console.log('─────────────────────────────────────────\n')

    try {
      await sql`
        ALTER TABLE players 
        ALTER COLUMN "leagueId" SET NOT NULL
      `
      console.log('✅ Made players.leagueId NOT NULL')
    } catch (error) {
      if (error instanceof Error) {
        console.log('⚠️  Could not make players.leagueId NOT NULL:', error.message)
        console.log('   This is OK if some players still lack leagueId')
      }
    }

    try {
      await sql`
        ALTER TABLE armies 
        ALTER COLUMN "leagueId" SET NOT NULL
      `
      console.log('✅ Made armies.leagueId NOT NULL')
    } catch (error) {
      if (error instanceof Error) {
        console.log('⚠️  Could not make armies.leagueId NOT NULL:', error.message)
        console.log('   This is OK if some armies still lack leagueId')
      }
    }

    try {
      await sql`
        ALTER TABLE leagues 
        ALTER COLUMN "createdBy" SET NOT NULL
      `
      console.log('✅ Made leagues.createdBy NOT NULL')
    } catch (error) {
      if (error instanceof Error) {
        console.log('⚠️  Could not make leagues.createdBy NOT NULL:', error.message)
        console.log('   This is OK if some leagues still lack createdBy')
      }
    }

    console.log('\n🎉 Migration completed successfully!\n')
    console.log('Summary:')
    console.log('─────────────────────────────────────────')
    console.log(`📍 League ID: ${leagueId}`)
    console.log(`👥 Players migrated: ${playersWithoutLeague.length}`)
    console.log(`⚔️  Armies migrated: ${armiesWithoutLeague.length}`)
    console.log(`🔗 Memberships created: ${membershipsCreated}`)
    console.log('─────────────────────────────────────────\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

// Run the migration
main()
