/**
 * Component tests for LoginButton.vue
 *
 * Tests login button functionality including:
 * - Rendering based on authentication state
 * - Login action triggering
 * - Button styling and accessibility
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ref } from 'vue'
import LoginButton from '~/components/LoginButton.vue'

// Mock the auth composable
const mockLogin = vi.fn()
const mockIsAuthenticated = ref(false)

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    login: mockLogin
  })
}))

describe('LoginButton.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    mockIsAuthenticated.value = false
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendering', () => {
    it('should render login button', () => {
      wrapper = mount(LoginButton)

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should display login text on larger screens', () => {
      wrapper = mount(LoginButton)

      // The "Login" text is hidden on small screens but visible on larger screens
      const span = wrapper.find('span.hidden.sm\\:inline-block')
      expect(span.exists()).toBe(true)
      expect(span.text()).toBe('Login')
    })

    it('should display LogIn icon', () => {
      wrapper = mount(LoginButton)

      // Icon should be rendered (lucide-vue-next components)
      expect(wrapper.html()).toContain('svg')
    })

    it('should have correct button structure', () => {
      wrapper = mount(LoginButton)

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.classes()).toContain('btn-primary')
    })
  })

  describe('Styling', () => {
    beforeEach(() => {
      mockIsAuthenticated.value = false
      wrapper = mount(LoginButton)
    })

    it('should have btn-primary class', () => {
      const button = wrapper.find('button')
      expect(button.classes()).toContain('btn-primary')
    })

    it('should have flex layout classes', () => {
      const button = wrapper.find('button')
      expect(button.classes()).toContain('flex')
      expect(button.classes()).toContain('items-center')
      expect(button.classes()).toContain('gap-2')
    })
  })

  describe('Functionality', () => {
    beforeEach(() => {
      mockIsAuthenticated.value = false
      wrapper = mount(LoginButton)
    })

    it('should call login when button is clicked', async () => {
      const button = wrapper.find('button')
      await button.trigger('click')

      expect(mockLogin).toHaveBeenCalledTimes(1)
    })

    it('should call login multiple times on multiple clicks', async () => {
      const button = wrapper.find('button')

      await button.trigger('click')
      await button.trigger('click')
      await button.trigger('click')

      expect(mockLogin).toHaveBeenCalledTimes(3)
    })

    it('should not call login if not clicked', () => {
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockIsAuthenticated.value = false
      wrapper = mount(LoginButton)
    })

    it('should be a button element', () => {
      const button = wrapper.find('button')
      expect(button.element.tagName).toBe('BUTTON')
    })

    it('should have meaningful text content', () => {
      const button = wrapper.find('button')
      expect(button.text()).toBeTruthy()
      expect(button.text().length).toBeGreaterThan(0)
    })

    it('should be keyboard accessible', () => {
      const button = wrapper.find('button')
      // Button elements are keyboard accessible by default
      expect(button.element.getAttribute('type')).toBeNull() // No type means type="button" default
    })
  })

  describe('State Transitions', () => {
    it('should always render the button regardless of auth state', async () => {
      mockIsAuthenticated.value = false
      wrapper = mount(LoginButton)

      expect(wrapper.find('button').exists()).toBe(true)

      // Change auth state - button should still render
      // (parent component handles visibility based on auth state)
      mockIsAuthenticated.value = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('button exists even when authenticated', async () => {
      mockIsAuthenticated.value = true
      wrapper = mount(LoginButton)

      // Component itself doesn't conditionally render - parent component does
      expect(wrapper.find('button').exists()).toBe(true)

      // Change auth state
      mockIsAuthenticated.value = false
      await wrapper.vm.$nextTick()

      expect(wrapper.find('button').exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    beforeEach(() => {
      mockIsAuthenticated.value = false
      wrapper = mount(LoginButton)
    })

    it('should have a root div wrapper', () => {
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('should contain icon and text in correct order', () => {
      const button = wrapper.find('button')
      const html = button.html()

      // SVG (icon) should come before span (text)
      const svgIndex = html.indexOf('<svg')
      const spanIndex = html.indexOf('<span')

      expect(svgIndex).toBeGreaterThan(-1)
      expect(spanIndex).toBeGreaterThan(-1)
      expect(svgIndex).toBeLessThan(spanIndex)
    })
  })
})
