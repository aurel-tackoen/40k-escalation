import { defineStore } from 'pinia'

export const useLeagueStore = defineStore('league', {
  state: () => ({
    currentLeague: null,
    players: [],
    matches: [],
    armies: [],
    paintingProgress: [],
    loading: false,
    error: null
  }),

  getters: {
    league: (state) => state.currentLeague,
    
    // Calculate painting statistics for a player at a specific round
    getPaintingStats: (state) => (playerId, round) => {
      const army = state.armies.find(a => a.playerId === playerId && a.round === round)
      if (!army) return null

      const progress = state.paintingProgress.filter(p => 
        p.playerId === playerId && p.round === round
      )

      const totalModels = progress.reduce((sum, unit) => sum + unit.totalModels, 0)
      const paintedModels = progress.reduce((sum, unit) => sum + unit.paintedModels, 0)
      const paintedPercentage = totalModels > 0 ? (paintedModels / totalModels) * 100 : 0

      // Calculate painted points (proportional to painted models)
      const paintedPoints = progress.reduce((sum, unit) => {
        const unitPercentage = unit.totalModels > 0 ? unit.paintedModels / unit.totalModels : 0
        return sum + (unit.points * unitPercentage)
      }, 0)

      return {
        totalModels,
        paintedModels,
        paintedPercentage: Math.round(paintedPercentage * 10) / 10,
        paintedPoints: Math.round(paintedPoints),
        totalPoints: army.points || 0,
        isFullyPainted: paintedPercentage === 100,
        units: progress
      }
    },

    // Get painting leaderboard for current round
    paintingLeaderboard: (state) => {
      const leaderboard = []
      const currentRound = state.currentLeague?.currentRound || 1
      
      state.players.forEach(player => {
        const stats = state.getPaintingStats(player.id, currentRound)
        
        if (stats && stats.totalModels > 0) {
          leaderboard.push({
            playerId: player.id,
            playerName: player.name,
            faction: player.faction,
            ...stats
          })
        }
      })

      return leaderboard.sort((a, b) => b.paintedPercentage - a.paintedPercentage)
    },

    // Get overall painting progress across all rounds
    getOverallPaintingStats: (state) => (playerId) => {
      const progress = state.paintingProgress.filter(p => p.playerId === playerId)
      
      const totalModels = progress.reduce((sum, unit) => sum + unit.totalModels, 0)
      const paintedModels = progress.reduce((sum, unit) => sum + unit.paintedModels, 0)
      const paintedPercentage = totalModels > 0 ? (paintedModels / totalModels) * 100 : 0

      return {
        totalModels,
        paintedModels,
        paintedPercentage: Math.round(paintedPercentage * 10) / 10,
        isFullyPainted: paintedPercentage === 100
      }
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

    async fetchPaintingProgress() {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch('/api/painting-progress')
        if (response.success) {
          this.paintingProgress = response.data
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching painting progress:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchAll() {
      await Promise.all([
        this.fetchLeague(),
        this.fetchPlayers(),
        this.fetchMatches(),
        this.fetchArmies(),
        this.fetchPaintingProgress()
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
    },

    async updatePaintingProgress(progressData) {
      // progressData: { playerId, round, unitName, totalModels, paintedModels, points }
      try {
        const response = await $fetch('/api/painting-progress', {
          method: 'POST',
          body: progressData
        })
        if (response.success) {
          const existingIndex = this.paintingProgress.findIndex(p =>
            p.playerId === progressData.playerId && 
            p.round === progressData.round && 
            p.unitName === progressData.unitName
          )

          if (existingIndex !== -1) {
            this.paintingProgress[existingIndex] = response.data
          } else {
            this.paintingProgress.push(response.data)
          }
        }
        return response
      } catch (error) {
        console.error('Error updating painting progress:', error)
        throw error
      }
    },

    async deletePaintingProgress(playerId, round, unitName) {
      try {
        const response = await $fetch(
          `/api/painting-progress?playerId=${playerId}&round=${round}&unitName=${encodeURIComponent(unitName)}`,
          { method: 'DELETE' }
        )
        if (response.success) {
          this.paintingProgress = this.paintingProgress.filter(p =>
            !(p.playerId === playerId && p.round === round && p.unitName === unitName)
          )
        }
        return response
      } catch (error) {
        console.error('Error deleting painting progress:', error)
        throw error
      }
    }
  }
})
