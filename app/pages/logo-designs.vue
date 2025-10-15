<script setup>
  // Logo design inspiration page - not linked in navigation
  import { Swords } from 'lucide-vue-next'
</script>

<template>
  <div class="logo-showcase">
    <div class="container">
      <h1 class="page-title">War's Path - Logo Design Options</h1>
      <p class="subtitle">Logo inspiration concepts for the header</p>

      <div class="logo-grid">
        <!-- NEW: Yellow War's + Grey Path with Rotation -->
        <div class="logo-card featured">
          <div class="logo-preview">
            <div class="logo logo-new-1">
              <Swords :size="64" :stroke-width="1.5" class="sword-left" />
              <div class="text-stacked">
                <span class="wars-text">War's</span>
                <span class="path-text">Path</span>
              </div>
            </div>
          </div>
          <p class="logo-description">⭐ Yellow "War's" + Grey "Path" with rotation</p>
        </div>

        <!-- NEW 2: Yellow War's + Grey Path - Stacked -->
        <div class="logo-card featured">
          <div class="logo-preview">
            <div class="logo logo-new-2">
              <Swords :size="64" :stroke-width="1.5" class="sword-left" />
              <div class="stacked-logo">
                <span class="wars-yellow">War's</span>
                <span class="path-grey">Path</span>
              </div>
            </div>
          </div>
          <p class="logo-description">⭐ Stacked version with bold styling</p>
        </div>

        <!-- NEW 3: Yellow War's + Grey Path - With Icon -->
        <div class="logo-card featured">
          <div class="logo-preview">
            <div class="logo logo-new-3">
              <Swords :size="80" :stroke-width="1.5" class="accent-icon" />
              <div class="text-combo">
                <span class="wars-yellow">War's</span>
                <span class="path-grey">Path</span>
              </div>
            </div>
          </div>
          <p class="logo-description">⭐ With progress path icon</p>
        </div>

        <!-- NEW 4: Minimal Clean Version -->
        <div class="logo-card featured">
          <div class="logo-preview">
            <div class="logo logo-new-4">
              <Swords :size="72" :stroke-width="1.5" class="sword-left" />
              <div class="text-stacked">
                <span class="wars-bold">War's</span>
                <span class="path-rotated">Path</span>
              </div>
            </div>
          </div>
          <p class="logo-description">⭐ Clean minimal with subtle rotation</p>
        </div>

        <!-- NEW 5: With Slash Separator -->
        <div class="logo-card featured">
          <div class="logo-preview">
            <div class="logo logo-new-5">
              <Swords :size="64" :stroke-width="1.5" class="sword-left" />
              <div class="text-with-separator">
                <span class="wars-glow">War's</span>
                <span class="separator">/</span>
                <span class="path-italic">Path</span>
              </div>
            </div>
          </div>
          <p class="logo-description">⭐ With slash separator</p>
        </div>
      </div>

      <div class="usage-note">
        <h2>Usage Instructions</h2>
        <p>Access this page at: <code>/logo-designs</code></p>
        <p>Copy the logo HTML/CSS you like into the header component</p>
        <p>This page is not linked in the navigation menu</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Container */
.logo-showcase {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 4rem 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-title {
  font-size: 3rem;
  font-weight: 900;
  text-align: center;
  color: #e94560;
  text-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
  font-family: Cinzel, serif;
}

.subtitle {
  text-align: center;
  color: #a8b2d1;
  font-size: 1.2rem;
  margin-bottom: 3rem;
}

/* Logo Grid */
.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.logo-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(233, 69, 96, 0.3);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.logo-card.featured {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.05);
}

.logo-card:hover {
  border-color: #e94560;
  box-shadow: 0 8px 32px rgba(233, 69, 96, 0.3);
  transform: translateY(-4px);
}

.logo-card.featured:hover {
  border-color: #ffd700;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
}

.logo-preview {
  background: #0f0f23;
  border-radius: 8px;
  padding: 3rem 2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.logo-description {
  text-align: center;
  color: #8892b0;
  font-size: 0.9rem;
  font-style: italic;
}

/* NEW LOGOS: Yellow War's + Grey Path */

/* Sword icon (shared across all logos) - Using Lucide Swords */
.sword-left {
  color: #ffd700;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
  flex-shrink: 0;
  margin-right: 1rem;
}

.accent-icon {
  color: #ffd700;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
  flex-shrink: 0;
}

/* Logo New 1: Side by side with rotation */
.logo-new-1 {
  gap: 0;
  position: relative;
  align-items: center;
}

.text-stacked {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0;
}

.wars-text {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: Cinzel, serif;
  color: #ffd700;
  letter-spacing: 1px;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  position: relative;
  z-index: 1;
}

.path-text {
  font-size: 2.5rem;
  font-weight: 900;
  color: #8892b0;
  letter-spacing: 1px;
  transform: rotate(-3deg);
  display: inline-block;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  margin-left: -0.15em;
  position: relative;
  z-index: 2;
}

/* Logo New 2: Stacked version */
.logo-new-2 {
  gap: 1rem;
  align-items: center;
}

.logo-new-2 .stacked-logo {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0;
}

.wars-yellow {
  font-size: 2.2rem;
  font-weight: 700;
  font-family: Cinzel, serif;
  color: #ffd700;
  letter-spacing: 3px;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  position: relative;
  z-index: 1;
}

.path-grey {
  font-size: 2.2rem;
  font-weight: 900;
  color: #8892b0;
  letter-spacing: 3px;
  transform: rotate(-2deg);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  margin-left: -0.15em;
  position: relative;
  z-index: 2;
}

/* Logo New 3: With icon */
.logo-new-3 {
  gap: 1rem;
  flex-direction: column;
}

.text-combo {
  display: flex;
  flex-direction: row;
  gap: 0;
  align-items: baseline;
  position: relative;
}

.text-combo .wars-yellow {
  position: relative;
  z-index: 1;
}

.text-combo .path-grey {
  margin-left: -0.15em;
  position: relative;
  z-index: 2;
}

/* Logo New 4: Minimal clean */
.logo-new-4 {
  gap: 0;
  position: relative;
  align-items: center;
}

.logo-new-4 .text-stacked {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0;
}

.wars-bold {
  font-size: 2.8rem;
  font-weight: 700;
  font-family: Cinzel, serif;
  color: #ffd700;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
  position: relative;
  z-index: 1;
}

.path-rotated {
  font-size: 2.8rem;
  font-weight: 700;
  color: #a0aec0;
  letter-spacing: 2px;
  transform: rotate(-4deg);
  display: inline-block;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.6);
  margin-left: -0.15em;
  position: relative;
  z-index: 2;
}

/* Logo New 5: With slash */
.logo-new-5 {
  gap: 0;
  align-items: center;
  position: relative;
}

.text-with-separator {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0;
  position: relative;
}

.wars-glow {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: Cinzel, serif;
  color: #ffd700;
  letter-spacing: 1px;
  text-shadow:
    0 0 10px rgba(255, 215, 0, 0.8),
    0 0 20px rgba(255, 215, 0, 0.5);
  position: relative;
  z-index: 1;
}

.separator {
  font-size: 2rem;
  font-weight: 300;
  color: #4a5568;
  margin: 0 0.5rem;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.path-italic {
  font-size: 2.5rem;
  font-weight: 700;
  color: #8892b0;
  font-style: italic;
  transform: rotate(-3deg);
  display: inline-block;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  margin-left: -0.15em;
  position: relative;
  z-index: 2;
}

/* Usage Note */
.usage-note {
  background: rgba(233, 69, 96, 0.1);
  border: 2px solid #e94560;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 3rem;
}

.usage-note h2 {
  color: #e94560;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 900;
}

.usage-note p {
  color: #a8b2d1;
  margin-bottom: 0.5rem;
}

.usage-note code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  color: #e94560;
  font-family: 'Courier New', monospace;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .logo-grid {
    grid-template-columns: 1fr;
  }

  .logo-showcase {
    padding: 2rem 1rem;
  }
}
</style>
