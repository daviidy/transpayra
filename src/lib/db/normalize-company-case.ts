import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { company } from './schema'
import { eq } from 'drizzle-orm'

// Common acronyms and company suffixes that should stay uppercase
const acronyms = new Set([
  'SA', 'SARL', 'SAS', 'CI', 'AG', 'GMBH', 'LLC', 'INC', 'LTD', 'PLC', 'BV',
  'IT', 'RH', 'HR', 'HRBP', 'SAV', 'QA', 'BI', 'CRM', 'ERP', 'FM', 'AI', 'API',
  'SMS', 'GPS', 'IOT', 'SIR', 'CIE', 'TP', 'SAAS', 'USA', 'UK', 'UAE', 'CEO'
])

// Words that should stay lowercase in company names
const lowercaseWords = new Set([
  'de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'ou', 'à', 'au', 'aux',
  'en', 'pour', 'par', 'sur', 'dans', 'avec', 'sans', 'of', 'the', 'a', 'an',
  'and', 'or', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'd', 'l'
])

function toTitleCase(name: string): string {
  // Split by spaces and special characters while keeping them
  const words = name.split(/(\s+|\/|-|'|&)/g)

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

    // Handle single letter words with apostrophes (like d', l')
    if (cleanWord.length === 1 && lowerWord.match(/^[dlmntsc]$/)) {
      return word.replace(cleanWord, lowerWord)
    }

    // Default: capitalize first letter, lowercase the rest
    return word.replace(cleanWord, cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase())
  })

  return convertedWords.join('')
}

async function normalizeCompanyCase() {
  console.log('Starting company name case normalization...\n')

  try {
    // Fetch all companies
    const allCompanies = await db.select().from(company)
    console.log(`Found ${allCompanies.length} companies\n`)

    const updates: Array<{
      companyId: number
      oldName: string
      newName: string
    }> = []

    // Process each company
    for (const comp of allCompanies) {
      const newName = toTitleCase(comp.name)

      if (newName !== comp.name) {
        updates.push({
          companyId: comp.companyId,
          oldName: comp.name,
          newName
        })
      }
    }

    console.log(`Found ${updates.length} companies to update\n`)

    if (updates.length === 0) {
      console.log('✓ All company names are already in correct case format')
      return
    }

    // Show sample conversions
    console.log('Sample conversions:')
    updates.slice(0, 20).forEach(({ oldName, newName }) => {
      console.log(`  "${oldName}" → "${newName}"`)
    })
    console.log()

    // Update database
    console.log(`Updating ${updates.length} company names...`)

    let updated = 0
    for (const update of updates) {
      await db
        .update(company)
        .set({ name: update.newName })
        .where(eq(company.companyId, update.companyId))

      updated++

      if (updated % 50 === 0) {
        console.log(`  Updated ${updated}/${updates.length}...`)
      }
    }

    console.log(`\n✅ Successfully normalized ${updated} company names to title case!`)

  } catch (error) {
    console.error('❌ Error normalizing company names:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

normalizeCompanyCase()
