/**
 * POST /api/seed
 * Seeds the database with initial data
 */
import { db } from '../../db'
import { leagues, rounds, players, matches, armies } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    // Create league
    const [league] = await db.insert(leagues).values({
      name: 'Autumn Escalation 2025',
      description: 'Progressive army building campaign',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      currentRound: 1
    }).returning()

    // Create rounds
    await db.insert(rounds).values([
      {
        leagueId: league.id,
        number: 1,
        name: 'Combat Patrol',
        pointLimit: 500,
        startDate: '2025-10-01',
        endDate: '2025-10-31'
      },
      {
        leagueId: league.id,
        number: 2,
        name: 'Incursion',
        pointLimit: 1000,
        startDate: '2025-11-01',
        endDate: '2025-11-30'
      },
      {
        leagueId: league.id,
        number: 3,
        name: 'Strike Force',
        pointLimit: 2000,
        startDate: '2025-12-01',
        endDate: '2025-12-31'
      }
    ])

    // Create players
    const [player1] = await db.insert(players).values({
      name: 'Magnus the Red',
      faction: 'Thousand Sons',
      email: 'magnus@prospero.com',
      wins: 3,
      losses: 1,
      draws: 0,
      totalPoints: 85
    }).returning()

    const [player2] = await db.insert(players).values({
      name: 'Roboute Guilliman',
      faction: 'Ultramarines',
      email: 'guilliman@ultramar.com',
      wins: 2,
      losses: 1,
      draws: 1,
      totalPoints: 72
    }).returning()

    const [player3] = await db.insert(players).values({
      name: 'Abaddon the Despoiler',
      faction: 'Chaos Space Marines',
      email: 'abaddon@eyeofterror.com',
      wins: 2,
      losses: 2,
      draws: 0,
      totalPoints: 68
    }).returning()

    // Create matches
    await db.insert(matches).values([
      {
        leagueId: league.id,
        round: 1,
        player1Id: player1.id,
        player2Id: player2.id,
        player1Points: 25,
        player2Points: 18,
        winnerId: player1.id,
        mission: 'Purge the Enemy',
        datePlayed: '2025-10-05',
        notes: 'Close game, came down to final turn'
      },
      {
        leagueId: league.id,
        round: 1,
        player1Id: player3.id,
        player2Id: player1.id,
        player1Points: 15,
        player2Points: 30,
        winnerId: player1.id,
        mission: 'Secure and Control',
        datePlayed: '2025-10-12',
        notes: 'Magnus dominated the psychic phase'
      }
    ])

    // Create armies
    await db.insert(armies).values([
      {
        playerId: player1.id,
        round: 1,
        name: "Magnus's Psychic Legion",
        totalPoints: 500,
        units: JSON.stringify([
          { id: 1, name: "Magnus the Red", points: 350, type: "HQ", equipment: "" },
          { id: 2, name: "Rubric Marines", points: 150, type: "Troops", equipment: "Inferno Boltguns" }
        ]),
        isValid: true,
        lastModified: "2025-10-01"
      },
      {
        playerId: player2.id,
        round: 1,
        name: "Ultramarines Strike Force",
        totalPoints: 485,
        units: JSON.stringify([
          { id: 1, name: "Captain in Terminator Armour", points: 95, type: "HQ", equipment: "Thunder Hammer & Storm Shield" },
          { id: 2, name: "Tactical Squad", points: 140, type: "Troops", equipment: "Boltguns" },
          { id: 3, name: "Terminator Squad", points: 250, type: "Elites", equipment: "Power Fists & Storm Bolters" }
        ]),
        isValid: true,
        lastModified: "2025-10-02"
      }
    ])

    return {
      success: true,
      message: 'Database seeded successfully',
      data: {
        league,
        playersCreated: 3,
        matchesCreated: 2,
        armiesCreated: 2
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed database',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
