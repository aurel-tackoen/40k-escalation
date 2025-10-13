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
    league: (state) => state.currentLeague,
    paintingLeaderboard: (state) => {
      const leaderboard = []
      const currentRound = state.currentLeague?.currentRound || 1

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
    }
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
      try {
        const response = await $fetch(`/api/leagues?id=${league.id}`, {
          method: 'PUT',
          body: league
        })
        if (response.success) {
          this.currentLeague = response.data
        }
        return response
      } catch (error) {
        console.error('Error updating league:', error)
        throw error
      }
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
    }
  }
})
