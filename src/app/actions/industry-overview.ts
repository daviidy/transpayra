'use server'

import { db } from '@/lib/db'
import {
  industry,
  jobTitle,
  salarySubmission,
  company,
  location,
  level,
} from '@/lib/db/schema'
import { sql, eq, and, desc } from 'drizzle-orm'

export interface TopRoleSalary {
  jobTitleId: number
  jobTitle: string
  medianSalary: number
}

export interface IndustrySubmissionRow {
  submissionId: number
  companyId: number
  companyName: string
  companyLogo: string | null
  jobTitle: string
  levelName: string | null
  city: string
  state: string | null
  country: string
  yearsOfExperience: number
  yearsAtCompany: number
  baseSalary: string
  stockCompensation: string
  bonus: string
  totalCompensation: number
  submissionDate: Date
}

export interface TopPayingCompany {
  companyId: number
  companyName: string
  companyLogo: string | null
  medianSalary: number
}

export interface TopPayingLocation {
  locationId: number
  city: string
  state: string | null
  country: string
  slug: string
  medianSalary: number
}

export interface IndustryOverviewData {
  industryId: number
  industryName: string
  industrySlug: string
  industryIcon: string | null
  topRoles: TopRoleSalary[]
  submissions: IndustrySubmissionRow[]
  topCompanies: TopPayingCompany[]
  topLocations: TopPayingLocation[]
  totalSubmissions: number
}

export async function getIndustryOverviewData(
  industrySlug: string,
  locationFilter?: string
): Promise<IndustryOverviewData | null> {
  // Get industry details
  const industryData = await db
    .select()
    .from(industry)
    .where(eq(industry.slug, industrySlug))
    .limit(1)

  if (!industryData.length) {
    return null
  }

  const ind = industryData[0]

  // Build location filter condition if provided
  const locationCondition = locationFilter
    ? sql`${location.slug} = ${locationFilter}`
    : sql`true`

  // Get top 4 roles by median salary
  const topRolesQuery = await db
    .select({
      jobTitleId: jobTitle.jobTitleId,
      jobTitle: jobTitle.title,
      salaries: sql<string[]>`array_agg(
        (${salarySubmission.baseSalary}::numeric +
         COALESCE(${salarySubmission.stockCompensation}::numeric, 0) +
         COALESCE(${salarySubmission.bonus}::numeric, 0))::numeric
      )`,
    })
    .from(jobTitle)
    .innerJoin(salarySubmission, eq(jobTitle.jobTitleId, salarySubmission.jobTitleId))
    .innerJoin(location, eq(salarySubmission.locationId, location.locationId))
    .where(and(eq(jobTitle.industryId, ind.industryId), locationCondition))
    .groupBy(jobTitle.jobTitleId, jobTitle.title)
    .limit(4)

  // Calculate median for each role
  const topRoles: TopRoleSalary[] = topRolesQuery
    .map((role) => {
      // Handle cases where salaries might not be an array
      const salariesRaw = role.salaries as unknown
      const salariesArray = Array.isArray(salariesRaw) ? salariesRaw : []

      const salaries = salariesArray
        .filter((s) => s != null && s !== '')
        .map((s) => parseFloat(String(s)))
        .filter((s) => !isNaN(s))
        .sort((a, b) => a - b)

      const median =
        salaries.length > 0
          ? salaries[Math.floor(salaries.length / 2)]
          : 0
      return {
        jobTitleId: role.jobTitleId,
        jobTitle: role.jobTitle,
        medianSalary: Math.round(median),
      }
    })
    .filter((role) => role.medianSalary > 0)
    .sort((a, b) => b.medianSalary - a.medianSalary)
    .slice(0, 4)

  // Get all submissions for this industry (with location filter if provided)
  const submissionsQuery = await db
    .select({
      submissionId: salarySubmission.submissionId,
      companyId: company.companyId,
      companyName: company.name,
      companyLogo: company.logoUrl,
      jobTitle: jobTitle.title,
      levelName: level.levelName,
      city: location.city,
      state: location.state,
      country: location.country,
      yearsOfExperience: salarySubmission.yearsOfExperience,
      yearsAtCompany: salarySubmission.yearsAtCompany,
      baseSalary: salarySubmission.baseSalary,
      stockCompensation: salarySubmission.stockCompensation,
      bonus: salarySubmission.bonus,
      submissionDate: salarySubmission.submissionDate,
    })
    .from(salarySubmission)
    .innerJoin(company, eq(salarySubmission.companyId, company.companyId))
    .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
    .innerJoin(location, eq(salarySubmission.locationId, location.locationId))
    .leftJoin(level, eq(salarySubmission.levelId, level.levelId))
    .where(and(eq(jobTitle.industryId, ind.industryId), locationCondition))
    .orderBy(desc(salarySubmission.submissionDate))

  const submissions: IndustrySubmissionRow[] = submissionsQuery.map((s) => ({
    submissionId: s.submissionId,
    companyId: s.companyId,
    companyName: s.companyName,
    companyLogo: s.companyLogo,
    jobTitle: s.jobTitle,
    levelName: s.levelName || null,
    city: s.city,
    state: s.state || null,
    country: s.country,
    yearsOfExperience: s.yearsOfExperience,
    yearsAtCompany: s.yearsAtCompany || 0,
    baseSalary: s.baseSalary,
    stockCompensation: s.stockCompensation || '0',
    bonus: s.bonus || '0',
    totalCompensation: Math.round(
      parseFloat(s.baseSalary) +
        parseFloat(s.stockCompensation || '0') +
        parseFloat(s.bonus || '0')
    ),
    submissionDate: s.submissionDate,
  }))

  // Get top paying companies in this industry
  const topCompaniesQuery = await db
    .select({
      companyId: company.companyId,
      companyName: company.name,
      companyLogo: company.logoUrl,
      salaries: sql<string[]>`array_agg(
        (${salarySubmission.baseSalary}::numeric +
         COALESCE(${salarySubmission.stockCompensation}::numeric, 0) +
         COALESCE(${salarySubmission.bonus}::numeric, 0))::numeric
      )`,
    })
    .from(company)
    .innerJoin(salarySubmission, eq(company.companyId, salarySubmission.companyId))
    .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
    .innerJoin(location, eq(salarySubmission.locationId, location.locationId))
    .where(and(eq(jobTitle.industryId, ind.industryId), locationCondition))
    .groupBy(company.companyId, company.name, company.logoUrl)
    .limit(5)

  const topCompanies: TopPayingCompany[] = topCompaniesQuery
    .map((c) => {
      // Handle cases where salaries might not be an array
      const salariesRaw = c.salaries as unknown
      const salariesArray = Array.isArray(salariesRaw) ? salariesRaw : []

      const salaries = salariesArray
        .filter((s) => s != null && s !== '')
        .map((s) => parseFloat(String(s)))
        .filter((s) => !isNaN(s))
        .sort((a, b) => a - b)

      const median =
        salaries.length > 0
          ? salaries[Math.floor(salaries.length / 2)]
          : 0
      return {
        companyId: c.companyId,
        companyName: c.companyName,
        companyLogo: c.companyLogo,
        medianSalary: Math.round(median),
      }
    })
    .filter((c) => c.medianSalary > 0)
    .sort((a, b) => b.medianSalary - a.medianSalary)
    .slice(0, 4)

  // Get top paying locations in this industry
  const topLocationsQuery = await db
    .select({
      locationId: location.locationId,
      city: location.city,
      state: location.state,
      country: location.country,
      slug: location.slug,
      salaries: sql<string[]>`array_agg(
        (${salarySubmission.baseSalary}::numeric +
         COALESCE(${salarySubmission.stockCompensation}::numeric, 0) +
         COALESCE(${salarySubmission.bonus}::numeric, 0))::numeric
      )`,
    })
    .from(location)
    .innerJoin(salarySubmission, eq(location.locationId, salarySubmission.locationId))
    .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
    .where(eq(jobTitle.industryId, ind.industryId))
    .groupBy(location.locationId, location.city, location.state, location.country, location.slug)
    .limit(5)

  const topLocations: TopPayingLocation[] = topLocationsQuery
    .map((loc) => {
      // Handle cases where salaries might not be an array
      const salariesRaw = loc.salaries as unknown
      const salariesArray = Array.isArray(salariesRaw) ? salariesRaw : []

      const salaries = salariesArray
        .filter((s) => s != null && s !== '')
        .map((s) => parseFloat(String(s)))
        .filter((s) => !isNaN(s))
        .sort((a, b) => a - b)

      const median =
        salaries.length > 0
          ? salaries[Math.floor(salaries.length / 2)]
          : 0
      return {
        locationId: loc.locationId,
        city: loc.city,
        state: loc.state || null,
        country: loc.country,
        slug: loc.slug,
        medianSalary: Math.round(median),
      }
    })
    .filter((loc) => loc.medianSalary > 0)
    .sort((a, b) => b.medianSalary - a.medianSalary)
    .slice(0, 4)

  return {
    industryId: ind.industryId,
    industryName: ind.name,
    industrySlug: ind.slug,
    industryIcon: ind.icon,
    topRoles,
    submissions,
    topCompanies,
    topLocations,
    totalSubmissions: submissions.length,
  }
}
