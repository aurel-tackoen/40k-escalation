/**
 * Test script to verify game-specific rules generation
 * Run with: node test-rules-generation.js
 */

import { generateLeagueRules } from './app/data/default-rules.js'
import { gameSystems } from './app/data/game-systems.js'

console.log('🎯 Testing League Rules Generation for All Game Systems\n')
console.log('='.repeat(80))

gameSystems.forEach((gameSystem, index) => {
  console.log(`\n${index + 1}. ${gameSystem.name} (${gameSystem.shortName})`)
  console.log('-'.repeat(80))
  console.log(`Match Type: ${gameSystem.matchType}`)

  try {
    const rules = generateLeagueRules(gameSystem)

    // Verify rules contain expected sections
    const expectedSections = [
      'League Rules & Guidelines',
      'Scoring System',
      'Army Building',
      'Match Requirements',
      'League Standings',
      'Sportsmanship & Community'
    ]

    const missingSections = expectedSections.filter(section => !rules.includes(section))

    if (missingSections.length === 0) {
      console.log('✅ All sections present')
    } else {
      console.log('❌ Missing sections:', missingSections.join(', '))
    }

    // Check for game-specific content
    if (gameSystem.matchType === 'victory_points') {
      const hasVP = rules.includes(gameSystem.matchConfig.pointsLabel)
      console.log(hasVP ? '✅ Victory Points scoring included' : '❌ Missing Victory Points scoring')
    } else if (gameSystem.matchType === 'percentage') {
      const hasCasualties = rules.includes('Casualty-Based Victory')
      const hasMargin = rules.includes('Margin of victory')
      console.log(hasCasualties ? '✅ Casualty scoring included' : '❌ Missing casualty scoring')
      console.log(hasMargin ? '✅ Margin calculation included' : '❌ Missing margin calculation')
    } else if (gameSystem.matchType === 'scenario') {
      const hasObjective = rules.includes('Scenario Objectives')
      console.log(hasObjective ? '✅ Scenario objectives included' : '❌ Missing scenario objectives')
    }

    // Show first 300 characters as preview
    console.log('\nPreview:')
    console.log(rules.substring(0, 300) + '...\n')

    console.log(`Total length: ${rules.length} characters`)

  } catch (error) {
    console.log('❌ ERROR:', error.message)
  }
})

console.log('\n' + '='.repeat(80))
console.log('✨ Rules generation test complete!')
