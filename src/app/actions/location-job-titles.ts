'use server'

import { db } from '@/lib/db'
import { salarySubmission, location, jobTitle } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export interface LocationJobTitle {
  jobTitleId: number
  jobTitleName: string
  submissionCount: number
  medianSalary: number
}

export interface LocationJobTitlesData {
  locationId: number
  locationName: string
  locationSlug: string
  jobTitles: LocationJobTitle[]
}

export async function getLocationJobTitles(
  locationSlug: string
): Promise<LocationJobTitlesData | null> {
  // Get location details
  const locationData = await db
    .select()
    .from(location)
    .where(eq(location.slug, locationSlug))
    .limit(1)

  if (!locationData.length) {
    return null
  }

  const loc = locationData[0]

  // Get job titles with submission counts and salaries for this location
  const jobTitlesQuery = await db
    .select({
      jobTitleId: salarySubmission.jobTitleId,
      jobTitleName: jobTitle.title,
      submissionCount: sql<number>`count(${salarySubmission.submissionId})::int`,
      salaries: sql<string[]>`array_agg(
        (${salarySubmission.baseSalary}::numeric +
         COALESCE(${salarySubmission.stockCompensation}::numeric, 0) +
         COALESCE(${salarySubmission.bonus}::numeric, 0))::numeric
      )`,
    })
    .from(salarySubmission)
    .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
    .where(eq(salarySubmission.locationId, loc.locationId))
    .groupBy(salarySubmission.jobTitleId, jobTitle.title)

  // Calculate median for each job title
  const jobTitles: LocationJobTitle[] = jobTitlesQuery
    .map((jt) => {
      // Handle PostgreSQL array_agg which returns string like '{value1,value2}'
      const salariesRaw = jt.salaries as unknown
      let salariesArray: string[] = []

      if (Array.isArray(salariesRaw)) {
        salariesArray = salariesRaw
      } else if (typeof salariesRaw === 'string') {
        // Parse PostgreSQL array string format: '{500000,1300000}' -> ['500000', '1300000']
        const trimmed = salariesRaw.replace(/^\{|\}$/g, '')
        salariesArray = trimmed ? trimmed.split(',') : []
      }

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
        jobTitleId: jt.jobTitleId,
        jobTitleName: jt.jobTitleName,
        submissionCount: jt.submissionCount,
        medianSalary: Math.round(median),
      }
    })
    .filter((jt) => jt.medianSalary > 0)
    .sort((a, b) => b.submissionCount - a.submissionCount)

  const locationName = loc.state
    ? `${loc.city}, ${loc.state}, ${loc.country}`
    : `${loc.city}, ${loc.country}`

  return {
    locationId: loc.locationId,
    locationName,
    locationSlug: loc.slug,
    jobTitles,
  }
}
