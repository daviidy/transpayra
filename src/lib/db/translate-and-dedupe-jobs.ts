import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle } from './schema'
import { eq, sql } from 'drizzle-orm'

// French to English translation mappings
const translations: Record<string, string> = {
  // Titles
  'ingenieur': 'engineer',
  'ingénieur': 'engineer',
  'developpeur': 'developer',
  'développeur': 'developer',
  'directeur': 'director',
  'responsable': 'manager',
  'chef': 'lead',
  'assistant': 'assistant',
  'gestionnaire': 'administrator',
  'analyste': 'analyst',
  'technicien': 'technician',
  'comptable': 'accountant',
  'controleur': 'controller',
  'contrôleur': 'controller',

  // Departments/Functions
  'financier': 'financial',
  'commercial': 'sales',
  'marketing': 'marketing',
  'communication': 'communications',
  'production': 'production',
  'maintenance': 'maintenance',
  'qualite': 'quality',
  'qualité': 'quality',
  'logistique': 'logistics',
  'achats': 'purchasing',
  'ventes': 'sales',
  'projet': 'project',
  'projets': 'projects',

  // Levels
  'senior': 'senior',
  'junior': 'junior',
  'principal': 'principal',
  'adjoint': 'deputy',

  // Specific roles
  'devops': 'devops',
  'reseaux': 'network',
  'réseaux': 'network',
  'systemes': 'systems',
  'systèmes': 'systems',
  'securite': 'security',
  'sécurité': 'security',
  'cybersecurite': 'cybersecurity',
  'cybersécurité': 'cybersecurity',
  'infrastructures': 'infrastructure',
  'donnees': 'data',
  'données': 'data',

  // Business functions
  'gestion': 'management',
  'tresorerie': 'treasury',
  'trésorerie': 'treasury',
  'risques': 'risk',
  'conformite': 'compliance',
  'conformité': 'compliance',
  'audit': 'audit',
  'controle': 'control',
  'paie': 'payroll',
  'formation': 'training',
  'recrutement': 'recruitment',

  // Locations/Areas
  'national': 'national',
  'regional': 'regional',
  'régional': 'regional',
  'zone': 'territory',
  'secteur': 'sector',
  'agence': 'branch',
  'usine': 'plant',

  // Common words
  'et': 'and',
  'de': 'of',
  'des': 'of',
  'du': 'of',
  'la': 'the',
  'le': 'the',
  'les': 'the',
  'general': 'general',
  'général': 'general',
  'charge': 'manager',
  'chargé': 'manager',
}

function translateToEnglish(frenchTitle: string): string {
  let translated = frenchTitle.toLowerCase()

  // Remove accents
  translated = translated
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Split into words
  const words = translated.split(/[\s\-\/]+/)

  // Translate each word
  const translatedWords = words.map(word => {
    // Check direct translation
    if (translations[word]) {
      return translations[word]
    }

    // Check if word contains a translatable substring
    for (const [fr, en] of Object.entries(translations)) {
      if (word.includes(fr)) {
        return word.replace(fr, en)
      }
    }

    return word
  })

  // Join and capitalize
  return translatedWords
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeForComparison(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

async function translateAndDedupeJobs() {
  console.log('Starting job title translation and deduplication...\n')

  try {
    // Step 1: Get all job titles
    const allJobTitles = await db.select().from(jobTitle)
    console.log(`Found ${allJobTitles.length} job titles\n`)

    // Step 2: Identify which titles need translation (contain French characters/words)
    const needsTranslation: Array<{
      jobTitleId: number
      originalTitle: string
      translatedTitle: string
      normalizedOriginal: string
      normalizedTranslated: string
    }> = []

    const alreadyEnglish: Array<{
      jobTitleId: number
      title: string
      normalized: string
    }> = []

    for (const job of allJobTitles) {
      // Check if title contains French-specific characters or common French words
      const hasFrenchAccents = /[àâäéèêëïîôùûüÿçœæ]/i.test(job.title)
      const hasFrenchWords = Object.keys(translations).some(frWord =>
        job.title.toLowerCase().includes(frWord)
      )

      if (hasFrenchAccents || hasFrenchWords) {
        const translated = translateToEnglish(job.title)
        needsTranslation.push({
          jobTitleId: job.jobTitleId,
          originalTitle: job.title,
          translatedTitle: translated,
          normalizedOriginal: normalizeForComparison(job.title),
          normalizedTranslated: normalizeForComparison(translated),
        })
      } else {
        alreadyEnglish.push({
          jobTitleId: job.jobTitleId,
          title: job.title,
          normalized: normalizeForComparison(job.title),
        })
      }
    }

    console.log(`French titles to translate: ${needsTranslation.length}`)
    console.log(`Already in English: ${alreadyEnglish.length}\n`)

    // Show sample translations
    console.log('Sample translations:')
    needsTranslation.slice(0, 20).forEach(({ originalTitle, translatedTitle }) => {
      console.log(`  "${originalTitle}" → "${translatedTitle}"`)
    })
    console.log()

    // Step 3: Check for duplicates after translation
    const toDelete: number[] = []
    const toUpdate: Array<{ jobTitleId: number; newTitle: string }> = []

    for (const frenchJob of needsTranslation) {
      // Check if translated version already exists in English titles
      const existingEnglish = alreadyEnglish.find(
        eng => eng.normalized === frenchJob.normalizedTranslated
      )

      if (existingEnglish) {
        // Duplicate found - mark French version for deletion
        toDelete.push(frenchJob.jobTitleId)
        console.log(
          `  ✓ Will delete "${frenchJob.originalTitle}" (duplicate of "${existingEnglish.title}")`
        )
      } else {
        // No duplicate - update to English
        toUpdate.push({
          jobTitleId: frenchJob.jobTitleId,
          newTitle: frenchJob.translatedTitle,
        })
      }
    }

    console.log(`\nFound ${toDelete.length} duplicates to remove`)
    console.log(`Will translate ${toUpdate.length} unique titles\n`)

    // Step 4: Execute updates and deletions
    if (toDelete.length > 0) {
      console.log('Deleting duplicate titles...')
      for (const id of toDelete) {
        await db.delete(jobTitle).where(eq(jobTitle.jobTitleId, id))
      }
      console.log(`✓ Deleted ${toDelete.length} duplicates\n`)
    }

    if (toUpdate.length > 0) {
      console.log('Translating unique titles to English...')
      let updated = 0
      for (const { jobTitleId, newTitle } of toUpdate) {
        await db
          .update(jobTitle)
          .set({ title: newTitle })
          .where(eq(jobTitle.jobTitleId, jobTitleId))

        updated++
        if (updated % 50 === 0) {
          console.log(`  Updated ${updated}/${toUpdate.length}...`)
        }
      }
      console.log(`✓ Translated ${updated} titles\n`)
    }

    // Step 5: Final summary
    const finalCount = await db.select({ count: sql<number>`count(*)` }).from(jobTitle)
    console.log('✅ Translation and deduplication complete!')
    console.log(`Final job title count: ${finalCount[0].count}`)
    console.log(`Removed: ${allJobTitles.length - finalCount[0].count} titles`)

  } catch (error) {
    console.error('❌ Error translating job titles:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

translateAndDedupeJobs()
