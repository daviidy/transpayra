'use server'

import { db } from '@/lib/db'
import { salarySubmission, company, jobTitle, location, level } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface SubmissionDetails {
  submissionId: number
  companyName: string
  companyId: number
  companyLogoUrl?: string | null
  jobTitle: string
  levelName?: string
  levelDescription?: string
  city: string
  state?: string
  country: string
  baseSalary: string
  bonus: string
  stockCompensation: string
  currency: string
  yearsOfExperience: number
  yearsAtCompany: number
  submissionDate: Date
}

export async function getSubmissionDetails(submissionId: number): Promise<SubmissionDetails | null> {
  const result = await db
    .select({
      submissionId: salarySubmission.submissionId,
      companyName: company.name,
      companyId: company.companyId,
      companyLogoUrl: company.logoUrl,
      jobTitle: jobTitle.title,
      levelName: level.levelName,
      levelDescription: level.description,
      city: location.city,
      state: location.state,
      country: location.country,
      baseSalary: salarySubmission.baseSalary,
      bonus: salarySubmission.bonus,
      stockCompensation: salarySubmission.stockCompensation,
      currency: salarySubmission.currency,
      yearsOfExperience: salarySubmission.yearsOfExperience,
      yearsAtCompany: salarySubmission.yearsAtCompany,
      submissionDate: salarySubmission.submissionDate,
    })
    .from(salarySubmission)
    .innerJoin(company, eq(salarySubmission.companyId, company.companyId))
    .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
    .innerJoin(location, eq(salarySubmission.locationId, location.locationId))
    .leftJoin(level, eq(salarySubmission.levelId, level.levelId))
    .where(eq(salarySubmission.submissionId, submissionId))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return result[0] as SubmissionDetails
}