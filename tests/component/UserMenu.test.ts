/**
 * Component tests for UserMenu.vue
 *
 * Tests user menu functionality including:
 * - Rendering when authenticated
 * - Toggle dropdown menu
 * - Click outside to close
 * - Navigation to profile
 * - Logout functionality
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ref } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import UserMenu from '~/components/UserMenu.vue'

// Mock Nuxt's auto-imports
vi.mock('#app', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock the auth composable
const mockLogout = vi.fn()
const mockIsAuthenticated = ref(true)
const mockGetUserName = ref('Test User')
const mockGetUserAvatar = ref('https://example.com/avatar.jpg')

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    getUserName: mockGetUserName,
    getUserAvatar: mockGetUserAvatar,
    logout: mockLogout
  })
}))

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  User: { name: 'User', template: '<svg data-testid="user-icon"></svg>' },
  ChevronDown: { name: 'ChevronDown', template: '<svg data-testid="chevron-down-icon"></svg>' },
  LogOut: { name: 'LogOut', template: '<svg data-testid="logout-icon"></svg>' },
  ShieldAlert: { name: 'ShieldAlert', template: '<svg data-testid="shield-alert-icon"></svg>' }
}))

describe('UserMenu.vue', () => {
  let wrapper: VueWrapper

  const mountComponent = (options = {}) => {
    return mount(UserMenu, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              auth: {
                user: { role: 'player' }
              }
            }
          })
        ],
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
            props: ['to']
          }
        }
      },
      ...options
    })
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    mockIsAuthenticated.value = true
    mockGetUserName.value = 'Test User'
    mockGetUserAvatar.value = 'https://example.com/avatar.jpg'
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendering', () => {
    it('should render when user is authenticated', () => {
      wrapper = mountComponent()

      expect(wrapper.find('[data-testid="user-menu"]').exists()).toBe(false) // No test ID in original
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('should not render when user is not authenticated', () => {
      mockIsAuthenticated.value = false

      wrapper = mountComponent()

      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('should display user name', () => {
      mockGetUserName.value = 'John Doe'

      wrapper = mountComponent()

      expect(wrapper.text()).toContain('John Doe')
    })

    it('should display user avatar with correct src and alt', () => {
      mockGetUserName.value = 'Jane Smith'
      mockGetUserAvatar.value = 'https://example.com/jane.jpg'

      wrapper = mountComponent()

      const avatar = wrapper.find('img')
      expect(avatar.exists()).toBe(true)
      expect(avatar.attributes('src')).toBe('https://example.com/jane.jpg')
      expect(avatar.attributes('alt')).toBe('Jane Smith')
    })
  })

  describe('Dropdown Menu Toggle', () => {
    it('should start with menu closed', () => {
      wrapper = mountComponent()

      // Dropdown should not be visible initially
      const dropdown = wrapper.find('.absolute.right-0')
      expect(dropdown.exists()).toBe(false)
    })

    it('should open menu when button is clicked', async () => {
      wrapper = mountComponent()

      const button = wrapper.find('button')
      await button.trigger('click')

      const dropdown = wrapper.find('.absolute.right-0')
      expect(dropdown.exists()).toBe(true)
    })

    it('should close menu when button is clicked again', async () => {
      wrapper = mountComponent()

      const button = wrapper.find('button')

      // Open menu
      await button.trigger('click')
      expect(wrapper.find('.absolute.right-0').exists()).toBe(true)

      // Close menu
      await button.trigger('click')
      expect(wrapper.find('.absolute.right-0').exists()).toBe(false)
    })

    it('should toggle menu multiple times', async () => {
      wrapper = mountComponent( {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      const button = wrapper.find('button')

      // Toggle open
      await button.trigger('click')
      expect(wrapper.find('.absolute.right-0').exists()).toBe(true)

      // Toggle close
      await button.trigger('click')
      expect(wrapper.find('.absolute.right-0').exists()).toBe(false)

      // Toggle open again
      await button.trigger('click')
      expect(wrapper.find('.absolute.right-0').exists()).toBe(true)
    })
  })

  describe('Dropdown Menu Content', () => {
    beforeEach(async () => {
      wrapper = mountComponent( {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      // Open the menu
      await wrapper.find('button').trigger('click')
    })

    it('should display "My Profile" link', () => {
      expect(wrapper.text()).toContain('My Profile')
    })

    it('should have profile link pointing to /profile', () => {
      const profileLink = wrapper.find('a[href="/profile"]')
      expect(profileLink.exists()).toBe(true)
    })

    it('should display "Logout" button', () => {
      expect(wrapper.text()).toContain('Logout')
    })

    it('should have logout button with red styling', () => {
      const logoutButton = wrapper.findAll('button').find(btn =>
        btn.text().includes('Logout')
      )
      expect(logoutButton?.classes()).toContain('text-red-400')
    })
  })

  describe('Menu Interactions', () => {
    beforeEach(async () => {
      wrapper = mountComponent( {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to" @click="$emit(\'click\')"><slot /></a>',
              props: ['to'],
              emits: ['click']
            }
          }
        }
      })

      // Open the menu
      await wrapper.find('button').trigger('click')
    })

    it('should close menu when profile link is clicked', async () => {
      const profileLink = wrapper.find('a[href="/profile"]')
      await profileLink.trigger('click')

      expect(wrapper.find('.absolute.right-0').exists()).toBe(false)
    })

    it('should call logout when logout button is clicked', async () => {
      const logoutButton = wrapper.findAll('button').find(btn =>
        btn.text().includes('Logout')
      )

      await logoutButton!.trigger('click')

      expect(mockLogout).toHaveBeenCalledTimes(1)
    })
  })

  describe('Click Outside Behavior', () => {
    it('should close menu when clicking outside', async () => {
      wrapper = mountComponent( {
        attachTo: document.body,
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      // Open menu
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('.absolute.right-0').exists()).toBe(true)

      // Click outside
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)
      outsideElement.click()

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.absolute.right-0').exists()).toBe(false)

      // Cleanup
      document.body.removeChild(outsideElement)
      wrapper.unmount()
    })

    it('should not close menu when clicking inside', async () => {
      wrapper = mountComponent( {
        attachTo: document.body,
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      // Open menu
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('.absolute.right-0').exists()).toBe(true)

      // Click inside the menu
      const dropdown = wrapper.find('.absolute.right-0')
      await dropdown.trigger('click')

      expect(wrapper.find('.absolute.right-0').exists()).toBe(true)

      wrapper.unmount()
    })
  })

  describe('Lifecycle', () => {
    it('should add click listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      wrapper = mountComponent( {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should remove click listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      wrapper = mountComponent( {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      wrapper = mountComponent( {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.element.tagName).toBe('BUTTON')
    })

    it('should have meaningful avatar alt text', () => {
      mockGetUserName.value = 'Alice Wonder'

      wrapper = mountComponent( {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      const avatar = wrapper.find('img')
      expect(avatar.attributes('alt')).toBe('Alice Wonder')
    })
  })
})
