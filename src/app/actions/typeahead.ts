'use server'

import { db } from '@/lib/db'
import { industry, jobTitle, company, location, level } from '@/lib/db/schema'
import { like, ilike, eq, and } from 'drizzle-orm'

export interface TypeaheadOption {
  id: number
  label: string
  value: string
}

export async function searchIndustries(query: string): Promise<TypeaheadOption[]> {
  if (!query) return []

  const results = await db
    .select({
      id: industry.industryId,
      name: industry.name,
    })
    .from(industry)
    .where(like(industry.name, `%${query}%`))
    .limit(10)

  return results.map((r) => ({
    id: r.id,
    label: r.name,
    value: r.name,
  }))
}

export async function searchJobTitles(query: string, industryId?: number): Promise<TypeaheadOption[]> {
  if (!query) return []

  const conditions = [ilike(jobTitle.title, `%${query}%`)]
  if (industryId) {
    conditions.push(eq(jobTitle.industryId, industryId))
  }

  const results = await db
    .select({
      id: jobTitle.jobTitleId,
      title: jobTitle.title,
      industryId: jobTitle.industryId,
    })
    .from(jobTitle)
    .where(and(...conditions))
    .limit(10)

  return results.map((r) => ({
    id: r.id,
    label: r.title,
    value: r.title,
  }))
}

export async function searchCompanies(query: string): Promise<TypeaheadOption[]> {
  if (!query) return []

  const results = await db
    .select({
      id: company.companyId,
      name: company.name,
    })
    .from(company)
    .where(ilike(company.name, `%${query}%`))
    .limit(10)

  return results.map((r) => ({
    id: r.id,
    label: r.name,
    value: r.name,
  }))
}

// Use free Nominatim API from OpenStreetMap for location search
export async function searchLocations(query: string): Promise<TypeaheadOption[]> {
  if (!query || query.length < 2) return []

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query,
          format: 'json',
          limit: '10',
          addressdetails: '1',
          featuretype: 'city',
        }),
      {
        headers: {
          'User-Agent': 'Transpayra-Salary-App/1.0',
        },
      }
    )

    if (!response.ok) {
      console.error('Nominatim API error:', response.status)
      return []
    }

    const data = await response.json()

    // Filter and deduplicate results
    const seen = new Set<string>()
    const results: TypeaheadOption[] = []

    for (const item of data) {
      const city = item.address?.city || item.address?.town || item.address?.village || item.name
      const country = item.address?.country

      if (city && country) {
        const label = `${city}, ${country}`
        const value = `${city}, ${country}`

        // Avoid duplicates
        if (!seen.has(label)) {
          seen.add(label)
          results.push({
            id: item.place_id,
            label,
            value,
          })
        }
      }
    }

    return results
  } catch (error) {
    console.error('Location search error:', error)
    return []
  }
}

export async function searchCompanyLevels(
  query: string,
  companyId: number,
  jobTitleId: number
): Promise<TypeaheadOption[]> {
  if (!companyId || !jobTitleId) return []

  const results = await db
    .select({
      id: level.levelId,
      name: level.levelName,
    })
    .from(level)
    .where(
      and(
        eq(level.companyId, companyId),
        eq(level.jobTitleId, jobTitleId),
        query ? ilike(level.levelName, `%${query}%`) : undefined
      )
    )
    .limit(10)

  return results.map((r) => ({
    id: r.id,
    label: r.name,
    value: r.name,
  }))
}

// Get industry information by job title ID
export async function getIndustryByJobTitle(jobTitleId: number): Promise<TypeaheadOption | null> {
  if (!jobTitleId) return null

  const result = await db
    .select({
      industryId: industry.industryId,
      industryName: industry.name,
    })
    .from(jobTitle)
    .innerJoin(industry, eq(jobTitle.industryId, industry.industryId))
    .where(eq(jobTitle.jobTitleId, jobTitleId))
    .limit(1)

  if (result.length === 0) return null

  return {
    id: result[0].industryId,
    label: result[0].industryName,
    value: result[0].industryName,
  }
}

// Save location to database and return its ID
export async function saveLocation(cityCountry: string): Promise<number> {
  // Parse "City, Country" format
  const parts = cityCountry.split(',').map((p) => p.trim())
  const city = parts[0]
  const country = parts[parts.length - 1]

  // Check if location already exists
  const existing = await db
    .select({ id: location.locationId })
    .from(location)
    .where(and(eq(location.city, city), eq(location.country, country)))
    .limit(1)

  if (existing.length > 0) {
    return existing[0].id
  }

  // Create new location
  function createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const [newLocation] = await db
    .insert(location)
    .values({
      city,
      country,
      slug: createSlug(`${city}-${country}`),
      state: null,
      region: null,
    })
    .returning({ id: location.locationId })

  return newLocation.id
}
