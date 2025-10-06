import fs from 'fs'
import path from 'path'

interface JobTitle {
  job_title_id: null
  title: string
  industry_id: null
  category: null
  slug: null
}

function removeDuplicates() {
  console.log('Removing duplicates from job_seed.json...\n')

  try {
    const jsonPath = path.join(process.cwd(), 'job_seed.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const jobTitles: JobTitle[] = JSON.parse(jsonData)

    console.log(`Original count: ${jobTitles.length} titles\n`)

    // Track seen titles (case-insensitive) and keep first occurrence
    const seenTitles = new Set<string>()
    const uniqueTitles: JobTitle[] = []
    const removed: Array<{index: number, title: string}> = []

    jobTitles.forEach((job, index) => {
      const normalizedTitle = job.title.toLowerCase()

      if (seenTitles.has(normalizedTitle)) {
        removed.push({index, title: job.title})
      } else {
        seenTitles.add(normalizedTitle)
        uniqueTitles.push(job)
      }
    })

    console.log(`Unique titles kept: ${uniqueTitles.length}`)
    console.log(`Duplicates removed: ${removed.length}\n`)

    if (removed.length > 0) {
      console.log('Removed entries:')
      removed.forEach((item, i) => {
        console.log(`  ${i + 1}. Index ${item.index}: "${item.title}"`)
      })
      console.log()
    }

    // Write back to file
    fs.writeFileSync(jsonPath, JSON.stringify(uniqueTitles, null, 2))

    console.log(`✅ Successfully removed ${removed.length} duplicates!`)
    console.log(`Final count: ${uniqueTitles.length} titles`)

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

removeDuplicates()