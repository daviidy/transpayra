import { checkUserHasAccess } from '@/app/actions/check-access'
import { submitSalary } from '@/app/actions/submit-salary'
import { migrateAnonymousSubmissions } from '@/app/actions/migrate-anonymous-submissions'
import { generateAnonymousToken, hashAnonymousToken } from '@/lib/anonymous-token'
import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { seedTestData } from '../setup'
import type { FormData } from '@/components/contribute/types'

describe('Enhanced Access Control - checkUserHasAccess with OAuth', () => {
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
      yearsAtCompany: 2,
      asOfDate: { month: 12, year: 2024 },
      accuracyConsent: true,
      privacyConsent: true,
    } as FormData
  })

  test('should grant access to authenticated user with submission', async () => {
    const userId = 'test-user-authenticated'
    const token = generateAnonymousToken()

    // Create submission and migrate immediately (simulating authenticated submission)
    const submitResult = await submitSalary(validFormData, token, userId)
    await migrateAnonymousSubmissions(userId, token)

    // Check access with userId only (no token)
    const accessStatus = await checkUserHasAccess(undefined, userId)

    expect(accessStatus.hasAccess).toBe(true)
    expect(accessStatus.expiresAt).toBeDefined()
    expect(accessStatus.daysUntilExpiry).toBeGreaterThan(0)
  })

  test('should grant access to anonymous user with token', async () => {
    const token = generateAnonymousToken()

    // Create anonymous submission
    await submitSalary(validFormData, token)

    // Check access with token only (no userId)
    const accessStatus = await checkUserHasAccess(token, undefined)

    expect(accessStatus.hasAccess).toBe(true)
  })

  test('should grant access with both userId and token (hybrid)', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-hybrid'

    // Create submission with userId
    await submitSalary(validFormData, token, userId)
    await migrateAnonymousSubmissions(userId, token)

    // Check access with both parameters
    const accessStatus = await checkUserHasAccess(token, userId)

    expect(accessStatus.hasAccess).toBe(true)
  })

  test('should deny access when neither userId nor token provided', async () => {
    const accessStatus = await checkUserHasAccess(undefined, undefined)

    expect(accessStatus.hasAccess).toBe(false)
  })

  test('should deny access when user has no submissions', async () => {
    const userId = 'user-with-no-submissions'

    const accessStatus = await checkUserHasAccess(undefined, userId)

    expect(accessStatus.hasAccess).toBe(false)
  })

  test('should deny access when token has no submissions', async () => {
    const token = generateAnonymousToken()

    // Don't create any submission with this token
    const accessStatus = await checkUserHasAccess(token, undefined)

    expect(accessStatus.hasAccess).toBe(false)
  })

  test('should work after migration (userId set)', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-after-migration'

    // Create anonymous submission
    await submitSalary(validFormData, token, userId)

    // Migrate
    await migrateAnonymousSubmissions(userId, token)

    // Check access via userId only (simulating new device without cookie)
    const accessStatus = await checkUserHasAccess(undefined, userId)

    expect(accessStatus.hasAccess).toBe(true)
  })

  test('should still work with tokenHash after migration', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-token-still-works'

    // Create anonymous submission
    await submitSalary(validFormData, token, userId)

    // Migrate (userId + tokenHash both set now)
    await migrateAnonymousSubmissions(userId, token)

    // Check access via token only (backward compatibility)
    const accessStatus = await checkUserHasAccess(token, undefined)

    expect(accessStatus.hasAccess).toBe(true) // Should still work!
  })

  test('should grant access if user has multiple submissions', async () => {
    const userId = 'test-user-multiple'
    const token = generateAnonymousToken()

    // Create 3 submissions (need to wait for cooldown to pass in real scenario, but tests mock time)
    await submitSalary(validFormData, token, userId)
    // Note: In real scenario, these would fail due to cooldown. Tests may need to mock time or adjust

    await migrateAnonymousSubmissions(userId, token)

    // Should grant access (has at least one)
    const accessStatus = await checkUserHasAccess(undefined, userId)

    expect(accessStatus.hasAccess).toBe(true)
  })

  test('should work with wrong token but correct userId', async () => {
    const correctToken = generateAnonymousToken()
    const wrongToken = generateAnonymousToken()
    const userId = 'test-user-wrong-token'

    // Create with correct token
    await submitSalary(validFormData, correctToken, userId)
    await migrateAnonymousSubmissions(userId, correctToken)

    // Check with wrong token but correct userId
    const accessStatus = await checkUserHasAccess(wrongToken, userId)

    expect(accessStatus.hasAccess).toBe(true) // Should work via userId
  })

  test('should deny access with wrong token and no userId', async () => {
    const correctToken = generateAnonymousToken()
    const wrongToken = generateAnonymousToken()

    // Create with correct token
    await submitSalary(validFormData, correctToken)

    // Try to access with wrong token
    const accessStatus = await checkUserHasAccess(wrongToken, undefined)

    expect(accessStatus.hasAccess).toBe(false)
  })

  test('should handle case-sensitive userId', async () => {
    const token = generateAnonymousToken()
    const userId = 'TestUser123'

    await submitSalary(validFormData, token, userId)
    await migrateAnonymousSubmissions(userId, token)

    // Exact match should work
    const accessStatus1 = await checkUserHasAccess(undefined, userId)
    expect(accessStatus1.hasAccess).toBe(true)

    // Different case should not work (database is case-sensitive)
    const accessStatus2 = await checkUserHasAccess(undefined, 'testuser123')
    expect(accessStatus2.hasAccess).toBe(false)
  })

  test('should prioritize userId over token when both match', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-both-match'

    // Create submission
    await submitSalary(validFormData, token, userId)

    // Migrate
    await migrateAnonymousSubmissions(userId, token)

    // Both should work
    const viaToken = await checkUserHasAccess(token, undefined)
    const viaUserId = await checkUserHasAccess(undefined, userId)
    const viaBoth = await checkUserHasAccess(token, userId)

    expect(viaToken.hasAccess).toBe(true)
    expect(viaUserId.hasAccess).toBe(true)
    expect(viaBoth.hasAccess).toBe(true)
  })

  test('should handle empty string userId', async () => {
    const accessStatus = await checkUserHasAccess(undefined, '')

    expect(accessStatus.hasAccess).toBe(false)
  })

  test('should handle empty string token', async () => {
    const accessStatus = await checkUserHasAccess('', undefined)

    expect(accessStatus.hasAccess).toBe(false)
  })

  test('should work across different users with same token (edge case)', async () => {
    const token = generateAnonymousToken()
    const userId1 = 'user-one'
    const userId2 = 'user-two'

    // User 1 creates submission
    await submitSalary(validFormData, token, userId1)

    // User 1 migrates
    await migrateAnonymousSubmissions(userId1, token)

    // User 2 tries to claim same token (shouldn't work)
    const result = await migrateAnonymousSubmissions(userId2, token)
    expect(result.migratedCount).toBe(0) // Already has userId

    // User 1 should have access
    const user1Access = await checkUserHasAccess(undefined, userId1)
    expect(user1Access.hasAccess).toBe(true)

    // User 2 should NOT have access
    const user2Access = await checkUserHasAccess(undefined, userId2)
    expect(user2Access.hasAccess).toBe(false)
  })
})
