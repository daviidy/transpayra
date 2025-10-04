'use server'

import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import type { FormData } from '@/components/contribute/types'

export async function submitSalary(formData: FormData): Promise<{ success: boolean; submissionId?: number; error?: string }> {
  try {
    // Validate required fields
    if (!formData.companyId || !formData.jobTitleId || !formData.locationId || !formData.baseSalary) {
      return { success: false, error: 'Missing required fields' }
    }

    // Calculate total compensation
    const baseSalary = formData.baseSalary
    const stockComp = formData.equityGrantValue && formData.vestingDuration
      ? formData.equityGrantValue / formData.vestingDuration
      : 0
    const bonus = formData.actualBonusAmount
      ? formData.actualBonusAmount
      : formData.targetBonusPercent && formData.baseSalary
      ? (formData.baseSalary * formData.targetBonusPercent) / 100
      : 0

    // Insert salary submission
    const [result] = await db
      .insert(salarySubmission)
      .values({
        userId: null, // Anonymous submission
        companyId: formData.companyId,
        jobTitleId: formData.jobTitleId,
        locationId: formData.locationId,
        levelId: formData.companyLevelId || null,
        baseSalary: baseSalary.toString(),
        bonus: bonus.toString(),
        stockCompensation: stockComp.toString(),
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
