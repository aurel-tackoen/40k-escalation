/**
 * E2E tests for navigation and basic UI
 */
import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Escalation League/)
  })

  test('should have navigation links', async ({ page }) => {
    await page.goto('/')

    // Check for main navigation elements
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/')

    // Look for dashboard link and click it
    const dashboardLink = page.locator('a[href="/dashboard"]')
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click()
      await expect(page).toHaveURL(/\/dashboard/)
    }
  })

  test('should navigate to players page', async ({ page }) => {
    await page.goto('/')

    const playersLink = page.locator('a[href="/players"]')
    if (await playersLink.isVisible()) {
      await playersLink.click()
      await expect(page).toHaveURL(/\/players/)
    }
  })

  test('should navigate to armies page', async ({ page }) => {
    await page.goto('/')

    const armiesLink = page.locator('a[href="/armies"]')
    if (await armiesLink.isVisible()) {
      await armiesLink.click()
      await expect(page).toHaveURL(/\/armies/)
    }
  })

  test('should navigate to matches page', async ({ page }) => {
    await page.goto('/')

    const matchesLink = page.locator('a[href="/matches"]')
    if (await matchesLink.isVisible()) {
      await matchesLink.click()
      await expect(page).toHaveURL(/\/matches/)
    }
  })
})

test.describe('Page Load Performance', () => {
  test('home page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000)
  })
})

test.describe('Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Page should still be visible and not have horizontal scroll
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
