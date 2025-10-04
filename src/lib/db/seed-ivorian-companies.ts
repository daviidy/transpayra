import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { company } from './schema'
import fs from 'fs'
import path from 'path'

interface IvorianCompany {
  company_id: null
  name: string
  website: string | null
  logo_url: string | null
  industry: string
  headquarters: string | null
  founded: number | null
  company_type: string
  description: string | null
  slug: string
}

async function seedIvorianCompanies() {
  console.log('Starting Ivorian companies seed...\n')

  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'company_registry.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const ivorianCompanies: IvorianCompany[] = JSON.parse(jsonData)

    console.log(`Found ${ivorianCompanies.length} companies in JSON file\n`)

    // Map the JSON structure to the database schema
    const companiesToInsert = ivorianCompanies.map((c) => ({
      name: c.name,
      slug: c.slug,
      website: c.website,
      logoUrl: c.logo_url,
      industry: c.industry,
      headquarters: c.headquarters || 'Côte d\'Ivoire', // Default to Côte d'Ivoire if null
      founded: c.founded,
      companyType: c.company_type,
      description: c.description,
    }))

    // Insert companies in batches to avoid overwhelming the database
    const batchSize = 100
    let totalInserted = 0

    for (let i = 0; i < companiesToInsert.length; i += batchSize) {
      const batch = companiesToInsert.slice(i, i + batchSize)

      const insertedCompanies = await db
        .insert(company)
        .values(batch)
        .onConflictDoNothing() // Skip duplicates based on unique constraints (name, slug)
        .returning()

      totalInserted += insertedCompanies.length
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: Inserted ${insertedCompanies.length} companies`)
    }

    console.log(`\n✅ Successfully seeded ${totalInserted} companies from Côte d'Ivoire!`)
    console.log(`Skipped ${ivorianCompanies.length - totalInserted} duplicates or conflicts`)
  } catch (error) {
    console.error('❌ Error seeding Ivorian companies:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

seedIvorianCompanies()
