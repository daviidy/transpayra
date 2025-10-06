import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle } from './schema'
import { eq, sql } from 'drizzle-orm'

// Comprehensive French to English translation dictionary
const frenchToEnglish: Record<string, string> = {
  // Job titles - exact matches first
  'ingénieur': 'Engineer',
  'ingenieur': 'Engineer',
  'développeur': 'Developer',
  'developpeur': 'Developer',
  'directeur': 'Director',
  'responsable': 'Manager',
  'chef': 'Lead',
  'assistant': 'Assistant',
  'gestionnaire': 'Administrator',
  'analyste': 'Analyst',
  'technicien': 'Technician',
  'comptable': 'Accountant',
  'contrôleur': 'Controller',
  'controleur': 'Controller',

  // Specific roles
  'devops': 'DevOps',
  'réseaux': 'Networks',
  'reseaux': 'Networks',
  'systèmes': 'Systems',
  'systemes': 'Systems',
  'sécurité': 'Security',
  'securite': 'Security',
  'cybersécurité': 'Cybersecurity',
  'cybersecurite': 'Cybersecurity',

  // Departments
  'financier': 'Financial',
  'commercial': 'Sales',
  'commerciale': 'Sales',
  'marketing': 'Marketing',
  'communication': 'Communications',
  'communications': 'Communications',
  'production': 'Production',
  'maintenance': 'Maintenance',
  'qualité': 'Quality',
  'qualite': 'Quality',
  'logistique': 'Logistics',
  'achats': 'Purchasing',
  'acheteur': 'Buyer',
  'ventes': 'Sales',
  'projet': 'Project',
  'projets': 'Projects',

  // Levels/Seniority
  'senior': 'Senior',
  'junior': 'Junior',
  'principal': 'Principal',
  'adjoint': 'Deputy',
  'assistant': 'Assistant',

  // Business functions
  'gestion': 'Management',
  'trésorerie': 'Treasury',
  'tresorerie': 'Treasury',
  'risques': 'Risk',
  'conformité': 'Compliance',
  'conformite': 'Compliance',
  'audit': 'Audit',
  'contrôle': 'Control',
  'controle': 'Control',
  'paie': 'Payroll',
  'formation': 'Training',
  'recrutement': 'Recruitment',

  // Locations/Areas
  'national': 'National',
  'régional': 'Regional',
  'regional': 'Regional',
  'zone': 'Territory',
  'secteur': 'Sector',
  'agence': 'Branch',
  'usine': 'Plant',
  'd\'agence': 'of Branch',

  // Common words
  'et': 'and',
  'de': 'of',
  'des': 'of',
  'du': 'of',
  'la': 'the',
  'le': 'the',
  'les': 'the',
  'général': 'General',
  'general': 'General',
  'chargé': 'Manager',
  'charge': 'Manager',
  'données': 'Data',
  'donnees': 'Data',
}

function isFrenchTitle(title: string): boolean {
  // Check for French accents
  if (/[àâäéèêëïîôùûüÿçœæ]/i.test(title)) {
    return true
  }

  // Check for French-specific words (not in common English titles)
  const frenchKeywords = [
    'ingénieur', 'ingenieur', 'développeur', 'developpeur', 'directeur',
    'responsable', 'gestionnaire', 'acheteur', 'comptable', 'contrôleur',
    'controle', 'chargé', 'technicien', 'réseaux', 'systèmes', 'sécurité',
    'achats', 'ventes', 'trésorerie', 'conformité'
  ]

  const lowerTitle = title.toLowerCase()
  return frenchKeywords.some(keyword => lowerTitle.includes(keyword))
}

function translateTitle(frenchTitle: string): string {
  // Split by word boundaries but keep the structure
  let result = frenchTitle

  // Create a case-insensitive search and replace
  for (const [french, english] of Object.entries(frenchToEnglish)) {
    // Use word boundaries to avoid partial replacements
    const regex = new RegExp(`\\b${french}\\b`, 'gi')
    result = result.replace(regex, english)
  }

  return result
}

function normalizeForComparison(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

async function translateAndDedupeJobsV2() {
  console.log('Starting job title translation and deduplication (v2)...\n')

  try {
    // Step 1: Get all job titles
    const allJobTitles = await db.select().from(jobTitle)
    console.log(`Found ${allJobTitles.length} job titles\n`)

    // Step 2: Separate French and English titles
    const frenchTitles: Array<{
      jobTitleId: number
      originalTitle: string
      translatedTitle: string
    }> = []

    const englishTitles: Map<string, { jobTitleId: number; title: string }> = new Map()

    for (const job of allJobTitles) {
      if (isFrenchTitle(job.title)) {
        const translated = translateTitle(job.title)
        frenchTitles.push({
          jobTitleId: job.jobTitleId,
          originalTitle: job.title,
          translatedTitle: translated,
        })
      } else {
        const normalized = normalizeForComparison(job.title)
        englishTitles.set(normalized, {
          jobTitleId: job.jobTitleId,
          title: job.title,
        })
      }
    }

    console.log(`French titles to translate: ${frenchTitles.length}`)
    console.log(`Already in English: ${englishTitles.size}\n`)

    // Show sample translations
    console.log('Sample translations:')
    frenchTitles.slice(0, 20).forEach(({ originalTitle, translatedTitle }) => {
      console.log(`  "${originalTitle}" → "${translatedTitle}"`)
    })
    console.log()

    // Step 3: Process each French title
    const toDelete: Array<{ jobTitleId: number; title: string; reason: string }> = []
    const toUpdate: Array<{ jobTitleId: number; originalTitle: string; newTitle: string }> = []

    for (const frenchJob of frenchTitles) {
      const normalizedTranslated = normalizeForComparison(frenchJob.translatedTitle)

      // Check if this translation already exists
      const existingEnglish = englishTitles.get(normalizedTranslated)

      if (existingEnglish) {
        // Duplicate - mark for deletion
        toDelete.push({
          jobTitleId: frenchJob.jobTitleId,
          title: frenchJob.originalTitle,
          reason: `Duplicate of "${existingEnglish.title}"`,
        })
      } else {
        // Check if another French title will translate to the same thing
        const duplicateTranslation = toUpdate.find(
          u => normalizeForComparison(u.newTitle) === normalizedTranslated
        )

        if (duplicateTranslation) {
          // Another French title already translates to this - delete this one
          toDelete.push({
            jobTitleId: frenchJob.jobTitleId,
            title: frenchJob.originalTitle,
            reason: `Will become duplicate of "${duplicateTranslation.newTitle}"`,
          })
        } else {
          // Unique - mark for translation
          toUpdate.push({
            jobTitleId: frenchJob.jobTitleId,
            originalTitle: frenchJob.originalTitle,
            newTitle: frenchJob.translatedTitle,
          })
          // Add to English titles map to check future duplicates
          englishTitles.set(normalizedTranslated, {
            jobTitleId: frenchJob.jobTitleId,
            title: frenchJob.translatedTitle,
          })
        }
      }
    }

    console.log(`\nWill delete ${toDelete.length} duplicates`)
    console.log(`Will translate ${toUpdate.length} unique titles\n`)

    if (toDelete.length > 0) {
      console.log('Duplicates to remove:')
      toDelete.slice(0, 10).forEach(({ title, reason }) => {
        console.log(`  ✗ "${title}" - ${reason}`)
      })
      if (toDelete.length > 10) {
        console.log(`  ... and ${toDelete.length - 10} more`)
      }
      console.log()
    }

    // Step 4: Execute deletions first
    if (toDelete.length > 0) {
      console.log('Deleting duplicate titles...')
      for (const { jobTitleId } of toDelete) {
        await db.delete(jobTitle).where(eq(jobTitle.jobTitleId, jobTitleId))
      }
      console.log(`✓ Deleted ${toDelete.length} duplicates\n`)
    }

    // Step 5: Execute translations
    if (toUpdate.length > 0) {
      console.log('Translating unique titles to English...')
      let updated = 0
      for (const { jobTitleId, newTitle } of toUpdate) {
        try {
          await db
            .update(jobTitle)
            .set({ title: newTitle })
            .where(eq(jobTitle.jobTitleId, jobTitleId))
          updated++
        } catch (error: any) {
          console.error(`  ✗ Failed to update ID ${jobTitleId}: ${error.message}`)
        }

        if (updated % 50 === 0) {
          console.log(`  Updated ${updated}/${toUpdate.length}...`)
        }
      }
      console.log(`✓ Translated ${updated} titles\n`)
    }

    // Step 6: Final summary
    const finalCount = await db.select({ count: sql<number>`count(*)` }).from(jobTitle)
    console.log('✅ Translation and deduplication complete!')
    console.log(`Final job title count: ${finalCount[0].count}`)
    console.log(`Removed: ${allJobTitles.length - Number(finalCount[0].count)} titles`)

  } catch (error) {
    console.error('❌ Error translating job titles:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

translateAndDedupeJobsV2()
