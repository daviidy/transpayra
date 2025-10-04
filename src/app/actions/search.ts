'use server'

import { db } from '@/lib/db'
import { company, jobTitle, location, level, salarySubmission } from '@/lib/db/schema'
import { ilike, or, sql, count, desc, eq } from 'drizzle-orm'

export interface SearchSuggestion {
  id: number
  name: string
  type: 'job' | 'company' | 'location' | 'level'
  submissionCount?: number
}

export interface GroupedSuggestions {
  jobTitles: SearchSuggestion[]
  companies: SearchSuggestion[]
  locations: SearchSuggestion[]
  levels: SearchSuggestion[]
}

export async function getSearchSuggestions(
  query: string,
  contextJobTitle?: string
): Promise<GroupedSuggestions> {
  if (!query || query.length < 2) {
    return { jobTitles: [], companies: [], locations: [], levels: [] }
  }

  const searchPattern = `%${query}%`
  const prefixPattern = `${query}%`

  // Search job titles
  const jobTitlesPromise = db
    .select({
      id: jobTitle.jobTitleId,
      name: jobTitle.title,
      submissionCount: count(salarySubmission.submissionId),
    })
    .from(jobTitle)
    .leftJoin(salarySubmission, eq(jobTitle.jobTitleId, salarySubmission.jobTitleId))
    .where(ilike(jobTitle.title, searchPattern))
    .groupBy(jobTitle.jobTitleId, jobTitle.title)
    .orderBy(desc(count(salarySubmission.submissionId)))
    .limit(3)

  // Search companies
  const companiesPromise = db
    .select({
      id: company.companyId,
      name: company.name,
      submissionCount: count(salarySubmission.submissionId),
    })
    .from(company)
    .leftJoin(salarySubmission, eq(company.companyId, salarySubmission.companyId))
    .where(ilike(company.name, searchPattern))
    .groupBy(company.companyId, company.name)
    .orderBy(desc(count(salarySubmission.submissionId)))
    .limit(3)

  // Search locations
  const locationsPromise = db
    .select({
      id: location.locationId,
      city: location.city,
      state: location.state,
      country: location.country,
      submissionCount: count(salarySubmission.submissionId),
    })
    .from(location)
    .leftJoin(salarySubmission, eq(location.locationId, salarySubmission.locationId))
    .where(
      or(
        ilike(location.city, searchPattern),
        ilike(location.country, searchPattern),
        ilike(location.state, searchPattern)
      )
    )
    .groupBy(location.locationId, location.city, location.state, location.country)
    .orderBy(desc(count(salarySubmission.submissionId)))
    .limit(3)

  // Search levels (contextual if job title provided)
  let levelsPromise = Promise.resolve([])
  if (contextJobTitle) {
    levelsPromise = db
      .select({
        id: level.levelId,
        name: level.levelName,
        companyName: company.name,
      })
      .from(level)
      .innerJoin(company, eq(level.companyId, company.companyId))
      .innerJoin(jobTitle, eq(level.jobTitleId, jobTitle.jobTitleId))
      .where(
        sql`${ilike(level.levelName, searchPattern)} AND ${eq(
          jobTitle.title,
          contextJobTitle
        )}`
      )
      .limit(3)
  }

  const [jobTitlesData, companiesData, locationsData, levelsData] = await Promise.all([
    jobTitlesPromise,
    companiesPromise,
    locationsPromise,
    levelsPromise,
  ])

  return {
    jobTitles: jobTitlesData.map((jt) => ({
      id: jt.id,
      name: jt.name,
      type: 'job' as const,
      submissionCount: Number(jt.submissionCount),
    })),
    companies: companiesData.map((c) => ({
      id: c.id,
      name: c.name,
      type: 'company' as const,
      submissionCount: Number(c.submissionCount),
    })),
    locations: locationsData.map((l) => ({
      id: l.id,
      name: `${l.city}${l.state ? `, ${l.state}` : ''}, ${l.country}`,
      type: 'location' as const,
      submissionCount: Number(l.submissionCount),
    })),
    levels: levelsData.map((lv: any) => ({
      id: lv.id,
      name: `${lv.name} (${lv.companyName})`,
      type: 'level' as const,
    })),
  }
}