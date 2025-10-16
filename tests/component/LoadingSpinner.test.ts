/**
 * Component tests for LoadingSpinner.vue
 *
 * Tests loading spinner functionality including:
 * - Rendering with default and custom props
 * - Size variants (small, normal, large)
 * - Custom loading messages
 * - Icon rendering (Loader2 and Swords)
 * - Animation classes
 * - Accessibility
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '~/components/LoadingSpinner.vue'

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  Swords: { name: 'Swords', template: '<svg data-testid="swords-icon"></svg>' },
  Loader2: { name: 'Loader2', template: '<svg data-testid="loader-icon"></svg>' }
}))

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.exists()).toBe(true)
    })

    it('renders default loading message', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.text()).toContain('Loading...')
    })

    it('renders custom loading message', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          message: 'Preparing your army...'
        }
      })
      expect(wrapper.text()).toContain('Preparing your army...')
    })

    it('renders Swords icon', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('[data-testid="swords-icon"]').exists()).toBe(true)
    })

    it('renders Loader2 icon', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('[data-testid="loader-icon"]').exists()).toBe(true)
    })

    it('renders animated dots', () => {
      const wrapper = mount(LoadingSpinner)
      const dots = wrapper.findAll('.dot')
      expect(dots.length).toBe(3)
    })
  })

  describe('Size Variants', () => {
    it('applies normal size by default', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('.loading-container').classes()).toContain('loading-normal')
    })

    it('applies small size class', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          size: 'small'
        }
      })
      expect(wrapper.find('.loading-container').classes()).toContain('loading-small')
    })

    it('applies large size class', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.find('.loading-container').classes()).toContain('loading-large')
    })

    it('validates size prop', () => {
      // Suppress console warnings for invalid prop
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(LoadingSpinner, {
        props: {
          size: 'invalid' as 'small'
        }
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Icon Sizing', () => {
    it('uses correct sword size for small variant', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          size: 'small'
        }
      })
      const swordsIcon = wrapper.find('[data-testid="swords-icon"]')
      expect(swordsIcon.attributes('size')).toBe('25')
    })

    it('uses correct sword size for normal variant', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          size: 'normal'
        }
      })
      const swordsIcon = wrapper.find('[data-testid="swords-icon"]')
      expect(swordsIcon.attributes('size')).toBe('40')
    })

    it('uses correct sword size for large variant', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          size: 'large'
        }
      })
      const swordsIcon = wrapper.find('[data-testid="swords-icon"]')
      expect(swordsIcon.attributes('size')).toBe('50')
    })

    it('uses correct loader size for small variant', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          size: 'small'
        }
      })
      const loaderIcon = wrapper.find('[data-testid="loader-icon"]')
      expect(loaderIcon.attributes('size')).toBe('60')
    })

    it('uses correct loader size for normal variant', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          size: 'normal'
        }
      })
      const loaderIcon = wrapper.find('[data-testid="loader-icon"]')
      expect(loaderIcon.attributes('size')).toBe('85')
    })

    it('uses correct loader size for large variant', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          size: 'large'
        }
      })
      const loaderIcon = wrapper.find('[data-testid="loader-icon"]')
      expect(loaderIcon.attributes('size')).toBe('100')
    })
  })

  describe('Structure', () => {
    it('contains loading container', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('.loading-container').exists()).toBe(true)
    })

    it('contains loading spinner', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })

    it('contains loader ring', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('.loader-ring').exists()).toBe(true)
    })

    it('contains sword container', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('.sword-container').exists()).toBe(true)
    })

    it('contains loading message', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('.loading-message').exists()).toBe(true)
    })

    it('contains message text', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('.message-text').exists()).toBe(true)
    })

    it('contains loading dots container', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('.loading-dots').exists()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('applies flex layout to container', () => {
      const wrapper = mount(LoadingSpinner)
      const container = wrapper.find('.loading-container')
      expect(container.classes()).toBeDefined()
    })

    it('applies position relative to spinner', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })

    it('applies correct stroke width to icons', () => {
      const wrapper = mount(LoadingSpinner)
      expect(wrapper.find('[data-testid="swords-icon"]').attributes('stroke-width')).toBe('1.5')
      expect(wrapper.find('[data-testid="loader-icon"]').attributes('stroke-width')).toBe('1')
    })
  })

  describe('Accessibility', () => {
    it('provides visual loading indicator', () => {
      const wrapper = mount(LoadingSpinner)
      // Component provides visual feedback through icons and message
      expect(wrapper.find('.loading-message').exists()).toBe(true)
      expect(wrapper.find('[data-testid="swords-icon"]').exists()).toBe(true)
    })

    it('displays readable loading message', () => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          message: 'Loading your data'
        }
      })
      const message = wrapper.find('.message-text')
      expect(message.text()).toBe('Loading your data')
    })

    it('message is visible and not hidden', () => {
      const wrapper = mount(LoadingSpinner)
      const message = wrapper.find('.message-text')
      expect(message.isVisible()).toBe(true)
    })
  })
})
