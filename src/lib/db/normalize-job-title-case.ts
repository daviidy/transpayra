import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle } from './schema'
import { eq } from 'drizzle-orm'

// Common acronyms that should stay uppercase
const acronyms = new Set([
  'IT', 'RH', 'HR', 'HRBP', 'SAV', 'QA', 'BI', 'CRM', 'ERP', 'QHSE', 'HSE',
  'PME', 'PMI', 'CEO', 'CFO', 'CTO', 'TP', 'GSS', 'GSA', 'GSB', 'CHR', 'GMS',
  'IARD', 'DAB', 'FM', 'RSE', 'RRH', 'GMAO', 'SOP', 'UI', 'UX', 'B2B', 'B2C',
  'GE', 'MP', 'TL', 'CHD', 'GDS', 'RHF', 'API', 'SQL', 'AWS', 'GCP'
])

// Words that should stay lowercase in titles (French and English articles, prepositions)
const lowercaseWords = new Set([
  'de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'ou', 'à', 'au', 'aux',
  'en', 'pour', 'par', 'sur', 'dans', 'avec', 'sans', 'of', 'the', 'a', 'an',
  'and', 'or', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'from'
])

function toTitleCase(title: string): string {
  // Split by spaces and special characters while keeping them
  const words = title.split(/(\s+|\/|-|'|&)/g)

  const convertedWords = words.map((word, index) => {
    // Keep whitespace and separators as-is
    if (/^(\s+|\/|-|'|&)$/.test(word)) {
      return word
    }

    // Remove surrounding punctuation for processing
    const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '')

    if (!cleanWord) return word

    const upperWord = cleanWord.toUpperCase()
    const lowerWord = cleanWord.toLowerCase()

    // Check if it's an acronym
    if (acronyms.has(upperWord)) {
      return word.replace(cleanWord, upperWord)
    }

    // First word should always be capitalized
    if (index === 0) {
      return word.replace(cleanWord, cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase())
    }

    // Check if it should be lowercase (articles, prepositions)
    if (lowercaseWords.has(lowerWord)) {
      return word.replace(cleanWord, lowerWord)
    }

    // Handle words with apostrophes (like d', l')
    if (lowerWord === 'd' || lowerWord === 'l' || lowerWord === 'c' || lowerWord === 'm' || lowerWord === 'n' || lowerWord === 's' || lowerWord === 't') {
      return word.replace(cleanWord, lowerWord)
    }

    // Default: capitalize first letter, lowercase the rest
    return word.replace(cleanWord, cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase())
  })

  return convertedWords.join('')
}

async function normalizeJobTitleCase() {
  console.log('Starting job title case normalization...\n')

  try {
    // Fetch all job titles
    const allJobTitles = await db.select().from(jobTitle)
    console.log(`Found ${allJobTitles.length} job titles\n`)

    const updates: Array<{
      jobTitleId: number
      oldTitle: string
      newTitle: string
    }> = []

    // Process each title
    for (const job of allJobTitles) {
      const newTitle = toTitleCase(job.title)

      if (newTitle !== job.title) {
        updates.push({
          jobTitleId: job.jobTitleId,
          oldTitle: job.title,
          newTitle
        })
      }
    }

    console.log(`Found ${updates.length} titles to update\n`)

    if (updates.length === 0) {
      console.log('✓ All job titles are already in correct case format')
      return
    }

    // Show sample conversions
    console.log('Sample conversions:')
    updates.slice(0, 20).forEach(({ oldTitle, newTitle }) => {
      console.log(`  "${oldTitle}" → "${newTitle}"`)
    })
    console.log()

    // Update database
    console.log(`Updating ${updates.length} job titles...`)

    let updated = 0
    for (const update of updates) {
      await db
        .update(jobTitle)
        .set({ title: update.newTitle })
        .where(eq(jobTitle.jobTitleId, update.jobTitleId))

      updated++

      if (updated % 50 === 0) {
        console.log(`  Updated ${updated}/${updates.length}...`)
      }
    }

    console.log(`\n✅ Successfully normalized ${updated} job titles to title case!`)

  } catch (error) {
    console.error('❌ Error normalizing job titles:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

normalizeJobTitleCase()