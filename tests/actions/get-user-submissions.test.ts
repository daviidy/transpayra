import { getUserSubmissions } from '@/app/actions/get-user-submissions'
import { submitSalary } from '@/app/actions/submit-salary'
import { migrateAnonymousSubmissions } from '@/app/actions/migrate-anonymous-submissions'
import { generateAnonymousToken } from '@/lib/anonymous-token'
import { seedTestData } from '../setup'
import type { FormData } from '@/components/contribute/types'

describe('Get User Submissions - getUserSubmissions', () => {
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

  test('should fetch submissions for authenticated user', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-fetch'

    // Create 2 submissions
    await submitSalary(validFormData, token)
    await submitSalary({ ...validFormData, baseSalary: 160000 }, token)

    // Migrate to userId
    await migrateAnonymousSubmissions(userId, token)

    // Fetch submissions
    const submissions = await getUserSubmissions(userId)

    expect(submissions.length).toBe(2)
  })

  test('should include JOINed data (company, job, location)', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-joins'

    await submitSalary(validFormData, token)
    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions.length).toBe(1)
    expect(submissions[0].company).toBe('Google')
    expect(submissions[0].jobTitle).toBe('Software Engineer')
    expect(submissions[0].location).toContain('San Francisco')
    expect(submissions[0].level).toBe('L3')
  })

  test('should calculate total compensation correctly', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-calc'

    // Base: 100k, Bonus: 20k, Stock: 100k (400k/4 years)
    const formData: FormData = {
      ...validFormData,
      baseSalary: 100000,
      actualBonusAmount: 20000,
      equityGrantValue: 400000,
      vestingDuration: 4,
    }

    await submitSalary(formData, token)
    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions.length).toBe(1)
    // Total = 100k + 20k + 100k = 220k
    expect(parseFloat(submissions[0].totalCompensation)).toBe(220000)
  })

  test('should order by submission date descending', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-order'

    // Create 3 submissions (will have different timestamps)
    await submitSalary({ ...validFormData, baseSalary: 100000 }, token)
    await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay

    await submitSalary({ ...validFormData, baseSalary: 200000 }, token)
    await new Promise((resolve) => setTimeout(resolve, 100))

    await submitSalary({ ...validFormData, baseSalary: 300000 }, token)

    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions.length).toBe(3)

    // Most recent should be first
    expect(parseFloat(submissions[0].baseSalary)).toBe(300000)
    expect(parseFloat(submissions[1].baseSalary)).toBe(200000)
    expect(parseFloat(submissions[2].baseSalary)).toBe(100000)
  })

  test('should return empty array for user with no submissions', async () => {
    const userId = 'user-with-no-submissions'

    const submissions = await getUserSubmissions(userId)

    expect(submissions).toEqual([])
  })

  test('should include pre-migration anonymous submissions', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-pre-migration'

    // Create anonymous submission (don't migrate)
    await submitSalary(validFormData, token)

    // Fetch with token parameter
    const submissions = await getUserSubmissions(userId, token)

    expect(submissions.length).toBe(1)
  })

  test('should format location correctly', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-location'

    await submitSalary(validFormData, token)
    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions[0].location).toBe('San Francisco, CA, United States')
  })

  test('should handle NULL level', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-null-level'

    // Create submission without level
    const formData: FormData = { ...validFormData, companyLevelId: undefined }
    await submitSalary(formData, token)
    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions.length).toBe(1)
    expect(submissions[0].level).toBeNull()
  })

  test('should include all compensation fields', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-compensation'

    await submitSalary(validFormData, token)
    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions[0].baseSalary).toBe('150000')
    expect(submissions[0].bonus).toBe('20000')
    expect(submissions[0].stockCompensation).toBe('100000') // 400k/4
  })

  test('should include experience fields', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-experience'

    await submitSalary(validFormData, token)
    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions[0].yearsOfExperience).toBe(5)
    expect(submissions[0].yearsAtCompany).toBe(2)
  })

  test('should include submission date', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-date'

    await submitSalary(validFormData, token)
    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions[0].submissionDate).toBeInstanceOf(Date)
    expect(submissions[0].submissionDate.getTime()).toBeLessThanOrEqual(Date.now())
  })

  test('should include submissionId', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-id'

    const submitResult = await submitSalary(validFormData, token)
    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions[0].submissionId).toBe(submitResult.submissionId)
  })

  test('should fetch from different companies', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-companies'

    // Submit to Google
    await submitSalary(validFormData, token)

    // Submit to Meta
    await submitSalary({ ...validFormData, companyId: testData.companies.meta.companyId }, token)

    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions.length).toBe(2)
    const companies = submissions.map((s) => s.company).sort()
    expect(companies).toEqual(['Google', 'Meta'])
  })

  test('should handle user with only anonymous token (no userId in DB)', async () => {
    const token = generateAnonymousToken()
    const userId = 'user-not-yet-migrated'

    // Create anonymous submission (don't migrate)
    await submitSalary(validFormData, token)

    // Fetch with token (simulating before sign-in)
    const submissions = await getUserSubmissions(userId, token)

    expect(submissions.length).toBe(1)
  })

  test('should return both migrated and unmigrated submissions', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-mixed'

    // Create 2 anonymous submissions
    await submitSalary({ ...validFormData, baseSalary: 100000 }, token)
    await submitSalary({ ...validFormData, baseSalary: 200000 }, token)

    // Migrate only first one manually (edge case)
    await migrateAnonymousSubmissions(userId, token)

    // Should get both via token parameter
    const submissions = await getUserSubmissions(userId, token)

    expect(submissions.length).toBe(2)
  })

  test('should handle zero compensation values', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-zeros'

    const formData: FormData = {
      ...validFormData,
      actualBonusAmount: 0,
      equityGrantValue: 0,
    }

    await submitSalary(formData, token)
    await migrateAnonymousSubmissions(userId, token)

    const submissions = await getUserSubmissions(userId)

    expect(submissions[0].bonus).toBe('0')
    expect(submissions[0].stockCompensation).toBe('0')
    expect(parseFloat(submissions[0].totalCompensation)).toBe(150000) // Only base salary
  })
})
