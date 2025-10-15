<script setup>
  import { Swords, Loader2 } from 'lucide-vue-next'

  defineProps({
    message: {
      type: String,
      default: 'Loading...'
    },
    size: {
      type: String,
      default: 'normal', // 'small', 'normal', 'large'
      validator: (value) => ['small', 'normal', 'large'].includes(value)
    }
  })

  const getSwordSize = (size) => {
    switch (size) {
      case 'small': return 25
      case 'large': return 50
      default: return 40
    }
  }

  const getLoaderSize = (size) => {
    switch (size) {
      case 'small': return 60
      case 'large': return 100
      default: return 85
    }
  }
</script>

<template>
  <div class="loading-container" :class="`loading-${size}`">
    <div class="loading-spinner">
      <!-- Rotating loader ring -->
      <div class="loader-ring">
        <Loader2 :size="getLoaderSize(size)" :stroke-width="1" class="loader-icon" />
      </div>

      <!-- Centered sword icon -->
      <div class="sword-container">
        <Swords :size="getSwordSize(size)" :stroke-width="1.5" class="sword-icon" />
      </div>
    </div>

    <!-- Loading message -->
    <div class="loading-message">
      <span class="message-text">{{ message }}</span>
      <span class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&display=swap');

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
}

.loading-small {
  gap: 1rem;
  padding: 1rem;
}

.loading-large {
  gap: 2.5rem;
  padding: 3rem;
}

.loading-spinner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Rotating loader ring */
.loader-ring {
  position: absolute;
  animation: rotate 2s linear infinite;
}

.loader-icon {
  color: #facc15;
  filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.5))
          drop-shadow(0 0 12px rgba(250, 204, 21, 0.3));
}

/* Centered sword icon */
.sword-container {
  position: relative;
  z-index: 10;
  animation: pulse 2s ease-in-out infinite;
}

.sword-icon {
  color: #facc15;
  filter: drop-shadow(0 2px 0 rgba(217, 119, 6, 0.5))
          drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))
          drop-shadow(0 0 15px rgba(250, 204, 21, 0.6));
}

/* Loading message */
.loading-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Cinzel', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #facc15;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5),
               0 0 10px rgba(250, 204, 21, 0.3);
}

.loading-small .loading-message {
  font-size: 1rem;
}

.loading-large .loading-message {
  font-size: 1.5rem;
}

.message-text {
  animation: fadeInOut 2s ease-in-out infinite;
}

/* Animated dots */
.loading-dots {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #facc15;
  box-shadow: 0 0 8px rgba(250, 204, 21, 0.6);
  animation: dotPulse 1.4s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* Animations */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes dotPulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
