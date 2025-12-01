'use server'

import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { hashAnonymousToken } from '@/lib/anonymous-token'
import { desc, eq, and, gte, or } from 'drizzle-orm'
import type { FormData } from '@/components/contribute/types'

export async function submitSalary(
  formData: FormData,
  anonymousToken?: string,
  userId?: string
): Promise<{ success: boolean; submissionId?: number; error?: string }> {
  try {
    // Validate required fields
    if (!formData.companyId || !formData.jobTitleId || !formData.locationId || !formData.baseSalary) {
      return { success: false, error: 'Missing required fields' }
    }

    // Hash the anonymous token
    const tokenHash = anonymousToken ? hashAnonymousToken(anonymousToken) : null

    // Build conditions for checking existing submissions
    const conditions = []
    if (userId) {
      conditions.push(eq(salarySubmission.userId, userId))
    }
    if (tokenHash) {
      conditions.push(eq(salarySubmission.userTokenHash, tokenHash))
    }

    if (conditions.length === 0) {
      return { success: false, error: 'Unable to identify user' }
    }

    // Check for accidental double-submit (within 1 minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const recentSubmission = await db
      .select()
      .from(salarySubmission)
      .where(
        and(
          or(...conditions),
          gte(salarySubmission.submissionDate, oneMinuteAgo)
        )
      )
      .limit(1)

    if (recentSubmission.length > 0) {
      return {
        success: false,
        error: 'You just submitted. Please wait before submitting again.',
      }
    }

    // Check for 3-month cooldown period
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
    const cooldownSubmission = await db
      .select()
      .from(salarySubmission)
      .where(
        and(
          or(...conditions),
          gte(salarySubmission.submissionDate, threeMonthsAgo)
        )
      )
      .orderBy(desc(salarySubmission.submissionDate))
      .limit(1)

    if (cooldownSubmission.length > 0) {
      const lastSubmissionDate = cooldownSubmission[0].submissionDate
      const daysSinceLastSubmission = Math.floor(
        (Date.now() - lastSubmissionDate.getTime()) / (24 * 60 * 60 * 1000)
      )
      const daysRemaining = 90 - daysSinceLastSubmission

      return {
        success: false,
        error: `You can submit again in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. This helps us maintain data quality.`,
      }
    }

    // Calculate access expiration (12 months from now)
    const accessExpiresAt = new Date()
    accessExpiresAt.setMonth(accessExpiresAt.getMonth() + 12)

    // Insert salary submission
    const [result] = await db
      .insert(salarySubmission)
      .values({
        userId: userId || null,
        userTokenHash: tokenHash,
        companyId: formData.companyId,
        jobTitleId: formData.jobTitleId,
        locationId: formData.locationId,
        levelId: formData.companyLevelId || null,
        baseSalary: formData.baseSalary.toString(),
        bonus: '0',
        stockCompensation: '0',
        yearsOfExperience: formData.yearsOfExperience || 0,
        yearsAtCompany: formData.yearsAtCompany || 0,
        accessExpiresAt: accessExpiresAt,
      })
      .returning({ submissionId: salarySubmission.submissionId })

    return {
      success: true,
      submissionId: result.submissionId,
    }
  } catch (error) {
    console.error('Salary submission error:', error)
    return {
      success: false,
      error: 'Failed to submit salary. Please try again.',
    }
  }
}
