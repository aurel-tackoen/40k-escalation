import { defineStore } from 'pinia'

export const useLeagueStore = defineStore('league', {
  state: () => ({
    currentLeague: {
      name: 'Autumn Escalation 2025',
      description: 'Progressive army building campaign',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      currentRound: 1,
      rounds: [
        { number: 1, name: 'Combat Patrol', pointLimit: 500, startDate: '2025-10-01', endDate: '2025-10-31' },
        { number: 2, name: 'Incursion', pointLimit: 1000, startDate: '2025-11-01', endDate: '2025-11-30' },
        { number: 3, name: 'Strike Force', pointLimit: 2000, startDate: '2025-12-01', endDate: '2025-12-31' }
      ]
    },
    players: [
      {
        id: 1,
        name: 'Magnus the Red',
        faction: 'Thousand Sons',
        email: 'magnus@prospero.com',
        wins: 3,
        losses: 1,
        draws: 0,
        totalPoints: 85
      },
      {
        id: 2,
        name: 'Roboute Guilliman',
        faction: 'Ultramarines',
        email: 'guilliman@ultramar.com',
        wins: 2,
        losses: 1,
        draws: 1,
        totalPoints: 72
      },
      {
        id: 3,
        name: 'Abaddon the Despoiler',
        faction: 'Chaos Space Marines',
        email: 'abaddon@eyeofterror.com',
        wins: 2,
        losses: 2,
        draws: 0,
        totalPoints: 68
      }
    ],
    matches: [
      {
        id: 1,
        round: 1,
        player1Id: 1,
        player2Id: 2,
        player1Points: 25,
        player2Points: 18,
        winnerId: 1,
        mission: 'Purge the Enemy',
        datePlayed: '2025-10-05',
        notes: 'Close game, came down to final turn'
      },
      {
        id: 2,
        round: 1,
        player1Id: 3,
        player2Id: 1,
        player1Points: 15,
        player2Points: 30,
        winnerId: 1,
        mission: 'Secure and Control',
        datePlayed: '2025-10-12',
        notes: 'Magnus dominated the psychic phase'
      }
    ],
    armies: [
      {
        id: 1,
        playerId: 1,
        round: 1,
        name: "Magnus's Psychic Legion",
        totalPoints: 500,
        units: [
          { id: 1, name: "Magnus the Red", points: 350, type: "HQ", equipment: "" },
          { id: 2, name: "Rubric Marines", points: 150, type: "Troops", equipment: "Inferno Boltguns" }
        ],
        isValid: true,
        lastModified: "2025-10-01"
      },
      {
        id: 2,
        playerId: 2,
        round: 1,
        name: "Ultramarines Strike Force",
        totalPoints: 485,
        units: [
          { id: 1, name: "Captain in Terminator Armour", points: 95, type: "HQ", equipment: "Thunder Hammer & Storm Shield" },
          { id: 2, name: "Tactical Squad", points: 140, type: "Troops", equipment: "Boltguns" },
          { id: 3, name: "Terminator Squad", points: 250, type: "Elites", equipment: "Power Fists & Storm Bolters" }
        ],
        isValid: true,
        lastModified: "2025-10-02"
      }
    ]
  }),

  getters: {
    league: (state) => state.currentLeague
  },

  actions: {
    addPlayer(player) {
      const newPlayer = {
        ...player,
        id: this.players.length + 1,
        wins: 0,
        losses: 0,
        draws: 0,
        totalPoints: 0
      }
      this.players.push(newPlayer)
    },

    removePlayer(playerId) {
      this.players = this.players.filter(p => p.id !== playerId)
    },

    addMatch(match) {
      const newMatch = {
        ...match,
        id: this.matches.length + 1
      }
      this.matches.push(newMatch)
      this.updatePlayerStats(newMatch)
    },

    updatePlayerStats(match) {
      const player1 = this.players.find(p => p.id === match.player1Id)
      const player2 = this.players.find(p => p.id === match.player2Id)
      
      if (player1) {
        player1.totalPoints += match.player1Points
        if (match.winnerId === match.player1Id) {
          player1.wins++
        } else if (match.winnerId === match.player2Id) {
          player1.losses++
        } else {
          player1.draws++
        }
      }
      
      if (player2) {
        player2.totalPoints += match.player2Points
        if (match.winnerId === match.player2Id) {
          player2.wins++
        } else if (match.winnerId === match.player1Id) {
          player2.losses++
        } else {
          player2.draws++
        }
      }
    },

    updateLeague(league) {
      this.currentLeague = { ...league }
    },

    saveArmy(army) {
      const existingIndex = this.armies.findIndex(a => 
        a.playerId === army.playerId && a.round === army.round
      )
      
      if (existingIndex !== -1) {
        this.armies[existingIndex] = {
          ...army,
          id: this.armies[existingIndex].id,
          lastModified: new Date().toISOString().split('T')[0]
        }
      } else {
        const newArmy = {
          ...army,
          id: this.armies.length + 1,
          lastModified: new Date().toISOString().split('T')[0]
        }
        this.armies.push(newArmy)
      }
    },

    deleteArmy(playerId, round) {
      this.armies = this.armies.filter(a => 
        !(a.playerId === playerId && a.round === round)
      )
    }
  }
})
