import { migrateAnonymousSubmissions } from '@/app/actions/migrate-anonymous-submissions'
import { submitSalary } from '@/app/actions/submit-salary'
import { generateAnonymousToken, hashAnonymousToken } from '@/lib/anonymous-token'
import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { seedTestData } from '../setup'
import type { FormData } from '@/components/contribute/types'

describe('Token Migration - migrateAnonymousSubmissions', () => {
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

  test('should migrate anonymous submission to authenticated user', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-uuid-123'

    // Create anonymous submission
    const submitResult = await submitSalary(validFormData, token)
    expect(submitResult.success).toBe(true)

    // Verify submission has tokenHash but no userId
    const tokenHash = hashAnonymousToken(token)
    const [beforeMigration] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, submitResult.submissionId!))

    expect(beforeMigration.userTokenHash).toBe(tokenHash)
    expect(beforeMigration.userId).toBeNull()

    // Migrate submissions
    const result = await migrateAnonymousSubmissions(userId, token)

    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(1)

    // Verify submission now has userId
    const [afterMigration] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, submitResult.submissionId!))

    expect(afterMigration.userId).toBe(userId)
    expect(afterMigration.userTokenHash).toBe(tokenHash) // Preserved
  })

  test('should migrate multiple anonymous submissions at once', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-uuid-456'

    // Create 3 anonymous submissions with same token
    const submission1 = await submitSalary(validFormData, token)
    const submission2 = await submitSalary({ ...validFormData, baseSalary: 160000 }, token)
    const submission3 = await submitSalary({ ...validFormData, baseSalary: 170000 }, token)

    expect(submission1.success).toBe(true)
    expect(submission2.success).toBe(true)
    expect(submission3.success).toBe(true)

    // Migrate all submissions
    const result = await migrateAnonymousSubmissions(userId, token)

    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(3)

    // Verify all 3 now have userId
    const tokenHash = hashAnonymousToken(token)
    const migratedSubmissions = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.userTokenHash, tokenHash))

    expect(migratedSubmissions.length).toBe(3)
    migratedSubmissions.forEach((sub) => {
      expect(sub.userId).toBe(userId)
    })
  })

  test('should NOT migrate submissions that already have userId', async () => {
    const token = generateAnonymousToken()
    const originalUserId = 'original-user-123'
    const newUserId = 'new-user-456'

    // Create submission and immediately set userId (simulating already-linked submission)
    const submitResult = await submitSalary(validFormData, token)

    await db
      .update(salarySubmission)
      .set({ userId: originalUserId })
      .where(eq(salarySubmission.submissionId, submitResult.submissionId!))

    // Try to migrate with different userId
    const result = await migrateAnonymousSubmissions(newUserId, token)

    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(0) // Should not migrate

    // Verify userId unchanged
    const [submission] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, submitResult.submissionId!))

    expect(submission.userId).toBe(originalUserId) // Still original, not overwritten
  })

  test('should return correct migration count', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-789'

    // Create exactly 2 submissions
    await submitSalary(validFormData, token)
    await submitSalary({ ...validFormData, baseSalary: 155000 }, token)

    const result = await migrateAnonymousSubmissions(userId, token)

    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(2)
  })

  test('should handle case with no anonymous submissions', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-999'

    // Don't create any submissions
    const result = await migrateAnonymousSubmissions(userId, token)

    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(0)
    expect(result.error).toBeUndefined()
  })

  test('should handle invalid token gracefully', async () => {
    const invalidToken = 'not-a-valid-token'
    const userId = 'test-user-invalid'

    // Should not crash
    const result = await migrateAnonymousSubmissions(userId, invalidToken)

    expect(result.success).toBe(true) // No error thrown
    expect(result.migratedCount).toBe(0) // No submissions found
  })

  test('should preserve tokenHash after migration', async () => {
    const token = generateAnonymousToken()
    const tokenHash = hashAnonymousToken(token)
    const userId = 'test-user-preserve'

    // Create submission
    const submitResult = await submitSalary(validFormData, token)

    // Migrate
    await migrateAnonymousSubmissions(userId, token)

    // Verify tokenHash still exists
    const [submission] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, submitResult.submissionId!))

    expect(submission.userTokenHash).toBe(tokenHash)
    expect(submission.userId).toBe(userId)
  })

  test('should handle different tokenHashes separately', async () => {
    const token1 = generateAnonymousToken()
    const token2 = generateAnonymousToken()
    const userId = 'test-user-separate'

    // Create submissions with 2 different tokens
    const sub1 = await submitSalary(validFormData, token1)
    const sub2 = await submitSalary({ ...validFormData, baseSalary: 160000 }, token2)

    expect(sub1.success).toBe(true)
    expect(sub2.success).toBe(true)

    // Migrate only token1
    const result = await migrateAnonymousSubmissions(userId, token1)

    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(1)

    // Verify only token1 submission migrated
    const [submission1] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, sub1.submissionId!))

    const [submission2] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.submissionId, sub2.submissionId!))

    expect(submission1.userId).toBe(userId) // Migrated
    expect(submission2.userId).toBeNull() // Not migrated
  })

  test('should migrate only NULL userId submissions (idempotent)', async () => {
    const token = generateAnonymousToken()
    const userId = 'test-user-idempotent'

    // Create 2 submissions
    await submitSalary(validFormData, token)
    await submitSalary({ ...validFormData, baseSalary: 160000 }, token)

    // First migration
    const result1 = await migrateAnonymousSubmissions(userId, token)
    expect(result1.migratedCount).toBe(2)

    // Second migration (should do nothing)
    const result2 = await migrateAnonymousSubmissions(userId, token)
    expect(result2.migratedCount).toBe(0) // Already migrated
  })

  test('should handle empty token string', async () => {
    const emptyToken = ''
    const userId = 'test-user-empty'

    const result = await migrateAnonymousSubmissions(userId, emptyToken)

    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(0)
  })

  test('should handle special characters in token', async () => {
    // Generate valid token with special chars
    const token = generateAnonymousToken()
    const userId = 'test-user-special-chars-123'

    // Create submission
    await submitSalary(validFormData, token)

    // Should work normally
    const result = await migrateAnonymousSubmissions(userId, token)

    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(1)
  })

  test('should handle very long userId strings', async () => {
    const token = generateAnonymousToken()
    const longUserId = 'a'.repeat(100) // Very long UUID

    await submitSalary(validFormData, token)

    const result = await migrateAnonymousSubmissions(longUserId, token)

    expect(result.success).toBe(true)
    expect(result.migratedCount).toBe(1)

    // Verify long userId stored correctly
    const tokenHash = hashAnonymousToken(token)
    const [submission] = await db
      .select()
      .from(salarySubmission)
      .where(eq(salarySubmission.userTokenHash, tokenHash))

    expect(submission.userId).toBe(longUserId)
  })
})
