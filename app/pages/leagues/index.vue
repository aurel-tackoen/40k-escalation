<script setup>
  import { useLeaguesStore } from '~/stores/leagues'
  import { useAuthStore } from '~/stores/auth'
  import { Swords, Plus, Globe } from 'lucide-vue-next'
  import ConfirmationModal from '~/components/ConfirmationModal.vue'

  const authStore = useAuthStore()
  const leaguesStore = useLeaguesStore()
  const { myLeagues, publicLeagues, currentLeagueId } = storeToRefs(leaguesStore)

  // Local loading state to prevent flash
  const pageLoading = ref(true)

  // Delete confirmation modal
  const showDeleteModal = ref(false)
  const leagueToDelete = ref(null)

  // Computed to ensure stable public leagues list
  const hasPublicLeagues = computed(() => {
    return publicLeagues.value && Array.isArray(publicLeagues.value) && publicLeagues.value.length > 0
  })

  onMounted(async () => {
    try {
      // Ensure auth user is loaded first
      if (!authStore.user) {
        await authStore.fetchUser()
      }

      // Then fetch leagues data
      await leaguesStore.fetchMyLeagues()
      await leaguesStore.fetchPublicLeagues()
    } finally {
      pageLoading.value = false
    }
  })

  const switchToLeague = async (leagueId) => {
    await leaguesStore.switchLeague(leagueId)
    navigateTo('/dashboard')
  }

  const handleSettings = (leagueId) => {
    leaguesStore.currentLeagueId = leagueId
    navigateTo('/setup')
  }

  const handleLeave = async (leagueId, leagueName) => {
    if (confirm(`Are you sure you want to leave "${leagueName}"? This will delete your player profile in this league.`)) {
      const wasCurrentLeague = leagueId === currentLeagueId.value

      // Temporarily switch to the league we're leaving (if not already there)
      if (!wasCurrentLeague) {
        leaguesStore.currentLeagueId = leagueId
      }

      await leaguesStore.leaveLeague()

      // After leaving, navigate appropriately
      if (wasCurrentLeague) {
        // If we left the current league, navigate based on what's left
        if (myLeagues.value.length > 0) {
          // Store already switched to first available league
          navigateTo('/dashboard')
        } else {
          // No leagues left, go to leagues page
          navigateTo('/leagues')
        }
      }
      // If we weren't on this league, stay on leagues page (list refreshed)
    }
  }

  const handleDelete = async (leagueId, leagueName) => {
    // Store the league to delete
    leagueToDelete.value = { id: leagueId, name: leagueName }
    showDeleteModal.value = true
  }

  const confirmDeleteLeague = async () => {
    if (!leagueToDelete.value) return

    const { id: leagueId } = leagueToDelete.value
    const wasCurrentLeague = leagueId === currentLeagueId.value

    // Temporarily switch to the league we're deleting (if not already there)
    if (!wasCurrentLeague) {
      leaguesStore.currentLeagueId = leagueId
    }

    await leaguesStore.deleteLeague()

    // Close modal and reset
    showDeleteModal.value = false
    leagueToDelete.value = null

    // After deleting, navigate appropriately
    if (wasCurrentLeague) {
      if (myLeagues.value.length > 0) {
        navigateTo('/dashboard')
      } else {
        navigateTo('/leagues')
      }
    }
  }

  const cancelDeleteLeague = () => {
    showDeleteModal.value = false
    leagueToDelete.value = null
  }

  const handleJoin = (leagueId) => {
    navigateTo(`/leagues/join?leagueId=${leagueId}`)
  }
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div class="flex items-center gap-3">
          <Swords :size="32" class="text-yellow-500" />
          <div>
            <h2 class="text-2xl font-serif font-bold text-yellow-500">My Leagues</h2>
            <p class="text-gray-400 text-sm mt-1">Manage your escalation league campaigns</p>
          </div>
        </div>
        <div v-if="myLeagues && myLeagues.length > 0" class="flex gap-3">
          <NuxtLink
            to="/leagues/create"
            class="btn-primary flex items-center justify-center gap-2"
          >
            <Plus :size="20" />
            Create League
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pageLoading" class="py-12">
      <LoadingSpinner message="Loading Your Leagues" />
    </div>

    <!-- No Leagues State -->
    <div v-else-if="!myLeagues || myLeagues.length === 0" class="text-center py-12">
      <Swords :size="64" class="text-gray-600 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-gray-300 mb-2">No Leagues Yet</h2>
      <p class="text-gray-400 mb-6">Create your first league or join an existing one to get started</p>
      <div class="flex gap-4 justify-center">
        <NuxtLink to="/leagues/create" class="btn-primary flex items-center gap-2">
          <Plus :size="20" />
          Create League
        </NuxtLink>
      </div>
    </div>

    <!-- Leagues Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <LeagueCard
        v-for="league in myLeagues"
        :key="league.id"
        :league="league"
        variant="my-league"
        :is-current="league.id === currentLeagueId"
        @click="switchToLeague"
        @settings="handleSettings"
        @leave="handleLeave"
        @delete="handleDelete"
      />
    </div>

    <!-- Help Text -->
    <div v-if="myLeagues && myLeagues.length > 0" class="text-center text-gray-500 text-sm">
      Click on a league card to switch to it and view its dashboard
    </div>

    <!-- Public Leagues Section -->
    <div v-if="hasPublicLeagues" class="card">
      <div class="flex items-center gap-3">
        <Globe :size="32" class="text-yellow-500" />
        <div>
          <h2 class="text-2xl font-serif font-bold text-yellow-500">Public Leagues</h2>
          <p class="text-gray-400 text-sm mt-1">Discover and join public leagues</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <LeagueCard
        v-for="league in publicLeagues"
        :key="league.id"
        :league="league"
        variant="public"
        @join="handleJoin"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      title="Delete League"
      variant="danger"
      confirm-text="Delete League"
      cancel-text="Cancel"
      @confirm="confirmDeleteLeague"
      @cancel="cancelDeleteLeague"
      @close="cancelDeleteLeague"
    >
      <template #default>
        <div v-if="leagueToDelete" class="space-y-4">
          <p class="text-gray-200">
            Are you sure you want to delete <strong class="text-red-400">"{{ leagueToDelete.name }}"</strong>?
          </p>
          <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p class="text-red-300 font-semibold mb-2">This will permanently delete:</p>
            <ul class="text-red-200 space-y-1 text-sm">
              <li>• All players in this league</li>
              <li>• All army lists</li>
              <li>• All match records</li>
              <li>• All league data</li>
            </ul>
          </div>
          <p class="text-yellow-400 font-semibold">
            ⚠️ This action CANNOT be undone!
          </p>
        </div>
      </template>
    </ConfirmationModal>
  </div>
</template>
