import { submitSalary } from '@/app/actions/submit-salary'
import { checkUserHasAccess } from '@/app/actions/check-access'
import { migrateAnonymousSubmissions } from '@/app/actions/migrate-anonymous-submissions'
import { getUserSubmissions } from '@/app/actions/get-user-submissions'
import { generateAnonymousToken } from '@/lib/anonymous-token'
import { seedTestData } from '../setup'
import type { FormData } from '@/components/contribute/types'

describe('Integration - Complete OAuth Flow', () => {
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

  test('Complete flow: Anonymous → Sign In → Dashboard', async () => {
    // ============================================
    // PHASE 1: Anonymous User Submits Salary
    // ============================================
    const token = generateAnonymousToken()

    // 1. Submit salary anonymously
    const submitResult = await submitSalary(validFormData, token)
    expect(submitResult.success).toBe(true)
    expect(submitResult.submissionId).toBeDefined()

    // 2. Verify anonymous access works
    const anonAccess = await checkUserHasAccess(token)
    expect(anonAccess).toBe(true)

    // 3. Verify can't access with different token
    const wrongToken = generateAnonymousToken()
    const noAccess = await checkUserHasAccess(wrongToken)
    expect(noAccess).toBe(false)

    // ============================================
    // PHASE 2: User Signs In (OAuth Callback)
    // ============================================
    const userId = 'oauth-user-github-12345'

    // 4. Simulate OAuth sign-in - migration happens
    const migrationResult = await migrateAnonymousSubmissions(userId, token)
    expect(migrationResult.success).toBe(true)
    expect(migrationResult.migratedCount).toBe(1)

    // ============================================
    // PHASE 3: Authenticated Access
    // ============================================

    // 5. User now has access via userId (cross-device!)
    const authAccess = await checkUserHasAccess(undefined, userId)
    expect(authAccess).toBe(true)

    // 6. Old token still works (backward compatibility)
    const tokenStillWorks = await checkUserHasAccess(token, undefined)
    expect(tokenStillWorks).toBe(true)

    // ============================================
    // PHASE 4: Dashboard View
    // ============================================

    // 7. Fetch submissions for dashboard
    const submissions = await getUserSubmissions(userId, token)
    expect(submissions.length).toBe(1)

    // 8. Verify submission data is correct
    const submission = submissions[0]
    expect(submission.company).toBe('Google')
    expect(submission.jobTitle).toBe('Software Engineer')
    expect(submission.level).toBe('L3')
    expect(parseFloat(submission.baseSalary)).toBe(150000)
    expect(parseFloat(submission.bonus)).toBe(20000)
    expect(parseFloat(submission.stockCompensation)).toBe(100000) // 400k/4
    expect(parseFloat(submission.totalCompensation)).toBe(270000)

    // ============================================
    // PHASE 5: Cross-Device Access
    // ============================================

    // 9. Simulate signing in on another device (no token cookie)
    const deviceBAccess = await checkUserHasAccess(undefined, userId)
    expect(deviceBAccess).toBe(true)

    // 10. Fetch submissions on device B (no token)
    const deviceBSubmissions = await getUserSubmissions(userId)
    expect(deviceBSubmissions.length).toBe(1)
  })

  test('Cross-device access after sign-in', async () => {
    const userId = 'cross-device-user'

    // ============================================
    // DEVICE A: Sign in and submit
    // ============================================
    const deviceAToken = generateAnonymousToken()

    // Submit on Device A
    await submitSalary(validFormData, deviceAToken)
    await migrateAnonymousSubmissions(userId, deviceAToken)

    // ============================================
    // DEVICE B: Sign in (different token/session)
    // ============================================
    const deviceBToken = generateAnonymousToken() // Different token!

    // Should still have access via userId
    const deviceBAccess = await checkUserHasAccess(deviceBToken, userId)
    expect(deviceBAccess).toBe(true) // Works because of userId

    // Should see same submissions
    const deviceBSubmissions = await getUserSubmissions(userId, deviceBToken)
    expect(deviceBSubmissions.length).toBe(1)

    // ============================================
    // DEVICE C: No token at all
    // ============================================

    // Should still have access via userId only
    const deviceCAccess = await checkUserHasAccess(undefined, userId)
    expect(deviceCAccess).toBe(true)

    const deviceCSubmissions = await getUserSubmissions(userId)
    expect(deviceCSubmissions.length).toBe(1)
  })

  test('Multiple anonymous submissions migrate together', async () => {
    const token = generateAnonymousToken()
    const userId = 'multi-submission-user'

    // ============================================
    // PHASE 1: Submit 3 salaries anonymously
    // ============================================

    // Submission 1: Google
    await submitSalary(validFormData, token)

    // Submission 2: Meta
    await submitSalary({
      ...validFormData,
      companyId: testData.companies.meta.companyId,
      baseSalary: 180000,
    }, token)

    // Submission 3: Google (different level)
    await submitSalary({
      ...validFormData,
      companyLevelId: testData.levels.l4.levelId,
      baseSalary: 200000,
    }, token)

    // Verify anonymous access
    const anonAccess = await checkUserHasAccess(token)
    expect(anonAccess).toBe(true)

    // ============================================
    // PHASE 2: Sign In - All migrate together
    // ============================================

    const migrationResult = await migrateAnonymousSubmissions(userId, token)
    expect(migrationResult.success).toBe(true)
    expect(migrationResult.migratedCount).toBe(3) // All 3 at once!

    // ============================================
    // PHASE 3: Dashboard shows all 3
    // ============================================

    const submissions = await getUserSubmissions(userId, token)
    expect(submissions.length).toBe(3)

    // Verify companies
    const companies = submissions.map((s) => s.company).sort()
    expect(companies).toEqual(['Google', 'Google', 'Meta'])

    // Verify salaries
    const salaries = submissions.map((s) => parseFloat(s.baseSalary)).sort((a, b) => a - b)
    expect(salaries).toEqual([150000, 180000, 200000])
  })

  test('User journey: Anonymous → Add salary → Sign in → Add another salary', async () => {
    const token = generateAnonymousToken()
    const userId = 'journey-user'

    // ============================================
    // STEP 1: Anonymous submission
    // ============================================
    await submitSalary({ ...validFormData, baseSalary: 120000 }, token)

    let submissions = await getUserSubmissions(userId, token)
    expect(submissions.length).toBe(1)

    // ============================================
    // STEP 2: User signs in
    // ============================================
    await migrateAnonymousSubmissions(userId, token)

    submissions = await getUserSubmissions(userId, token)
    expect(submissions.length).toBe(1)

    // ============================================
    // STEP 3: User adds another salary (authenticated)
    // ============================================
    // This time, we'll manually set userId to simulate authenticated submission
    const newToken = generateAnonymousToken()
    const submitResult = await submitSalary({ ...validFormData, baseSalary: 150000 }, newToken)

    // Manually link it (in real app, this would happen in submit-salary.ts when user is authenticated)
    await migrateAnonymousSubmissions(userId, newToken)

    // ============================================
    // STEP 4: Dashboard shows both submissions
    // ============================================
    submissions = await getUserSubmissions(userId, token)
    expect(submissions.length).toBe(2)

    const salaries = submissions.map((s) => parseFloat(s.baseSalary)).sort((a, b) => a - b)
    expect(salaries).toEqual([120000, 150000])
  })

  test('Edge case: Sign in before ever submitting', async () => {
    const userId = 'new-user-no-submissions'

    // User signs in with GitHub/Google but has never submitted
    const fakeToken = generateAnonymousToken()

    // Migration should succeed but migrate nothing
    const result = await migrateAnonymousSubmissions(userId, fakeToken)
    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(0)

    // No access yet (hasn't submitted)
    const hasAccess = await checkUserHasAccess(undefined, userId)
    expect(hasAccess).toBe(false)

    // Dashboard should be empty
    const submissions = await getUserSubmissions(userId)
    expect(submissions.length).toBe(0)
  })

  test('Edge case: Multiple sign-ins with same token (idempotent)', async () => {
    const token = generateAnonymousToken()
    const userId = 'idempotent-user'

    // Submit anonymously
    await submitSalary(validFormData, token)

    // Sign in first time
    const result1 = await migrateAnonymousSubmissions(userId, token)
    expect(result1.migratedCount).toBe(1)

    // Sign in again (e.g., user logs out and logs back in)
    const result2 = await migrateAnonymousSubmissions(userId, token)
    expect(result2.migratedCount).toBe(0) // Already migrated

    // Should still have access
    const hasAccess = await checkUserHasAccess(undefined, userId)
    expect(hasAccess).toBe(true)

    // Should still see submission
    const submissions = await getUserSubmissions(userId)
    expect(submissions.length).toBe(1)
  })

  test('Real-world scenario: User workflow over 1 week', async () => {
    const token = generateAnonymousToken()
    const userId = 'week-long-user'

    // ============================================
    // DAY 1: User discovers site, submits anonymously
    // ============================================
    await submitSalary({
      ...validFormData,
      companyId: testData.companies.google.companyId,
      baseSalary: 120000,
    }, token)

    // ============================================
    // DAY 3: User comes back, browses more salaries
    // ============================================
    const day3Access = await checkUserHasAccess(token)
    expect(day3Access).toBe(true) // Cookie still works

    // ============================================
    // DAY 5: User adds another salary anonymously
    // ============================================
    await submitSalary({
      ...validFormData,
      companyId: testData.companies.meta.companyId,
      baseSalary: 140000,
    }, token)

    // ============================================
    // DAY 7: User decides to create account
    // ============================================
    const migrationResult = await migrateAnonymousSubmissions(userId, token)
    expect(migrationResult.migratedCount).toBe(2) // Both submissions!

    // ============================================
    // Future: User can access from anywhere
    // ============================================
    const crossDeviceAccess = await checkUserHasAccess(undefined, userId)
    expect(crossDeviceAccess).toBe(true)

    const allSubmissions = await getUserSubmissions(userId)
    expect(allSubmissions.length).toBe(2)

    // Verify both companies present
    const companies = allSubmissions.map((s) => s.company).sort()
    expect(companies).toEqual(['Google', 'Meta'])
  })
})
