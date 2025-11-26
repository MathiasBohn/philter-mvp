/**
 * Unit Tests for lib/utils.ts
 *
 * These tests verify the actual utility functions work correctly,
 * not mock implementations.
 */

import { describe, it, expect } from 'vitest'
import {
  cn,
  formatCurrency,
  formatDate,
  formatSSN,
  calculateDTI,
  calculateNetWorth,
  calculateCompletionPercentage,
} from '@/lib/utils'
import { FinancialEntryType, type FinancialEntry, type ApplicationSection } from '@/lib/types'

describe('cn (class name merger)', () => {
  it('merges multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe('base active')
  })

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('merges conflicting Tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('returns empty string for no input', () => {
    expect(cn()).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formats positive numbers as USD', () => {
    expect(formatCurrency(1234)).toBe('$1,234')
    expect(formatCurrency(1234567)).toBe('$1,234,567')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('formats negative numbers', () => {
    expect(formatCurrency(-1234)).toBe('-$1,234')
  })

  it('rounds decimal values', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235')
    expect(formatCurrency(1234.49)).toBe('$1,234')
  })

  it('handles very large numbers', () => {
    expect(formatCurrency(1000000000)).toBe('$1,000,000,000')
  })
})

describe('formatDate', () => {
  describe('short format (default)', () => {
    it('formats date as MM/DD/YYYY', () => {
      // Use explicit time to avoid timezone issues
      const date = new Date(2024, 2, 15) // March 15, 2024 (month is 0-indexed)
      expect(formatDate(date, 'short')).toBe('03/15/2024')
    })

    it('handles string input with time component', () => {
      // ISO string with explicit time to avoid UTC midnight issues
      expect(formatDate('2024-03-15T12:00:00', 'short')).toBe('03/15/2024')
    })

    it('uses short format by default', () => {
      const date = new Date(2024, 5, 20) // June 20, 2024
      expect(formatDate(date)).toBe('06/20/2024')
    })
  })

  describe('long format', () => {
    it('formats date with full month name', () => {
      const date = new Date(2024, 2, 15) // March 15, 2024
      expect(formatDate(date, 'long')).toBe('March 15, 2024')
    })
  })

  describe('relative format', () => {
    it('returns "Today" for today', () => {
      const today = new Date()
      expect(formatDate(today, 'relative')).toBe('Today')
    })

    it('returns "Yesterday" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(formatDate(yesterday, 'relative')).toBe('Yesterday')
    })

    it('returns "X days ago" for recent dates', () => {
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      expect(formatDate(fiveDaysAgo, 'relative')).toBe('5 days ago')
    })

    it('returns "X weeks ago" for dates within a month', () => {
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      expect(formatDate(twoWeeksAgo, 'relative')).toBe('2 weeks ago')
    })

    it('returns "X months ago" for dates within a year', () => {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90)
      expect(formatDate(threeMonthsAgo, 'relative')).toBe('3 months ago')
    })
  })

  describe('edge cases', () => {
    it('returns "—" for null', () => {
      expect(formatDate(null)).toBe('—')
    })

    it('returns "—" for undefined', () => {
      expect(formatDate(undefined)).toBe('—')
    })

    it('returns "—" for invalid date string', () => {
      expect(formatDate('not-a-date')).toBe('—')
    })
  })
})

describe('formatSSN', () => {
  describe('last4 format (default)', () => {
    it('masks all but last 4 digits', () => {
      expect(formatSSN('123456789')).toBe('xxx-xx-6789')
      expect(formatSSN('123-45-6789')).toBe('xxx-xx-6789')
    })

    it('uses last4 format by default', () => {
      expect(formatSSN('987654321')).toBe('xxx-xx-4321')
    })
  })

  describe('full format', () => {
    it('formats 9-digit SSN with dashes', () => {
      expect(formatSSN('123456789', 'full')).toBe('123-45-6789')
    })

    it('handles SSN already with dashes', () => {
      expect(formatSSN('123-45-6789', 'full')).toBe('123-45-6789')
    })

    it('returns original for invalid length', () => {
      expect(formatSSN('1234', 'full')).toBe('1234')
    })
  })

  describe('redacted format', () => {
    it('returns dots for redacted', () => {
      expect(formatSSN('123456789', 'redacted')).toBe('••••')
    })
  })
})

describe('calculateDTI', () => {
  it('calculates debt-to-income ratio correctly', () => {
    expect(calculateDTI(10000, 3500)).toBe(0.35)
    expect(calculateDTI(5000, 2000)).toBe(0.4)
  })

  it('returns 0 for zero income', () => {
    expect(calculateDTI(0, 1000)).toBe(0)
  })

  it('handles zero expenses', () => {
    expect(calculateDTI(5000, 0)).toBe(0)
  })

  it('returns correct ratio for decimal values', () => {
    expect(calculateDTI(8333.33, 2500)).toBeCloseTo(0.3, 1)
  })
})

describe('calculateNetWorth', () => {
  it('calculates net worth from assets and liabilities', () => {
    const entries: FinancialEntry[] = [
      { id: '1', entryType: FinancialEntryType.ASSET, category: 'Savings', amount: 50000 },
      { id: '2', entryType: FinancialEntryType.ASSET, category: 'Investment', amount: 30000 },
      { id: '3', entryType: FinancialEntryType.LIABILITY, category: 'Mortgage', amount: 200000 },
      { id: '4', entryType: FinancialEntryType.LIABILITY, category: 'Car Loan', amount: 15000 },
    ]

    // Assets: 80,000 - Liabilities: 215,000 = -135,000
    expect(calculateNetWorth(entries)).toBe(-135000)
  })

  it('returns positive net worth when assets exceed liabilities', () => {
    const entries: FinancialEntry[] = [
      { id: '1', entryType: FinancialEntryType.ASSET, category: 'Savings', amount: 100000 },
      { id: '2', entryType: FinancialEntryType.LIABILITY, category: 'Credit Card', amount: 5000 },
    ]

    expect(calculateNetWorth(entries)).toBe(95000)
  })

  it('returns 0 for empty array', () => {
    expect(calculateNetWorth([])).toBe(0)
  })

  it('handles only assets', () => {
    const entries: FinancialEntry[] = [
      { id: '1', entryType: FinancialEntryType.ASSET, category: 'Savings', amount: 10000 },
    ]

    expect(calculateNetWorth(entries)).toBe(10000)
  })

  it('handles only liabilities', () => {
    const entries: FinancialEntry[] = [
      { id: '1', entryType: FinancialEntryType.LIABILITY, category: 'Debt', amount: 5000 },
    ]

    expect(calculateNetWorth(entries)).toBe(-5000)
  })

  it('ignores MONTHLY_INCOME and MONTHLY_EXPENSE types', () => {
    const entries: FinancialEntry[] = [
      { id: '1', entryType: FinancialEntryType.ASSET, category: 'Savings', amount: 10000 },
      { id: '2', entryType: FinancialEntryType.MONTHLY_INCOME, category: 'Salary', amount: 5000 },
      { id: '3', entryType: FinancialEntryType.MONTHLY_EXPENSE, category: 'Rent', amount: 2000 },
    ]

    expect(calculateNetWorth(entries)).toBe(10000)
  })
})

describe('calculateCompletionPercentage', () => {
  it('calculates percentage of completed sections', () => {
    const sections: ApplicationSection[] = [
      { id: '1', title: 'Profile', isComplete: true, path: '/profile' },
      { id: '2', title: 'Income', isComplete: true, path: '/income' },
      { id: '3', title: 'Documents', isComplete: false, path: '/documents' },
      { id: '4', title: 'Review', isComplete: false, path: '/review' },
    ]

    expect(calculateCompletionPercentage(sections)).toBe(50)
  })

  it('returns 100 for all completed', () => {
    const sections: ApplicationSection[] = [
      { id: '1', title: 'Profile', isComplete: true, path: '/profile' },
      { id: '2', title: 'Income', isComplete: true, path: '/income' },
    ]

    expect(calculateCompletionPercentage(sections)).toBe(100)
  })

  it('returns 0 for none completed', () => {
    const sections: ApplicationSection[] = [
      { id: '1', title: 'Profile', isComplete: false, path: '/profile' },
      { id: '2', title: 'Income', isComplete: false, path: '/income' },
    ]

    expect(calculateCompletionPercentage(sections)).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(calculateCompletionPercentage([])).toBe(0)
  })

  it('rounds to nearest integer', () => {
    const sections: ApplicationSection[] = [
      { id: '1', title: 'Profile', isComplete: true, path: '/profile' },
      { id: '2', title: 'Income', isComplete: false, path: '/income' },
      { id: '3', title: 'Documents', isComplete: false, path: '/documents' },
    ]

    // 1/3 = 33.33... -> rounds to 33
    expect(calculateCompletionPercentage(sections)).toBe(33)
  })
})
