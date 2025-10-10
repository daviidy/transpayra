import { db } from '@/lib/db'
import {
  salarySubmission,
  company,
  jobTitle,
  location,
  industry,
  level
} from '@/lib/db/schema'

export async function cleanDatabase() {
  // Delete in correct order (respecting foreign keys)
  await db.delete(salarySubmission)
  await db.delete(level)
  await db.delete(location)
  await db.delete(jobTitle)
  await db.delete(company)
  await db.delete(industry)
}

export async function seedTestData() {
  // Insert test industries
  const [techIndustry] = await db.insert(industry).values({
    name: 'Technology',
    slug: 'technology',
  }).returning()

  const [financeIndustry] = await db.insert(industry).values({
    name: 'Finance',
    slug: 'finance',
  }).returning()

  // Insert test companies
  const [googleCompany] = await db.insert(company).values({
    name: 'Google',
    slug: 'google',
  }).returning()

  const [metaCompany] = await db.insert(company).values({
    name: 'Meta',
    slug: 'meta',
  }).returning()

  // Insert test job titles
  const [sweJobTitle] = await db.insert(jobTitle).values({
    title: 'Software Engineer',
    slug: 'software-engineer',
    industryId: techIndustry.industryId,
  }).returning()

  const [dataJobTitle] = await db.insert(jobTitle).values({
    title: 'Data Scientist',
    slug: 'data-scientist',
    industryId: techIndustry.industryId,
  }).returning()

  // Insert test locations
  const [sfLocation] = await db.insert(location).values({
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    slug: 'san-francisco-ca-united-states',
  }).returning()

  const [nyLocation] = await db.insert(location).values({
    city: 'New York',
    state: 'NY',
    country: 'United States',
    slug: 'new-york-ny-united-states',
  }).returning()

  // Insert test levels
  const [l3Level] = await db.insert(level).values({
    levelName: 'L3',
    companyId: googleCompany.companyId,
    jobTitleId: sweJobTitle.jobTitleId,
  }).returning()

  const [l4Level] = await db.insert(level).values({
    levelName: 'L4',
    companyId: googleCompany.companyId,
    jobTitleId: sweJobTitle.jobTitleId,
  }).returning()

  return {
    industries: { tech: techIndustry, finance: financeIndustry },
    companies: { google: googleCompany, meta: metaCompany },
    jobTitles: { swe: sweJobTitle, data: dataJobTitle },
    locations: { sf: sfLocation, ny: nyLocation },
    levels: { l3: l3Level, l4: l4Level },
  }
}
