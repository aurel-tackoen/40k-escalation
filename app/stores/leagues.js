import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useLeaguesStore = defineStore('leagues', {
  state: () => ({
    // Multi-league state
    myLeagues: [],              // User's leagues with roles
    publicLeagues: [],          // Public leagues available to join
    currentLeagueId: null,      // Active league ID
    leagues: {},                // Cache of league details { [id]: leagueData }

    // Game systems state
    gameSystems: [],            // Available game systems
    currentGameSystem: null,    // Active game system for current league
    factions: [],               // Factions for current game system
    missions: [],               // Missions for current game system
    unitTypes: [],              // Unit types for current game system

    // Current league data
    players: [],
    matches: [],
    armies: [],
    members: [],                // League members
    pairings: [],               // Pairings for current league
    leagueSettings: null,       // League settings (pairing config)

    // UI state
    loading: false,
    initializing: true,         // Initial app load
    error: null,
    initialized: false          // Track if store has been initialized
  }),

  getters: {
    // Current league getter
    currentLeague: (state) => {
      if (!state.currentLeagueId) return null
      return state.leagues[state.currentLeagueId] || null
    },

    // Current game system name
    currentGameSystemName: (state) => {
      return state.currentGameSystem?.name || 'Unknown Game System'
    },

    // Available factions for current game system
    availableFactions: (state) => {
      return state.factions
    },

    // Available missions for current game system
    availableMissions: (state) => {
      return state.missions
    },

    // Available unit types for current game system
    availableUnitTypes: (state) => {
      return state.unitTypes
    },

    // User's role in current league
    currentRole: (state) => {
      if (!state.currentLeagueId) return null
      const membership = state.myLeagues.find(l => l.id === state.currentLeagueId)
      return membership?.role || null
    },

    // User's army name for current league (now from players table)
    currentArmyName: (state) => {
      if (!state.currentLeagueId) return null
      const player = state.currentPlayer
      return player?.armyName || null
    },

    // Check if user is owner of current league
    isLeagueOwner() {
      return this.currentRole === 'owner'
    },

    // Check if user can manage league (owner or organizer)
    canManageLeague() {
      const role = this.currentRole
      return role === 'owner' || role === 'organizer'
    },

    // Painting leaderboard for current round
    paintingLeaderboard(state) {
      // Return empty array if no league is selected
      if (!this.currentLeague) return []

      const leaderboard = []
      const currentRound = this.currentLeague.currentRound || 1

      state.players.forEach(player => {
        const army = state.armies.find(a => a.playerId === player.id && a.round === currentRound)

        if (army && army.units) {
          const unitsWithModels = army.units.filter(u => u.totalModels > 0)

          if (unitsWithModels.length > 0) {
            // Model-based stats
            const totalModels = unitsWithModels.reduce((sum, u) => sum + (u.totalModels || 0), 0)
            const painted = unitsWithModels.reduce((sum, u) => sum + (u.paintedModels || 0), 0)
            const percentage = totalModels > 0 ? Math.round((painted / totalModels) * 100) : 0

            // Points-based stats
            const unitsWithPoints = unitsWithModels.filter(u => u.points > 0)
            const totalPoints = army.totalPoints || 0
            let paintedPoints = 0

            unitsWithPoints.forEach(unit => {
              const pointsPerModel = unit.points / unit.totalModels
              const unitPaintedModels = unit.paintedModels || 0
              paintedPoints += Math.round(pointsPerModel * unitPaintedModels)
            })

            const pointsPercentage = totalPoints > 0 ? Math.round((paintedPoints / totalPoints) * 100) : 0

            leaderboard.push({
              playerId: player.id,
              playerName: player.name,
              faction: player.faction,
              totalModels,
              painted,
              percentage,
              totalPoints,
              paintedPoints,
              pointsPercentage
            })
          }
        }
      })

      return leaderboard.sort((a, b) => b.percentage - a.percentage)
    },

    // Check if user has selected a league
    hasActiveLeague: (state) => {
      return state.currentLeagueId !== null
    },

    // Get current user's player entity in current league
    currentPlayer(state) {
      const authStore = useAuthStore()
      if (!authStore.user?.id || !state.currentLeagueId) return null

      return state.players.find(p => p.userId === authStore.user.id)
    },

    // Check if current user has a player entity in current league
    hasPlayerInLeague() {
      return this.currentPlayer !== null
    },

    // Pairings for current round
    currentRoundPairings(state) {
      if (!this.currentLeague) return []
      const currentRound = this.currentLeague.currentRound || 1
      return state.pairings.filter(p => p.round === currentRound)
    },

    // Count of unpaired active players in current round
    unpairedPlayersCount(state) {
      if (!this.currentLeague) return 0
      const currentRound = this.currentLeague.currentRound || 1
      const activePlayers = state.players.filter(p =>
        p.isActive &&
        (p.joinedRound || 1) <= currentRound &&
        (!p.leftRound || p.leftRound >= currentRound)
      )

      const pairedIds = new Set()
      state.pairings
        .filter(p => p.round === currentRound)
        .forEach(p => {
          pairedIds.add(p.player1Id)
          if (p.player2Id) pairedIds.add(p.player2Id)
        })

      return activePlayers.filter(p => !pairedIds.has(p.id)).length
    },

    // Active players for current round
    activePlayers(state) {
      if (!this.currentLeague) return []
      const currentRound = this.currentLeague.currentRound || 1
      return state.players.filter(p =>
        p.isActive &&
        (p.joinedRound || 1) <= currentRound &&
        (!p.leftRound || p.leftRound >= currentRound)
      )
    }
  },

  actions: {
    // ==================== Game Systems ====================

    /**
     * Fetch all available game systems
     */
    async fetchGameSystems() {
      try {
        const response = await $fetch('/api/game-systems')
        if (response.success) {
          this.gameSystems = response.data
        }
      } catch (error) {
        console.error('Error fetching game systems:', error)
      }
    },

    /**
     * Fetch factions for a specific game system
     */
    async fetchFactions(gameSystemId) {
      try {
        const response = await $fetch(`/api/factions?gameSystemId=${gameSystemId}`)
        if (response.success) {
          this.factions = response.data
        }
      } catch (error) {
        console.error('Error fetching factions:', error)
        this.factions = []
      }
    },

    /**
     * Fetch missions for a specific game system
     */
    async fetchMissions(gameSystemId) {
      try {
        const response = await $fetch(`/api/missions?gameSystemId=${gameSystemId}`)
        if (response.success) {
          this.missions = response.data
        }
      } catch (error) {
        console.error('Error fetching missions:', error)
        this.missions = []
      }
    },

    /**
     * Fetch unit types for a specific game system
     */
    async fetchUnitTypes(gameSystemId) {
      try {
        const response = await $fetch(`/api/unit-types?gameSystemId=${gameSystemId}`)
        if (response.success) {
          this.unitTypes = response.data
        }
      } catch (error) {
        console.error('Error fetching unit types:', error)
        this.unitTypes = []
      }
    },

    // ==================== League Management ====================

    /**
     * Fetch user's leagues (leagues they are a member of)
     */
    async fetchMyLeagues(options = {}) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.user?.id) {
          // No user logged in, return empty
          this.myLeagues = []
          this.loading = false
          return
        }

        // Add cache buster to ensure fresh data
        const cacheBuster = Date.now()
        const response = await $fetch(`/api/leagues/my?userId=${authStore.user.id}&_=${cacheBuster}`)
        if (response.success) {
          this.myLeagues = response.data

          // If no league selected but user has leagues, select first one
          // Skip auto-selection during initialization (will be handled by initialize() after localStorage check)
          if (!this.currentLeagueId && this.myLeagues.length > 0 && !options.skipAutoSelect) {
            await this.switchLeague(this.myLeagues[0].id)
          }
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching user leagues:', error)
      } finally {
        this.loading = false
      }
    },    /**
     * Fetch all public leagues available to join
     * Server will mark leagues the user has already joined with isJoined flag
     */
    async fetchPublicLeagues() {
      this.loading = true
      this.error = null
      try {
        // Get current user ID to mark joined leagues server-side
        const authStore = useAuthStore()
        const userId = authStore.user?.id

        console.log('[fetchPublicLeagues] userId:', userId, 'user:', authStore.user)

        // Fetch all public leagues with joined status
        const url = userId ? `/api/leagues/public?userId=${userId}` : '/api/leagues/public'
        const response = await $fetch(url)

        console.log('[fetchPublicLeagues] Public leagues response:', response.data?.map(l => ({ id: l.id, name: l.name, isJoined: l.isJoined })))

        if (response.success) {
          // Server returns all public leagues with isJoined flag
          const allPublicLeagues = Array.isArray(response.data) ? response.data : []
          this.publicLeagues = allPublicLeagues
        } else {
          this.publicLeagues = []
        }
      } catch (error) {
        this.error = error.message
        this.publicLeagues = []
        console.error('Error fetching public leagues:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Switch to a different league
     */
    async switchLeague(leagueId) {
      if (this.currentLeagueId === leagueId) return

      this.loading = true
      this.error = null

      try {
        this.currentLeagueId = leagueId

        // Fetch league details if not cached
        if (!this.leagues[leagueId]) {
          const response = await $fetch(`/api/leagues/${leagueId}`)
          if (response.success) {
            this.leagues[leagueId] = response.data
          }
        }

        // Get game system data for this league
        const league = this.leagues[leagueId]
        if (league?.gameSystemId) {
          // Set current game system
          this.currentGameSystem = this.gameSystems.find(gs => gs.id === league.gameSystemId)

          // Fetch factions and missions for this game system
          await Promise.all([
            this.fetchFactions(league.gameSystemId),
            this.fetchMissions(league.gameSystemId),
            this.fetchUnitTypes(league.gameSystemId)
          ])
        }

        // Fetch all data for this league
        await this.fetchLeagueData()

        // Store in localStorage for persistence
        if (import.meta.client) {
          localStorage.setItem('currentLeagueId', leagueId.toString())
        }
      } catch (error) {
        this.error = error.message
        console.error('Error switching league:', error)
        this.currentLeagueId = null
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a new league
     */
    async createLeague(leagueData) {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch('/api/leagues/create', {
          method: 'POST',
          body: leagueData
        })

        if (response.success) {
          // Add to user's leagues
          this.myLeagues.push({
            id: response.data.league.id,
            name: response.data.league.name,
            role: 'owner',
            joinedAt: response.data.membership.joinedAt,
            rounds: response.data.rounds
          })

          // Cache league details
          this.leagues[response.data.league.id] = {
            ...response.data.league,
            rounds: response.data.rounds,
            memberCount: 1
          }

          // Switch to new league
          await this.switchLeague(response.data.league.id)
        }

        return response
      } catch (error) {
        this.error = error.message
        console.error('Error creating league:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Join an existing league with player creation
     */
    async joinLeague(leagueId, playerName, faction, armyName, password) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/api/leagues/${leagueId}/join`, {
          method: 'POST',
          body: {
            userId: authStore.user?.id,
            playerName,
            faction,
            armyName,
            password
          }
        })

        if (response.success) {
          // Refresh user's leagues
          await this.fetchMyLeagues()
          // Switch to newly joined league
          await this.switchLeague(leagueId)
        }

        return response
      } catch (error) {
        this.error = error.message
        console.error('Error joining league:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Leave current league
     */
    async leaveLeague() {
      if (!this.currentLeagueId) return

      this.loading = true
      this.error = null
      const leagueIdToLeave = this.currentLeagueId
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/api/leagues/${leagueIdToLeave}/leave`, {
          method: 'POST',
          body: {
            userId: authStore.user?.id
          }
        })

        if (response.success) {
          // Clear cache for the league we're leaving
          delete this.leagues[leagueIdToLeave]

          // Clear current league data
          this.currentLeagueId = null
          this.currentGameSystem = null
          this.players = []
          this.matches = []
          this.armies = []
          this.members = []
          this.factions = []
          this.missions = []
          this.unitTypes = []

          // Refresh both my leagues and public leagues to ensure sync
          await Promise.all([
            this.fetchMyLeagues(),
            this.fetchPublicLeagues()
          ])

          // After refetching, check if user has any leagues left
          // Note: fetchMyLeagues() will auto-switch to first league if currentLeagueId is null
          if (this.myLeagues.length === 0) {
            // No leagues left, clear localStorage
            if (import.meta.client) {
              localStorage.removeItem('currentLeagueId')
            }
          }
        }

        return response
      } catch (error) {
        this.error = error.message
        console.error('Error leaving league:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update league settings
     */
    async updateLeague(updates) {
      if (!this.currentLeagueId) return

      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/api/leagues/${this.currentLeagueId}`, {
          method: 'PATCH',
          body: {
            userId: authStore.user?.id,
            ...updates
          }
        })

        if (response.success) {
          // Update cache
          this.leagues[this.currentLeagueId] = {
            ...this.leagues[this.currentLeagueId],
            ...response.data
          }

          // Update in myLeagues
          const leagueIndex = this.myLeagues.findIndex(l => l.id === this.currentLeagueId)
          if (leagueIndex !== -1) {
            this.myLeagues[leagueIndex] = {
              ...this.myLeagues[leagueIndex],
              name: response.data.name
            }
          }

          // If game system was changed, update current game system and fetch new factions/missions
          if (updates.gameSystemId && updates.gameSystemId !== this.currentGameSystem?.id) {
            this.currentGameSystem = this.gameSystems.find(gs => gs.id === updates.gameSystemId)
            await Promise.all([
              this.fetchFactions(updates.gameSystemId),
              this.fetchMissions(updates.gameSystemId),
              this.fetchUnitTypes(updates.gameSystemId)
            ])
          }
        }

        return response
      } catch (error) {
        this.error = error.message
        console.error('Error updating league:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete current league (owner only)
     */
    async deleteLeague() {
      if (!this.currentLeagueId) return

      this.loading = true
      this.error = null
      const leagueIdToDelete = this.currentLeagueId
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/api/leagues/${leagueIdToDelete}`, {
          method: 'DELETE',
          body: {
            userId: authStore.user?.id
          }
        })

        if (response.success) {
          // Clear cache for the league we're deleting
          delete this.leagues[leagueIdToDelete]

          // Clear current league data
          this.currentLeagueId = null
          this.currentGameSystem = null
          this.players = []
          this.matches = []
          this.armies = []
          this.members = []
          this.factions = []
          this.missions = []
          this.unitTypes = []

          // Refresh both my leagues and public leagues to ensure sync
          await Promise.all([
            this.fetchMyLeagues(),
            this.fetchPublicLeagues()
          ])

          // After refetching, check if user has any leagues left
          // Note: fetchMyLeagues() will auto-switch to first league if currentLeagueId is null
          if (this.myLeagues.length === 0) {
            // No leagues left, clear localStorage
            if (import.meta.client) {
              localStorage.removeItem('currentLeagueId')
            }
          }
        }

        return response
      } catch (error) {
        this.error = error.message
        console.error('Error deleting league:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // ==================== Data Fetching ====================

    /**
     * Fetch all data for current league
     */
    async fetchLeagueData() {
      if (!this.currentLeagueId) return

      await Promise.all([
        this.fetchPlayers(),
        this.fetchMatches(),
        this.fetchArmies(),
        this.fetchMembers(),
        this.fetchPairings(),
        this.fetchLeagueSettings()
      ])
    },

    /**
     * Fetch players for current league
     */
    async fetchPlayers() {
      if (!this.currentLeagueId) return

      this.loading = true
      this.error = null
      try {
        const response = await $fetch(`/api/players?leagueId=${this.currentLeagueId}`)
        if (response.success) {
          // Keep all players (including inactive) for display
          // UI will handle visual differentiation
          this.players = response.data
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching players:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch matches for current league
     */
    async fetchMatches() {
      if (!this.currentLeagueId) return

      this.loading = true
      this.error = null
      try {
        const response = await $fetch(`/api/matches?leagueId=${this.currentLeagueId}`)
        if (response.success) {
          this.matches = response.data
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching matches:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch armies for current league
     */
    async fetchArmies() {
      if (!this.currentLeagueId) return

      this.loading = true
      this.error = null
      try {
        const response = await $fetch(`/api/armies?leagueId=${this.currentLeagueId}`)
        if (response.success) {
          this.armies = response.data
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching armies:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch members for current league
     */
    async fetchMembers() {
      if (!this.currentLeagueId) return

      this.loading = true
      this.error = null
      try {
        const response = await $fetch(`/api/leagues/${this.currentLeagueId}/members`)
        if (response.success) {
          this.members = response.data
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching members:', error)
      } finally {
        this.loading = false
      }
    },

    // ==================== Player Management ====================

    /**
     * Add player to current league
     */
    async addPlayer(player) {
      if (!this.currentLeagueId) return

      try {
        const response = await $fetch('/api/players', {
          method: 'POST',
          body: {
            ...player,
            leagueId: this.currentLeagueId
          }
        })
        if (response.success) {
          this.players.push(response.data)
        }
        return response
      } catch (error) {
        console.error('Error adding player:', error)
        throw error
      }
    },

    /**
     * Update player in current league
     */
    async updatePlayer(playerData) {
      try {
        const response = await $fetch('/api/players', {
          method: 'PUT',
          body: playerData
        })
        if (response.success) {
          const index = this.players.findIndex(p => p.id === playerData.id)
          if (index !== -1) {
            this.players[index] = response.data
          }
        }
        return response
      } catch (error) {
        console.error('Error updating player:', error)
        throw error
      }
    },

    /**
     * Remove player from current league
     */
    async removePlayer(playerId, isSelf = false) {
      try {
        const response = await $fetch(`/api/players?id=${playerId}`, {
          method: 'DELETE'
        })
        if (response.success) {
          // If user removed themselves, handle it like leaving the league
          if (isSelf) {
            const leagueIdToLeave = this.currentLeagueId

            // Clear cache for the league we're leaving
            delete this.leagues[leagueIdToLeave]

            // Clear current league data
            this.currentLeagueId = null
            this.currentGameSystem = null
            this.players = []
            this.matches = []
            this.armies = []
            this.members = []
            this.factions = []
            this.missions = []
            this.unitTypes = []

            // Small delay to ensure database has committed the change
            await new Promise(resolve => setTimeout(resolve, 100))

            // Refresh both my leagues and public leagues to ensure sync
            await Promise.all([
              this.fetchMyLeagues(),
              this.fetchPublicLeagues()
            ])

            // After refetching, check if user has any leagues left
            if (this.myLeagues.length === 0) {
              // No leagues left, clear localStorage
              if (import.meta.client) {
                localStorage.removeItem('currentLeagueId')
              }
              // Navigate to leagues page
              navigateTo('/leagues')
            } else {
              // User has other leagues, navigate to dashboard
              // (fetchMyLeagues will have auto-switched to first league)
              navigateTo('/dashboard')
            }
          } else {
            // Just removing another player, refresh the player list
            await this.fetchPlayers()
          }
        }
        return response
      } catch (error) {
        console.error('Error removing player:', error)
        throw error
      }
    },

    // ==================== Match Management ====================

    /**
     * Add match to current league
     */
    async addMatch(match) {
      if (!this.currentLeagueId) return

      try {
        const response = await $fetch('/api/matches', {
          method: 'POST',
          body: {
            ...match,
            leagueId: this.currentLeagueId
          }
        })
        if (response.success) {
          this.matches.push(response.data)
          // Refresh players to get updated stats
          await this.fetchPlayers()
        }
        return response
      } catch (error) {
        console.error('Error adding match:', error)
        throw error
      }
    },

    /**
     * Delete match from current league
     * Only owner/organizer or match participants can delete
     */
    async deleteMatch(matchId) {
      try {
        console.log('Store deleteMatch called with matchId:', matchId, 'type:', typeof matchId)
        console.log('Current matches before delete:', this.matches.length)
        console.log('Match IDs in store:', this.matches.map(m => ({ id: m.id, type: typeof m.id })))

        const response = await $fetch(`/api/matches?id=${matchId}`, {
          method: 'DELETE'
        })

        console.log('API response:', response)

        if (response.success) {
          console.log('Filtering out match with id:', matchId)
          const beforeLength = this.matches.length
          this.matches = this.matches.filter(m => {
            console.log(`Comparing m.id (${m.id}, ${typeof m.id}) !== matchId (${matchId}, ${typeof matchId}):`, m.id !== matchId)
            return m.id !== matchId
          })
          console.log('Matches after filter:', this.matches.length, 'removed:', beforeLength - this.matches.length)

          // Refresh players to get updated stats
          await this.fetchPlayers()
          console.log('Players refreshed')
        }
        return response
      } catch (error) {
        console.error('Error deleting match:', error)
        throw error
      }
    },

    /**
     * Update an existing match
     * Only owner/organizer or match participants can edit
     */
    async updateMatch(matchData) {
      try {
        console.log('Store updateMatch called with:', matchData)

        const response = await $fetch('/api/matches', {
          method: 'PUT',
          body: matchData
        })

        console.log('Update API response:', response)

        if (response.success) {
          // Update the match in the local state
          const index = this.matches.findIndex(m => m.id === matchData.id)
          if (index !== -1) {
            this.matches[index] = { ...this.matches[index], ...response.data }
          }

          // Note: Player stats are NOT automatically recalculated on edit
          // Organizers may need to manually adjust if needed
          console.log('Match updated in store')
        }
        return response
      } catch (error) {
        console.error('Error updating match:', error)
        throw error
      }
    },

    // ==================== Army Management ====================

    /**
     * Save army for current league
     */
    async saveArmy(army) {
      if (!this.currentLeagueId) return

      try {
        const response = await $fetch('/api/armies', {
          method: 'POST',
          body: {
            ...army,
            leagueId: this.currentLeagueId
          }
        })
        if (response.success) {
          const existingIndex = this.armies.findIndex(a =>
            a.playerId === army.playerId && a.round === army.round
          )

          if (existingIndex !== -1) {
            this.armies[existingIndex] = response.data
          } else {
            this.armies.push(response.data)
          }
        }
        return response
      } catch (error) {
        console.error('Error saving army:', error)
        throw error
      }
    },

    /**
     * Delete army from current league
     */
    async deleteArmy(playerId, round) {
      try {
        if (!this.currentLeagueId) {
          throw new Error('No league selected')
        }

        const response = await $fetch(`/api/armies?leagueId=${this.currentLeagueId}&playerId=${playerId}&round=${round}`, {
          method: 'DELETE'
        })
        if (response.success) {
          this.armies = this.armies.filter(a =>
            !(a.playerId === playerId && a.round === round && a.leagueId === this.currentLeagueId)
          )
        }
        return response
      } catch (error) {
        console.error('Error deleting army:', error)
        throw error
      }
    },

    // ==================== Pairing Management ====================

    /**
     * Fetch pairings for current league
     */
    async fetchPairings(round = null) {
      if (!this.currentLeagueId) return

      try {
        const url = round
          ? `/api/pairings?leagueId=${this.currentLeagueId}&round=${round}`
          : `/api/pairings?leagueId=${this.currentLeagueId}`

        const response = await $fetch(url)
        if (response.success) {
          this.pairings = response.data
        }
      } catch (error) {
        console.error('Error fetching pairings:', error)
        this.pairings = []
      }
    },

    /**
     * Generate pairings for a round
     */
    async generatePairings(round, pairings) {
      if (!this.currentLeagueId) return

      try {
        const response = await $fetch('/api/pairings/generate', {
          method: 'POST',
          body: {
            leagueId: this.currentLeagueId,
            round,
            pairings
          }
        })

        if (response.success) {
          // Refresh ALL pairings (not just the current round)
          await this.fetchPairings()
        }

        return response
      } catch (error) {
        console.error('Error generating pairings:', error)
        throw error
      }
    },

    /**
     * Create manual pairing
     */
    async createManualPairing(pairingData) {
      if (!this.currentLeagueId) return

      try {
        const response = await $fetch('/api/pairings/manual', {
          method: 'POST',
          body: {
            ...pairingData,
            leagueId: this.currentLeagueId
          }
        })

        if (response.success) {
          // Add to local state
          this.pairings.push(response.data)
        }

        return response
      } catch (error) {
        console.error('Error creating manual pairing:', error)
        throw error
      }
    },

    /**
     * Delete pairing
     */
    async deletePairing(pairingId) {
      try {
        const response = await $fetch(`/api/pairings/${pairingId}`, {
          method: 'DELETE'
        })

        if (response.success) {
          // Remove from local state
          this.pairings = this.pairings.filter(p => p.id !== pairingId)
        }

        return response
      } catch (error) {
        console.error('Error deleting pairing:', error)
        throw error
      }
    },

    /**
     * Fetch league settings
     */
    async fetchLeagueSettings() {
      if (!this.currentLeagueId) return

      try {
        const response = await $fetch(`/api/league-settings/${this.currentLeagueId}`)
        if (response.success) {
          this.leagueSettings = response.data
        }
      } catch (error) {
        console.error('Error fetching league settings:', error)
        this.leagueSettings = null
      }
    },

    /**
     * Update league settings
     */
    async updateLeagueSettings(settings) {
      if (!this.currentLeagueId) return

      try {
        const response = await $fetch(`/api/league-settings/${this.currentLeagueId}`, {
          method: 'PUT',
          body: settings
        })

        if (response.success) {
          this.leagueSettings = response.data
        }

        return response
      } catch (error) {
        console.error('Error updating league settings:', error)
        throw error
      }
    },

    /**
     * Toggle player active status
     */
    async togglePlayerActive(playerId, isActive, currentRound) {
      try {
        const response = await $fetch(`/api/players/${playerId}/toggle-active`, {
          method: 'PATCH',
          body: {
            isActive,
            currentRound
          }
        })

        if (response.success) {
          // Update local player state
          const playerIndex = this.players.findIndex(p => p.id === playerId)
          if (playerIndex !== -1) {
            this.players[playerIndex] = response.data
          }
        }

        return response
      } catch (error) {
        console.error('Error toggling player status:', error)
        throw error
      }
    },

    // ==================== Initialization ====================

    /**
     * Initialize store (restore from localStorage)
     */
    async initialize() {
      // Prevent duplicate initialization
      if (this.initialized) {
        return
      }

      // Use initializing flag (not loading) to avoid hiding content
      this.initializing = true

      // Fetch game systems first (needed for all leagues)
      await this.fetchGameSystems()

      // Check localStorage BEFORE fetching leagues to preserve user's selection
      let savedLeagueId = null
      if (import.meta.client) {
        const saved = localStorage.getItem('currentLeagueId')
        if (saved) {
          savedLeagueId = parseInt(saved)
        }
      }

      // Fetch user's leagues (skip auto-select, we'll handle it below)
      await this.fetchMyLeagues({ skipAutoSelect: true })

      // After fetching leagues, validate and restore from localStorage
      if (savedLeagueId) {
        // Check if the saved league is still in user's leagues
        const isValidLeague = this.myLeagues.some(l => l.id === savedLeagueId)

        if (isValidLeague) {
          // Valid league from localStorage, switch to it
          await this.switchLeague(savedLeagueId)
        } else {
          // Invalid league (user left it), clear localStorage
          if (import.meta.client) {
            localStorage.removeItem('currentLeagueId')
          }
          this.currentLeagueId = null

          // If user has other leagues, switch to first one
          if (this.myLeagues.length > 0) {
            await this.switchLeague(this.myLeagues[0].id)
          }
        }
      } else if (this.myLeagues.length > 0) {
        // No saved league but user has leagues, switch to first one
        await this.switchLeague(this.myLeagues[0].id)
      }

      // Mark as initialized
      this.initialized = true
      this.initializing = false
    },

    // ==================== Private League Support ====================

    /**
     * Join a league using an invite code
     */
    async joinByInviteCode(inviteCode) {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch('/api/leagues/join-by-code', {
          method: 'POST',
          body: { inviteCode: inviteCode.toUpperCase() }
        })

        if (response.success) {
          // Refresh user's leagues and switch to the new league
          await this.fetchMyLeagues()
          await this.switchLeague(response.data.id)
        }

        return response
      } catch (error) {
        this.error = error.data?.message || 'Failed to join league'
        console.error('Error joining league with invite code:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Join a league using a share token
     */
    async joinByShareToken(shareToken) {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch(`/api/leagues/join-by-token/${shareToken}`, {
          method: 'POST'
        })

        if (response.success) {
          // Refresh user's leagues and switch to the new league
          await this.fetchMyLeagues()
          await this.switchLeague(response.data.id)
        }

        return response
      } catch (error) {
        this.error = error.data?.message || 'Failed to join league'
        console.error('Error joining league with share token:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Generate a new share URL for the current league
     */
    async generateShareUrl() {
      if (!this.currentLeagueId) {
        throw new Error('No league selected')
      }

      this.loading = true
      this.error = null
      try {
        const response = await $fetch(`/api/leagues/${this.currentLeagueId}/share-url`, {
          method: 'POST'
        })

        if (response.success) {
          // Update cached league data with new share token
          if (this.leagues[this.currentLeagueId]) {
            this.leagues[this.currentLeagueId].shareToken = response.data.shareToken
          }
        }

        return response
      } catch (error) {
        this.error = error.data?.message || 'Failed to generate share URL'
        console.error('Error generating share URL:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Get league info by share token (for preview before joining)
     */
    async getLeagueByToken(shareToken) {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch(`/api/leagues/info-by-token/${shareToken}`)
        return response
      } catch (error) {
        this.error = error.data?.message || 'League not found'
        console.error('Error fetching league by token:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // ==================== Store Management ====================

    /**
     * Reset store to initial state (called on logout)
     */
    resetStore() {
      // Clear all state
      this.myLeagues = []
      this.publicLeagues = []
      this.currentLeagueId = null
      this.leagues = {}
      this.gameSystems = []
      this.currentGameSystem = null
      this.factions = []
      this.missions = []
      this.players = []
      this.matches = []
      this.armies = []
      this.members = []
      this.loading = false
      this.initializing = true     // Reset to initial state
      this.error = null
      this.initialized = false      // Reset initialization flag

      // Clear localStorage
      if (import.meta.client) {
        localStorage.removeItem('currentLeagueId')
      }
    }
  }
})
