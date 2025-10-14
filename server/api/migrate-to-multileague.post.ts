import { db } from '~/db'
import { leagues, players, armies, users, leagueMemberships } from '~/db/schema'
import { eq, isNull, isNotNull } from 'drizzle-orm'

/**
 * DATA MIGRATION SCRIPT: Single League -> Multi-League
 *
 * This script:
 * 1. Checks if migration is needed (checks for players without leagueId)
 * 2. Gets or creates a default league
 * 3. Assigns all existing players to that league
 * 4. Creates league memberships for all users with players
 * 5. Sets the first user as league owner
 *
 * ⚠️ IMPORTANT: Run this BEFORE applying migration 0006
 * ⚠️ This script is idempotent - safe to run multiple times
 */
export default defineEventHandler(async (_event) => {
  try {
    console.log('🔄 Starting multi-league migration...')

    // Step 1: Check if migration is needed
    const playersWithoutLeague = await db
      .select()
      .from(players)
      .where(isNull(players.leagueId))
      .limit(1)

    if (playersWithoutLeague.length === 0) {
      return {
        success: true,
        message: '✅ Migration already completed - no players without leagueId',
        alreadyMigrated: true
      }
    }

    console.log('📊 Found players without leagueId - proceeding with migration...')

    // Step 2: Get existing league or create default one
    const existingLeagues = await db.select().from(leagues).limit(1)
    let targetLeague

    if (existingLeagues.length === 0) {
      console.log('🆕 No leagues found - creating default league...')

      // Get first user to set as owner
      const firstUser = await db.select().from(users).limit(1)

      if (firstUser.length === 0) {
        throw new Error('No users found - cannot create league without owner')
      }

      const [newLeague] = await db.insert(leagues).values({
        name: 'Default Escalation League',
        description: 'Migrated from single-league system',
        startDate: new Date('2025-01-01'),
        currentRound: 1,
        createdBy: firstUser[0].id,
        isPublic: true,
        status: 'active'
      }).returning()

      targetLeague = newLeague
      console.log(`✅ Created default league: ${targetLeague.name} (ID: ${targetLeague.id})`)
    } else {
      targetLeague = existingLeagues[0]
      console.log(`✅ Using existing league: ${targetLeague.name} (ID: ${targetLeague.id})`)

      // Set createdBy if not set
      if (!targetLeague.createdBy) {
        const firstUser = await db.select().from(users).limit(1)
        if (firstUser.length > 0) {
          await db.update(leagues)
            .set({ createdBy: firstUser[0].id })
            .where(eq(leagues.id, targetLeague.id))
          console.log(`✅ Set league owner to user ${firstUser[0].id}`)
        }
      }
    }

    // Step 3: Assign all existing players to this league
    const allPlayers = await db
      .select()
      .from(players)
      .where(isNull(players.leagueId))

    console.log(`📊 Found ${allPlayers.length} players to migrate...`)

    for (const player of allPlayers) {
      await db.update(players)
        .set({ leagueId: targetLeague.id })
        .where(eq(players.id, player.id))
    }

    console.log(`✅ Assigned ${allPlayers.length} players to league ${targetLeague.id}`)

    // Step 4: Create league memberships for users with players
    const playersWithUsers = await db
      .select()
      .from(players)
      .where(isNotNull(players.userId))

    console.log(`📊 Found ${playersWithUsers.length} players with user accounts...`)

    let membershipsCreated = 0
    const processedUsers = new Set()

    for (const player of playersWithUsers) {
      // Skip if we already created membership for this user in this league
      const membershipKey = `${player.userId}-${player.leagueId}`
      if (processedUsers.has(membershipKey)) {
        continue
      }

      // Check if membership already exists
      const existingMembership = await db
        .select()
        .from(leagueMemberships)
        .where(eq(leagueMemberships.userId, player.userId!))
        .where(eq(leagueMemberships.leagueId, player.leagueId!))
        .limit(1)

      if (existingMembership.length === 0) {
        // Determine role: first user is owner, others are players
        const role = membershipsCreated === 0 ? 'owner' : 'player'

        await db.insert(leagueMemberships).values({
          leagueId: player.leagueId!,
          userId: player.userId!,
          playerId: player.id,
          role,
          status: 'active'
        })

        membershipsCreated++
        processedUsers.add(membershipKey)

        if (role === 'owner') {
          console.log(`👑 Created OWNER membership for user ${player.userId}`)
        }
      }
    }

    console.log(`✅ Created ${membershipsCreated} league memberships`)

    // Step 5: Update armies with leagueId
    const armiesToUpdate = await db
      .select()
      .from(armies)
      .where(isNull(armies.leagueId))

    console.log(`📊 Found ${armiesToUpdate.length} armies to update...`)

    for (const army of armiesToUpdate) {
      // Get player's leagueId
      const [player] = await db
        .select()
        .from(players)
        .where(eq(players.id, army.playerId))
        .limit(1)

      if (player && player.leagueId) {
        await db.update(armies)
          .set({ leagueId: player.leagueId })
          .where(eq(armies.id, army.id))
      }
    }

    console.log(`✅ Updated ${armiesToUpdate.length} armies with leagueId`)

    // Step 6: Generate summary
    const summary = {
      leagueId: targetLeague.id,
      leagueName: targetLeague.name,
      playersMigrated: allPlayers.length,
      membershipsCreated,
      armiesUpdated: armiesToUpdate.length
    }

    console.log('🎉 Migration completed successfully!')
    console.log('Summary:', summary)

    return {
      success: true,
      message: '✅ Multi-league migration completed successfully',
      data: summary
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Migration failed: ' + (error as Error).message
    })
  }
})
