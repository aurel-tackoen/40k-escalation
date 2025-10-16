import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import LeagueCard from '~/components/LeagueCard.vue'

// Mock Pinia
vi.mock('pinia', () => ({
  storeToRefs: () => ({
    gameSystems: ref([
      { id: 1, name: 'Warhammer 40,000', shortName: '40k' },
      { id: 2, name: 'Age of Sigmar', shortName: 'aos' }
    ])
  })
}))

// Mock stores
vi.mock('~/stores/leagues', () => ({
  useLeaguesStore: () => ({
    fetchGameSystems: vi.fn().mockResolvedValue(undefined)
  })
}))

// Mock composables
vi.mock('~/composables/useFormatting', () => ({
  useFormatting: () => ({
    formatDate: (date: string) => new Date(date).toLocaleDateString()
  })
}))

vi.mock('~/composables/useGameSystems', () => ({
  useGameSystems: () => ({
    getGameSystemName: (id: number) => {
      const systems: Record<number, string> = {
        1: 'Warhammer 40,000',
        2: 'Age of Sigmar'
      }
      return systems[id] || null
    }
  })
}))

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  Users: { name: 'Users', template: '<svg data-testid="users-icon"></svg>' },
  Calendar: { name: 'Calendar', template: '<svg data-testid="calendar-icon"></svg>' },
  Swords: { name: 'Swords', template: '<svg data-testid="swords-icon"></svg>' },
  Globe: { name: 'Globe', template: '<svg data-testid="globe-icon"></svg>' },
  Settings: { name: 'Settings', template: '<svg data-testid="settings-icon"></svg>' },
  LogOut: { name: 'LogOut', template: '<svg data-testid="logout-icon"></svg>' },
  Trash2: { name: 'Trash2', template: '<svg data-testid="trash-icon"></svg>' },
  LogIn: { name: 'LogIn', template: '<svg data-testid="login-icon"></svg>' },
  Target: { name: 'Target', template: '<svg data-testid="target-icon"></svg>' },
  Trophy: { name: 'Trophy', template: '<svg data-testid="trophy-icon"></svg>' }
}))

describe('LeagueCard', () => {
  const mockMyLeague = {
    id: 1,
    name: 'Test League',
    description: 'A test league for testing',
    gameSystemId: 1,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    currentRound: 2,
    memberCount: 8,
    maxPlayers: 12,
    role: 'owner',
    joinedAt: '2025-01-01',
    rounds: [
      { number: 1, pointLimit: 500 },
      { number: 2, pointLimit: 1000 },
      { number: 3, pointLimit: 1500 }
    ],
    status: 'active'
  }

  const mockPublicLeague = {
    id: 2,
    name: 'Public League',
    description: 'A public league',
    gameSystemId: 2,
    startDate: '2025-02-01',
    currentRound: 1,
    memberCount: 5,
    maxPlayers: 10,
    status: 'active',
    isJoined: false
  }

  // Helper to mount with global mocks
  const mountWithMocks = (props: Record<string, unknown>, options = {}) => {
    return mount(LeagueCard, {
      props,
      global: {
        stubs: {
          // Stub onMounted to do nothing in tests
        },
        mocks: {
          onMounted: vi.fn()
        }
      },
      ...options
    })
  }

  describe('Rendering', () => {
    it('renders the component', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('renders league name', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.find('h3').text()).toBe('Test League')
    })

    it('renders league description', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.text()).toContain('A test league for testing')
    })

    it('does not render description when not provided', () => {
      const leagueWithoutDescription = { ...mockMyLeague, description: null }
      const wrapper = mountWithMocks({
        league: leagueWithoutDescription
      })
      const descriptionElement = wrapper.find('p.text-gray-400')
      expect(descriptionElement.exists()).toBe(false)
    })
  })

  describe('Variants', () => {
    it('defaults to my-league variant', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.props('variant')).toBe('my-league')
    })

    it('accepts public variant', () => {
      const wrapper = mountWithMocks({
        league: mockPublicLeague,
        variant: 'public'
      })
      expect(wrapper.props('variant')).toBe('public')
    })

    it('accepts public-guest variant', () => {
      const wrapper = mountWithMocks({
        league: mockPublicLeague,
        variant: 'public-guest'
      })
      expect(wrapper.props('variant')).toBe('public-guest')
    })
  })

  describe('Badges', () => {
    it('shows Current badge when isCurrent is true', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague,
        isCurrent: true
      })
      expect(wrapper.text()).toContain('✓ Current')
      expect(wrapper.find('.bg-purple-600').exists()).toBe(true)
    })

    it('does not show Current badge when isCurrent is false', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague,
        isCurrent: false
      })
      expect(wrapper.text()).not.toContain('✓ Current')
    })

    it('shows Public badge for public variant when not joined', () => {
      const wrapper = mountWithMocks({
        league: { ...mockPublicLeague, isJoined: false },
        variant: 'public'
      })
      expect(wrapper.text()).toContain('Public')
      expect(wrapper.find('.bg-green-600').exists()).toBe(true)
      expect(wrapper.find('[data-testid="globe-icon"]').exists()).toBe(true)
    })

    it('shows Joined badge for public variant when joined', () => {
      const wrapper = mountWithMocks({
        league: { ...mockPublicLeague, isJoined: true },
        variant: 'public'
      })
      expect(wrapper.text()).toContain('✓ Joined')
      expect(wrapper.find('.bg-blue-600').exists()).toBe(true)
    })

    it('shows role badge for my-league variant', () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'owner' }
      })
      expect(wrapper.text()).toContain('owner')
      expect(wrapper.find('.bg-yellow-600').exists()).toBe(true)
    })

    it('applies correct role badge colors', () => {
      const ownerWrapper = mountWithMocks({ league: { ...mockMyLeague, role: 'owner' } })
      expect(ownerWrapper.find('.bg-yellow-600').exists()).toBe(true)

      const organizerWrapper = mountWithMocks({ league: { ...mockMyLeague, role: 'organizer' } })
      expect(organizerWrapper.find('.bg-blue-600').exists()).toBe(true)
    })

    it('shows status badge for public leagues', () => {
      const wrapper = mountWithMocks({
        league: { ...mockPublicLeague, status: 'active' },
        variant: 'public'
      })
      expect(wrapper.text()).toContain('active')
      expect(wrapper.find('.bg-green-600\\/20').exists()).toBe(true)
    })
  })

  describe('League Stats', () => {
    it('displays member count', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.text()).toContain('8')
      expect(wrapper.text()).toContain('12')
      expect(wrapper.text()).toContain('members')
      expect(wrapper.find('[data-testid="users-icon"]').exists()).toBe(true)
    })

    it('displays member count without max when maxPlayers not set', () => {
      const leagueNoMax = { ...mockMyLeague, maxPlayers: null, memberCount: 5 }
      const wrapper = mountWithMocks({
        league: leagueNoMax
      })
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('members')
    })

    it('uses singular member when count is 1', () => {
      const leagueOneMember = { ...mockMyLeague, maxPlayers: null, memberCount: 1 }
      const wrapper = mountWithMocks({
        league: leagueOneMember
      })
      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('member')
    })

    it('displays current round for my-league variant', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.text()).toContain('Round 2 of 3')
      expect(wrapper.find('[data-testid="calendar-icon"]').exists()).toBe(true)
    })

    it('displays current round for public variant without total', () => {
      const wrapper = mountWithMocks({
        league: { ...mockPublicLeague, rounds: undefined },
        variant: 'public'
      })
      expect(wrapper.text()).toContain('Round 1')
    })

    it('displays game system name', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.text()).toContain('Warhammer 40,000')
      expect(wrapper.find('[data-testid="swords-icon"]').exists()).toBe(true)
    })

    it('displays point limit for my-league variant', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.text()).toContain('1000 points')
      expect(wrapper.find('[data-testid="trophy-icon"]').exists()).toBe(true)
    })
  })

  describe('Dates', () => {
    it('displays start date', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.text()).toContain('Started:')
    })

    it('displays end date when provided', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.text()).toContain('Ends:')
    })

    it('does not display end date when not provided', () => {
      const leagueNoEnd = { ...mockMyLeague, endDate: null }
      const wrapper = mountWithMocks({
        league: leagueNoEnd
      })
      expect(wrapper.text()).toContain('Started:')
      expect(wrapper.text()).not.toContain('Ends:')
    })

    it('displays joined date for my-league variant', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.text()).toContain('Joined:')
    })
  })

  describe('Actions - My League', () => {
    it('shows Settings button for owner', () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'owner' }
      })
      expect(wrapper.find('[data-testid="settings-icon"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Settings')
    })

    it('shows Settings button for organizer', () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'organizer' }
      })
      expect(wrapper.find('[data-testid="settings-icon"]').exists()).toBe(true)
    })

    it('shows Delete button for owner', () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'owner' }
      })
      expect(wrapper.find('[data-testid="trash-icon"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Delete')
    })

    it('shows Leave button for non-owner', () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'player' }
      })
      expect(wrapper.find('[data-testid="logout-icon"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Leave')
    })

    it('does not show Leave button for owner', () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'owner' }
      })
      expect(wrapper.findAll('[data-testid="logout-icon"]')).toHaveLength(0)
    })
  })

  describe('Actions - Public League', () => {
    it('shows Join button for public variant', () => {
      const wrapper = mountWithMocks({
        league: { ...mockPublicLeague, isJoined: false },
        variant: 'public'
      })
      const joinButton = wrapper.find('.btn-primary')
      expect(joinButton.exists()).toBe(true)
      expect(joinButton.text()).toContain('Join League')
      expect(wrapper.find('[data-testid="login-icon"]').exists()).toBe(true)
    })

    it('disables Join button when already joined', () => {
      const wrapper = mountWithMocks({
        league: { ...mockPublicLeague, isJoined: true },
        variant: 'public'
      })
      const joinButton = wrapper.find('.btn-primary')
      expect(joinButton.attributes('disabled')).toBeDefined()
      expect(joinButton.text()).toContain('Already Joined')
    })

    it('disables Join button when league is full', () => {
      const fullLeague = { ...mockPublicLeague, memberCount: 10, maxPlayers: 10 }
      const wrapper = mountWithMocks({
        league: fullLeague,
        variant: 'public'
      })
      const joinButton = wrapper.find('.btn-primary')
      expect(joinButton.attributes('disabled')).toBeDefined()
      expect(joinButton.text()).toContain('League Full')
    })

    it('shows Join button for public-guest variant', () => {
      const wrapper = mountWithMocks({
        league: { ...mockPublicLeague, isJoined: false },
        variant: 'public-guest'
      })
      expect(wrapper.find('button').text()).toContain('Join League')
      expect(wrapper.find('.from-yellow-500').exists()).toBe(true)
    })
  })

  describe('Events', () => {
    it('emits click event for my-league variant', async () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0]).toEqual([1])
    })

    it('does not emit click event for public variant', async () => {
      const wrapper = mountWithMocks({
        league: mockPublicLeague,
        variant: 'public'
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('emits settings event when Settings clicked', async () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'owner' }
      })
      await wrapper.find('[data-testid="settings-icon"]').trigger('click')
      expect(wrapper.emitted('settings')).toBeTruthy()
      expect(wrapper.emitted('settings')?.[0]).toEqual([1])
    })

    it('emits leave event when Leave clicked', async () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'player' }
      })
      await wrapper.find('[data-testid="logout-icon"]').trigger('click')
      expect(wrapper.emitted('leave')).toBeTruthy()
      expect(wrapper.emitted('leave')?.[0]).toEqual([1, 'Test League'])
    })

    it('emits delete event when Delete clicked', async () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'owner' }
      })
      await wrapper.find('[data-testid="trash-icon"]').trigger('click')
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')?.[0]).toEqual([1, 'Test League'])
    })

    it('emits join event when Join clicked', async () => {
      const wrapper = mountWithMocks({
        league: { ...mockPublicLeague, isJoined: false },
        variant: 'public'
      })
      await wrapper.find('.btn-primary').trigger('click')
      expect(wrapper.emitted('join')).toBeTruthy()
      expect(wrapper.emitted('join')?.[0]).toEqual([2])
    })

    it('stops event propagation on action buttons', async () => {
      const wrapper = mountWithMocks({
        league: { ...mockMyLeague, role: 'owner' }
      })
      await wrapper.find('[data-testid="settings-icon"]').trigger('click')
      // If propagation was not stopped, click event would also be emitted
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('Styling', () => {
    it('applies cursor-pointer for my-league variant', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.find('.cursor-pointer').exists()).toBe(true)
    })

    it('does not apply cursor-pointer for public variant', () => {
      const wrapper = mountWithMocks({
        league: mockPublicLeague,
        variant: 'public'
      })
      expect(wrapper.find('.cursor-pointer').exists()).toBe(false)
    })

    it('applies ring styling when isCurrent is true', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague,
        isCurrent: true
      })
      expect(wrapper.find('.ring-2').exists()).toBe(true)
      expect(wrapper.find('.ring-purple-500').exists()).toBe(true)
    })

    it('applies opacity when joined', () => {
      const wrapper = mountWithMocks({
        league: { ...mockPublicLeague, isJoined: true },
        variant: 'public'
      })
      expect(wrapper.find('.opacity-75').exists()).toBe(true)
    })

    it('applies correct hover color for my-league', () => {
      const wrapper = mountWithMocks({
        league: mockMyLeague
      })
      expect(wrapper.find('.hover\\:border-purple-500').exists()).toBe(true)
    })

    it('applies correct hover color for public variant', () => {
      const wrapper = mountWithMocks({
        league: mockPublicLeague,
        variant: 'public'
      })
      expect(wrapper.find('.hover\\:border-green-500').exists()).toBe(true)
    })
  })
})

// Mock stores
vi.mock('~/stores/leagues', () => ({
  useLeaguesStore: () => ({
    fetchGameSystems: vi.fn()
  })
}))

// Mock composables
vi.mock('~/composables/useFormatting', () => ({
  useFormatting: () => ({
    formatDate: (date: string) => new Date(date).toLocaleDateString()
  })
}))

vi.mock('~/composables/useGameSystems', () => ({
  useGameSystems: () => ({
    getGameSystemName: (id: number) => {
      const systems: Record<number, string> = {
        1: 'Warhammer 40,000',
        2: 'Age of Sigmar'
      }
      return systems[id] || null
    }
  })
}))

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  Users: { name: 'Users', template: '<svg data-testid="users-icon"></svg>' },
  Calendar: { name: 'Calendar', template: '<svg data-testid="calendar-icon"></svg>' },
  Swords: { name: 'Swords', template: '<svg data-testid="swords-icon"></svg>' },
  Globe: { name: 'Globe', template: '<svg data-testid="globe-icon"></svg>' },
  Settings: { name: 'Settings', template: '<svg data-testid="settings-icon"></svg>' },
  LogOut: { name: 'LogOut', template: '<svg data-testid="logout-icon"></svg>' },
  Trash2: { name: 'Trash2', template: '<svg data-testid="trash-icon"></svg>' },
  LogIn: { name: 'LogIn', template: '<svg data-testid="login-icon"></svg>' },
  Target: { name: 'Target', template: '<svg data-testid="target-icon"></svg>' },
  Trophy: { name: 'Trophy', template: '<svg data-testid="trophy-icon"></svg>' }
}))
