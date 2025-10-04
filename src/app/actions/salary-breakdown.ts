'use server'

import { db } from '@/lib/db'
import { salarySubmission, location, jobTitle, level, company } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export interface SalaryStats {
  median: number
  p25: number
  p75: number
  p90: number
  count: number
  lastUpdated: Date
}

export interface LocationSalaryData {
  locationName: string
  locationSlug: string
  jobTitleName: string
  stats: SalaryStats
}

export async function getLocationSalaryStats(
  locationSlug: string,
  jobTitleName: string = 'Software Engineer',
  levelFilter?: string
): Promise<LocationSalaryData | null> {
  // Get location
  const locationResult = await db
    .select()
    .from(location)
    .where(eq(location.slug, locationSlug))
    .limit(1)

  if (locationResult.length === 0) {
    return null
  }

  const loc = locationResult[0]

  // Get job title
  const jobTitleResult = await db
    .select()
    .from(jobTitle)
    .where(eq(jobTitle.title, jobTitleName))
    .limit(1)

  if (jobTitleResult.length === 0) {
    return null
  }

  const title = jobTitleResult[0]

  // Build query conditions
  const conditions = [
    eq(salarySubmission.locationId, loc.locationId),
    eq(salarySubmission.jobTitleId, title.jobTitleId),
  ]

  // Get all submissions for this location and job title
  const submissions = await db
    .select({
      baseSalary: salarySubmission.baseSalary,
      bonus: salarySubmission.bonus,
      stockCompensation: salarySubmission.stockCompensation,
      submissionDate: salarySubmission.submissionDate,
    })
    .from(salarySubmission)
    .where(and(...conditions))

  if (submissions.length === 0) {
    return null
  }

  // Calculate total compensation for each submission
  const totalComps = submissions.map((s) =>
    parseFloat(s.baseSalary) +
    parseFloat(s.bonus || '0') +
    parseFloat(s.stockCompensation || '0')
  ).sort((a, b) => a - b)

  // Calculate percentiles
  const getPercentile = (arr: number[], percentile: number) => {
    const index = Math.ceil((percentile / 100) * arr.length) - 1
    return Math.round(arr[Math.max(0, index)])
  }

  const stats: SalaryStats = {
    median: getPercentile(totalComps, 50),
    p25: getPercentile(totalComps, 25),
    p75: getPercentile(totalComps, 75),
    p90: getPercentile(totalComps, 90),
    count: totalComps.length,
    lastUpdated: new Date(Math.max(...submissions.map((s) => s.submissionDate.getTime()))),
  }

  const locationName = loc.state
    ? `${loc.city}, ${loc.state}, ${loc.country}`
    : `${loc.city}, ${loc.country}`

  return {
    locationName,
    locationSlug: loc.slug,
    jobTitleName: title.title,
    stats,
  }
}
