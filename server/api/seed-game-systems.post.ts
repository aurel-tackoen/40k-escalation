import { db } from '../../db'
import { gameSystems, factions, missions, unitTypes } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineEventHandler(async () => {
  try {
    console.log('Starting game systems seed...')

    // Use absolute paths for imports
    const gameSystemsPath = join(__dirname, '../../app/data/game-systems.js')
    const factionsPath = join(__dirname, '../../app/data/factions-by-system.js')
    const missionsPath = join(__dirname, '../../app/data/missions-by-system.js')
    const unitTypesPath = join(__dirname, '../../app/data/unit-types-by-system.js')

    const { gameSystems: gameSystemsData } = await import(gameSystemsPath)
    const { factionsBySystem } = await import(factionsPath)
    const { missionsBySystem } = await import(missionsPath)
    const { unitTypesBySystem } = await import(unitTypesPath)

    // 1. Seed game systems
    for (const system of gameSystemsData) {
      const existing = await db
        .select()
        .from(gameSystems)
        .where(eq(gameSystems.shortName, system.shortName))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(gameSystems).values({
          name: system.name,
          shortName: system.shortName,
          isActive: true
        })
        console.log(`✓ Created game system: ${system.name}`)
      } else {
        console.log(`- Game system already exists: ${system.name}`)
      }
    }

    // 2. Get all game systems with their IDs
    const allSystems = await db.select().from(gameSystems)
    console.log(`Found ${allSystems.length} game systems`)

    // 3. Seed factions for each game system
    let factionsCreated = 0
    for (const system of allSystems) {
      const systemFactions = factionsBySystem[system.shortName]
      if (!systemFactions) {
        console.log(`⚠ No factions defined for ${system.name}`)
        continue
      }

      for (const faction of systemFactions) {
        const existing = await db
          .select()
          .from(factions)
          .where(eq(factions.name, faction.name))
          .limit(1)

        if (existing.length === 0) {
          await db.insert(factions).values({
            gameSystemId: system.id,
            name: faction.name,
            category: faction.category,
            isActive: true
          })
          factionsCreated++
        }
      }
      console.log(`✓ Processed ${systemFactions.length} factions for ${system.name}`)
    }

    // 4. Seed missions for each game system
    let missionsCreated = 0
    for (const system of allSystems) {
      const systemMissions = missionsBySystem[system.shortName]
      if (!systemMissions) {
        console.log(`⚠ No missions defined for ${system.name}`)
        continue
      }

      for (const mission of systemMissions) {
        const existing = await db
          .select()
          .from(missions)
          .where(eq(missions.name, mission.name))
          .limit(1)

        if (existing.length === 0) {
          await db.insert(missions).values({
            gameSystemId: system.id,
            name: mission.name,
            category: mission.category,
            isActive: true
          })
          missionsCreated++
        }
      }
      console.log(`✓ Processed ${systemMissions.length} missions for ${system.name}`)
    }

    // 5. Seed unit types for each game system
    let unitTypesCreated = 0
    for (const system of allSystems) {
      const systemUnitTypes = unitTypesBySystem[system.shortName]
      if (!systemUnitTypes) {
        console.log(`⚠ No unit types defined for ${system.name}`)
        continue
      }

      for (const unitType of systemUnitTypes) {
        const existing = await db
          .select()
          .from(unitTypes)
          .where(eq(unitTypes.name, unitType.name))
          .limit(1)

        if (existing.length === 0) {
          await db.insert(unitTypes).values({
            gameSystemId: system.id,
            name: unitType.name,
            category: unitType.category,
            displayOrder: unitType.displayOrder,
            isActive: true
          })
          unitTypesCreated++
        }
      }
      console.log(`✓ Processed ${systemUnitTypes.length} unit types for ${system.name}`)
    }

    // 6. Get final counts
    const totalFactions = await db.select().from(factions)
    const totalMissions = await db.select().from(missions)
    const totalUnitTypes = await db.select().from(unitTypes)

    return {
      success: true,
      message: 'Game systems seeded successfully',
      data: {
        gameSystems: allSystems.length,
        factions: totalFactions.length,
        missions: totalMissions.length,
        unitTypes: totalUnitTypes.length,
        created: {
          factions: factionsCreated,
          missions: missionsCreated,
          unitTypes: unitTypesCreated
        }
      }
    }
  } catch (error) {
    console.error('Error seeding game systems:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed game systems',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
