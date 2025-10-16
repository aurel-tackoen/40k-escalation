import { vi } from 'vitest'

// Mock Nuxt auto-imports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.defineEventHandler = (handler: any) => handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.createError = (error: any) => error
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    auth0: {
      domain: 'test-domain',
      clientId: 'test-client-id',
      audience: 'test-audience'
    }
  }
}))

// Mock navigateTo
global.navigateTo = vi.fn()

// Mock useState
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.useState = vi.fn((key: string, init?: () => any) => {
  return {
    value: init ? init() : undefined
  }
})

// Mock useRoute
global.useRoute = vi.fn(() => ({
  params: {},
  query: {}
}))

// Mock useRouter
global.useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn()
}))

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
}

