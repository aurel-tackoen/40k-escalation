<script setup>
  import { Swords } from 'lucide-vue-next'
</script>

<template>
  <div class="logo-container">

    <div class="logo logo-chrome">
      <!-- Responsive icon sizing: smaller on mobile -->
      <Swords :size="32" :stroke-width="1.5" class="sword-icon-chrome sm:hidden" />
      <Swords :size="60" :stroke-width="1.5" class="sword-icon-chrome hidden sm:block" />
      <div class="text-container">
        <span class="wars-chrome">War's</span>
        <span class="path-chrome">PATH</span>
      </div>
    </div>

    <div class="flex items-center gap-2 -mt-2 ml-2">
      <span class="mt-1 sm:mt-0text-xs sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-200 tracking-wider">
        ESCALATION LEAGUE <span class="hidden sm:inline">MANAGER</span>
      </span>
      <span class="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Exo+2:wght@600;700;800;900&display=swap');
</style>

<style scoped>

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Mobile: 0.5rem (8px) */
}

/* Responsive gap for larger screens */
@media (min-width: 640px) {
  .logo {
    gap: 1rem; /* Desktop: 1rem (16px) */
  }
}
.logo-chrome .sword-icon-chrome {
  color: #fbbf24;
  filter: drop-shadow(0 2px 0 rgba(217, 119, 6, 0.5))
          drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.logo-chrome .text-container {
  display: flex;
  align-items: baseline;
  gap: 0.0rem;
}

.logo-chrome .wars-chrome {
  margin-left: -0.5rem; /* Mobile: -0.5rem (reduced overlap) */
  font-family: 'Cinzel', serif;
  font-size: 2rem; /* Mobile: 1.75rem (28px) */
  font-weight: 900;
  background: linear-gradient(135deg,
    #fbbf24 0%,
    #f59e0b 25%,
    #d97706 50%,
    #f59e0b 75%,
    #fbbf24 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 0px;
  transform: translateY(-6px);
  animation: chrome-shine 8s ease-in-out infinite;
  filter: drop-shadow(0 2px 0 rgba(217, 119, 6, 0.5))
          drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

/* Responsive font sizing for larger screens */
@media (min-width: 640px) {
  .logo-chrome .wars-chrome {
    font-size: 3rem; /* Desktop: 3rem (48px) */
    margin-left: -1rem; /* Desktop: -1rem (original overlap) */
  }
}

@keyframes chrome-shine {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.logo-chrome .path-chrome {
  font-family: 'Exo 2', sans-serif;
  font-size: 2rem; /* Mobile: 1.5rem (24px) */
  font-weight: 800;
  background: linear-gradient(135deg,
    #e5e7eb 0%,
    #d1d5db 25%,
    #9ca3af 50%,
    #d1d5db 75%,
    #e5e7eb 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
transform: rotate(-3deg) translateY(8px) translateX(-10px);
  letter-spacing: 0px;
  animation: chrome-shine 8s ease-in-out infinite;
  filter: drop-shadow(0 2px 0 rgba(75, 85, 99, 0.4))
          drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3));
}

/* Responsive font sizing for larger screens */
@media (min-width: 640px) {
  .logo-chrome .path-chrome {
    font-size: 2.6rem; /* Desktop: 2.6rem (41.6px) */
  }
}
</style>
