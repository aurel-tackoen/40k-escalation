import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useLeaguesStore = defineStore('leagues', {
  state: () => ({
    // Multi-league state
    myLeagues: [],              // User's leagues with roles
    currentLeagueId: null,      // Active league ID
    leagues: {},                // Cache of league details { [id]: leagueData }

    // Current league data
    players: [],
    matches: [],
    armies: [],
    members: [],                // League members

    // UI state
    loading: false,
    error: null
  }),

  getters: {
    // Current league getter
    currentLeague: (state) => {
      if (!state.currentLeagueId) return null
      return state.leagues[state.currentLeagueId] || null
    },

    // User's role in current league
    currentRole: (state) => {
      if (!state.currentLeagueId) return null
      const membership = state.myLeagues.find(l => l.id === state.currentLeagueId)
      return membership?.role || null
    },

    // Check if user is owner of current league
    isLeagueOwner: (state, getters) => {
      return getters.currentRole === 'owner'
    },

    // Check if user can manage league (owner or organizer)
    canManageLeague: (state, getters) => {
      const role = getters.currentRole
      return role === 'owner' || role === 'organizer'
    },

    // Painting leaderboard for current round
    paintingLeaderboard: (state, getters) => {
      // Return empty array if no league is selected
      if (!getters.currentLeague) return []

      const leaderboard = []
      const currentRound = getters.currentLeague.currentRound || 1

      state.players.forEach(player => {
        const army = state.armies.find(a => a.playerId === player.id && a.round === currentRound)

        if (army && army.units) {
          const unitsWithModels = army.units.filter(u => u.totalModels > 0)

          if (unitsWithModels.length > 0) {
            const totalModels = unitsWithModels.reduce((sum, u) => sum + (u.totalModels || 0), 0)
            const painted = unitsWithModels.reduce((sum, u) => sum + (u.paintedModels || 0), 0)
            const percentage = totalModels > 0 ? Math.round((painted / totalModels) * 100) : 0

            leaderboard.push({
              playerId: player.id,
              playerName: player.name,
              faction: player.faction,
              totalModels,
              painted,
              percentage
            })
          }
        }
      })

      return leaderboard.sort((a, b) => b.percentage - a.percentage)
    },

    // Check if user has selected a league
    hasActiveLeague: (state) => {
      return state.currentLeagueId !== null
    }
  },

  actions: {
    // ==================== League Management ====================

    /**
     * Fetch all leagues the user is a member of
     */
    async fetchMyLeagues() {
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

        const response = await $fetch(`/api/leagues/my?userId=${authStore.user.id}`)
        if (response.success) {
          this.myLeagues = response.data

          // If no league selected but user has leagues, select first one
          if (!this.currentLeagueId && this.myLeagues.length > 0) {
            await this.switchLeague(this.myLeagues[0].id)
          }
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching user leagues:', error)
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

        // Fetch all data for this league
        await this.fetchLeagueData()

        // Store in localStorage for persistence
        if (process.client) {
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
     * Join an existing league
     */
    async joinLeague(leagueId, password) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/api/leagues/${leagueId}/join`, {
          method: 'POST',
          body: {
            userId: authStore.user?.id,
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
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/api/leagues/${this.currentLeagueId}/leave`, {
          method: 'POST',
          body: {
            userId: authStore.user?.id
          }
        })

        if (response.success) {
          // Remove from user's leagues
          this.myLeagues = this.myLeagues.filter(l => l.id !== this.currentLeagueId)

          // Clear cache
          delete this.leagues[this.currentLeagueId]

          // Clear current league data
          this.currentLeagueId = null
          this.players = []
          this.matches = []
          this.armies = []
          this.members = []

          // Switch to first available league or null
          if (this.myLeagues.length > 0) {
            await this.switchLeague(this.myLeagues[0].id)
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
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/api/leagues/${this.currentLeagueId}`, {
          method: 'DELETE',
          body: {
            userId: authStore.user?.id
          }
        })

        if (response.success) {
          // Same cleanup as leave league
          this.myLeagues = this.myLeagues.filter(l => l.id !== this.currentLeagueId)
          delete this.leagues[this.currentLeagueId]
          this.currentLeagueId = null
          this.players = []
          this.matches = []
          this.armies = []
          this.members = []

          if (this.myLeagues.length > 0) {
            await this.switchLeague(this.myLeagues[0].id)
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
        this.fetchMembers()
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
     * Remove player from current league
     */
    async removePlayer(playerId) {
      try {
        const response = await $fetch(`/api/players?id=${playerId}`, {
          method: 'DELETE'
        })
        if (response.success) {
          this.players = this.players.filter(p => p.id !== playerId)
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
        const response = await $fetch(`/api/armies?playerId=${playerId}&round=${round}`, {
          method: 'DELETE'
        })
        if (response.success) {
          this.armies = this.armies.filter(a =>
            !(a.playerId === playerId && a.round === round)
          )
        }
        return response
      } catch (error) {
        console.error('Error deleting army:', error)
        throw error
      }
    },

    // ==================== Initialization ====================

    /**
     * Initialize store (restore from localStorage)
     */
    async initialize() {
      if (process.client) {
        const savedLeagueId = localStorage.getItem('currentLeagueId')
        if (savedLeagueId) {
          this.currentLeagueId = parseInt(savedLeagueId)
        }
      }

      await this.fetchMyLeagues()

      // Fetch league data if a league is selected
      if (this.currentLeagueId) {
        // Fetch league details if not cached
        if (!this.leagues[this.currentLeagueId]) {
          try {
            const response = await $fetch(`/api/leagues/${this.currentLeagueId}`)
            if (response.success) {
              this.leagues[this.currentLeagueId] = response.data
            }
          } catch (error) {
            console.error('Error fetching league details:', error)
          }
        }

        // Fetch all league data
        await this.fetchLeagueData()
      }
    }
  }
})
