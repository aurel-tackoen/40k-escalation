import { defineStore } from 'pinia'

export const useLeagueStore = defineStore('league', {
  state: () => ({
    currentLeague: null,
    players: [],
    matches: [],
    armies: [],
    loading: false,
    error: null
  }),

  getters: {
    league: (state) => state.currentLeague
  },

  actions: {
    async fetchLeague() {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch('/api/leagues')
        if (response.success && response.data.length > 0) {
          this.currentLeague = response.data[0]
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching league:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchPlayers() {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch('/api/players')
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

    async fetchMatches() {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch('/api/matches')
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

    async fetchArmies() {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch('/api/armies')
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

    async fetchAll() {
      await Promise.all([
        this.fetchLeague(),
        this.fetchPlayers(),
        this.fetchMatches(),
        this.fetchArmies()
      ])
    },

    async addPlayer(player) {
      try {
        const response = await $fetch('/api/players', {
          method: 'POST',
          body: player
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

    async removePlayer(playerId) {
      // TODO: Create DELETE endpoint
      this.players = this.players.filter(p => p.id !== playerId)
    },

    async addMatch(match) {
      try {
        const response = await $fetch('/api/matches', {
          method: 'POST',
          body: match
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

    async updateLeague(league) {
      // TODO: Create PUT endpoint
      this.currentLeague = { ...league }
    },

    async saveArmy(army) {
      try {
        const response = await $fetch('/api/armies', {
          method: 'POST',
          body: army
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

    async deleteArmy(playerId, round) {
      // TODO: Create DELETE endpoint
      this.armies = this.armies.filter(a => 
        !(a.playerId === playerId && a.round === round)
      )
    }
  }
})
