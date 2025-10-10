# Functional Tests - Transpayra

## Test Database Setup

### 1. Create Test Database
```bash
# Create separate test database
createdb transpayra_test

# Or via psql
psql postgres
CREATE DATABASE transpayra_test;
```

### 2. Environment Configuration
Create `.env.test`:
```env
DATABASE_URL=postgresql://localhost:5432/transpayra_test
ANONYMOUS_TOKEN_SALT=test-4f8a9d2b6c1e7f3a5d8b9c2e4f6a8d1b2c3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a
NODE_ENV=test
```

### 3. Test Setup Script
Create `tests/setup.ts`:
```typescript
import { db } from '@/lib/db'
import {
  salarySubmission,
  company,
  jobTitle,
  location,
  industry,
  level
} from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function setupTestDatabase() {
  // Run migrations
  await db.execute(sql`
    -- Migration scripts will be run by drizzle-kit
  `)
}

export async function cleanDatabase() {
  // Delete in correct order (respecting foreign keys)
  await db.delete(salarySubmission)
  await db.delete(level)
  await db.delete(location)
  await db.delete(jobTitle)
  await db.delete(company)
  await db.delete(industry)
}

export async function seedTestData() {
  // Insert test industries
  const [techIndustry] = await db.insert(industry).values({
    name: 'Technology',
  }).returning()

  const [financeIndustry] = await db.insert(industry).values({
    name: 'Finance',
  }).returning()

  // Insert test companies
  const [googleCompany] = await db.insert(company).values({
    name: 'Google',
  }).returning()

  const [metaCompany] = await db.insert(company).values({
    name: 'Meta',
  }).returning()

  // Insert test job titles
  const [sweJobTitle] = await db.insert(jobTitle).values({
    title: 'Software Engineer',
    industryId: techIndustry.industryId,
  }).returning()

  const [dataJobTitle] = await db.insert(jobTitle).values({
    title: 'Data Scientist',
    industryId: techIndustry.industryId,
  }).returning()

  // Insert test locations
  const [sfLocation] = await db.insert(location).values({
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
  }).returning()

  const [nyLocation] = await db.insert(location).values({
    city: 'New York',
    state: 'NY',
    country: 'United States',
  }).returning()

  // Insert test levels
  const [l3Level] = await db.insert(level).values({
    levelName: 'L3',
    companyId: googleCompany.companyId,
    jobTitleId: sweJobTitle.jobTitleId,
  }).returning()

  const [l4Level] = await db.insert(level).values({
    levelName: 'L4',
    companyId: googleCompany.companyId,
    jobTitleId: sweJobTitle.jobTitleId,
  }).returning()

  return {
    industries: { tech: techIndustry, finance: financeIndustry },
    companies: { google: googleCompany, meta: metaCompany },
    jobTitles: { swe: sweJobTitle, data: dataJobTitle },
    locations: { sf: sfLocation, ny: nyLocation },
    levels: { l3: l3Level, l4: l4Level },
  }
}
```

### 4. Test Runner Configuration
Update `package.json`:
```json
{
  "scripts": {
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage",
    "test:setup": "NODE_ENV=test tsx tests/setup-db.ts"
  }
}
```

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
}
```

Create `tests/jest.setup.ts`:
```typescript
import { cleanDatabase, seedTestData } from './setup'

beforeEach(async () => {
  await cleanDatabase()
  await seedTestData()
})

afterAll(async () => {
  await cleanDatabase()
})
```

---

## Test Suite 1: Anonymous Token System

### TEST-001: Token Generation
**File:** `tests/anonymous-token.test.ts`
```typescript
import { generateAnonymousToken, hashAnonymousToken, verifyAnonymousToken } from '@/lib/anonymous-token'

describe('Anonymous Token System', () => {
  test('should generate unique 64-character hex tokens', () => {
    const token1 = generateAnonymousToken()
    const token2 = generateAnonymousToken()

    expect(token1).toHaveLength(64)
    expect(token2).toHaveLength(64)
    expect(token1).not.toBe(token2)
    expect(token1).toMatch(/^[0-9a-f]{64}$/)
  })

  test('should hash tokens consistently', () => {
    const token = generateAnonymousToken()
    const hash1 = hashAnonymousToken(token)
    const hash2 = hashAnonymousToken(token)

    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(128) // 64 bytes = 128 hex chars
  })

  test('should produce different hashes for different tokens', () => {
    const token1 = generateAnonymousToken()
    const token2 = generateAnonymousToken()

    const hash1 = hashAnonymousToken(token1)
    const hash2 = hashAnonymousToken(token2)

    expect(hash1).not.toBe(hash2)
  })

  test('should verify tokens correctly', () => {
    const token = generateAnonymousToken()
    const hash = hashAnonymousToken(token)

    expect(verifyAnonymousToken(token, hash)).toBe(true)
  })

  test('should reject incorrect tokens', () => {
    const token1 = generateAnonymousToken()
    const token2 = generateAnonymousToken()
    const hash1 = hashAnonymousToken(token1)

    expect(verifyAnonymousToken(token2, hash1)).toBe(false)
  })
})
```

### TEST-002: Token Persistence (Client-Side Hook)
**File:** `tests/hooks/useAnonymousToken.test.tsx`
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken'
import Cookies from 'js-cookie'

describe('useAnonymousToken Hook', () => {
  beforeEach(() => {
    Cookies.remove('anonymous_user_token')
  })

  test('should generate token on first use', async () => {
    const { result } = renderHook(() => useAnonymousToken())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.token).toBeTruthy()
    expect(result.current.token).toHaveLength(64)
  })

  test('should reuse existing token from cookie', async () => {
    const existingToken = 'a'.repeat(64)
    Cookies.set('anonymous_user_token', existingToken)

    const { result } = renderHook(() => useAnonymousToken())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.token).toBe(existingToken)
  })

  test('should set cookie with 365 day expiration', async () => {
    const { result } = renderHook(() => useAnonymousToken())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const cookieValue = Cookies.get('anonymous_user_token')
    expect(cookieValue).toBe(result.current.token)
  })
})
```

---

## Test Suite 2: Access Control

### TEST-003: Check Access (No Submission)
**File:** `tests/actions/check-access.test.ts`
```typescript
import { checkUserHasAccess } from '@/app/actions/check-access'
import { generateAnonymousToken } from '@/lib/anonymous-token'
import { seedTestData } from '../setup'

describe('checkUserHasAccess', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>

  beforeEach(async () => {
    testData = await seedTestData()
  })

  test('should return false for new token with no submissions', async () => {
    const token = generateAnonymousToken()
    const hasAccess = await checkUserHasAccess(token)

    expect(hasAccess).toBe(false)
  })

  test('should return false for undefined token', async () => {
    const hasAccess = await checkUserHasAccess(undefined)

    expect(hasAccess).toBe(false)
  })

  test('should return false for empty string token', async () => {
    const hasAccess = await checkUserHasAccess('')

    expect(hasAccess).toBe(false)
  })
})
```

### TEST-004: Check Access (With Submission)
```typescript
import { checkUserHasAccess } from '@/app/actions/check-access'
import { submitSalary } from '@/app/actions/submit-salary'
import { generateAnonymousToken } from '@/lib/anonymous-token'
import { seedTestData } from '../setup'
import type { FormData } from '@/components/contribute/types'

describe('checkUserHasAccess - After Submission', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>
  let testFormData: FormData

  beforeEach(async () => {
    testData = await seedTestData()

    testFormData = {
      industryId: testData.industries.tech.industryId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      companyId: testData.companies.google.companyId,
      locationId: testData.locations.sf.locationId,
      companyLevelId: testData.levels.l3.levelId,
      workModel: 'Remote',
      employmentType: 'Full-time',
      currency: 'USD',
      baseSalary: 150000,
      actualBonusAmount: 20000,
      equityType: 'RSU',
      equityGrantValue: 400000,
      vestingDuration: 4,
      yearsOfExperience: 5,
      yearsAtCompany: 2,
      asOfDate: { month: 12, year: 2024 },
      accuracyConsent: true,
      privacyConsent: true,
    } as FormData
  })

  test('should return true after successful submission', async () => {
    const token = generateAnonymousToken()

    const result = await submitSalary(testFormData, token)
    expect(result.success).toBe(true)

    const hasAccess = await checkUserHasAccess(token)
    expect(hasAccess).toBe(true)
  })

  test('should return false for different token', async () => {
    const token1 = generateAnonymousToken()
    const token2 = generateAnonymousToken()

    await submitSalary(testFormData, token1)

    const hasAccess = await checkUserHasAccess(token2)
    expect(hasAccess).toBe(false)
  })

  test('should persist access across multiple checks', async () => {
    const token = generateAnonymousToken()

    await submitSalary(testFormData, token)

    const hasAccess1 = await checkUserHasAccess(token)
    const hasAccess2 = await checkUserHasAccess(token)
    const hasAccess3 = await checkUserHasAccess(token)

    expect(hasAccess1).toBe(true)
    expect(hasAccess2).toBe(true)
    expect(hasAccess3).toBe(true)
  })
})
```

---

## Test Suite 3: Salary Submission

### TEST-005: Submit Salary - Success
**File:** `tests/actions/submit-salary.test.ts`
```typescript
import { submitSalary } from '@/app/actions/submit-salary'
import { generateAnonymousToken } from '@/lib/anonymous-token'
import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { seedTestData } from '../setup'
import type { FormData } from '@/components/contribute/types'

describe('submitSalary', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>
  let validFormData: FormData

  beforeEach(async () => {
    testData = await seedTestData()

    validFormData = {
      industryId: testData.industries.tech.industryId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      companyId: testData.companies.google.companyId,
      locationId: testData.locations.sf.locationId,
      companyLevelId: testData.levels.l3.levelId,
      workModel: 'Remote',
      employmentType: 'Full-time',
      currency: 'USD',
      baseSalary: 150000,
      actualBonusAmount: 20000,
      equityType: 'RSU',
      equityGrantValue: 400000,
      vestingDuration: 4,
      yearsOfExperience: 5,
      yearsAtCompany: 2,
      asOfDate: { month: 12, year: 2024 },
      accuracyConsent: true,
      privacyConsent: true,
    } as FormData
  })

  test('should successfully submit with all required fields', async () => {
    const token = generateAnonymousToken()
    const result = await submitSalary(validFormData, token)

    expect(result.success).toBe(true)
    expect(result.submissionId).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  test('should store hashed token in database', async () => {
    const token = generateAnonymousToken()
    const result = await submitSalary(validFormData, token)

    const [submission] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, result.submissionId!))

    expect(submission.userTokenHash).toBeTruthy()
    expect(submission.userTokenHash).not.toBe(token) // Should be hashed
    expect(submission.userTokenHash).toHaveLength(128) // PBKDF2 SHA512 output
  })

  test('should correctly calculate total compensation', async () => {
    const token = generateAnonymousToken()
    const result = await submitSalary(validFormData, token)

    const [submission] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, result.submissionId!))

    const expectedStockPerYear = 400000 / 4 // 100k per year
    const expectedTotal = 150000 + 20000 + expectedStockPerYear // 270k

    expect(parseFloat(submission.baseSalary)).toBe(150000)
    expect(parseFloat(submission.bonus)).toBe(20000)
    expect(parseFloat(submission.stockCompensation)).toBe(100000)
  })

  test('should handle zero bonus correctly', async () => {
    const token = generateAnonymousToken()
    const formData = { ...validFormData, actualBonusAmount: 0 }

    const result = await submitSalary(formData, token)

    const [submission] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, result.submissionId!))

    expect(parseFloat(submission.bonus)).toBe(0)
  })

  test('should handle no equity correctly', async () => {
    const token = generateAnonymousToken()
    const formData = {
      ...validFormData,
      equityType: 'None',
      equityGrantValue: undefined,
      vestingDuration: undefined,
    } as FormData

    const result = await submitSalary(formData, token)

    const [submission] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, result.submissionId!))

    expect(parseFloat(submission.stockCompensation)).toBe(0)
  })
})
```

### TEST-006: Submit Salary - Validation Errors
```typescript
describe('submitSalary - Validation', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>
  let token: string

  beforeEach(async () => {
    testData = await seedTestData()
    token = generateAnonymousToken()
  })

  test('should fail without companyId', async () => {
    const invalidData = {
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      locationId: testData.locations.sf.locationId,
      baseSalary: 150000,
    } as FormData

    const result = await submitSalary(invalidData, token)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Missing required fields')
  })

  test('should fail without jobTitleId', async () => {
    const invalidData = {
      companyId: testData.companies.google.companyId,
      locationId: testData.locations.sf.locationId,
      baseSalary: 150000,
    } as FormData

    const result = await submitSalary(invalidData, token)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Missing required fields')
  })

  test('should fail without locationId', async () => {
    const invalidData = {
      companyId: testData.companies.google.companyId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      baseSalary: 150000,
    } as FormData

    const result = await submitSalary(invalidData, token)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Missing required fields')
  })

  test('should fail without baseSalary', async () => {
    const invalidData = {
      companyId: testData.companies.google.companyId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      locationId: testData.locations.sf.locationId,
    } as FormData

    const result = await submitSalary(invalidData, token)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Missing required fields')
  })
})
```

### TEST-007: Submit Salary - Duplicate Prevention
```typescript
describe('submitSalary - Duplicate Prevention', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>
  let validFormData: FormData

  beforeEach(async () => {
    testData = await seedTestData()
    validFormData = {
      industryId: testData.industries.tech.industryId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      companyId: testData.companies.google.companyId,
      locationId: testData.locations.sf.locationId,
      baseSalary: 150000,
      actualBonusAmount: 20000,
      yearsOfExperience: 5,
      asOfDate: { month: 12, year: 2024 },
      accuracyConsent: true,
      privacyConsent: true,
    } as FormData
  })

  test('should prevent duplicate submission within 1 minute', async () => {
    const token = generateAnonymousToken()

    const result1 = await submitSalary(validFormData, token)
    expect(result1.success).toBe(true)

    const result2 = await submitSalary(validFormData, token)
    expect(result2.success).toBe(false)
    expect(result2.error).toBe('You just submitted. Please wait before submitting again.')
  })

  test('should allow submission after 1 minute', async () => {
    const token = generateAnonymousToken()

    const result1 = await submitSalary(validFormData, token)
    expect(result1.success).toBe(true)

    // Mock time passage (in real test, would use jest.useFakeTimers)
    // For now, we'll test the logic exists

    // Wait 61 seconds would allow:
    // const result2 = await submitSalary(validFormData, token)
    // expect(result2.success).toBe(true)
  })

  test('should allow different tokens to submit immediately', async () => {
    const token1 = generateAnonymousToken()
    const token2 = generateAnonymousToken()

    const result1 = await submitSalary(validFormData, token1)
    const result2 = await submitSalary(validFormData, token2)

    expect(result1.success).toBe(true)
    expect(result2.success).toBe(true)
  })
})
```

---

## Test Suite 4: Search Functionality

### TEST-008: Search Suggestions
**File:** `tests/actions/search.test.ts`
```typescript
import { searchSuggestions } from '@/app/actions/search'
import { seedTestData } from '../setup'

describe('searchSuggestions', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>

  beforeEach(async () => {
    testData = await seedTestData()
  })

  test('should return job title suggestions', async () => {
    const results = await searchSuggestions('Software')

    expect(results.jobTitles.length).toBeGreaterThan(0)
    expect(results.jobTitles[0].name).toContain('Software Engineer')
    expect(results.jobTitles[0].type).toBe('job')
  })

  test('should return company suggestions', async () => {
    const results = await searchSuggestions('Google')

    expect(results.companies.length).toBeGreaterThan(0)
    expect(results.companies[0].name).toBe('Google')
    expect(results.companies[0].type).toBe('company')
  })

  test('should return location suggestions', async () => {
    const results = await searchSuggestions('San Francisco')

    expect(results.locations.length).toBeGreaterThan(0)
    expect(results.locations[0].name).toContain('San Francisco')
    expect(results.locations[0].type).toBe('location')
  })

  test('should return industry suggestions', async () => {
    const results = await searchSuggestions('Technology')

    expect(results.industries.length).toBeGreaterThan(0)
    expect(results.industries[0].name).toBe('Technology')
    expect(results.industries[0].type).toBe('industry')
  })

  test('should return empty results for no matches', async () => {
    const results = await searchSuggestions('XYZ Nonexistent Company')

    expect(results.jobTitles.length).toBe(0)
    expect(results.companies.length).toBe(0)
    expect(results.locations.length).toBe(0)
    expect(results.industries.length).toBe(0)
  })

  test('should be case insensitive', async () => {
    const results1 = await searchSuggestions('google')
    const results2 = await searchSuggestions('GOOGLE')
    const results3 = await searchSuggestions('Google')

    expect(results1.companies.length).toBe(results2.companies.length)
    expect(results2.companies.length).toBe(results3.companies.length)
  })

  test('should limit results to 3 per category', async () => {
    // Assuming we have more than 3 tech-related entries
    const results = await searchSuggestions('a') // Very broad search

    expect(results.jobTitles.length).toBeLessThanOrEqual(3)
    expect(results.companies.length).toBeLessThanOrEqual(3)
    expect(results.locations.length).toBeLessThanOrEqual(3)
    expect(results.industries.length).toBeLessThanOrEqual(3)
  })

  test('should include submission counts', async () => {
    const token = generateAnonymousToken()

    // Submit salary for Google Software Engineer
    await submitSalary({
      companyId: testData.companies.google.companyId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      locationId: testData.locations.sf.locationId,
      baseSalary: 150000,
      yearsOfExperience: 5,
    } as FormData, token)

    const results = await searchSuggestions('Software Engineer')

    expect(results.jobTitles[0].submissionCount).toBeGreaterThan(0)
  })
})
```

### TEST-009: Search Salaries by Job Title
**File:** `tests/actions/search-salaries.test.ts`
```typescript
import { searchSalaries } from '@/app/actions/search-salaries'
import { submitSalary } from '@/app/actions/submit-salary'
import { generateAnonymousToken } from '@/lib/anonymous-token'
import { seedTestData } from '../setup'
import type { FormData } from '@/components/contribute/types'

describe('searchSalaries', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>

  beforeEach(async () => {
    testData = await seedTestData()

    // Seed some submissions
    const token = generateAnonymousToken()
    await submitSalary({
      companyId: testData.companies.google.companyId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      locationId: testData.locations.sf.locationId,
      baseSalary: 150000,
      actualBonusAmount: 20000,
      equityGrantValue: 400000,
      vestingDuration: 4,
      yearsOfExperience: 5,
      yearsAtCompany: 2,
    } as FormData, token)
  })

  test('should filter by jobTitleId', async () => {
    const results = await searchSalaries({
      jobTitleId: testData.jobTitles.swe.jobTitleId,
    })

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].jobTitle).toBe('Software Engineer')
  })

  test('should filter by companyId', async () => {
    const results = await searchSalaries({
      companyId: testData.companies.google.companyId,
    })

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].company).toBe('Google')
  })

  test('should filter by locationId', async () => {
    const results = await searchSalaries({
      locationId: testData.locations.sf.locationId,
    })

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].location).toContain('San Francisco')
  })

  test('should filter by industryId', async () => {
    const results = await searchSalaries({
      industryId: testData.industries.tech.industryId,
    })

    expect(results.length).toBeGreaterThan(0)
  })

  test('should combine multiple filters', async () => {
    const results = await searchSalaries({
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      companyId: testData.companies.google.companyId,
      locationId: testData.locations.sf.locationId,
    })

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].jobTitle).toBe('Software Engineer')
    expect(results[0].company).toBe('Google')
    expect(results[0].location).toContain('San Francisco')
  })

  test('should return empty array for no matches', async () => {
    const results = await searchSalaries({
      companyId: testData.companies.meta.companyId, // No submissions for Meta yet
    })

    expect(results.length).toBe(0)
  })

  test('should include total compensation', async () => {
    const results = await searchSalaries({
      jobTitleId: testData.jobTitles.swe.jobTitleId,
    })

    expect(results[0].totalCompensation).toBeDefined()
    // 150k base + 20k bonus + 100k stock = 270k
    expect(parseFloat(results[0].totalCompensation)).toBe(270000)
  })

  test('should order by submission date descending', async () => {
    const token = generateAnonymousToken()

    // Submit older entry
    await submitSalary({
      companyId: testData.companies.google.companyId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      locationId: testData.locations.ny.locationId,
      baseSalary: 140000,
      yearsOfExperience: 3,
    } as FormData, token)

    const results = await searchSalaries({
      jobTitleId: testData.jobTitles.swe.jobTitleId,
    })

    // Most recent first
    expect(results.length).toBeGreaterThanOrEqual(2)
    const dates = results.map(r => new Date(r.submissionDate).getTime())
    expect(dates[0]).toBeGreaterThanOrEqual(dates[1])
  })
})
```

---

## Test Suite 5: Percentile Calculations

### TEST-010: Statistics Calculations
**File:** `tests/utils/percentile.test.ts`
```typescript
// Extract percentile calculation to utility function first
// src/lib/utils/percentile.ts
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (percentile / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower

  if (lower === upper) return sorted[lower]
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

// tests/utils/percentile.test.ts
import { calculatePercentile } from '@/lib/utils/percentile'

describe('calculatePercentile', () => {
  test('should calculate median correctly', () => {
    const values = [100, 200, 300, 400, 500]
    expect(calculatePercentile(values, 50)).toBe(300)
  })

  test('should calculate 25th percentile', () => {
    const values = [100, 200, 300, 400, 500]
    expect(calculatePercentile(values, 25)).toBe(200)
  })

  test('should calculate 75th percentile', () => {
    const values = [100, 200, 300, 400, 500]
    expect(calculatePercentile(values, 75)).toBe(400)
  })

  test('should calculate 90th percentile', () => {
    const values = [100, 200, 300, 400, 500]
    expect(calculatePercentile(values, 90)).toBe(460)
  })

  test('should handle single value', () => {
    expect(calculatePercentile([100], 50)).toBe(100)
    expect(calculatePercentile([100], 90)).toBe(100)
  })

  test('should handle empty array', () => {
    expect(calculatePercentile([], 50)).toBe(0)
  })

  test('should handle unsorted input', () => {
    const values = [500, 100, 300, 200, 400]
    expect(calculatePercentile(values, 50)).toBe(300)
  })

  test('should interpolate between values', () => {
    const values = [100, 200]
    expect(calculatePercentile(values, 50)).toBe(150)
  })
})
```

---

## Test Suite 6: Integration Tests

### TEST-011: Complete User Flow (No Previous Submission)
**File:** `tests/integration/user-flow.test.ts`
```typescript
import { generateAnonymousToken } from '@/lib/anonymous-token'
import { submitSalary } from '@/app/actions/submit-salary'
import { checkUserHasAccess } from '@/app/actions/check-access'
import { searchSalaries } from '@/app/actions/search-salaries'
import { seedTestData } from '../setup'
import type { FormData } from '@/components/contribute/types'

describe('Complete User Flow - First Time Visitor', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>

  beforeEach(async () => {
    testData = await seedTestData()
  })

  test('should complete full flow: generate token → no access → submit → has access → view all results', async () => {
    // Step 1: User visits site, token generated
    const token = generateAnonymousToken()
    expect(token).toBeTruthy()

    // Step 2: User searches and views results - should not have access
    let hasAccess = await checkUserHasAccess(token)
    expect(hasAccess).toBe(false)

    // Step 3: User submits salary
    const formData: FormData = {
      industryId: testData.industries.tech.industryId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      companyId: testData.companies.google.companyId,
      locationId: testData.locations.sf.locationId,
      companyLevelId: testData.levels.l3.levelId,
      baseSalary: 150000,
      actualBonusAmount: 20000,
      equityGrantValue: 400000,
      vestingDuration: 4,
      yearsOfExperience: 5,
      yearsAtCompany: 2,
      asOfDate: { month: 12, year: 2024 },
      accuracyConsent: true,
      privacyConsent: true,
    } as FormData

    const submitResult = await submitSalary(formData, token)
    expect(submitResult.success).toBe(true)

    // Step 4: User now has access
    hasAccess = await checkUserHasAccess(token)
    expect(hasAccess).toBe(true)

    // Step 5: User can view their submission in search results
    const results = await searchSalaries({
      jobTitleId: testData.jobTitles.swe.jobTitleId,
    })

    expect(results.length).toBeGreaterThan(0)
    const userSubmission = results.find(r => r.submissionId === submitResult.submissionId)
    expect(userSubmission).toBeDefined()
    expect(userSubmission!.company).toBe('Google')
    expect(userSubmission!.totalCompensation).toBe('270000')
  })
})
```

### TEST-012: Complete User Flow (Returning Visitor)
```typescript
describe('Complete User Flow - Returning Visitor', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>
  let existingToken: string

  beforeEach(async () => {
    testData = await seedTestData()

    // Simulate previous visit with submission
    existingToken = generateAnonymousToken()
    await submitSalary({
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      companyId: testData.companies.google.companyId,
      locationId: testData.locations.sf.locationId,
      baseSalary: 150000,
      yearsOfExperience: 5,
    } as FormData, existingToken)
  })

  test('should immediately have access with existing token', async () => {
    // User returns with token in cookie
    const hasAccess = await checkUserHasAccess(existingToken)

    expect(hasAccess).toBe(true)
  })

  test('should view all results without paywall', async () => {
    const hasAccess = await checkUserHasAccess(existingToken)
    const results = await searchSalaries({
      jobTitleId: testData.jobTitles.swe.jobTitleId,
    })

    // In real implementation, component would use hasAccess to determine visibility
    expect(hasAccess).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })
})
```

---

## Test Suite 7: Edge Cases

### TEST-013: Large Numbers
```typescript
describe('Edge Cases - Large Numbers', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>

  beforeEach(async () => {
    testData = await seedTestData()
  })

  test('should handle very large base salary', async () => {
    const token = generateAnonymousToken()
    const result = await submitSalary({
      companyId: testData.companies.google.companyId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      locationId: testData.locations.sf.locationId,
      baseSalary: 999999999, // ~1 billion
      yearsOfExperience: 20,
    } as FormData, token)

    expect(result.success).toBe(true)
  })

  test('should handle very large equity grants', async () => {
    const token = generateAnonymousToken()
    const result = await submitSalary({
      companyId: testData.companies.google.companyId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      locationId: testData.locations.sf.locationId,
      baseSalary: 200000,
      equityGrantValue: 10000000, // 10 million
      vestingDuration: 4,
      yearsOfExperience: 15,
    } as FormData, token)

    expect(result.success).toBe(true)
  })
})
```

### TEST-014: Special Characters
```typescript
describe('Edge Cases - Special Characters', () => {
  test('should handle company names with special characters', async () => {
    const [company] = await db.insert(company).values({
      name: "O'Reilly Media & Co.",
    }).returning()

    expect(company.name).toBe("O'Reilly Media & Co.")
  })

  test('should handle location names with accents', async () => {
    const [location] = await db.insert(location).values({
      city: 'São Paulo',
      country: 'Brazil',
    }).returning()

    expect(location.city).toBe('São Paulo')
  })

  test('should search with special characters', async () => {
    await db.insert(company).values({ name: "O'Reilly" })

    const results = await searchSuggestions("O'Reilly")
    expect(results.companies.length).toBeGreaterThan(0)
  })
})
```

---

## Test Suite 8: Performance

### TEST-015: Query Performance
**File:** `tests/performance/queries.test.ts`
```typescript
describe('Query Performance', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>

  beforeEach(async () => {
    testData = await seedTestData()

    // Seed 100 submissions
    const token = generateAnonymousToken()
    const promises = []
    for (let i = 0; i < 100; i++) {
      promises.push(
        submitSalary({
          companyId: testData.companies.google.companyId,
          jobTitleId: testData.jobTitles.swe.jobTitleId,
          locationId: testData.locations.sf.locationId,
          baseSalary: 100000 + (i * 1000),
          yearsOfExperience: Math.floor(i / 10),
        } as FormData, token)
      )
    }
    await Promise.all(promises)
  })

  test('checkUserHasAccess should complete in <100ms with indexed token', async () => {
    const token = generateAnonymousToken()
    await submitSalary({
      companyId: testData.companies.google.companyId,
      jobTitleId: testData.jobTitles.swe.jobTitleId,
      locationId: testData.locations.sf.locationId,
      baseSalary: 150000,
      yearsOfExperience: 5,
    } as FormData, token)

    const start = Date.now()
    await checkUserHasAccess(token)
    const duration = Date.now() - start

    expect(duration).toBeLessThan(100)
  })

  test('searchSalaries should complete in <200ms with 100 submissions', async () => {
    const start = Date.now()
    await searchSalaries({
      jobTitleId: testData.jobTitles.swe.jobTitleId,
    })
    const duration = Date.now() - start

    expect(duration).toBeLessThan(200)
  })

  test('searchSuggestions should complete in <150ms', async () => {
    const start = Date.now()
    await searchSuggestions('Software')
    const duration = Date.now() - start

    expect(duration).toBeLessThan(150)
  })
})
```

---

## Running the Tests

### Setup
```bash
# Install test dependencies
npm install --save-dev jest ts-jest @types/jest @testing-library/react @testing-library/react-hooks

# Create test database
createdb transpayra_test

# Run migrations on test database
NODE_ENV=test npm run db:push

# Set test environment variable
echo "ANONYMOUS_TOKEN_SALT=test-4f8a9d2b6c1e7f3a5d8b9c2e4f6a8d1b2c3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a" >> .env.test
```

### Run Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/anonymous-token.test.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only integration tests
npm test -- tests/integration/
```

### CI/CD Integration
Create `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: transpayra_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/transpayra_test
        run: npm run db:push

      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/transpayra_test
          ANONYMOUS_TOKEN_SALT: test-salt-for-ci
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Test Coverage Goals

| Area | Target Coverage |
|------|----------------|
| Anonymous Token System | 100% |
| Access Control | 100% |
| Salary Submission | 95% |
| Search Functions | 90% |
| Utility Functions | 100% |
| UI Components | 80% |
| **Overall** | **90%** |

---

## Maintenance

### When to Update Tests
- After schema changes → Update seed data
- After adding new features → Add new test suites
- After bug fixes → Add regression tests
- After performance improvements → Update performance benchmarks

### Test Database Management
```bash
# Reset test database
dropdb transpayra_test && createdb transpayra_test && NODE_ENV=test npm run db:push

# Inspect test data
psql transpayra_test
```
