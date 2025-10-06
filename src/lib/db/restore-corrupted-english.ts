import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle } from './schema'
import { eq } from 'drizzle-orm'

// Fix corrupted English titles ONLY
const corruptedToCorrect: Record<string, string> = {
  // Fix "Designer" corruption
  'Ui Ux Ofsigner': 'UI/UX Designer',
  'Ux Ofsigner': 'UX Designer',
  'Proofct Ofsigner': 'Product Designer',
  'Motion Ofsigner': 'Motion Designer',

  // Fix "Product" corruption
  'Proofct Manager': 'Product Manager',
  'Senior Proofct Manager': 'Senior Product Manager',
  'Proofct Owner': 'Product Owner',
  'Proofct Marketing Manager': 'Product Marketing Manager',
  'Proofct Ofsign Manager': 'Product Design Manager',

  // Fix "Developer" corruption
  'Web Ofveloper': 'Web Developer',
  'Ofveloper Advocate': 'Developer Advocate',
  'Quantitative Ofveloper': 'Quantitative Developer',
  'Sathesforce Ofveloper': 'Salesforce Developer',

  // Fix "Learning" corruption
  'Machine Thearning Engineer': 'Machine Learning Engineer',
  'Machine Thearning Ops Engineer': 'Machine Learning Ops Engineer',

  // Fix "Mobile" corruption
  'Mobithe Software Engineer': 'Mobile Software Engineer',

  // Fix "Deployed" corruption
  'Forward Ofployed Software Engineer': 'Forward Deployed Software Engineer',

  // Fix "Networking" corruption
  'Nandworking Engineer': 'Networking Engineer',

  // Fix "Video" corruption
  'Viofo Game Software Engineer': 'Video Game Software Engineer',

  // Fix "Business" corruption
  'Bplantss Intelligence Engineer': 'Business Intelligence Engineer',
  'Bplantss Intelligence Analyst': 'Business Intelligence Analyst',
  'Bplantss Analyst': 'Business Analyst',
}

async function restoreCorruptedEnglish() {
  console.log('Restoring corrupted English titles...\n')

  try {
    const allTitles = await db.select().from(jobTitle)

    let restoredCount = 0
    for (const [corrupted, correct] of Object.entries(corruptedToCorrect)) {
      const found = allTitles.find(t => t.title === corrupted)
      if (found) {
        // Check if correct version already exists
        const existing = allTitles.find(t => t.title === correct && t.jobTitleId !== found.jobTitleId)

        if (existing) {
          // Delete the corrupted one
          await db.delete(jobTitle).where(eq(jobTitle.jobTitleId, found.jobTitleId))
          console.log(`✓ Deleted: "${corrupted}" (duplicate of "${correct}")`)
        } else {
          // Update to correct version
          await db.update(jobTitle).set({ title: correct }).where(eq(jobTitle.jobTitleId, found.jobTitleId))
          console.log(`✓ Restored: "${corrupted}" → "${correct}"`)
        }
        restoredCount++
      }
    }

    console.log(`\n✅ Restored ${restoredCount} corrupted English titles`)

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

restoreCorruptedEnglish()