import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle } from './schema'
import { eq, sql } from 'drizzle-orm'

// Manual mappings for corrupted titles and remaining French titles
const corrections: Record<string, string> = {
  // Fix corrupted English titles
  'Proofct Manager': 'Product Manager',
  'Ui Ux Ofsigner': 'UI/UX Designer',
  'Ui Ux Designer': 'UI/UX Designer',
  'Ux Ofsigner': 'UX Designer',
  'Proofct Ofsigner': 'Product Designer',
  'Web Ofveloper': 'Web Developer',
  'Machine Thearning Engineer': 'Machine Learning Engineer',
  'Machine Thearning Ops Engineer': 'Machine Learning Ops Engineer',
  'Mobithe Software Engineer': 'Mobile Software Engineer',
  'Sathesforce Ofveloper': 'Salesforce Developer',
  'Forward Ofployed Software Engineer': 'Forward Deployed Software Engineer',
  'Ofveloper Advocate': 'Developer Advocate',
  'Nandworking Engineer': 'Networking Engineer',
  'Viofo Game Software Engineer': 'Video Game Software Engineer',
  'Bplantss Intelligence Engineer': 'Business Intelligence Engineer',
  'Quantitative Ofveloper': 'Quantitative Developer',

  // Finish translating remaining French titles
  'Administrator SantÉ/ Prévoyance': 'Health Insurance Administrator',
  'Director of Mission d\'Expérience': 'Experience Mission Director',
  'Lead of Project Monétique': 'Payment Systems Project Lead',
  'Trésorier': 'Treasurer',
  'Manager Opérations': 'Operations Manager',
  'Médias Lead of Sales': 'Media Sales Lead',
  'Director of Clientèthe': 'Client Director',
  'Manager Clientèthe': 'Client Manager',
  'Superviseur/ Manager Télévente': 'Telesales Manager',
  'Manager Télévente': 'Telesales Manager',
}

async function fixCorruptedTitles() {
  console.log('Fixing corrupted and remaining French titles...\n')

  try {
    // Get all job titles
    const allTitles = await db.select().from(jobTitle)

    // Find titles that need fixing
    const toFix: Array<{ jobTitleId: number; oldTitle: string; newTitle: string }> = []

    for (const job of allTitles) {
      if (corrections[job.title]) {
        toFix.push({
          jobTitleId: job.jobTitleId,
          oldTitle: job.title,
          newTitle: corrections[job.title],
        })
      }
    }

    // Also check for any title with French accents
    const withAccents = await db.select().from(jobTitle).where(sql`title ~ '[àâäéèêëïîôùûüÿçœæÀÂÄÉÈÊËÏÎÔÙÛÜŸÇŒÆ]'`)

    console.log(`Found ${toFix.length} titles with direct corrections`)
    console.log(`Found ${withAccents.length} titles still with French accents\n`)

    if (toFix.length > 0) {
      console.log('Titles to fix:')
      toFix.forEach(({ oldTitle, newTitle }) => {
        console.log(`  "${oldTitle}" → "${newTitle}"`)
      })
      console.log()

      // Apply fixes - handle duplicates by deleting
      let fixed = 0
      for (const { jobTitleId, newTitle, oldTitle } of toFix) {
        try {
          // Check if target title already exists
          const existing = allTitles.find(t => t.title === newTitle && t.jobTitleId !== jobTitleId)

          if (existing) {
            // Delete the old one instead of updating
            await db.delete(jobTitle).where(eq(jobTitle.jobTitleId, jobTitleId))
            console.log(`  ✓ Deleted "${oldTitle}" (duplicate of "${newTitle}")`)
          } else {
            // Update to new title
            await db
              .update(jobTitle)
              .set({ title: newTitle })
              .where(eq(jobTitle.jobTitleId, jobTitleId))
            console.log(`  ✓ Updated "${oldTitle}" → "${newTitle}"`)
          }
          fixed++
        } catch (error: any) {
          console.error(`  ✗ Failed to fix "${oldTitle}": ${error.message}`)
        }
      }

      console.log(`\n✓ Fixed ${fixed} titles\n`)
    }

    if (withAccents.length > 0) {
      console.log('Remaining titles with French accents (need manual review):')
      withAccents.forEach(j => console.log(`  - ${j.title}`))
    }

    console.log('\n✅ Corrections complete!')

  } catch (error) {
    console.error('❌ Error fixing titles:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

fixCorruptedTitles()
