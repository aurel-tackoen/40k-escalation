import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PaintingProgress from '~/components/PaintingProgress.vue'

// Mock composables
vi.mock('~/composables/usePaintingStats', () => ({
  usePaintingStats: () => ({
    getPaintPercentageColor: (percentage: number) => {
      if (percentage === 100) return 'text-purple-400'
      if (percentage >= 75) return 'text-green-400'
      if (percentage >= 50) return 'text-yellow-400'
      return 'text-red-400'
    },
    getPaintProgressClass: (percentage: number) => {
      if (percentage === 100) return 'bg-gradient-to-r from-purple-500 to-purple-600'
      if (percentage >= 75) return 'bg-gradient-to-r from-green-500 to-green-600'
      if (percentage >= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      return 'bg-gradient-to-r from-red-500 to-red-600'
    }
  })
}))

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  Brush: {
    name: 'Brush',
    template: '<svg data-testid="brush-icon"></svg>'
  },
  TrendingUp: {
    name: 'TrendingUp',
    template: '<svg data-testid="trending-up-icon"></svg>'
  }
}))

describe('PaintingProgress', () => {
  const mockLeaderboard = [
    {
      playerId: 1,
      playerName: 'Alice',
      faction: 'Space Marines',
      painted: 25,
      totalModels: 25,
      percentage: 100,
      totalPoints: 500,
      paintedPoints: 500,
      pointsPercentage: 100
    },
    {
      playerId: 2,
      playerName: 'Bob',
      faction: 'Necrons',
      painted: 18,
      totalModels: 20,
      percentage: 90,
      totalPoints: 500,
      paintedPoints: 450,
      pointsPercentage: 90
    },
    {
      playerId: 3,
      playerName: 'Charlie',
      faction: 'Tyranids',
      painted: 10,
      totalModels: 20,
      percentage: 50,
      totalPoints: 500,
      paintedPoints: 250,
      pointsPercentage: 50
    }
  ]

  describe('Rendering', () => {
    it('renders the component', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: []
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('renders the header with title and icon', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: []
        }
      })
      expect(wrapper.find('h3').text()).toBe('Painting Leaderboard')
      expect(wrapper.find('[data-testid="brush-icon"]').exists()).toBe(true)
    })

    it('renders all leaderboard entries', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const entries = wrapper.findAll('.bg-gray-700')
      expect(entries).toHaveLength(3)
    })

    it('renders empty state when leaderboard is empty', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: []
        }
      })
      expect(wrapper.text()).toContain('No painting progress tracked yet')
      expect(wrapper.text()).toContain('Add model counts to your army lists to track painting!')
    })
  })

  describe('Player Information', () => {
    it('displays player name for each entry', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      expect(wrapper.text()).toContain('Alice')
      expect(wrapper.text()).toContain('Bob')
      expect(wrapper.text()).toContain('Charlie')
    })

    it('displays faction for each entry', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      expect(wrapper.text()).toContain('Space Marines')
      expect(wrapper.text()).toContain('Necrons')
      expect(wrapper.text()).toContain('Tyranids')
    })

    it('displays model counts correctly', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      expect(wrapper.text()).toContain('25 / 25 models')
      expect(wrapper.text()).toContain('18 / 20 models')
      expect(wrapper.text()).toContain('10 / 20 models')
    })

    it('displays percentage correctly', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      expect(wrapper.text()).toContain('100%')
      expect(wrapper.text()).toContain('90%')
      expect(wrapper.text()).toContain('50%')
    })
  })

  describe('Ranking Display', () => {
    it('displays rank numbers for all entries', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const ranks = wrapper.findAll('.rounded-full')
      expect(ranks[0].text()).toBe('1')
      expect(ranks[1].text()).toBe('2')
      expect(ranks[2].text()).toBe('3')
    })

    it('applies gold medal styling to first place', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const firstPlace = wrapper.findAll('.rounded-full')[0]
      expect(firstPlace.classes()).toContain('from-yellow-400')
      expect(firstPlace.classes()).toContain('text-gray-900')
    })

    it('applies silver medal styling to second place', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const secondPlace = wrapper.findAll('.rounded-full')[1]
      expect(secondPlace.classes()).toContain('from-gray-300')
      expect(secondPlace.classes()).toContain('text-gray-900')
    })

    it('applies bronze medal styling to third place', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const thirdPlace = wrapper.findAll('.rounded-full')[2]
      expect(thirdPlace.classes()).toContain('from-amber-600')
      expect(thirdPlace.classes()).toContain('text-white')
    })
  })

  describe('Progress Bars', () => {
    it('renders model progress bars with correct widths', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const progressBars = wrapper.findAll('.h-2 > div')
      expect(progressBars[0].attributes('style')).toContain('width: 100%')
      expect(progressBars[2].attributes('style')).toContain('width: 90%')
      expect(progressBars[4].attributes('style')).toContain('width: 50%')
    })

    it('applies correct color classes based on percentage', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const progressBars = wrapper.findAll('.h-2 > div')
      expect(progressBars[0].classes()).toContain('from-purple-500') // 100%
      expect(progressBars[2].classes()).toContain('from-green-500') // 90%
      expect(progressBars[4].classes()).toContain('from-yellow-500') // 50%
    })

    it('renders points progress bars when totalPoints > 0', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      expect(wrapper.text()).toContain('500 / 500 pts')
      expect(wrapper.text()).toContain('450 / 500 pts')
      expect(wrapper.text()).toContain('250 / 500 pts')
    })

    it('displays points percentage correctly', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const pointsPercentages = wrapper.findAll('.text-green-400')
      expect(pointsPercentages.some(el => el.text() === '100%')).toBe(true)
      expect(pointsPercentages.some(el => el.text() === '90%')).toBe(true)
      expect(pointsPercentages.some(el => el.text() === '50%')).toBe(true)
    })

    it('does not render points progress when totalPoints is 0', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: [
            {
              playerId: 1,
              playerName: 'Test Player',
              faction: 'Test Faction',
              painted: 5,
              totalModels: 10,
              percentage: 50,
              totalPoints: 0,
              paintedPoints: 0,
              pointsPercentage: 0
            }
          ]
        }
      })
      expect(wrapper.find('[data-testid="trending-up-icon"]').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('pts')
    })
  })

  describe('Special States', () => {
    it('shows "Fully Painted!" message for 100% completion', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      expect(wrapper.text()).toContain('✨ Fully Painted!')
    })

    it('does not show "Fully Painted!" for less than 100%', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: [mockLeaderboard[1]] // 90% completion
        }
      })
      expect(wrapper.text()).not.toContain('✨ Fully Painted!')
    })

    it('applies correct text color classes for different percentages', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: [
            { ...mockLeaderboard[0], percentage: 100 },
            { ...mockLeaderboard[1], percentage: 75 },
            { ...mockLeaderboard[2], percentage: 50 }
          ]
        }
      })
      expect(wrapper.find('.text-purple-400').exists()).toBe(true) // 100%
      expect(wrapper.find('.text-green-400').exists()).toBe(true) // 75%
      expect(wrapper.find('.text-yellow-400').exists()).toBe(true) // 50%
    })
  })

  describe('Props', () => {
    it('accepts leaderboard prop', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      expect(wrapper.props('leaderboard')).toEqual(mockLeaderboard)
    })

    it('accepts currentPhase prop', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: [],
          currentPhase: 3
        }
      })
      expect(wrapper.props('currentPhase')).toBe(3)
    })

    it('defaults currentPhase to 1', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: []
        }
      })
      expect(wrapper.props('currentPhase')).toBe(1)
    })
  })

  describe('Styling and Layout', () => {
    it('applies hover effect to entries', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const entry = wrapper.find('.bg-gray-700')
      expect(entry.classes()).toContain('hover:border-yellow-500')
    })

    it('uses card styling for container', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: []
        }
      })
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('applies transition classes to progress bars', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const progressBars = wrapper.findAll('.h-2 > div')
      progressBars.forEach(bar => {
        expect(bar.classes()).toContain('transition-all')
        expect(bar.classes()).toContain('duration-500')
      })
    })
  })

  describe('Icons', () => {
    it('renders Brush icon in header', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: []
        }
      })
      expect(wrapper.findAll('[data-testid="brush-icon"]').length).toBeGreaterThan(0)
    })

    it('renders Brush icons for model counts', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const brushIcons = wrapper.findAll('[data-testid="brush-icon"]')
      expect(brushIcons.length).toBeGreaterThan(1) // Header + entries
    })

    it('renders TrendingUp icons for points progress', () => {
      const wrapper = mount(PaintingProgress, {
        props: {
          leaderboard: mockLeaderboard
        }
      })
      const trendingUpIcons = wrapper.findAll('[data-testid="trending-up-icon"]')
      expect(trendingUpIcons.length).toBe(3) // One per entry with points
    })
  })
})
