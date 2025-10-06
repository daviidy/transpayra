'use server'

import { db } from '@/lib/db'
import { salarySubmission, company, jobTitle, location, level } from '@/lib/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'

export interface SalaryResult {
  submissionId: number
  company: string
  jobTitle: string
  location: string
  level: string | null
  baseSalary: string
  bonus: string
  stockCompensation: string
  totalCompensation: number
  yearsOfExperience: number
  yearsAtCompany: number
  submissionDate: Date
  currency: string
}

export interface SearchFilters {
  jobTitleId?: number
  companyId?: number
  locationId?: number
  levelId?: number
}

export async function searchSalaries(filters: SearchFilters): Promise<SalaryResult[]> {
  try {
    const conditions = []

    if (filters.jobTitleId) {
      conditions.push(eq(salarySubmission.jobTitleId, filters.jobTitleId))
    }
    if (filters.companyId) {
      conditions.push(eq(salarySubmission.companyId, filters.companyId))
    }
    if (filters.locationId) {
      conditions.push(eq(salarySubmission.locationId, filters.locationId))
    }
    if (filters.levelId) {
      conditions.push(eq(salarySubmission.levelId, filters.levelId))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const results = await db
      .select({
        submissionId: salarySubmission.submissionId,
        companyName: company.name,
        jobTitleName: jobTitle.title,
        locationCity: location.city,
        locationState: location.state,
        locationCountry: location.country,
        levelName: level.levelName,
        baseSalary: salarySubmission.baseSalary,
        bonus: salarySubmission.bonus,
        stockCompensation: salarySubmission.stockCompensation,
        yearsOfExperience: salarySubmission.yearsOfExperience,
        yearsAtCompany: salarySubmission.yearsAtCompany,
        submissionDate: salarySubmission.submissionDate,
      })
      .from(salarySubmission)
      .innerJoin(company, eq(salarySubmission.companyId, company.companyId))
      .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
      .innerJoin(location, eq(salarySubmission.locationId, location.locationId))
      .leftJoin(level, eq(salarySubmission.levelId, level.levelId))
      .where(whereClause)
      .orderBy(desc(salarySubmission.submissionDate))
      .limit(100)

    return results.map((r) => {
      const base = parseFloat(r.baseSalary)
      const bonus = parseFloat(r.bonus)
      const stock = parseFloat(r.stockCompensation)
      const total = base + bonus + stock

      return {
        submissionId: r.submissionId,
        company: r.companyName,
        jobTitle: r.jobTitleName,
        location: `${r.locationCity}${r.locationState ? `, ${r.locationState}` : ''}, ${r.locationCountry}`,
        level: r.levelName,
        baseSalary: r.baseSalary,
        bonus: r.bonus,
        stockCompensation: r.stockCompensation,
        totalCompensation: total,
        yearsOfExperience: r.yearsOfExperience,
        yearsAtCompany: r.yearsAtCompany,
        submissionDate: r.submissionDate,
        currency: 'USD', // TODO: Add currency to schema
      }
    })
  } catch (error) {
    console.error('Search salaries error:', error)
    return []
  }
}