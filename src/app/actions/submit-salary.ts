'use server'

import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { hashAnonymousToken } from '@/lib/anonymous-token'
import { desc, eq, and, gte } from 'drizzle-orm'
import type { FormData } from '@/components/contribute/types'

export async function submitSalary(
  formData: FormData,
  anonymousToken?: string
): Promise<{ success: boolean; submissionId?: number; error?: string }> {
  try {
    // Validate required fields
    if (!formData.companyId || !formData.jobTitleId || !formData.locationId || !formData.baseSalary) {
      return { success: false, error: 'Missing required fields' }
    }

    // Hash the anonymous token
    const tokenHash = anonymousToken ? hashAnonymousToken(anonymousToken) : null

    // Check for recent duplicate submissions (prevent accidental double-submit)
    if (tokenHash) {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
      const recentSubmission = await db
        .select()
        .from(salarySubmission)
        .where(
          and(
            eq(salarySubmission.userTokenHash, tokenHash),
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
    }

    // Insert salary submission
    const [result] = await db
      .insert(salarySubmission)
      .values({
        userId: null, // Anonymous submission
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
