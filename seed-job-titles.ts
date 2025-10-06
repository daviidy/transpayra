import { config } from 'dotenv'
config({ path: '.env.local' })

import fs from 'fs'
import path from 'path'
import { db } from './src/lib/db/index'
import { jobTitle } from './src/lib/db/schema'
import { sql } from 'drizzle-orm'

interface JobTitle {
  job_title_id: null
  title: string
  industry_id: null
  category: null
  slug: null
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function seedJobTitles() {
  console.log('Seeding job titles from job_seed.json...\n')

  try {
    // Read job_seed.json
    const jsonPath = path.join(process.cwd(), 'job_seed.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const jobTitles: JobTitle[] = JSON.parse(jsonData)

    console.log(`Found ${jobTitles.length} job titles in job_seed.json\n`)

    // Get existing titles from database
    const existingTitles = await db.select().from(jobTitle)
    const existingTitleSet = new Set(existingTitles.map(t => t.title.toLowerCase()))

    console.log(`Existing titles in database: ${existingTitles.length}\n`)

    // Prepare new titles to insert
    const newTitles = jobTitles.filter(
      job => !existingTitleSet.has(job.title.toLowerCase())
    )

    console.log(`New titles to insert: ${newTitles.length}`)
    console.log(`Duplicates to skip: ${jobTitles.length - newTitles.length}\n`)

    if (newTitles.length === 0) {
      console.log('✅ No new titles to insert. All titles already exist in database.')
      return
    }

    // Insert in batches of 100
    const batchSize = 100
    let inserted = 0
    let failed = 0

    for (let i = 0; i < newTitles.length; i += batchSize) {
      const batch = newTitles.slice(i, i + batchSize)

      const titlesToInsert = batch.map(job => ({
        title: job.title,
        slug: createSlug(job.title),
        industryId: null,
        category: null
      }))

      try {
        await db.insert(jobTitle).values(titlesToInsert)
        inserted += batch.length
        console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} titles (Total: ${inserted})`)
      } catch (error: any) {
        // If batch fails, try inserting one by one
        console.log(`⚠ Batch failed, inserting individually...`)
        for (const title of titlesToInsert) {
          try {
            await db.insert(jobTitle).values(title)
            inserted++
          } catch (err: any) {
            if (err.message?.includes('duplicate key')) {
              console.log(`  ⊘ Skipped duplicate: "${title.title}"`)
            } else {
              console.log(`  ✗ Failed: "${title.title}" - ${err.message}`)
              failed++
            }
          }
        }
      }
    }

    // Final count
    const finalCount = await db.select({ count: sql<number>`count(*)` }).from(jobTitle)

    console.log(`\n✅ Seeding complete!`)
    console.log(`Successfully inserted: ${inserted} titles`)
    if (failed > 0) {
      console.log(`Failed: ${failed} titles`)
    }
    console.log(`Total job titles in database: ${finalCount[0].count}`)

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

seedJobTitles()