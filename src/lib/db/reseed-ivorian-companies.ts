import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { company, level, salarySubmission } from './schema'
import { sql } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'

interface IvorianCompany {
  id: number
  name: string
  acronym: string | null
  logo_url: string | null
  phone_number: string | null
  website_url: string | null
  address: string | null
  activity_sector: string
  country: string
}

// Helper function to generate slug from company name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function reseedIvorianCompanies() {
  console.log('Starting company table refresh...\n')

  try {
    // Step 1: Delete all related data in correct order (to satisfy foreign key constraints)
    console.log('Deleting salary submissions...')
    await db.delete(salarySubmission)
    console.log('✓ Salary submissions deleted')

    console.log('Deleting levels...')
    await db.delete(level)
    console.log('✓ Levels deleted')

    console.log('Deleting companies...')
    await db.delete(company)
    console.log('✓ All companies deleted\n')

    // Step 2: Read the updated JSON file
    const jsonPath = path.join(process.cwd(), 'company_registry.json')
    let jsonData = fs.readFileSync(jsonPath, 'utf-8')

    // Remove comments from JSON
    jsonData = jsonData.replace(/\/\/.*$/gm, '')

    const ivorianCompanies: IvorianCompany[] = JSON.parse(jsonData)

    console.log(`Found ${ivorianCompanies.length} companies in updated JSON file\n`)

    // Step 3: Map the JSON structure to the database schema
    const companiesToInsert = ivorianCompanies.map((c) => ({
      name: c.name,
      slug: generateSlug(c.name),
      website: c.website_url,
      logoUrl: c.logo_url,
      industry: c.activity_sector,
      headquarters: c.address || c.country,
      founded: null,
      companyType: null,
      description: null,
    }))

    // Step 4: Insert companies in batches
    const batchSize = 100
    let totalInserted = 0

    console.log('Inserting companies in batches...')
    for (let i = 0; i < companiesToInsert.length; i += batchSize) {
      const batch = companiesToInsert.slice(i, i + batchSize)

      const insertedCompanies = await db
        .insert(company)
        .values(batch)
        .returning()

      totalInserted += insertedCompanies.length
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: Inserted ${insertedCompanies.length} companies`)
    }

    console.log(`\n✅ Successfully reseeded ${totalInserted} companies from Côte d'Ivoire!`)
  } catch (error) {
    console.error('❌ Error reseeding companies:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

reseedIvorianCompanies()
