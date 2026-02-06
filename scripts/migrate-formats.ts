/**
 * One-time migration script: Assign formats to existing leagues and recalculate OW PtG stats.
 *
 * What it does:
 * 1. Discovers the 40k league and OW league by game system shortName (not hardcoded IDs)
 * 2. Sets format = '40k-matched' on the 40k league
 * 3. Sets format = 'ow-ptg' on the OW league
 * 4. Recalculates OW player stats using CP scoring:
 *    - Massacre win = 3 CP, Major Victory = 2 CP, Minor Victory = 2 CP, Draw = 1 CP, Loss = 0 CP
 *    - +1 CP painting bonus per match if player's army is 100% painted for that phase
 * 5. Resets and rewrites OW player wins/losses/draws/totalPoints from scratch
 *
 * Usage:
 *   npx tsx scripts/migrate-formats.ts              # Auto-discover leagues (1 per system)
 *   npx tsx scripts/migrate-formats.ts --dry-run    # Preview without making changes
 *   npx tsx scripts/migrate-formats.ts --league-40k=27 --league-ow=28   # Specify league IDs
 *   npx tsx scripts/migrate-formats.ts --league-40k=27 --league-ow=28 --dry-run
 *
 * Requires:
 *   - DATABASE_URL environment variable
 *   - Migration 0023 (add format column to leagues) must be applied first
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { leagues, gameSystems, matches, players, armies } from '../db/schema'

// --- Types ---

interface Unit {
  totalModels: number
  paintedModels: number
  points?: number
  [key: string]: unknown
}

interface PlayerStats {
  wins: number
  losses: number
  draws: number
  totalPoints: number  // Total CP including painting bonuses
  paintingBonuses: number  // Count of painting bonuses applied (for logging)
}

// --- CP Scoring Derivation ---

const CP_MAP: Record<string, number> = {
  'Massacre': 3,
  'Major Victory': 2,
  'Minor Victory': 2,
  'Draw': 1,
}

function getWinnerCP(marginOfVictory: string | null): number {
  if (!marginOfVictory) return 0
  return CP_MAP[marginOfVictory] ?? 0
}

function getLoserCP(_marginOfVictory: string | null): number {
  // Losers always get 0 CP (Draw handled separately)
  return 0
}

// --- Painting Bonus ---

function isArmyFullyPainted(armyRecord: { units: string } | undefined): boolean {
  if (!armyRecord || !armyRecord.units) return false

  let units: Unit[]
  try {
    units = JSON.parse(armyRecord.units)
  } catch {
    return false
  }

  if (!Array.isArray(units) || units.length === 0) return false

  const unitsWithModels = units.filter((u: Unit) => u.totalModels > 0)
  if (unitsWithModels.length === 0) return false

  const totalModels = unitsWithModels.reduce((sum: number, u: Unit) => sum + (u.totalModels || 0), 0)
  const paintedModels = unitsWithModels.reduce((sum: number, u: Unit) => sum + (u.paintedModels || 0), 0)

  if (totalModels === 0) return false
  const percentage = Math.round((paintedModels / totalModels) * 100)
  return percentage >= 100
}

// --- CLI Argument Parsing ---

function parseLeagueIdArg(flag: string): number | null {
  const arg = process.argv.find(a => a.startsWith(`${flag}=`))
  if (!arg) return null
  const value = parseInt(arg.split('=')[1], 10)
  if (isNaN(value)) {
    console.error(`Invalid value for ${flag}: ${arg.split('=')[1]}`)
    process.exit(1)
  }
  return value
}

// --- Main Migration ---

async function migrateFormats() {
  const isDryRun = process.argv.includes('--dry-run')
  const explicit40kId = parseLeagueIdArg('--league-40k')
  const explicitOwId = parseLeagueIdArg('--league-ow')

  if (isDryRun) {
    console.log('=== DRY RUN MODE === (no changes will be made)\n')
  }

  // 1. Connect to database
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required. Set it in .env or export it.')
  }

  const client = neon(databaseUrl)
  const db = drizzle(client)

  console.log('Connected to database.\n')

  // 2. Discover leagues by game system
  console.log('--- Step 1: Discovering leagues by game system ---\n')

  // Find all leagues joined with their game system shortName
  // Note: We don't select leagues.format here because this script may run
  // right after migration 0023 is applied. We're about to SET the format anyway.
  const allLeagues = await db
    .select({
      leagueId: leagues.id,
      leagueName: leagues.name,
      gameSystemId: leagues.gameSystemId,
      shortName: gameSystems.shortName,
    })
    .from(leagues)
    .innerJoin(gameSystems, eq(leagues.gameSystemId, gameSystems.id))

  // Resolve 40k league: explicit ID or auto-discover
  let league40k: typeof allLeagues[number] | null = null
  if (explicit40kId) {
    league40k = allLeagues.find(l => l.leagueId === explicit40kId) || null
    if (!league40k) {
      console.log(`WARNING: --league-40k=${explicit40kId} not found in database. Skipping 40k format assignment.`)
    } else {
      console.log(`  Using explicitly specified 40k league: "${league40k.leagueName}" (id: ${league40k.leagueId})`)
    }
  } else {
    const fortyKLeagues = allLeagues.filter(l => l.shortName === '40k')
    if (fortyKLeagues.length === 0) {
      console.log('WARNING: No 40k league found. Skipping 40k format assignment.')
    } else if (fortyKLeagues.length > 1) {
      console.log(`WARNING: Found ${fortyKLeagues.length} 40k leagues. This script expects exactly 1. Skipping 40k format assignment.`)
      console.log('  Leagues:', fortyKLeagues.map(l => `${l.leagueName} (id: ${l.leagueId})`).join(', '))
      console.log('  Use --league-40k=ID to specify which one.')
    } else {
      league40k = fortyKLeagues[0]
    }
  }

  // Resolve OW league: explicit ID or auto-discover
  let leagueOW: typeof allLeagues[number] | null = null
  if (explicitOwId) {
    leagueOW = allLeagues.find(l => l.leagueId === explicitOwId) || null
    if (!leagueOW) {
      console.log(`WARNING: --league-ow=${explicitOwId} not found in database. Skipping OW format assignment.`)
    } else {
      console.log(`  Using explicitly specified OW league: "${leagueOW.leagueName}" (id: ${leagueOW.leagueId})`)
    }
  } else {
    const owLeagues = allLeagues.filter(l => l.shortName === 'tow')
    if (owLeagues.length === 0) {
      console.log('WARNING: No OW (tow) league found. Skipping OW format assignment.')
    } else if (owLeagues.length > 1) {
      console.log(`WARNING: Found ${owLeagues.length} OW leagues. This script expects exactly 1. Skipping OW format assignment.`)
      console.log('  Leagues:', owLeagues.map(l => `${l.leagueName} (id: ${l.leagueId})`).join(', '))
      console.log('  Use --league-ow=ID to specify which one.')
    } else {
      leagueOW = owLeagues[0]
    }
  }

  // 3. Migrate 40k league
  if (league40k) {
    console.log(`\n--- Step 2: Migrating 40k league ---`)
    console.log(`  League: "${league40k.leagueName}" (id: ${league40k.leagueId})`)
    console.log(`  Setting format: 40k-matched`)

    if (!isDryRun) {
      await db
        .update(leagues)
        .set({ format: '40k-matched' })
        .where(eq(leagues.id, league40k.leagueId))
      console.log(`  DONE: Set 40k league (id: ${league40k.leagueId}) format to '40k-matched'`)
    } else {
      console.log(`  [DRY RUN] Would set format to '40k-matched'`)
    }
    console.log(`  Note: 40k data stays as-is (already VP-based scoring)\n`)
  }

  // 4. Migrate OW league
  if (leagueOW) {
    console.log(`--- Step 3: Migrating OW league ---`)
    console.log(`  League: "${leagueOW.leagueName}" (id: ${leagueOW.leagueId})`)
    console.log(`  Setting format: ow-ptg\n`)

    if (!isDryRun) {
      await db
        .update(leagues)
        .set({ format: 'ow-ptg' })
        .where(eq(leagues.id, leagueOW.leagueId))
      console.log(`  DONE: Set OW league (id: ${leagueOW.leagueId}) format to 'ow-ptg'\n`)
    } else {
      console.log(`  [DRY RUN] Would set format to 'ow-ptg'\n`)
    }

    // 5. Recalculate OW player stats from CP scoring
    console.log(`--- Step 4: Recalculating OW PtG player stats (CP scoring) ---\n`)

    // Get all matches for the OW league
    const owMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.leagueId, leagueOW.leagueId))

    console.log(`  Found ${owMatches.length} matches in OW league\n`)

    // Get all armies for the OW league (for painting bonus)
    const owArmies = await db
      .select()
      .from(armies)
      .where(eq(armies.leagueId, leagueOW.leagueId))

    console.log(`  Found ${owArmies.length} army records for painting bonus checks\n`)

    // Get all players in the OW league
    const owPlayers = await db
      .select()
      .from(players)
      .where(eq(players.leagueId, leagueOW.leagueId))

    console.log(`  Found ${owPlayers.length} players in OW league\n`)

    // Build a lookup: (playerId, phase) -> army record
    const armyLookup = new Map<string, typeof owArmies[number]>()
    for (const army of owArmies) {
      armyLookup.set(`${army.playerId}-${army.phase}`, army)
    }

    // Accumulate stats per player
    const statsMap = new Map<number, PlayerStats>()

    // Initialize all players with zero stats
    for (const player of owPlayers) {
      statsMap.set(player.id, {
        wins: 0,
        losses: 0,
        draws: 0,
        totalPoints: 0,
        paintingBonuses: 0,
      })
    }

    let totalPaintingBonuses = 0

    // Process each match
    for (const match of owMatches) {
      const { player1Id, player2Id, winnerId, marginOfVictory, phase } = match
      const isDraw = marginOfVictory === 'Draw'

      // Ensure stats exist for both players (may have been added mid-league)
      if (!statsMap.has(player1Id)) {
        statsMap.set(player1Id, { wins: 0, losses: 0, draws: 0, totalPoints: 0, paintingBonuses: 0 })
      }
      if (!statsMap.has(player2Id)) {
        statsMap.set(player2Id, { wins: 0, losses: 0, draws: 0, totalPoints: 0, paintingBonuses: 0 })
      }

      const p1Stats = statsMap.get(player1Id)!
      const p2Stats = statsMap.get(player2Id)!

      if (isDraw) {
        // Draw: both get 1 CP, both get a draw
        const drawCP = CP_MAP['Draw']
        p1Stats.draws += 1
        p1Stats.totalPoints += drawCP
        p2Stats.draws += 1
        p2Stats.totalPoints += drawCP

        console.log(`  Match ${match.id} (phase ${phase}): P${player1Id} vs P${player2Id} = Draw (${drawCP} CP each)`)
      } else if (winnerId) {
        // One player won
        const winnerCP = getWinnerCP(marginOfVictory)
        const loserId = winnerId === player1Id ? player2Id : player1Id

        const winnerStats = statsMap.get(winnerId)!
        const loserStats = statsMap.get(loserId)!

        winnerStats.wins += 1
        winnerStats.totalPoints += winnerCP
        loserStats.losses += 1
        loserStats.totalPoints += getLoserCP(marginOfVictory)

        console.log(`  Match ${match.id} (phase ${phase}): P${winnerId} wins (${marginOfVictory} = ${winnerCP} CP), P${loserId} loses (0 CP)`)
      } else {
        // No winner and no draw marginOfVictory -- treat as draw for safety
        console.log(`  Match ${match.id} (phase ${phase}): No winner and marginOfVictory='${marginOfVictory}' -- treating as Draw`)
        p1Stats.draws += 1
        p1Stats.totalPoints += 1
        p2Stats.draws += 1
        p2Stats.totalPoints += 1
      }

      // Check painting bonus for each player
      for (const playerId of [player1Id, player2Id]) {
        const armyKey = `${playerId}-${phase}`
        const army = armyLookup.get(armyKey)
        if (isArmyFullyPainted(army)) {
          const pStats = statsMap.get(playerId)!
          pStats.totalPoints += 1
          pStats.paintingBonuses += 1
          totalPaintingBonuses += 1
          console.log(`    +1 CP painting bonus for player ${playerId} (phase ${phase} army fully painted)`)
        }
      }
    }

    // 6. Write recalculated stats to database
    console.log(`\n--- Step 5: Writing recalculated OW player stats ---\n`)

    for (const player of owPlayers) {
      const stats = statsMap.get(player.id)
      if (!stats) continue

      console.log(`  Player ${player.id} (${player.name}): W/L/D = ${stats.wins}/${stats.losses}/${stats.draws}, totalCP = ${stats.totalPoints} (including ${stats.paintingBonuses} painting bonuses)`)
      console.log(`    Old stats: W/L/D = ${player.wins}/${player.losses}/${player.draws}, totalPoints = ${player.totalPoints}`)

      if (!isDryRun) {
        await db
          .update(players)
          .set({
            wins: stats.wins,
            losses: stats.losses,
            draws: stats.draws,
            totalPoints: stats.totalPoints,
          })
          .where(eq(players.id, player.id))
        console.log(`    DONE: Updated player ${player.id}`)
      } else {
        console.log(`    [DRY RUN] Would update to: W/L/D = ${stats.wins}/${stats.losses}/${stats.draws}, totalPoints = ${stats.totalPoints}`)
      }
    }

    // 7. Summary
    console.log(`\n--- Summary ---`)
    console.log(`  OW matches processed: ${owMatches.length}`)
    console.log(`  OW players updated: ${owPlayers.length}`)
    console.log(`  Total painting bonuses applied: ${totalPaintingBonuses}`)
    console.log(`  Per-player final stats:`)
    for (const player of owPlayers) {
      const stats = statsMap.get(player.id)
      if (stats) {
        console.log(`    ${player.name}: ${stats.wins}W/${stats.losses}L/${stats.draws}D = ${stats.totalPoints} CP (${stats.paintingBonuses} painting bonuses)`)
      }
    }
  }

  console.log(`\n--- Migration complete ---`)
  if (isDryRun) {
    console.log('(DRY RUN -- no changes were made)')
  }
}

// Run
migrateFormats().catch((error) => {
  console.error('\n!!! Migration failed !!!')
  console.error('Error:', error.message)
  console.error('Stack:', error.stack)
  process.exit(1)
})
