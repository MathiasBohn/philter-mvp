/**
 * E2E Tests for Authentication Flows
 *
 * Tests real user authentication against the running application
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Pages', () => {
  test.describe('Sign In Page', () => {
    test('displays sign in form', async ({ page }) => {
      await page.goto('/sign-in')

      // Check page title and heading
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
      await expect(page.getByText('Sign in to your philter account')).toBeVisible()

      // Check form elements exist
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
    })

    test('shows password field by default', async ({ page }) => {
      await page.goto('/sign-in')

      await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('can toggle to magic link mode', async ({ page }) => {
      await page.goto('/sign-in')

      // Click magic link toggle
      await page.getByRole('button', { name: 'Sign in with magic link' }).click()

      // Password field should be hidden
      await expect(page.getByLabel('Password')).not.toBeVisible()

      // Button should change
      await expect(page.getByRole('button', { name: 'Send magic link' })).toBeVisible()
    })

    test('shows error for invalid credentials', async ({ page }) => {
      await page.goto('/sign-in')

      // Fill in invalid credentials
      await page.getByLabel('Email').fill('invalid@test.com')
      await page.getByLabel('Password').fill('wrongpassword')

      // Submit form
      await page.getByRole('button', { name: 'Sign in', exact: true }).click()

      // Wait for error message (the actual message depends on Supabase response)
      await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 })
    })

    test('has link to forgot password', async ({ page }) => {
      await page.goto('/sign-in')

      const forgotLink = page.getByRole('link', { name: 'Forgot password?' })
      await expect(forgotLink).toBeVisible()
      await expect(forgotLink).toHaveAttribute('href', '/forgot-password')
    })

    test('has link to sign up', async ({ page }) => {
      await page.goto('/sign-in')

      const signUpLink = page.getByRole('link', { name: 'Sign up' })
      await expect(signUpLink).toBeVisible()
      await expect(signUpLink).toHaveAttribute('href', '/sign-up')
    })

    test('remember me checkbox is functional', async ({ page }) => {
      await page.goto('/sign-in')

      const checkbox = page.getByRole('checkbox', { name: /remember me/i })
      await expect(checkbox).toBeVisible()
      await expect(checkbox).not.toBeChecked()

      await checkbox.click()
      await expect(checkbox).toBeChecked()
    })
  })

  test.describe('Sign Up Page', () => {
    test('displays sign up form', async ({ page }) => {
      await page.goto('/sign-up')

      await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible()
      await expect(page.getByText('Sign up for philter to get started')).toBeVisible()
    })

    test('has all required form fields', async ({ page }) => {
      await page.goto('/sign-up')

      await expect(page.getByLabel('First name')).toBeVisible()
      await expect(page.getByLabel('Last name')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      // Role uses a custom select component - check by text
      await expect(page.getByText('Role')).toBeVisible()
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
      await expect(page.getByLabel('Confirm password')).toBeVisible()
    })

    test('has terms and privacy policy checkbox', async ({ page }) => {
      await page.goto('/sign-up')

      await expect(page.getByRole('link', { name: 'terms of service' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'privacy policy' })).toBeVisible()
    })

    test('submit button is disabled until terms accepted', async ({ page }) => {
      await page.goto('/sign-up')

      const submitButton = page.getByRole('button', { name: 'Create account' })
      await expect(submitButton).toBeDisabled()

      // Check terms checkbox
      await page.getByRole('checkbox').click()

      await expect(submitButton).toBeEnabled()
    })

    test('shows error when passwords do not match', async ({ page }) => {
      await page.goto('/sign-up')

      // Fill in form with mismatched passwords
      await page.getByLabel('First name').fill('Test')
      await page.getByLabel('Last name').fill('User')
      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password', { exact: true }).fill('password123')
      await page.getByLabel('Confirm password').fill('differentpassword')
      await page.getByRole('checkbox').click()

      await page.getByRole('button', { name: 'Create account' }).click()

      await expect(page.getByText('Passwords do not match')).toBeVisible()
    })

    test('shows error for weak password', async ({ page }) => {
      await page.goto('/sign-up')

      // Fill in form with weak password
      await page.getByLabel('First name').fill('Test')
      await page.getByLabel('Last name').fill('User')
      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password', { exact: true }).fill('short')
      await page.getByLabel('Confirm password').fill('short')
      await page.getByRole('checkbox').click()

      await page.getByRole('button', { name: 'Create account' }).click()

      await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
    })

    test('role selector has all options', async ({ page }) => {
      await page.goto('/sign-up')

      // Click role selector trigger (Radix UI select uses button with combobox role)
      await page.locator('button[role="combobox"]').click()

      // Check all role options are present
      await expect(page.getByRole('option', { name: 'Applicant' })).toBeVisible()
      await expect(page.getByRole('option', { name: 'Broker' })).toBeVisible()
      await expect(page.getByRole('option', { name: 'Transaction Agent' })).toBeVisible()
      await expect(page.getByRole('option', { name: 'Board Member' })).toBeVisible()
    })

    test('has link to sign in', async ({ page }) => {
      await page.goto('/sign-up')

      const signInLink = page.getByRole('link', { name: 'Sign in' })
      await expect(signInLink).toBeVisible()
      await expect(signInLink).toHaveAttribute('href', '/sign-in')
    })
  })

  test.describe('Forgot Password Page', () => {
    test('displays forgot password form', async ({ page }) => {
      await page.goto('/forgot-password')

      await expect(page.getByRole('heading', { name: /forgot/i })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('sign in page has working logo link to home', async ({ page }) => {
      await page.goto('/sign-in')

      // Click logo link (first link on the page that goes to home)
      await page.locator('a[href="/"]').first().click()

      await expect(page).toHaveURL('/')
    })

    test('unauthenticated user is redirected from protected routes', async ({ page }) => {
      // Try to access a protected route
      await page.goto('/my-applications')

      // Should be redirected to sign in
      await expect(page).toHaveURL(/sign-in/)
    })

    test('unauthenticated user is redirected from dashboard', async ({ page }) => {
      await page.goto('/applications')

      // Should be redirected to sign in
      await expect(page).toHaveURL(/sign-in/)
    })
  })
})

test.describe('Theme Toggle', () => {
  test('theme toggle is visible on sign in page', async ({ page }) => {
    await page.goto('/sign-in')

    // Theme toggle button should be visible
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible()
  })

  test('theme toggle is visible on sign up page', async ({ page }) => {
    await page.goto('/sign-up')

    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible()
  })
})
