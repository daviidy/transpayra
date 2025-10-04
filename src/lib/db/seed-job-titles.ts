import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle } from './schema'
import fs from 'fs'
import path from 'path'

interface JobTitleFromJSON {
  job_title_id: null
  title: string
  industry_id: null
  category: null
  slug: null
}

// Helper function to generate slug from job title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Helper function to normalize title for comparison
function normalizeForComparison(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

// Common French to English mappings for job titles
const frenchToEnglish: Record<string, string[]> = {
  'ingenieur': ['engineer', 'ing'],
  'developpeur': ['developer', 'dev'],
  'directeur': ['director', 'dir'],
  'responsable': ['manager', 'lead', 'head', 'chief'],
  'chef': ['lead', 'chief', 'head', 'manager'],
  'assistant': ['assistant', 'asst'],
  'gestionnaire': ['manager', 'administrator'],
  'analyste': ['analyst'],
  'technicien': ['technician', 'tech'],
  'senior': ['senior', 'sr'],
  'junior': ['junior', 'jr'],
  'devops': ['devops'],
  'architecte': ['architect'],
  'consultant': ['consultant'],
}

// Check if two titles might be duplicates
function areTitlesSimilar(title1: string, title2: string): boolean {
  const norm1 = normalizeForComparison(title1)
  const norm2 = normalizeForComparison(title2)

  // Exact match after normalization
  if (norm1 === norm2) return true

  // Check if one contains the other (for variations)
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return true
  }

  // Check for French-English equivalents
  for (const [french, englishVariants] of Object.entries(frenchToEnglish)) {
    if (norm1.includes(french)) {
      for (const eng of englishVariants) {
        if (norm2.includes(eng)) {
          // Both titles contain equivalent terms
          // Additional check: see if they share other keywords
          const words1 = norm1.split(/\s+/)
          const words2 = norm2.split(/\s+/)
          const commonWords = words1.filter(w => words2.includes(w))

          // If they share at least one more significant word, consider them similar
          if (commonWords.length > 0) {
            return true
          }
        }
      }
    }
  }

  return false
}

async function seedJobTitles() {
  console.log('Starting job titles seed...\n')

  try {
    // Step 1: Read the JSON file
    const jsonPath = path.join(process.cwd(), 'job_seed.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const jobTitles: JobTitleFromJSON[] = JSON.parse(jsonData)

    console.log(`Found ${jobTitles.length} job titles in JSON file\n`)

    // Step 2: Fetch all existing job titles from the database
    const existingJobTitles = await db.select().from(jobTitle)
    console.log(`Found ${existingJobTitles.length} existing job titles in database\n`)

    // Step 3: Filter out duplicates
    const newJobTitles: Array<{ title: string; slug: string; industryId: null; category: null }> = []
    const skippedDuplicates: Array<{ newTitle: string; existingTitle: string }> = []

    for (const job of jobTitles) {
      const newSlug = generateSlug(job.title)

      // Check if slug already exists
      const slugExists = existingJobTitles.some(existing => existing.slug === newSlug)

      if (slugExists) {
        const existing = existingJobTitles.find(e => e.slug === newSlug)
        skippedDuplicates.push({
          newTitle: job.title,
          existingTitle: existing?.title || 'unknown'
        })
        continue
      }

      // Check for semantic duplicates
      const semanticDuplicate = existingJobTitles.find(existing =>
        areTitlesSimilar(job.title, existing.title)
      )

      if (semanticDuplicate) {
        skippedDuplicates.push({
          newTitle: job.title,
          existingTitle: semanticDuplicate.title
        })
        continue
      }

      // No duplicate found, add to list
      newJobTitles.push({
        title: job.title,
        slug: newSlug,
        industryId: null,
        category: null,
      })
    }

    console.log(`\nFiltered out ${skippedDuplicates.length} duplicates`)
    console.log(`Will insert ${newJobTitles.length} new job titles\n`)

    if (skippedDuplicates.length > 0) {
      console.log('Sample of skipped duplicates:')
      skippedDuplicates.slice(0, 10).forEach(({ newTitle, existingTitle }) => {
        console.log(`  ✗ "${newTitle}" (similar to "${existingTitle}")`)
      })
      console.log()
    }

    // Step 4: Insert new job titles in batches
    if (newJobTitles.length === 0) {
      console.log('✓ No new job titles to insert')
      return
    }

    const batchSize = 100
    let totalInserted = 0

    console.log('Inserting new job titles in batches...')
    for (let i = 0; i < newJobTitles.length; i += batchSize) {
      const batch = newJobTitles.slice(i, i + batchSize)

      const insertedTitles = await db
        .insert(jobTitle)
        .values(batch)
        .onConflictDoNothing()
        .returning()

      totalInserted += insertedTitles.length
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: Inserted ${insertedTitles.length} job titles`)
    }

    console.log(`\n✅ Successfully seeded ${totalInserted} new job titles!`)
    console.log(`Skipped ${skippedDuplicates.length} duplicates`)
    console.log(`Total job titles in database: ${existingJobTitles.length + totalInserted}`)
  } catch (error) {
    console.error('❌ Error seeding job titles:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

seedJobTitles()
