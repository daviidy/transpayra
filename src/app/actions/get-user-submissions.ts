'use server'

import { db } from '@/lib/db'
import { salarySubmission, company, jobTitle, location, level } from '@/lib/db/schema'
import { eq, desc, or } from 'drizzle-orm'
import { hashAnonymousToken } from '@/lib/anonymous-token'

export interface UserSubmission {
  submissionId: number
  company: string
  jobTitle: string
  location: string
  level: string | null
  baseSalary: string
  bonus: string
  stockCompensation: string
  totalCompensation: string
  yearsOfExperience: number
  yearsAtCompany: number
  submissionDate: Date
}

/**
 * Get all salary submissions for a user (both authenticated and anonymous)
 *
 * @param userId - The user ID from Supabase
 * @param anonymousToken - Optional anonymous token for pre-migration submissions
 * @returns Array of user's salary submissions
 */
export async function getUserSubmissions(
  userId: string,
  anonymousToken?: string
): Promise<UserSubmission[]> {
  try {
    const conditions = [eq(salarySubmission.userId, userId)]

    // Also include pre-migration anonymous submissions
    if (anonymousToken) {
      const tokenHash = hashAnonymousToken(anonymousToken)
      conditions.push(eq(salarySubmission.userTokenHash, tokenHash))
    }

    const results = await db
      .select({
        submissionId: salarySubmission.submissionId,
        company: company.name,
        jobTitle: jobTitle.title,
        location: location.city,
        state: location.state,
        country: location.country,
        level: level.levelName,
        baseSalary: salarySubmission.baseSalary,
        bonus: salarySubmission.bonus,
        stockCompensation: salarySubmission.stockCompensation,
        yearsOfExperience: salarySubmission.yearsOfExperience,
        yearsAtCompany: salarySubmission.yearsAtCompany,
        submissionDate: salarySubmission.submissionDate,
      })
      .from(salarySubmission)
      .leftJoin(company, eq(salarySubmission.companyId, company.companyId))
      .leftJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
      .leftJoin(location, eq(salarySubmission.locationId, location.locationId))
      .leftJoin(level, eq(salarySubmission.levelId, level.levelId))
      .where(or(...conditions))
      .orderBy(desc(salarySubmission.submissionDate))

    return results.map((row) => ({
      submissionId: row.submissionId,
      company: row.company || 'Unknown',
      jobTitle: row.jobTitle || 'Unknown',
      location: `${row.location || 'Unknown'}${row.state ? ', ' + row.state : ''}, ${row.country || ''}`,
      level: row.level,
      baseSalary: row.baseSalary,
      bonus: row.bonus,
      stockCompensation: row.stockCompensation,
      totalCompensation: (
        parseFloat(row.baseSalary) +
        parseFloat(row.bonus) +
        parseFloat(row.stockCompensation)
      ).toString(),
      yearsOfExperience: row.yearsOfExperience,
      yearsAtCompany: row.yearsAtCompany,
      submissionDate: row.submissionDate,
    }))
  } catch (error) {
    console.error('Error fetching user submissions:', error)
    return []
  }
}
