import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle, industry } from './schema'
import { isNull, eq, ilike } from 'drizzle-orm'

async function fixMissingIndustries() {
  try {
    console.log('🔧 Fixing job titles with missing industries...')

    // Get Technology industry ID
    const [techIndustry] = await db
      .select({ id: industry.industryId })
      .from(industry)
      .where(eq(industry.name, 'Technology'))
      .limit(1)

    if (!techIndustry) {
      console.error('❌ Technology industry not found!')
      process.exit(1)
    }

    console.log(`✅ Found Technology industry (ID: ${techIndustry.id})`)

    // Get all job titles without industry
    const titlesWithoutIndustry = await db
      .select()
      .from(jobTitle)
      .where(isNull(jobTitle.industryId))

    console.log(`\n📊 Found ${titlesWithoutIndustry.length} job titles without industry`)

    // Update each one to Technology (since most are tech-related from old seed)
    for (const title of titlesWithoutIndustry) {
      await db
        .update(jobTitle)
        .set({ industryId: techIndustry.id })
        .where(eq(jobTitle.jobTitleId, title.jobTitleId))

      console.log(`   ✅ Updated: ${title.title} (ID: ${title.jobTitleId})`)
    }

    // Now check for duplicates and remove old ones
    console.log('\n🔍 Checking for duplicate job titles...')

    const allTitles = await db.select().from(jobTitle)
    const titleMap = new Map<string, number[]>()

    for (const title of allTitles) {
      const key = title.title.toLowerCase()
      if (!titleMap.has(key)) {
        titleMap.set(key, [])
      }
      titleMap.get(key)!.push(title.jobTitleId)
    }

    // Find duplicates
    const duplicates = Array.from(titleMap.entries()).filter(([_, ids]) => ids.length > 1)

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate job titles`)

      for (const [title, ids] of duplicates) {
        // Keep the one with the highest ID (newest), delete others
        const idsToDelete = ids.slice(0, -1)
        console.log(`   Deleting duplicates of "${title}": IDs ${idsToDelete.join(', ')}`)

        for (const id of idsToDelete) {
          await db.delete(jobTitle).where(eq(jobTitle.jobTitleId, id))
        }
      }
    }

    console.log('\n✅ Fix completed!')

    // Print summary
    const totalTitles = await db.select().from(jobTitle)
    const withIndustry = totalTitles.filter(t => t.industryId !== null)

    console.log('\n📊 Summary:')
    console.log(`   Total job titles: ${totalTitles.length}`)
    console.log(`   With industry: ${withIndustry.length}`)
    console.log(`   Without industry: ${totalTitles.length - withIndustry.length}`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  process.exit(0)
}

fixMissingIndustries()
