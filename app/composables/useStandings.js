import { unref, computed } from 'vue'

/**
 * Standings and Tiebreaker Composable
 *
 * Calculates league standings with advanced tiebreakers:
 * 1. Wins (primary)
 * 2. Points Differential (secondary)
 * 3. Strength of Schedule (tertiary)
 * 4. Total Points Scored (quaternary)
 *
 * @param {Ref<Array>} players - Reactive array of players
 * @param {Ref<Array>} matches - Reactive array of matches
 * @param {Ref<Object>} leagueSettings - Reactive league settings object
 */
export function useStandings(players, matches, leagueSettings) {
  /**
   * Calculate points differential for a player
   * @param {number} playerId - Player ID
   * @returns {number} Points differential (scored - conceded)
   */
  const calculatePointsDifferential = (playerId) => {
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
   * Calculate total points scored by a player
   * @param {number} playerId - Player ID
   * @returns {number} Total points scored
   */
  const calculateTotalPointsScored = (playerId) => {
    const matchesList = unref(matches)
    const playerMatches = matchesList.filter(m =>
      m.player1Id === playerId || m.player2Id === playerId
    )

    let totalScored = 0
    playerMatches.forEach(m => {
      if (m.player1Id === playerId) {
        totalScored += m.player1Points
      } else {
        totalScored += m.player2Points
      }
    })

    return totalScored
  }

  /**
   * Calculate Strength of Schedule (SOS) for a player
   * Average win percentage of all opponents faced
   * @param {number} playerId - Player ID
   * @returns {number} SOS value (0.0 - 1.0)
   */
  const calculateSOS = (playerId) => {
    const matchesList = unref(matches)
    const playersList = unref(players)

    // Get all opponents this player has faced
    const opponentIds = new Set()
    matchesList.forEach(m => {
      if (m.player1Id === playerId) {
        opponentIds.add(m.player2Id)
      } else if (m.player2Id === playerId) {
        opponentIds.add(m.player1Id)
      }
    })

    if (opponentIds.size === 0) return 0

    // Calculate average win percentage of opponents
    let totalWinPercentage = 0
    opponentIds.forEach(oppId => {
      const opponent = playersList.find(p => p.id === oppId)
      if (opponent) {
        const totalGames = opponent.wins + opponent.losses + opponent.draws
        const winPercentage = totalGames > 0 ? opponent.wins / totalGames : 0
        totalWinPercentage += winPercentage
      }
    })

    return totalWinPercentage / opponentIds.size
  }

  /**
   * Get head-to-head record between two players
   * @param {number} p1Id - Player 1 ID
   * @param {number} p2Id - Player 2 ID
   * @returns {Object} { p1Wins, p2Wins, draws, total }
   */
  const getHeadToHead = (p1Id, p2Id) => {
    const matchesList = unref(matches)
    const h2hMatches = matchesList.filter(m =>
      (m.player1Id === p1Id && m.player2Id === p2Id) ||
      (m.player1Id === p2Id && m.player2Id === p1Id)
    )

    let p1Wins = 0
    let p2Wins = 0
    let draws = 0

    h2hMatches.forEach(m => {
      if (m.winnerId === p1Id) {
        p1Wins++
      } else if (m.winnerId === p2Id) {
        p2Wins++
      } else {
        draws++
      }
    })

    return {
      p1Wins,
      p2Wins,
      draws,
      total: h2hMatches.length
    }
  }

  /**
   * Apply tiebreaker rules to compare two players
   * @param {Object} playerA - Player A object (with calculated stats)
   * @param {Object} playerB - Player B object (with calculated stats)
   * @returns {number} -1 if A > B, 1 if B > A, 0 if tied
   */
  const applyTiebreakers = (playerA, playerB) => {
    const settings = unref(leagueSettings)
    const tiebreakMethod = settings?.tiebreakMethod || 'points_differential'

    // 1. Wins (primary tiebreaker - always first)
    if (playerB.wins !== playerA.wins) {
      return playerB.wins - playerA.wins
    }

    // 2. Tiebreaker method from settings
    if (tiebreakMethod === 'head_to_head') {
      const h2h = getHeadToHead(playerA.id, playerB.id)
      if (h2h.p1Wins !== h2h.p2Wins) {
        return h2h.p2Wins - h2h.p1Wins // playerA is p1
      }
    }

    // 3. Points differential (always included)
    const aDiff = playerA.pointsDifferential ?? calculatePointsDifferential(playerA.id)
    const bDiff = playerB.pointsDifferential ?? calculatePointsDifferential(playerB.id)
    if (bDiff !== aDiff) {
      return bDiff - aDiff
    }

    // 4. Strength of Schedule (if enabled)
    if (tiebreakMethod === 'sos') {
      const aSOS = playerA.sos ?? calculateSOS(playerA.id)
      const bSOS = playerB.sos ?? calculateSOS(playerB.id)
      if (bSOS !== aSOS) {
        return bSOS - aSOS
      }
    }

    // 5. Total points scored (final tiebreaker)
    const aTotal = playerA.totalScored ?? calculateTotalPointsScored(playerA.id)
    const bTotal = playerB.totalScored ?? calculateTotalPointsScored(playerB.id)
    return bTotal - aTotal
  }

  /**
   * Calculate standings for a specific phase (or overall)
   * @param {number|null} phase - Phase number (null for overall)
   * @returns {Array} Sorted standings array with calculated stats
   */
  const calculateStandings = (phase = null) => {
    const playersList = unref(players)

    // Calculate stats for each player
    const standings = playersList.map(player => {
      const pointsDifferential = calculatePointsDifferential(player.id)
      const totalScored = calculateTotalPointsScored(player.id)
      const sos = calculateSOS(player.id)

      return {
        ...player,
        pointsDifferential,
        totalScored,
        sos,
        totalGames: player.wins + player.losses + player.draws,
        phase // Include phase for context
      }
    })

    // Sort by tiebreakers
    standings.sort(applyTiebreakers)

    // Add rank
    standings.forEach((player, index) => {
      player.rank = index + 1
    })

    return standings
  }

  /**
   * Get player rank in current standings
   * @param {number} playerId - Player ID
   * @param {number|null} phase - Phase number (null for overall)
   * @returns {number} Player rank (1-indexed)
   */
  const getPlayerRank = (playerId, phase = null) => {
    const standings = calculateStandings(phase)
    const playerStanding = standings.find(p => p.id === playerId)
    return playerStanding?.rank || null
  }

  /**
   * Get player statistics with all calculated values
   * @param {number} playerId - Player ID
   * @param {number|null} phase - Phase number (null for overall)
   * @returns {Object|null} Player stats object
   */
  const getPlayerStats = (playerId, phase = null) => {
    const standings = calculateStandings(phase)
    return standings.find(p => p.id === playerId) || null
  }

  /**
   * Compare two players' stats
   * @param {number} p1Id - Player 1 ID
   * @param {number} p2Id - Player 2 ID
   * @returns {Object} Comparison object with stats and head-to-head
   */
  const comparePlayerStats = (p1Id, p2Id) => {
    const p1Stats = getPlayerStats(p1Id)
    const p2Stats = getPlayerStats(p2Id)
    const h2h = getHeadToHead(p1Id, p2Id)

    return {
      player1: p1Stats,
      player2: p2Stats,
      headToHead: h2h,
      comparison: {
        rankDifference: (p1Stats?.rank || 0) - (p2Stats?.rank || 0),
        winDifference: (p1Stats?.wins || 0) - (p2Stats?.wins || 0),
        pointsDiffDifference: (p1Stats?.pointsDifferential || 0) - (p2Stats?.pointsDifferential || 0)
      }
    }
  }

  // Computed standings (reactive)
  const currentStandings = computed(() => calculateStandings())

  return {
    calculateStandings,
    getPlayerRank,
    calculateSOS,
    calculatePointsDifferential,
    calculateTotalPointsScored,
    getHeadToHead,
    applyTiebreakers,
    getPlayerStats,
    comparePlayerStats,
    currentStandings
  }
}
