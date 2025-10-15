'use server'

import { db } from '@/lib/db'
import { company, industry, salarySubmission, jobTitle, location, level } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export interface CompanyDetails {
  companyId: number
  name: string
  logoUrl?: string | null
  website?: string | null
  industry?: string | null
  headquarters?: string | null
  founded?: number | null
  companyType?: string | null
  description?: string | null
}

export interface CompanySalarySubmission {
  submissionId: number
  jobTitle: string
  levelName?: string
  city: string
  state?: string
  country: string
  baseSalary: string
  bonus?: string
  stockCompensation?: string
  currency: string
  yearsOfExperience: number
  yearsAtCompany: number
  submissionDate: Date
  totalCompensation: number
}

export interface CompanyLocation {
  city: string
  state?: string
  country: string
  submissionCount: number
}

export async function getCompanyDetails(companyId: number): Promise<CompanyDetails | null> {
  const result = await db
    .select({
      companyId: company.companyId,
      name: company.name,
      logoUrl: company.logoUrl,
      website: company.website,
      industry: industry.name,
      headquarters: company.headquarters,
      founded: company.founded,
      companyType: company.companyType,
      description: company.description,
    })
    .from(company)
    .leftJoin(industry, eq(company.industryId, industry.industryId))
    .where(eq(company.companyId, companyId))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return result[0]
}

export async function getCompanySalaries(
  companyId: number,
  limit?: number
): Promise<CompanySalarySubmission[]> {
  const query = db
    .select({
      submissionId: salarySubmission.submissionId,
      jobTitle: jobTitle.title,
      levelName: level.levelName,
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
    .where(eq(company.companyId, companyId))
    .orderBy(desc(salarySubmission.submissionDate))

  const results = limit ? await query.limit(limit) : await query

  return results.map((sub) => {
    const totalComp =
      parseFloat(sub.baseSalary) +
      parseFloat(sub.bonus || '0') +
      parseFloat(sub.stockCompensation || '0')

    return {
      submissionId: sub.submissionId,
      jobTitle: sub.jobTitle,
      levelName: sub.levelName || undefined,
      city: sub.city,
      state: sub.state || undefined,
      country: sub.country,
      baseSalary: sub.baseSalary,
      bonus: sub.bonus || undefined,
      stockCompensation: sub.stockCompensation || undefined,
      currency: sub.currency || 'XOF',
      yearsOfExperience: sub.yearsOfExperience,
      yearsAtCompany: sub.yearsAtCompany,
      submissionDate: sub.submissionDate,
      totalCompensation: totalComp,
    }
  })
}

export async function getCompanyLocations(companyId: number): Promise<CompanyLocation[]> {
  const results = await db
    .select({
      city: location.city,
      state: location.state,
      country: location.country,
      submissionCount: sql<number>`count(${salarySubmission.submissionId})`,
    })
    .from(salarySubmission)
    .innerJoin(location, eq(salarySubmission.locationId, location.locationId))
    .where(eq(salarySubmission.companyId, companyId))
    .groupBy(location.city, location.state, location.country)
    .orderBy(desc(sql`count(${salarySubmission.submissionId})`))

  return results.map((loc) => ({
    city: loc.city,
    state: loc.state || undefined,
    country: loc.country,
    submissionCount: Number(loc.submissionCount),
  }))
}

export async function getCompanyLevelsByJobTitle(
  companyId: number,
  jobTitleName: string
): Promise<{ levelName: string; description?: string }[]> {
  const results = await db
    .select({
      levelName: level.levelName,
      description: level.description,
    })
    .from(level)
    .innerJoin(jobTitle, eq(level.jobTitleId, jobTitle.jobTitleId))
    .where(eq(level.companyId, companyId))
    .orderBy(level.levelName)

  return results.map((l) => ({
    levelName: l.levelName,
    description: l.description || undefined,
  }))
}
