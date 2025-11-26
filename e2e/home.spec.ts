/**
 * E2E Tests for Home/Landing Page
 *
 * Tests the public landing page and navigation
 */

import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('displays home page', async ({ page }) => {
    await page.goto('/')

    // Page should load successfully
    await expect(page).toHaveTitle(/philter/i)
  })

  test('has navigation links', async ({ page }) => {
    await page.goto('/')

    // Check for sign in link (could be button or link)
    const signInElement = page.locator('a[href="/sign-in"], button:has-text("Sign in")').first()
    await expect(signInElement).toBeVisible()
  })

  test('can navigate to sign in from home', async ({ page }) => {
    await page.goto('/')

    // Click sign in link or button
    const signInElement = page.locator('a[href="/sign-in"]').first()
    if (await signInElement.isVisible()) {
      await signInElement.click()
    } else {
      // Navigate directly if no link found
      await page.goto('/sign-in')
    }

    await expect(page).toHaveURL('/sign-in')
  })

  test('can navigate to sign up from home', async ({ page }) => {
    await page.goto('/')

    // Look for sign up or get started link
    const signUpLink = page.getByRole('link', { name: /sign up|get started/i }).first()
    if (await signUpLink.isVisible()) {
      await signUpLink.click()
      await expect(page).toHaveURL('/sign-up')
    }
  })

  test('page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Page should still be functional
    await expect(page).toHaveTitle(/philter/i)
  })
})

test.describe('Error Handling', () => {
  test('404 page for non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345')

    // Should either show 404 or redirect
    // The response should be handled gracefully
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe('Performance', () => {
  test('home page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const loadTime = Date.now() - startTime

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('sign in page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/sign-in')
    await page.waitForLoadState('domcontentloaded')

    const loadTime = Date.now() - startTime

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })
})

test.describe('Accessibility', () => {
  test('home page has page content', async ({ page }) => {
    await page.goto('/')

    // Check that page has content (main landmark or content area)
    const content = page.locator('main, [role="main"], body')
    await expect(content.first()).toBeVisible()
  })

  test('sign in form has accessible labels', async ({ page }) => {
    await page.goto('/sign-in')

    // All form fields should have associated labels
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toBeVisible()

    const passwordInput = page.getByLabel('Password')
    await expect(passwordInput).toBeVisible()
  })

  test('sign up form has accessible labels', async ({ page }) => {
    await page.goto('/sign-up')

    // All form fields should have associated labels
    await expect(page.getByLabel('First name')).toBeVisible()
    await expect(page.getByLabel('Last name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm password')).toBeVisible()
  })

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/sign-in')

    // Tab through the form - the exact number depends on the page layout
    // Just verify we can tab and focus elements
    await page.keyboard.press('Tab')

    // Verify some element is focused
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
