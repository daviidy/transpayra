'use server'

import { db } from '@/lib/db'
import { location, salarySubmission, company, industry, jobTitle } from '@/lib/db/schema'
import { sql, count, eq } from 'drizzle-orm'

export interface LocationWithSubmissions {
  locationId: number
  city: string
  state?: string
  country: string
  slug: string
  region?: string
  submissionCount: number
}

export interface CompanyWithSubmissions {
  companyId: number
  name: string
  slug: string
  logoUrl?: string | null
  submissionCount: number
}

export interface IndustryWithSubmissions {
  industryId: number
  name: string
  slug: string
  icon?: string | null
  submissionCount: number
}

export async function getLocationsWithSubmissions(): Promise<LocationWithSubmissions[]> {
  const results = await db
    .select({
      locationId: location.locationId,
      city: location.city,
      state: location.state,
      country: location.country,
      slug: location.slug,
      region: location.region,
      submissionCount: count(salarySubmission.submissionId),
    })
    .from(location)
    .innerJoin(salarySubmission, eq(location.locationId, salarySubmission.locationId))
    .groupBy(
      location.locationId,
      location.city,
      location.state,
      location.country,
      location.slug,
      location.region
    )
    .orderBy(sql`count(${salarySubmission.submissionId}) DESC`)

  return results.map((r) => ({
    locationId: r.locationId,
    city: r.city,
    state: r.state || undefined,
    country: r.country,
    slug: r.slug,
    region: r.region || undefined,
    submissionCount: Number(r.submissionCount),
  }))
}

export async function getCompaniesWithSubmissions(): Promise<CompanyWithSubmissions[]> {
  const results = await db
    .select({
      companyId: company.companyId,
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl,
      submissionCount: count(salarySubmission.submissionId),
    })
    .from(company)
    .innerJoin(salarySubmission, eq(company.companyId, salarySubmission.companyId))
    .groupBy(company.companyId, company.name, company.slug, company.logoUrl)
    .orderBy(sql`count(${salarySubmission.submissionId}) DESC`)

  return results.map((r) => ({
    companyId: r.companyId,
    name: r.name,
    slug: r.slug,
    logoUrl: r.logoUrl,
    submissionCount: Number(r.submissionCount),
  }))
}

export async function getIndustriesWithSubmissions(): Promise<IndustryWithSubmissions[]> {
  const results = await db
    .select({
      industryId: industry.industryId,
      name: industry.name,
      slug: industry.slug,
      icon: industry.icon,
      submissionCount: count(salarySubmission.submissionId),
    })
    .from(industry)
    .innerJoin(jobTitle, eq(industry.industryId, jobTitle.industryId))
    .innerJoin(salarySubmission, eq(jobTitle.jobTitleId, salarySubmission.jobTitleId))
    .groupBy(industry.industryId, industry.name, industry.slug, industry.icon)
    .orderBy(sql`count(${salarySubmission.submissionId}) DESC`)

  return results.map((r) => ({
    industryId: r.industryId,
    name: r.name,
    slug: r.slug,
    icon: r.icon,
    submissionCount: Number(r.submissionCount),
  }))
}
