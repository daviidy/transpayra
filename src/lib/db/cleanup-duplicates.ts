import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle } from './schema'
import { eq } from 'drizzle-orm'

async function cleanupDuplicates() {
  try {
    console.log('🧹 Cleaning up duplicate job titles...')

    // Get all job titles
    const allTitles = await db.select().from(jobTitle)

    const duplicates: number[] = []

    for (const title of allTitles) {
      // Check if title has the pattern "Word Word" where both words are the same
      const words = title.title.split(' ')
      const halfLength = Math.floor(words.length / 2)

      // If even number of words, check if first half equals second half
      if (words.length % 2 === 0 && halfLength > 0) {
        const firstHalf = words.slice(0, halfLength).join(' ')
        const secondHalf = words.slice(halfLength).join(' ')

        if (firstHalf === secondHalf) {
          duplicates.push(title.jobTitleId)
          console.log(`   Found duplicate: "${title.title}" -> should be "${firstHalf}"`)
        }
      }
    }

    // Delete duplicates
    if (duplicates.length > 0) {
      for (const id of duplicates) {
        await db.delete(jobTitle).where(eq(jobTitle.jobTitleId, id))
      }
      console.log(`\n✅ Deleted ${duplicates.length} duplicate job titles`)
    } else {
      console.log('✅ No duplicates found')
    }

    console.log('\n✅ Cleanup completed!')
  } catch (error) {
    console.error('❌ Error cleaning up:', error)
    process.exit(1)
  }

  process.exit(0)
}

cleanupDuplicates()
