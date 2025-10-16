/**
 * Component tests for Logo.vue
 *
 * Tests logo component functionality including:
 * - Rendering of logo elements
 * - Swords icon
 * - Text content ("War's PATH")
 * - Subtitle text
 * - Styling classes
 * - Accessibility
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Logo from '~/components/Logo.vue'

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  Swords: { name: 'Swords', template: '<svg data-testid="swords-icon"></svg>' }
}))

describe('Logo', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const wrapper = mount(Logo)
      expect(wrapper.exists()).toBe(true)
    })

    it('renders the Swords icon', () => {
      const wrapper = mount(Logo)
      expect(wrapper.find('[data-testid="swords-icon"]').exists()).toBe(true)
    })

    it('renders "War\'s" text', () => {
      const wrapper = mount(Logo)
      expect(wrapper.text()).toContain("War's")
    })

    it('renders "PATH" text', () => {
      const wrapper = mount(Logo)
      expect(wrapper.text()).toContain('PATH')
    })

    it('renders subtitle text', () => {
      const wrapper = mount(Logo)
      expect(wrapper.text()).toContain('ESCALATION LEAGUE MANAGER')
    })

    it('renders pulsing indicator dot', () => {
      const wrapper = mount(Logo)
      const dot = wrapper.find('.animate-pulse')
      expect(dot.exists()).toBe(true)
    })
  })

  describe('Logo Structure', () => {
    it('contains main logo container', () => {
      const wrapper = mount(Logo)
      expect(wrapper.find('.logo').exists()).toBe(true)
    })

    it('applies chrome logo class', () => {
      const wrapper = mount(Logo)
      expect(wrapper.find('.logo-chrome').exists()).toBe(true)
    })

    it('contains text container', () => {
      const wrapper = mount(Logo)
      expect(wrapper.find('.text-container').exists()).toBe(true)
    })

    it('contains "War\'s" span with chrome class', () => {
      const wrapper = mount(Logo)
      expect(wrapper.find('.wars-chrome').exists()).toBe(true)
    })

    it('contains "PATH" span with chrome class', () => {
      const wrapper = mount(Logo)
      expect(wrapper.find('.path-chrome').exists()).toBe(true)
    })
  })

  describe('Icon Configuration', () => {
    it('sets correct icon size', () => {
      const wrapper = mount(Logo)
      const icon = wrapper.find('[data-testid="swords-icon"]')
      expect(icon.attributes('size')).toBe('60')
    })

    it('sets correct icon stroke width', () => {
      const wrapper = mount(Logo)
      const icon = wrapper.find('[data-testid="swords-icon"]')
      expect(icon.attributes('stroke-width')).toBe('1.5')
    })

    it('applies sword icon chrome class', () => {
      const wrapper = mount(Logo)
      const icon = wrapper.find('[data-testid="swords-icon"]')
      expect(icon.classes()).toContain('sword-icon-chrome')
    })
  })

  describe('Styling', () => {
    it('applies flex layout to main logo', () => {
      const wrapper = mount(Logo)
      const logo = wrapper.find('.logo')
      expect(logo.classes()).toContain('logo')
    })

    it('applies gradient styling to subtitle', () => {
      const wrapper = mount(Logo)
      const subtitle = wrapper.find('.bg-gradient-to-r')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.classes()).toContain('from-gray-200')
      expect(subtitle.classes()).toContain('via-white')
      expect(subtitle.classes()).toContain('to-gray-200')
    })

    it('applies text-transparent class to subtitle', () => {
      const wrapper = mount(Logo)
      const subtitle = wrapper.find('.text-transparent')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.classes()).toContain('bg-clip-text')
    })

    it('makes indicator dot yellow', () => {
      const wrapper = mount(Logo)
      const dot = wrapper.find('.bg-yellow-500')
      expect(dot.exists()).toBe(true)
    })

    it('makes indicator dot rounded', () => {
      const wrapper = mount(Logo)
      const dot = wrapper.find('.rounded-full')
      expect(dot.exists()).toBe(true)
    })

    it('applies pulse animation to indicator', () => {
      const wrapper = mount(Logo)
      const dot = wrapper.find('.animate-pulse')
      expect(dot.exists()).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('hides indicator dot on mobile', () => {
      const wrapper = mount(Logo)
      const dot = wrapper.find('.hidden.md\\:inline-block')
      expect(dot.exists()).toBe(true)
    })

    it('subtitle has responsive font size', () => {
      const wrapper = mount(Logo)
      const subtitle = wrapper.find('.text-base')
      expect(subtitle.exists()).toBe(true)
    })

    it('subtitle uses tracking-wider for spacing', () => {
      const wrapper = mount(Logo)
      const subtitle = wrapper.find('.tracking-wider')
      expect(subtitle.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('provides visible text content', () => {
      const wrapper = mount(Logo)
      const text = wrapper.text()
      expect(text).toContain("War's")
      expect(text).toContain('PATH')
      expect(text).toContain('ESCALATION LEAGUE MANAGER')
    })

    it('all text elements are visible', () => {
      const wrapper = mount(Logo)
      const wars = wrapper.find('.wars-chrome')
      const path = wrapper.find('.path-chrome')
      expect(wars.isVisible()).toBe(true)
      expect(path.isVisible()).toBe(true)
    })

    it('subtitle is semantic span element', () => {
      const wrapper = mount(Logo)
      const subtitle = wrapper.find('.text-base')
      expect(subtitle.element.tagName).toBe('SPAN')
    })
  })

  describe('Layout', () => {
    it('applies negative margin to subtitle container', () => {
      const wrapper = mount(Logo)
      const subtitleContainer = wrapper.find('.-mt-2')
      expect(subtitleContainer.exists()).toBe(true)
    })

    it('applies left margin to subtitle container', () => {
      const wrapper = mount(Logo)
      const subtitleContainer = wrapper.find('.ml-2')
      expect(subtitleContainer.exists()).toBe(true)
    })

    it('applies flex layout to subtitle container', () => {
      const wrapper = mount(Logo)
      const subtitleContainer = wrapper.find('.flex.items-center')
      expect(subtitleContainer.exists()).toBe(true)
    })

    it('applies gap between subtitle elements', () => {
      const wrapper = mount(Logo)
      const subtitleContainer = wrapper.find('.gap-2')
      expect(subtitleContainer.exists()).toBe(true)
    })
  })
})
