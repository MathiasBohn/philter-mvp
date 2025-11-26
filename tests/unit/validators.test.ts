/**
 * Unit Tests for lib/validators.ts
 *
 * Tests Zod validation schemas to ensure form validation works correctly.
 */

import { describe, it, expect } from 'vitest'
import {
  buildingCodeSchema,
  addressHistorySchema,
  profileSchema,
  employmentSchema,
  financialEntrySchema,
  documentUploadSchema,
  disclosureSchema,
  rfiCreationSchema,
  decisionSchema,
} from '@/lib/validators'

describe('buildingCodeSchema', () => {
  it('accepts valid building code', () => {
    const result = buildingCodeSchema.safeParse({ code: 'BLD001' })
    expect(result.success).toBe(true)
  })

  it('rejects empty building code', () => {
    const result = buildingCodeSchema.safeParse({ code: '' })
    expect(result.success).toBe(false)
  })

  it('rejects building code shorter than 6 characters', () => {
    const result = buildingCodeSchema.safeParse({ code: 'BLD' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 6 characters')
    }
  })
})

describe('addressHistorySchema', () => {
  const validAddress = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    fromDate: new Date('2020-01-01'),
    isCurrent: true,
  }

  it('accepts valid address', () => {
    const result = addressHistorySchema.safeParse(validAddress)
    expect(result.success).toBe(true)
  })

  it('accepts address with optional unit', () => {
    const result = addressHistorySchema.safeParse({ ...validAddress, unit: '5A' })
    expect(result.success).toBe(true)
  })

  it('rejects missing street', () => {
    const { street, ...noStreet } = validAddress
    const result = addressHistorySchema.safeParse(noStreet)
    expect(result.success).toBe(false)
  })

  it('rejects invalid ZIP code format', () => {
    const result = addressHistorySchema.safeParse({ ...validAddress, zip: '1234' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid ZIP')
    }
  })

  it('accepts ZIP+4 format', () => {
    const result = addressHistorySchema.safeParse({ ...validAddress, zip: '10001-1234' })
    expect(result.success).toBe(true)
  })

  it('rejects state code longer than 2 characters', () => {
    const result = addressHistorySchema.safeParse({ ...validAddress, state: 'New York' })
    expect(result.success).toBe(false)
  })
})

describe('employmentSchema', () => {
  const validEmployment = {
    employer: 'Acme Corp',
    title: 'Software Engineer',
    startDate: new Date('2020-01-01'),
    payCadence: 'ANNUAL' as const,
    annualIncome: 100000,
    isCurrent: true,
  }

  it('accepts valid employment record', () => {
    const result = employmentSchema.safeParse(validEmployment)
    expect(result.success).toBe(true)
  })

  it('accepts all pay cadence options', () => {
    const cadences = ['ANNUAL', 'MONTHLY', 'BIWEEKLY', 'WEEKLY'] as const
    cadences.forEach(payCadence => {
      const result = employmentSchema.safeParse({ ...validEmployment, payCadence })
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid pay cadence', () => {
    const result = employmentSchema.safeParse({ ...validEmployment, payCadence: 'DAILY' })
    expect(result.success).toBe(false)
  })

  it('rejects negative income', () => {
    const result = employmentSchema.safeParse({ ...validEmployment, annualIncome: -50000 })
    expect(result.success).toBe(false)
  })

  it('accepts zero income (e.g., unpaid intern)', () => {
    const result = employmentSchema.safeParse({ ...validEmployment, annualIncome: 0 })
    expect(result.success).toBe(true)
  })

  it('coerces string dates to Date objects', () => {
    const result = employmentSchema.safeParse({
      ...validEmployment,
      startDate: '2020-01-01',
    })
    expect(result.success).toBe(true)
  })

  it('coerces string income to number', () => {
    const result = employmentSchema.safeParse({
      ...validEmployment,
      annualIncome: '100000',
    })
    expect(result.success).toBe(true)
  })
})

describe('financialEntrySchema', () => {
  const validAsset = {
    entryType: 'ASSET' as const,
    category: 'Savings Account',
    amount: 50000,
  }

  it('accepts valid asset entry', () => {
    const result = financialEntrySchema.safeParse(validAsset)
    expect(result.success).toBe(true)
  })

  it('accepts all entry types', () => {
    const types = ['ASSET', 'LIABILITY', 'MONTHLY_INCOME', 'MONTHLY_EXPENSE'] as const
    types.forEach(entryType => {
      const result = financialEntrySchema.safeParse({ ...validAsset, entryType })
      expect(result.success).toBe(true)
    })
  })

  it('accepts optional institution', () => {
    const result = financialEntrySchema.safeParse({
      ...validAsset,
      institution: 'Chase Bank',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional description', () => {
    const result = financialEntrySchema.safeParse({
      ...validAsset,
      description: 'Emergency fund',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty category', () => {
    const result = financialEntrySchema.safeParse({ ...validAsset, category: '' })
    expect(result.success).toBe(false)
  })

  it('rejects negative amount', () => {
    const result = financialEntrySchema.safeParse({ ...validAsset, amount: -100 })
    expect(result.success).toBe(false)
  })

  it('coerces string amount to number', () => {
    const result = financialEntrySchema.safeParse({ ...validAsset, amount: '50000' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amount).toBe(50000)
    }
  })
})

describe('disclosureSchema', () => {
  it('accepts acknowledged LOCAL_LAW_55 disclosure', () => {
    const result = disclosureSchema.safeParse({
      type: 'LOCAL_LAW_55',
      acknowledged: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts acknowledged WINDOW_GUARD disclosure', () => {
    const result = disclosureSchema.safeParse({
      type: 'WINDOW_GUARD',
      acknowledged: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects unacknowledged disclosure', () => {
    const result = disclosureSchema.safeParse({
      type: 'LOCAL_LAW_55',
      acknowledged: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('acknowledge')
    }
  })

  it('rejects invalid disclosure type', () => {
    const result = disclosureSchema.safeParse({
      type: 'INVALID_TYPE',
      acknowledged: true,
    })
    expect(result.success).toBe(false)
  })
})

describe('rfiCreationSchema', () => {
  const validRfi = {
    sectionKey: 'income',
    assigneeRole: 'APPLICANT' as const,
    message: 'Please provide additional documentation for your income verification.',
  }

  it('accepts valid RFI creation', () => {
    const result = rfiCreationSchema.safeParse(validRfi)
    expect(result.success).toBe(true)
  })

  it('accepts BROKER assignee role', () => {
    const result = rfiCreationSchema.safeParse({ ...validRfi, assigneeRole: 'BROKER' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid assignee role', () => {
    const result = rfiCreationSchema.safeParse({ ...validRfi, assigneeRole: 'ADMIN' })
    expect(result.success).toBe(false)
  })

  it('rejects message shorter than 10 characters', () => {
    const result = rfiCreationSchema.safeParse({ ...validRfi, message: 'Too short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 10 characters')
    }
  })

  it('accepts optional document reference', () => {
    const result = rfiCreationSchema.safeParse({
      ...validRfi,
      documentReferenceId: 'doc-123',
    })
    expect(result.success).toBe(true)
  })
})

describe('decisionSchema', () => {
  const validDecision = {
    decision: 'APPROVED' as const,
    usesConsumerReport: false,
  }

  it('accepts APPROVED decision', () => {
    const result = decisionSchema.safeParse(validDecision)
    expect(result.success).toBe(true)
  })

  it('accepts CONDITIONAL decision', () => {
    const result = decisionSchema.safeParse({ ...validDecision, decision: 'CONDITIONAL' })
    expect(result.success).toBe(true)
  })

  it('accepts DENIED decision', () => {
    const result = decisionSchema.safeParse({ ...validDecision, decision: 'DENIED' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid decision type', () => {
    const result = decisionSchema.safeParse({ ...validDecision, decision: 'MAYBE' })
    expect(result.success).toBe(false)
  })

  describe('adverse action notice requirements', () => {
    it('requires adverse action notice for DENIED with consumer report', () => {
      const result = decisionSchema.safeParse({
        decision: 'DENIED',
        usesConsumerReport: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Adverse action notice')
      }
    })

    it('requires adverse action notice for CONDITIONAL with consumer report', () => {
      const result = decisionSchema.safeParse({
        decision: 'CONDITIONAL',
        usesConsumerReport: true,
      })
      expect(result.success).toBe(false)
    })

    it('accepts DENIED with consumer report when adverse action notice provided', () => {
      const result = decisionSchema.safeParse({
        decision: 'DENIED',
        usesConsumerReport: true,
        adverseActionNotice: 'Application denied based on credit report review.',
      })
      expect(result.success).toBe(true)
    })

    it('does not require adverse action for APPROVED with consumer report', () => {
      const result = decisionSchema.safeParse({
        decision: 'APPROVED',
        usesConsumerReport: true,
      })
      expect(result.success).toBe(true)
    })

    it('does not require adverse action for DENIED without consumer report', () => {
      const result = decisionSchema.safeParse({
        decision: 'DENIED',
        usesConsumerReport: false,
      })
      expect(result.success).toBe(true)
    })
  })

  it('accepts optional reason codes', () => {
    const result = decisionSchema.safeParse({
      ...validDecision,
      reasonCodes: ['INSUFFICIENT_INCOME', 'INCOMPLETE_DOCS'],
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional notes', () => {
    const result = decisionSchema.safeParse({
      ...validDecision,
      notes: 'Reviewed by compliance team.',
    })
    expect(result.success).toBe(true)
  })
})

describe('profileSchema', () => {
  const validProfile = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '212-555-1234',
    dob: new Date('1990-01-01'),
    ssn: '123-45-6789',
    addressHistory: [
      {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        fromDate: new Date('2020-01-01'),
        isCurrent: true,
      },
    ],
  }

  it('accepts valid profile', () => {
    const result = profileSchema.safeParse(validProfile)
    expect(result.success).toBe(true)
  })

  it('rejects age under 18', () => {
    const under18 = new Date()
    under18.setFullYear(under18.getFullYear() - 17)

    const result = profileSchema.safeParse({ ...validProfile, dob: under18 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('18 years old')
    }
  })

  it('accepts age exactly 18', () => {
    const exactly18 = new Date()
    exactly18.setFullYear(exactly18.getFullYear() - 18)

    const result = profileSchema.safeParse({ ...validProfile, dob: exactly18 })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = profileSchema.safeParse({ ...validProfile, email: 'invalid-email' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid phone format', () => {
    const result = profileSchema.safeParse({ ...validProfile, phone: '123' })
    expect(result.success).toBe(false)
  })

  it('accepts various phone formats', () => {
    const formats = ['212-555-1234', '(212) 555-1234', '212.555.1234', '2125551234']
    formats.forEach(phone => {
      const result = profileSchema.safeParse({ ...validProfile, phone })
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid SSN format', () => {
    const result = profileSchema.safeParse({ ...validProfile, ssn: '123456789' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('XXX-XX-XXXX')
    }
  })

  it('rejects empty address history', () => {
    const result = profileSchema.safeParse({ ...validProfile, addressHistory: [] })
    expect(result.success).toBe(false)
  })

  it('rejects name shorter than 2 characters', () => {
    const result = profileSchema.safeParse({ ...validProfile, fullName: 'J' })
    expect(result.success).toBe(false)
  })
})

describe('documentUploadSchema', () => {
  // Create mock File object for testing
  const createMockFile = (name: string, type: string, size: number): File => {
    const blob = new Blob([''], { type })
    return new File([blob], name, { type }) as File & { size: number }
  }

  it('accepts valid PDF file', () => {
    const file = createMockFile('document.pdf', 'application/pdf', 1024 * 1024)
    // Note: File size in mock is always 0, so we test the type validation
    const result = documentUploadSchema.safeParse({
      file,
      category: 'BANK_STATEMENT',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid image files', () => {
    const jpegFile = createMockFile('photo.jpg', 'image/jpeg', 1024)
    const pngFile = createMockFile('photo.png', 'image/png', 1024)

    expect(documentUploadSchema.safeParse({ file: jpegFile, category: 'ID' }).success).toBe(true)
    expect(documentUploadSchema.safeParse({ file: pngFile, category: 'ID' }).success).toBe(true)
  })

  it('accepts Word documents', () => {
    const docFile = createMockFile('letter.doc', 'application/msword', 1024)
    const docxFile = createMockFile('letter.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1024)

    expect(documentUploadSchema.safeParse({ file: docFile, category: 'COVER_LETTER' }).success).toBe(true)
    expect(documentUploadSchema.safeParse({ file: docxFile, category: 'COVER_LETTER' }).success).toBe(true)
  })

  it('rejects empty category', () => {
    const file = createMockFile('doc.pdf', 'application/pdf', 1024)
    const result = documentUploadSchema.safeParse({ file, category: '' })
    expect(result.success).toBe(false)
  })
})
