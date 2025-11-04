/**
 * Vue Test Utils Configuration
 * Shared configuration and helpers for component tests
 */

import { mount, config } from '@vue/test-utils'
import { vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'

// Global component stubs
config.global.stubs = {
  NuxtLink: {
    template: '<a><slot /></a>'
  },
  ClientOnly: {
    template: '<div><slot /></div>'
  }
}

// Global mocks
config.global.mocks = {
  $route: {
    params: {},
    query: {}
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }
}

/**
 * Create a wrapper with common test configuration
 * Includes Pinia testing setup by default
 */
export function createWrapper(component, options = {}) {
  return mount(component, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false
        })
      ],
      ...options.global
    },
    ...options
  })
}

/**
 * Create testing Pinia instance
 * Use this for tests that need to customize Pinia setup
 */
export function createPinia(options = {}) {
  return createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    ...options
  })
}

export default config
