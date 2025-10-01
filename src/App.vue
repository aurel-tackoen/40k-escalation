<template>
  <div id="app" class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-yellow-500 shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-yellow-500">
              ⚔️ Warhammer 40K Escalation League
            </h1>
          </div>
          <nav class="flex space-x-6">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-4 py-2 rounded-lg font-semibold transition-colors',
                activeTab === tab.id 
                  ? 'bg-yellow-500 text-gray-900' 
                  : 'text-gray-100 hover:bg-gray-700'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'" class="space-y-8">
        <DashboardView :league="currentLeague" :players="players" :matches="matches" :armies="armies" />
      </div>

      <!-- Players Tab -->
      <div v-if="activeTab === 'players'" class="space-y-8">
        <PlayersView :players="players" @add-player="addPlayer" @remove-player="removePlayer" />
      </div>

      <!-- Army Lists Tab -->
      <div v-if="activeTab === 'armies'" class="space-y-8">
        <ArmyListsView 
          :players="players" 
          :armies="armies" 
          :current-round="currentLeague.currentRound"
          :rounds="currentLeague.rounds"
          @save-army="saveArmy" 
          @delete-army="deleteArmy" 
        />
      </div>

      <!-- Matches Tab -->
      <div v-if="activeTab === 'matches'" class="space-y-8">
        <MatchesView :matches="matches" :players="players" @add-match="addMatch" />
      </div>

      <!-- League Setup Tab -->
      <div v-if="activeTab === 'setup'" class="space-y-8">
        <LeagueSetupView :league="currentLeague" @update-league="updateLeague" />
      </div>
    </main>
  </div>
</template>

<script>
import DashboardView from './components/DashboardView.vue'
import PlayersView from './components/PlayersView.vue'
import ArmyListsView from './components/ArmyListsView.vue'
import MatchesView from './components/MatchesView.vue'
import LeagueSetupView from './components/LeagueSetupView.vue'

export default {
  name: 'App',
  components: {
    DashboardView,
    PlayersView,
    ArmyListsView,
    MatchesView,
    LeagueSetupView
  },
  data() {
    return {
      activeTab: 'dashboard',
      tabs: [
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'players', name: 'Players' },
        { id: 'armies', name: 'Army Lists' },
        { id: 'matches', name: 'Matches' },
        { id: 'setup', name: 'League Setup' }
      ],
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
    }
  },
  methods: {
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
}
</script>
