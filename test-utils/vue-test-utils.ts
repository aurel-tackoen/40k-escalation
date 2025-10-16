/**
 * Vue Test Utils Configuration
 * Shared configuration and helpers for component tests
 */

import { mount, config } from '@vue/test-utils'
import { vi } from 'vitest'

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

export function createWrapper(component, options = {}) {
  return mount(component, {
    ...options
  })
}

export default config
