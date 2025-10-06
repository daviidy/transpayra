import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle } from './schema'
import { eq, sql } from 'drizzle-orm'

// Complete mapping of ALL remaining issues
const corrections: Record<string, string> = {
  // Remaining corrupted English titles
  'Inofstrial Ofsigner': 'Industrial Designer',
  'Fashion Ofsigner': 'Fashion Designer',
  'Interaction Ofsigner': 'Interaction Designer',
  'Usability Ofsigner': 'Usability Designer',
  'Ui Ofsigner': 'UI Designer',
  'Web Ofsigner': 'Web Designer',
  'Mobithe Ofsigner': 'Mobile Designer',
  'Viofo Game Ofsigner': 'Video Game Designer',
  'Graphic Ofsigner': 'Graphic Designer',
  'Content Ofsigner': 'Content Designer',
  'New Proofct Introofction (npi) Engineer': 'New Product Introduction Engineer',
  'Data Visualization Ofsigner': 'Data Visualization Designer',

  // Remaining French titles - most critical ones
  'Acheteur Grande': 'Senior Buyer',
  'Acheteur Grande Distribution': 'Retail Buyer',
  'Acheteur': 'Buyer',
  'Acheteur Matières Premières': 'Raw Materials Buyer',
  'Acheteur Services/FM': 'Services Buyer',
  'Ingénieur Devops': 'DevOps Engineer',
  'Ingénieur Cybersécurité': 'Cybersecurity Engineer',
  'Ingénieur Réseaux/ Systèmes Sécurité & Cybersécurité': 'Network Security Engineer',
  'Ingénieur Qhse': 'QHSE Engineer',
  'Directeur Financier': 'Financial Director',
  'Directeur Commercial': 'Sales Director',
  'Directeur Marketing': 'Marketing Director',
  'Directeur RH': 'HR Director',
  'Responsable Commercial': 'Sales Manager',
  'Responsable Marketing': 'Marketing Manager',
  'Responsable RH': 'HR Manager',
  'Responsable Financier': 'Financial Manager',
  'Gestionnaire': 'Administrator',
  'Comptable': 'Accountant',
  'Contrôleur': 'Controller',
  'Contrôleur de Gestion': 'Management Controller',
  'Chef de Projet': 'Project Lead',
  'Développeur': 'Developer',
  'Développeur Web': 'Web Developer',
}

async function finalCleanup() {
  console.log('Final cleanup of job titles...\n')

  try {
    const allTitles = await db.select().from(jobTitle)
    console.log(`Total titles: ${allTitles.length}\n`)

    let fixedCount = 0
    let deletedCount = 0

    for (const [incorrect, correct] of Object.entries(corrections)) {
      const found = allTitles.find(t => t.title === incorrect)
      if (found) {
        // Check if correct version exists
        const existing = allTitles.find(t => t.title === correct && t.jobTitleId !== found.jobTitleId)

        if (existing) {
          await db.delete(jobTitle).where(eq(jobTitle.jobTitleId, found.jobTitleId))
          console.log(`✓ Deleted: "${incorrect}" (duplicate of "${correct}")`)
          deletedCount++
        } else {
          try {
            await db.update(jobTitle).set({ title: correct }).where(eq(jobTitle.jobTitleId, found.jobTitleId))
            console.log(`✓ Fixed: "${incorrect}" → "${correct}"`)
            fixedCount++
          } catch (error: any) {
            if (error.message.includes('duplicate key')) {
              // Another record with this name exists, delete this one
              await db.delete(jobTitle).where(eq(jobTitle.jobTitleId, found.jobTitleId))
              console.log(`✓ Deleted: "${incorrect}" (duplicate of "${correct}")`)
              deletedCount++
            } else {
              console.error(`✗ Failed: "${incorrect}" - ${error.message}`)
            }
          }
        }
      }
    }

    console.log(`\n✅ Complete!`)
    console.log(`Fixed: ${fixedCount} titles`)
    console.log(`Deleted: ${deletedCount} duplicates`)

    // Final count
    const finalCount = await db.select({ count: sql<number>`count(*)` }).from(jobTitle)
    console.log(`Final count: ${finalCount[0].count} job titles`)

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

finalCleanup()
