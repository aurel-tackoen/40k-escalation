<template>
  <div class="space-y-8">
    <!-- League Settings -->
    <div class="card">
      <h3 class="text-2xl font-gothic font-bold text-yellow-500 mb-6">League Configuration</h3>
      <form @submit.prevent="saveLeague" class="space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">League Name</label>
            <input 
              v-model="editableLeague.name"
              type="text" 
              required
              class="input-field"
              placeholder="Enter league name"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">Current Round</label>
            <select v-model.number="editableLeague.currentRound" class="input-field">
              <option v-for="round in editableLeague.rounds" :key="round.number" :value="round.number">
                Round {{ round.number }} - {{ round.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-yellow-500 mb-2">Description</label>
          <textarea 
            v-model="editableLeague.description"
            class="input-field"
            rows="3"
            placeholder="Describe your escalation league..."
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">League Start Date</label>
            <input 
              v-model="editableLeague.startDate"
              type="date" 
              required
              class="input-field"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-yellow-500 mb-2">League End Date</label>
            <input 
              v-model="editableLeague.endDate"
              type="date" 
              required
              class="input-field"
            />
          </div>
        </div>

        <button type="submit" class="btn-primary">
          Save League Settings
        </button>
      </form>
    </div>

    <!-- Round Configuration -->
    <div class="card">
      <h3 class="text-2xl font-gothic font-bold text-yellow-500 mb-6">Round Configuration</h3>
      
      <div class="space-y-4">
        <div 
          v-for="(round, index) in editableLeague.rounds" 
          :key="round.number"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold text-yellow-500">Round {{ round.number }}</h4>
            <button 
              v-if="editableLeague.rounds.length > 1"
              @click="removeRound(index)"
              class="text-red-400 hover:text-red-300 transition-colors"
              title="Remove Round"
            >
              Remove
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">Round Name</label>
              <input 
                v-model="round.name"
                type="text" 
                required
                class="input-field"
                placeholder="e.g., Combat Patrol"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">Point Limit</label>
              <input 
                v-model.number="round.pointLimit"
                type="number" 
                min="500"
                max="3000"
                step="250"
                required
                class="input-field"
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">Start Date</label>
              <input 
                v-model="round.startDate"
                type="date" 
                required
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-yellow-500 mb-2">End Date</label>
              <input 
                v-model="round.endDate"
                type="date" 
                required
                class="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      <button @click="addRound" class="btn-secondary mt-4">
        Add New Round
      </button>
    </div>

    <!-- Scoring Rules -->
    <div class="card">
      <h3 class="text-2xl font-gothic font-bold text-yellow-500 mb-6">Scoring & Rules</h3>
      
      <div class="space-y-6">
        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Victory Points System</h4>
          <div class="text-gray-300 space-y-2">
            <p>• <strong>Primary Objectives:</strong> Up to 45 Victory Points</p>
            <p>• <strong>Secondary Objectives:</strong> Up to 15 Victory Points per objective (max 3)</p>
            <p>• <strong>Match Results:</strong> Win = 3 League Points, Draw = 1 League Point, Loss = 0 League Points</p>
          </div>
        </div>

        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Army Building Rules</h4>
          <div class="text-gray-300 space-y-2">
            <p>• Players must stay within the point limit for each round</p>
            <p>• Army lists should be submitted before each round begins</p>
            <p>• Players may modify their army between rounds</p>
            <p>• All models must be WYSIWYG (What You See Is What You Get)</p>
          </div>
        </div>

        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Match Requirements</h4>
          <div class="text-gray-300 space-y-2">
            <p>• Each player must play at least one match per round</p>
            <p>• Matches should be completed within the round timeframe</p>
            <p>• Results must be reported within 48 hours of completion</p>
            <p>• Disputes should be resolved by the league organizer</p>
          </div>
        </div>

        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">League Standings</h4>
          <div class="text-gray-300 space-y-2">
            <p>• Ranked by total wins, then by total Victory Points scored</p>
            <p>• Ties broken by head-to-head record</p>
            <p>• Final standings determine league champion</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Export/Import -->
    <div class="card">
      <h3 class="text-2xl font-gothic font-bold text-yellow-500 mb-6">Data Management</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Export League Data</h4>
          <p class="text-gray-300 mb-4">Download all league data as JSON for backup or sharing.</p>
          <button @click="exportData" class="btn-primary">
            Export Data
          </button>
        </div>
        
        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-yellow-500 mb-3">Import League Data</h4>
          <p class="text-gray-300 mb-4">Upload a previously exported league data file.</p>
          <input 
            ref="fileInput"
            type="file" 
            accept=".json"
            @change="importData"
            class="hidden"
          />
          <button @click="$refs.fileInput.click()" class="btn-secondary">
            Import Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeagueSetupView',
  props: {
    league: {
      type: Object,
      required: true
    }
  },
  emits: ['update-league'],
  data() {
    return {
      editableLeague: JSON.parse(JSON.stringify(this.league))
    }
  },
  watch: {
    league: {
      handler(newLeague) {
        this.editableLeague = JSON.parse(JSON.stringify(newLeague))
      },
      deep: true
    }
  },
  methods: {
    saveLeague() {
      // Sort rounds by number
      this.editableLeague.rounds.sort((a, b) => a.number - b.number)
      this.$emit('update-league', this.editableLeague)
      
      // Show success message (you could use a toast notification library)
      alert('League settings saved successfully!')
    },
    addRound() {
      const newRoundNumber = Math.max(...this.editableLeague.rounds.map(r => r.number)) + 1
      const lastRound = this.editableLeague.rounds[this.editableLeague.rounds.length - 1]
      
      // Calculate next point limit (add 500-1000 points)
      const nextPointLimit = lastRound.pointLimit + (lastRound.pointLimit < 1000 ? 500 : 1000)
      
      // Set start date to day after last round ends
      const startDate = new Date(lastRound.endDate)
      startDate.setDate(startDate.getDate() + 1)
      
      // Set end date to 4 weeks later
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 28)
      
      this.editableLeague.rounds.push({
        number: newRoundNumber,
        name: `Round ${newRoundNumber}`,
        pointLimit: nextPointLimit,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })
    },
    removeRound(index) {
      if (this.editableLeague.rounds.length > 1) {
        this.editableLeague.rounds.splice(index, 1)
        
        // Renumber remaining rounds
        this.editableLeague.rounds.forEach((round, i) => {
          round.number = i + 1
        })
        
        // Ensure current round is valid
        const maxRound = Math.max(...this.editableLeague.rounds.map(r => r.number))
        if (this.editableLeague.currentRound > maxRound) {
          this.editableLeague.currentRound = maxRound
        }
      }
    },
    exportData() {
      // Get all app data (you'd need to pass this from parent or use a store)
      const exportData = {
        league: this.editableLeague,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `wh40k-league-${this.editableLeague.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    },
    importData(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)
          
          if (importedData.league) {
            this.editableLeague = importedData.league
            alert('League data imported successfully!')
          } else {
            alert('Invalid file format. Please select a valid league export file.')
          }
        } catch (_error) {
          alert('Error reading file. Please ensure it\'s a valid JSON file.')
        }
      }
      reader.readAsText(file)
      
      // Reset file input
      event.target.value = ''
    }
  }
}
</script>