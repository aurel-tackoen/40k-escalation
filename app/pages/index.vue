<script setup>
  import { Swords, Users, Trophy, Lock, Globe, UserPlus, LogIn } from 'lucide-vue-next'
  import { useAuthStore } from '~/stores/auth'
  import { useLeaguesStore } from '~/stores/leagues'

  const authStore = useAuthStore()
  const leaguesStore = useLeaguesStore()
  const { publicLeagues, loading } = storeToRefs(leaguesStore)

  // Fetch public leagues
  onMounted(async () => {
    await leaguesStore.fetchPublicLeagues()
  })

  const handleJoin = () => {
    authStore.login('signup')
  }
</script>

<template>
  <div class="-mx-4 -my-8">
    <!-- Hero Section - Full Width -->
    <div class="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-b border-yellow-600/40 overflow-hidden">
      <!-- Smoke Particle Effect -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- Multiple layers for depth -->
        <div class="smoke-particle smoke-1"></div>
        <div class="smoke-particle smoke-2"></div>
        <div class="smoke-particle smoke-3"></div>
        <div class="smoke-particle smoke-4"></div>
        <div class="smoke-particle smoke-5"></div>
        <div class="smoke-particle smoke-6"></div>
        <div class="smoke-particle smoke-7"></div>
        <div class="smoke-particle smoke-8"></div>
        <div class="smoke-particle smoke-9"></div>
        <div class="smoke-particle smoke-10"></div>
        <div class="smoke-particle smoke-11"></div>
        <div class="smoke-particle smoke-12"></div>
        <div class="smoke-particle smoke-13"></div>
        <div class="smoke-particle smoke-14"></div>
        <div class="smoke-particle smoke-15"></div>
      </div>

      <div class="relative px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
        <div class="flex justify-center mb-6">
          <Swords :size="72" class="text-yellow-500" />
        </div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-100 mb-5 font-serif">
          War's Path
        </h1>
        <p class="text-xl sm:text-2xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 font-bold mb-6 tracking-widest">
          ESCALATION LEAGUE MANAGER
        </p>
        <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 px-4">
          Organize and track your Warhammer escalation campaigns with ease.
          Manage players, armies, matches, and painting progress all in one place.
        </p>

        <!-- Authenticated User Buttons -->
        <div v-if="authStore.isAuthenticated" class="flex flex-wrap gap-4 justify-center">
          <NuxtLink
            to="/leagues"
            class="btn-primary text-lg px-8 py-3 flex items-center gap-2"
          >
            <Swords :size="20" />
            My Leagues
          </NuxtLink>
          <NuxtLink
            to="/leagues"
            class="btn-login text-lg px-8 py-3 flex items-center gap-2"
          >
            <Globe :size="20" />
            Browse Leagues
          </NuxtLink>
        </div>

        <!-- Non-Authenticated User Buttons -->
        <div v-else class="flex flex-wrap gap-4 justify-center">
          <button
            @click="authStore.login('signup')"
            class="btn-primary text-lg px-8 py-3 flex items-center gap-2"
          >
            <UserPlus :size="20" />
            Create Account
          </button>
          <button
            @click="authStore.login()"
            class="btn-login text-lg px-8 py-3 flex items-center gap-2"
          >
            <LogIn :size="20" />
            Login
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-gray-900 py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-100 mb-12">
          Features
        </h2>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-colors">
            <Users :size="40" class="text-yellow-500 mb-4" />
            <h3 class="text-xl font-bold text-gray-100 mb-2">Player Management</h3>
            <p class="text-gray-400">
              Track players, their factions, win/loss records, and battle points across the campaign.
            </p>
          </div>
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-colors">
            <Trophy :size="40" class="text-yellow-500 mb-4" />
            <h3 class="text-xl font-bold text-gray-100 mb-2">Match Recording</h3>
            <p class="text-gray-400">
              Log battle results, track win streaks, and analyze match statistics with detailed analytics.
            </p>
          </div>
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-colors">
            <Swords :size="40" class="text-yellow-500 mb-4" />
            <h3 class="text-xl font-bold text-gray-100 mb-2">Army List Builder</h3>
            <p class="text-gray-400">
              Build armies with point validation, track painting progress, and manage escalation across rounds.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Multi-Game System Support Section -->
    <div class="bg-gray-900 py-16 border-y border-gray-700">
      <div class="container mx-auto px-4">
        <div class="max-w-5xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-gray-100 mb-4">
            Support for Multiple Game Systems
          </h2>
          <p class="text-center text-yellow-400 text-lg mb-12 font-semibold">
            Each game has its own unique match recording system
          </p>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <!-- Warhammer 40k / AoS / Horus Heresy -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-colors">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 class="text-lg font-bold text-gray-100">Victory Points</h3>
              </div>
              <p class="text-sm text-gray-400 mb-3">
                <span class="font-semibold text-gray-300">Warhammer 40,000</span><br>
                <span class="font-semibold text-gray-300">Age of Sigmar</span><br>
                <span class="font-semibold text-gray-300">The Horus Heresy</span>
              </p>
              <p class="text-gray-400 text-sm">
                Record matches using victory points (0-100). Track primary and secondary objectives to determine the winner.
              </p>
            </div>

            <!-- The Old World -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-colors">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-3 h-3 bg-amber-500 rounded-full"></div>
                <h3 class="text-lg font-bold text-gray-100">Percentage/Casualties</h3>
              </div>
              <p class="text-sm text-gray-400 mb-3">
                <span class="font-semibold text-gray-300">The Old World</span>
              </p>
              <p class="text-gray-400 text-sm">
                Calculate margin of victory based on army values and casualties inflicted. Supports Crushing Victory, Solid Victory, Minor Victory, and Draws.
              </p>
            </div>

            <!-- MESBG -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-600 transition-colors">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 class="text-lg font-bold text-gray-100">Scenario Objectives</h3>
              </div>
              <p class="text-sm text-gray-400 mb-3">
                <span class="font-semibold text-gray-300">Middle-Earth SBG</span>
              </p>
              <p class="text-gray-400 text-sm">
                Track scenario objectives and objective completion. Winner determined by objectives first, then casualties as a tiebreaker.
              </p>
            </div>
          </div>

          <div class="bg-gray-800/50 border border-yellow-600/30 rounded-lg p-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <Trophy :size="32" class="text-yellow-500" />
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-100 mb-2">Automatic Match Type Detection</h3>
                <p class="text-gray-400 mb-4">
                  When you create a league and select a game system, the match recording form automatically adapts to that game's scoring system.
                  No manual configuration needed—just pick your game and start recording battles!
                </p>
                <ul class="space-y-2 text-sm text-gray-400">
                  <li class="flex items-start gap-2">
                    <span class="text-yellow-500 mt-1">•</span>
                    <span><strong class="text-gray-300">Victory Points leagues</strong> show VP input fields (0-100)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-yellow-500 mt-1">•</span>
                    <span><strong class="text-gray-300">The Old World leagues</strong> show army value and casualties with automatic margin calculation</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-yellow-500 mt-1">•</span>
                    <span><strong class="text-gray-300">MESBG leagues</strong> show objective descriptions and completion checkboxes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Why Escalation League Section -->
    <div class="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 py-16 border border-gray-700 rounded-lg mb-8">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-gray-100 mb-4">
            Why an Escalation League?
          </h2>
          <p class="text-center text-yellow-400 text-lg mb-12 font-semibold">
            The perfect way to grow your army and skills together
          </p>

          <div class="space-y-8">
            <!-- Benefit 1 -->
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-yellow-600/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <span class="text-2xl font-bold text-yellow-500">1</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-100 mb-2">Lower Entry Barrier</h3>
                  <p class="text-gray-400">
                    Start with just 500 points instead of a full 2000-point army. Perfect for new players or those testing a new faction.
                    You can begin playing before your entire collection is painted!
                  </p>
                </div>
              </div>
            </div>

            <!-- Benefit 2 -->
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-yellow-600/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <span class="text-2xl font-bold text-yellow-500">2</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-100 mb-2">Progressive Learning</h3>
                  <p class="text-gray-400">
                    Master your army's core units before adding complexity. Each round introduces new strategies and synergies
                    as your force grows from 500 to 1000, 1500, and finally 2000 points.
                  </p>
                </div>
              </div>
            </div>

            <!-- Benefit 3 -->
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-yellow-600/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <span class="text-2xl font-bold text-yellow-500">3</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-100 mb-2">Painting Motivation</h3>
                  <p class="text-gray-400">
                    Stay motivated with manageable painting goals each round. Track your progress and compete on the painting leaderboard
                    as you build towards a fully painted army worthy of the tabletop!
                  </p>
                </div>
              </div>
            </div>

            <!-- Benefit 4 -->
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-yellow-600/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <span class="text-2xl font-bold text-yellow-500">4</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-100 mb-2">Community Building</h3>
                  <p class="text-gray-400">
                    Grow together with your local gaming group. Everyone starts on equal footing and progresses together,
                    fostering a supportive community and creating memorable campaign moments.
                  </p>
                </div>
              </div>
            </div>

            <!-- Benefit 5 -->
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-yellow-600/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <span class="text-2xl font-bold text-yellow-500">5</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-100 mb-2">Budget-Friendly</h3>
                  <p class="text-gray-400">
                    Spread your hobby purchases over time instead of buying everything at once. Each round gives you weeks to acquire,
                    build, and paint your next units—making the hobby more accessible and sustainable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="mt-12 text-center">
            <p class="text-gray-300 text-lg mb-6">
              Ready to embark on your escalation journey?
            </p>
            <div v-if="authStore.isAuthenticated" class="flex flex-wrap gap-4 justify-center">
              <NuxtLink
                to="/leagues"
                class="btn-primary text-base px-6 py-3 flex items-center gap-2"
              >
                <Swords :size="18" />
                Create Your League
              </NuxtLink>
            </div>
            <div v-else>
              <button
                @click="authStore.login('signup')"
                class="btn-primary text-base px-6 py-3 inline-flex items-center gap-2"
              >
                <UserPlus :size="18" />
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Public Leagues Section -->
    <div class="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gray-850 py-16  border-y border-yellow-600/20">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-100 mb-4">
          Join a Public League
        </h2>
        <p class="text-center text-gray-400 mb-12">
          Browse active campaigns and join the battle!
        </p>

        <!-- Loading State -->
        <div v-if="loading" class="py-8">
          <LoadingSpinner message="Loading Public Leagues" />
        </div>

        <!-- Error State -->
        <div v-else-if="leaguesStore.error" class="text-center py-8">
          <p class="text-red-400">{{ leaguesStore.error }}</p>
        </div>

        <!-- No Leagues -->
        <div v-else-if="publicLeagues.length === 0" class="text-center py-12">
          <Globe :size="64" class="text-gray-600 mx-auto mb-4" />
          <p class="text-gray-400 text-lg">No public leagues available at the moment.</p>
          <p class="text-gray-500 mt-2">Create an account to start your own league!</p>
        </div>

        <!-- Leagues Grid -->
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <LeagueCard
            v-for="league in publicLeagues"
            :key="league.id"
            :league="league"
            variant="public-guest"
            @join="handleJoin"
          />
        </div>

        <div class="text-center mt-12">
          <p class="text-gray-400 mb-4">
            Want to create your own private league?
          </p>
          <NuxtLink
            to="/api/auth/login"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-100 font-semibold rounded-lg border border-gray-600 hover:border-yellow-600 hover:bg-gray-600 transition-all duration-300"
          >
            <Lock :size="18" />
            <span>Create Private League</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced Smoke Particle Effect with Wow Factor */
.smoke-particle {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.075) 30%, rgba(255, 255, 255, 0.025) 60%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
  filter: blur(8px);
  mix-blend-mode: screen;
  will-change: transform, opacity;
}

/* Layer 1 - Bottom particles (fastest, most visible) */
.smoke-1 {
  width: 250px;
  height: 250px;
  left: 5%;
  bottom: -280px;
  animation: floatUpFast 12s infinite ease-out;
  animation-delay: 0s;
}

.smoke-2 {
  width: 200px;
  height: 200px;
  left: 18%;
  bottom: -230px;
  animation: floatUpFast 14s infinite ease-out;
  animation-delay: 2s;
}

.smoke-3 {
  width: 220px;
  height: 220px;
  left: 32%;
  bottom: -250px;
  animation: floatUpFast 13s infinite ease-out;
  animation-delay: 4s;
}

.smoke-4 {
  width: 240px;
  height: 240px;
  left: 48%;
  bottom: -270px;
  animation: floatUpFast 15s infinite ease-out;
  animation-delay: 1s;
}

.smoke-5 {
  width: 210px;
  height: 210px;
  left: 65%;
  bottom: -240px;
  animation: floatUpFast 13.5s infinite ease-out;
  animation-delay: 3s;
}

.smoke-6 {
  width: 230px;
  height: 230px;
  left: 78%;
  bottom: -260px;
  animation: floatUpFast 14.5s infinite ease-out;
  animation-delay: 5s;
}

.smoke-7 {
  width: 195px;
  height: 195px;
  left: 92%;
  bottom: -220px;
  animation: floatUpFast 12.5s infinite ease-out;
  animation-delay: 2.5s;
}

/* Layer 2 - Middle particles (medium speed) */
.smoke-8 {
  width: 180px;
  height: 180px;
  left: 12%;
  bottom: -230px;
  animation: floatUpMedium 16s infinite ease-in-out;
  animation-delay: 1.5s;
  filter: blur(10px);
  opacity: 0.4;
}

.smoke-9 {
  width: 190px;
  height: 190px;
  left: 38%;
  bottom: -240px;
  animation: floatUpMedium 17s infinite ease-in-out;
  animation-delay: 3.5s;
  filter: blur(10px);
  opacity: 0.4;
}

.smoke-10 {
  width: 175px;
  height: 175px;
  left: 58%;
  bottom: -220px;
  animation: floatUpMedium 15.5s infinite ease-in-out;
  animation-delay: 5.5s;
  filter: blur(10px);
  opacity: 0.4;
}

.smoke-11 {
  width: 185px;
  height: 185px;
  left: 85%;
  bottom: -230px;
  animation: floatUpMedium 16.5s infinite ease-in-out;
  animation-delay: 0.5s;
  filter: blur(10px);
  opacity: 0.4;
}

/* Layer 3 - Background particles (slowest, most subtle) */
.smoke-12 {
  width: 300px;
  height: 300px;
  left: 20%;
  bottom: -330px;
  animation: floatUpSlow 20s infinite ease-in;
  animation-delay: 2s;
  filter: blur(15px);
  opacity: 0.3;
}

.smoke-13 {
  width: 280px;
  height: 280px;
  left: 50%;
  bottom: -320px;
  animation: floatUpSlow 22s infinite ease-in;
  animation-delay: 6s;
  filter: blur(15px);
  opacity: 0.3;
}

.smoke-14 {
  width: 320px;
  height: 320px;
  left: 70%;
  bottom: -350px;
  animation: floatUpSlow 21s infinite ease-in;
  animation-delay: 4s;
  filter: blur(15px);
  opacity: 0.3;
}

.smoke-15 {
  width: 290px;
  height: 290px;
  left: 10%;
  bottom: -325px;
  animation: floatUpSlow 19s infinite ease-in;
  animation-delay: 8s;
  filter: blur(15px);
  opacity: 0.3;
}

/* Fast floating animation - Front layer */
@keyframes floatUpFast {
  0% {
    transform: translateY(0) translateX(0) scale(0.6) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  30% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.25;
    transform: translateY(-500px) translateX(80px) scale(1.4) rotate(45deg);
  }
  70% {
    opacity: 0.15;
  }
  90% {
    opacity: 0.05;
  }
  100% {
    transform: translateY(-900px) translateX(-50px) scale(2) rotate(90deg);
    opacity: 0;
  }
}

/* Medium floating animation - Middle layer */
@keyframes floatUpMedium {
  0% {
    transform: translateY(0) translateX(0) scale(0.7) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 0.25;
  }
  40% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.2;
    transform: translateY(-450px) translateX(-60px) scale(1.3) rotate(-30deg);
  }
  80% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-850px) translateX(70px) scale(1.8) rotate(-60deg);
    opacity: 0;
  }
}

/* Slow floating animation - Background layer */
@keyframes floatUpSlow {
  0% {
    transform: translateY(0) translateX(0) scale(0.8) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.15;
    transform: translateY(-400px) translateX(40px) scale(1.2) rotate(20deg);
  }
  85% {
    opacity: 0.075;
  }
  100% {
    transform: translateY(-800px) translateX(-80px) scale(1.6) rotate(40deg);
    opacity: 0;
  }
}
</style>
