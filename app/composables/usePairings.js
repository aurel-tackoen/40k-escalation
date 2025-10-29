import { unref } from 'vue'

/**
 * Pairing Management Composable
 *
 * Handles Swiss pairing, random pairing, BYE assignment, and pairing validation
 * for Warhammer league match assignments.
 *
 * @param {Ref<Array>} players - Reactive array of players
 * @param {Ref<Array>} matches - Reactive array of matches
 * @param {Ref<Array>} pairings - Reactive array of pairings
 * @param {Ref<Object>} leagueSettings - Reactive league settings object
 */
export function usePairings(players, matches, pairings, leagueSettings) {  /**
   * Get active players for a specific round
   * @param {number} round - Round number
   * @returns {Array} Active players for the round
   */
  const getActivePlayers = (round) => {
    const playersList = unref(players)
    return playersList.filter(p =>
      p.isActive &&
      (p.joinedRound || 1) <= round &&
      (!p.leftRound || p.leftRound >= round)
    )
  }

  /**
   * Create a BYE pairing for a player
   * @param {number} playerId - Player ID
   * @param {number} round - Round number
   * @param {number} leagueId - League ID
   * @returns {Object} BYE pairing object
   */
  const createByePairing = (playerId, round, leagueId) => {
    return {
      leagueId,
      round,
      player1Id: playerId,
      player2Id: null,
      isBye: true,
      status: 'completed', // BYE auto-completes
      matchId: null
    }
  }

  /**
   * Select player for BYE (prioritizes players with fewest BYEs)
   * @param {Array} activePlayers - Active players list
   * @param {number} _round - Current round (unused, for future implementation)
   * @returns {Object} Player selected for BYE
   */
  const selectByePlayer = (activePlayers, _round) => {
    const pairingsList = unref(pairings)
    const byeCounts = {}

    // Count previous BYEs for each player
    activePlayers.forEach(p => {
      byeCounts[p.id] = pairingsList.filter(
        pair => pair.isBye && (pair.player1Id === p.id || pair.player2Id === p.id)
      ).length
    })

    // Find player(s) with fewest BYEs
    const minByes = Math.min(...Object.values(byeCounts))
    const eligibleForBye = activePlayers.filter(p => byeCounts[p.id] === minByes)

    // Return random from eligible
    return eligibleForBye[Math.floor(Math.random() * eligibleForBye.length)]
  }

  /**
   * Check if pairing exists between two players
   * @param {number} p1Id - Player 1 ID
   * @param {number} p2Id - Player 2 ID
   * @param {number|null} round - Round number (null = any round)
   * @returns {boolean} True if pairing exists
   */
  const hasPairing = (p1Id, p2Id, round = null) => {
    const pairingsList = unref(pairings)
    return pairingsList.some(pair => {
      const matchesRound = round === null || pair.round === round
      const matchesPlayers =
        (pair.player1Id === p1Id && pair.player2Id === p2Id) ||
        (pair.player1Id === p2Id && pair.player2Id === p1Id)
      return matchesRound && matchesPlayers
    })
  }

  /**
   * Calculate points differential for a player (for tiebreaker)
   * @param {number} playerId - Player ID
   * @returns {number} Points differential
   */
  const getPointsDifferential = (playerId) => {
    const matchesList = unref(matches)
    const playerMatches = matchesList.filter(m =>
      m.player1Id === playerId || m.player2Id === playerId
    )

    let differential = 0
    playerMatches.forEach(m => {
      if (m.player1Id === playerId) {
        differential += (m.player1Points - m.player2Points)
      } else {
        differential += (m.player2Points - m.player1Points)
      }
    })

    return differential
  }

  /**
   * Generate Swiss pairings for a round
   * Pairs players with similar records, avoiding rematches when possible
   * @param {number} round - Round number
   * @param {number} leagueId - League ID
   * @returns {Array} Array of pairing objects
   */
  const generateSwissPairings = (round, leagueId) => {
    let activePlayers = getActivePlayers(round)
    const newPairings = []
    const settings = unref(leagueSettings)

    // Handle odd number - give BYE
    if (activePlayers.length % 2 === 1) {
      const byePlayer = settings?.byeHandling === 'manual'
        ? null // Organizer will assign manually
        : selectByePlayer(activePlayers, round)

      if (byePlayer) {
        newPairings.push(createByePairing(byePlayer.id, round, leagueId))
        activePlayers = activePlayers.filter(p => p.id !== byePlayer.id)
      }
    }

    // Sort by standings (wins, then points differential)
    const sorted = [...activePlayers].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      const aDiff = getPointsDifferential(a.id)
      const bDiff = getPointsDifferential(b.id)
      return bDiff - aDiff
    })

    // Pair players with similar records (avoid rematches)
    const paired = new Set()
    for (let i = 0; i < sorted.length; i++) {
      if (paired.has(sorted[i].id)) continue

      // Try to find opponent with similar record
      for (let j = i + 1; j < sorted.length; j++) {
        if (paired.has(sorted[j].id)) continue

        const hasPlayed = hasPairing(sorted[i].id, sorted[j].id)
        if (!hasPlayed || settings?.allowRematches) {
          newPairings.push({
            leagueId,
            round,
            player1Id: sorted[i].id,
            player2Id: sorted[j].id,
            isBye: false,
            status: 'pending'
          })
          paired.add(sorted[i].id)
          paired.add(sorted[j].id)
          break
        }
      }

      // If no valid pairing found and rematches not allowed, pair with closest available
      if (!paired.has(sorted[i].id)) {
        for (let j = i + 1; j < sorted.length; j++) {
          if (!paired.has(sorted[j].id)) {
            newPairings.push({
              leagueId,
              round,
              player1Id: sorted[i].id,
              player2Id: sorted[j].id,
              isBye: false,
              status: 'pending'
            })
            paired.add(sorted[i].id)
            paired.add(sorted[j].id)
            break
          }
        }
      }
    }

    return newPairings
  }

  /**
   * Generate random pairings for a round
   * @param {number} round - Round number
   * @param {number} leagueId - League ID
   * @returns {Array} Array of pairing objects
   */
  const generateRandomPairings = (round, leagueId) => {
    const activePlayers = getActivePlayers(round)
    const shuffled = [...activePlayers].sort(() => Math.random() - 0.5)
    const newPairings = []

    // Handle odd number
    if (shuffled.length % 2 === 1) {
      const byePlayer = shuffled.pop() // Random BYE
      newPairings.push(createByePairing(byePlayer.id, round, leagueId))
    }

    // Pair adjacent players
    for (let i = 0; i < shuffled.length; i += 2) {
      newPairings.push({
        leagueId,
        round,
        player1Id: shuffled[i].id,
        player2Id: shuffled[i + 1].id,
        isBye: false,
        status: 'pending'
      })
    }

    return newPairings
  }

  /**
   * Create a manual pairing
   * @param {number} player1Id - Player 1 ID
   * @param {number|null} player2Id - Player 2 ID (null for BYE)
   * @param {number} round - Round number
   * @param {number} leagueId - League ID
   * @returns {Object} Pairing object
   * @throws {Error} If validation fails
   */
  const createManualPairing = (player1Id, player2Id, round, leagueId) => {
    // Validate players are active
    const activePlayers = getActivePlayers(round)
    const p1Active = activePlayers.find(p => p.id === player1Id)
    const p2Active = player2Id ? activePlayers.find(p => p.id === player2Id) : true

    if (!p1Active || !p2Active) {
      throw new Error('Both players must be active in this round')
    }

    // Check if pairing already exists
    if (player2Id && hasPairing(player1Id, player2Id, round)) {
      throw new Error('Pairing already exists for this round')
    }

    return {
      leagueId,
      round,
      player1Id,
      player2Id: player2Id || null,
      isBye: !player2Id,
      status: player2Id ? 'pending' : 'completed'
    }
  }

  /**
   * Get unpaired active players for a round
   * @param {number} round - Round number
   * @returns {Array} Unpaired players
   */
  const getUnpairedPlayers = (round) => {
    const activePlayers = getActivePlayers(round)
    const pairingsList = unref(pairings)
    const pairedIds = new Set()

    pairingsList
      .filter(p => p.round === round)
      .forEach(p => {
        pairedIds.add(p.player1Id)
        if (p.player2Id) pairedIds.add(p.player2Id)
      })

    return activePlayers.filter(p => !pairedIds.has(p.id))
  }

  /**
   * Suggest pairing method based on round and settings
   * @param {number} round - Round number
   * @returns {string} Suggested method ('swiss', 'random', 'manual')
   */
  const suggestPairingMethod = (round) => {
    const settings = unref(leagueSettings)
    if (round === 1) {
      return settings?.firstRoundPairingMethod || 'manual'
    }
    return settings?.subsequentRoundMethod || 'swiss'
  }

  /**
   * Validate a pairing
   * @param {number} p1Id - Player 1 ID
   * @param {number} p2Id - Player 2 ID
   * @param {number} round - Round number
   * @returns {Object} Validation result { valid: boolean, error: string }
   */
  const validatePairing = (p1Id, p2Id, round) => {
    const activePlayers = getActivePlayers(round)

    if (!activePlayers.find(p => p.id === p1Id)) {
      return { valid: false, error: 'Player 1 is not active in this round' }
    }

    if (p2Id && !activePlayers.find(p => p.id === p2Id)) {
      return { valid: false, error: 'Player 2 is not active in this round' }
    }

    if (p2Id && hasPairing(p1Id, p2Id, round)) {
      return { valid: false, error: 'Pairing already exists for this round' }
    }

    return { valid: true }
  }

  return {
    generateSwissPairings,
    generateRandomPairings,
    createManualPairing,
    getActivePlayers,
    getUnpairedPlayers,
    createByePairing,
    selectByePlayer,
    hasPairing,
    getPointsDifferential,
    suggestPairingMethod,
    validatePairing
  }
}
