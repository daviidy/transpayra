import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { industry, jobTitle } from './schema'
import { eq } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

interface IndustryData {
  name: string
  jobTitles: string[]
}

async function parseIndustriesJobFile(): Promise<IndustryData[]> {
  const filePath = path.join(process.cwd(), 'industries-job.md')
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const industries: IndustryData[] = []
  let currentIndustry: IndustryData | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) continue

    // Industry header (starts with #)
    if (trimmed.startsWith('#')) {
      if (currentIndustry) {
        industries.push(currentIndustry)
      }
      const industryName = trimmed.replace(/^#+\s*/, '')
      currentIndustry = {
        name: industryName,
        jobTitles: [],
      }
      continue
    }

    // Job title lines (remove "Icon" text if present)
    if (currentIndustry && trimmed) {
      // Clean up the line - handle patterns like "Software Engineer IconSoftware Engineer"
      // First, try to match pattern "X IconX" and extract just X
      const iconPattern = /^(.+?)\s+Icon\1$/
      const match = trimmed.match(iconPattern)

      let cleanTitle: string
      if (match) {
        // Pattern "X IconX" found - use just X
        cleanTitle = match[1].trim()
      } else {
        // Otherwise, just remove all "Icon" occurrences
        cleanTitle = trimmed
          .replace(/\s*Icon[A-Za-z\s]*Icon\s*/g, ' ') // Remove "IconTextIcon" pattern
          .replace(/\s*Icon\s*/g, ' ') // Remove any remaining "Icon"
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim()
      }

      // Only add if it's a substantial job title (not sub-categories like "Finance", "Marketing")
      // We'll consider lines with more than 3 characters as job titles
      if (cleanTitle && cleanTitle.length > 2) {
        // Check if this looks like a main job title (not a subcategory)
        // Main job titles typically contain words like Engineer, Manager, Designer, etc.
        const isMainTitle =
          cleanTitle.includes('Engineer') ||
          cleanTitle.includes('Manager') ||
          cleanTitle.includes('Designer') ||
          cleanTitle.includes('Developer') ||
          cleanTitle.includes('Analyst') ||
          cleanTitle.includes('Scientist') ||
          cleanTitle.includes('Architect') ||
          cleanTitle.includes('Specialist') ||
          cleanTitle.includes('Consultant') ||
          cleanTitle.includes('Director') ||
          cleanTitle.includes('Executive') ||
          cleanTitle.includes('Administrator') ||
          cleanTitle.includes('Coordinator') ||
          cleanTitle.includes('Representative') ||
          cleanTitle.includes('Assistant') ||
          cleanTitle.includes('Technician') ||
          cleanTitle.includes('Recruiter') ||
          cleanTitle.includes('Writer') ||
          cleanTitle.includes('Researcher') ||
          cleanTitle.includes('Advocate') ||
          cleanTitle.includes('Moderator') ||
          cleanTitle.includes('Adjuster') ||
          cleanTitle.includes('Meteorologist') ||
          cleanTitle.includes('Physician') ||
          cleanTitle.includes('Surgeon') ||
          cleanTitle.includes('Doctor') ||
          cleanTitle.includes('Specialist') ||
          cleanTitle.includes('Toxicologist') ||
          cleanTitle.includes('Immunologist') ||
          cleanTitle.includes('Anesthesiologist') ||
          cleanTitle.includes('Cardiologist') ||
          cleanTitle.includes('Intensivist') ||
          cleanTitle.includes('Dermatologist') ||
          cleanTitle.includes('Endocrinologist') ||
          cleanTitle.includes('Gastroenterologist') ||
          cleanTitle.includes('Hematologist') ||
          cleanTitle.includes('Nephrologist') ||
          cleanTitle.includes('Neurosurgeon') ||
          cleanTitle.includes('Neurologist') ||
          cleanTitle.includes('Ophthalmologist') ||
          cleanTitle.includes('Pathologist') ||
          cleanTitle.includes('Pediatrician') ||
          cleanTitle.includes('Physiatrist') ||
          cleanTitle.includes('Psychiatrist') ||
          cleanTitle.includes('Pulmonologist') ||
          cleanTitle.includes('Oncologist') ||
          cleanTitle.includes('Radiologist') ||
          cleanTitle.includes('Rheumatologist') ||
          cleanTitle.includes('Urologist') ||
          cleanTitle.includes('Gynecologist') ||
          cleanTitle.includes('Obstetrician') ||
          cleanTitle.includes('Biologist') ||
          cleanTitle.includes('Biostatistician') ||
          cleanTitle.includes('Founder') ||
          cleanTitle.includes('Banker') ||
          cleanTitle.includes('Accountant') ||
          cleanTitle.includes('Auditor') ||
          cleanTitle.includes('Controller') ||
          cleanTitle.includes('Capitalist') ||
          cleanTitle.includes('Partner') ||
          cleanTitle.includes('Investor') ||
          cleanTitle.includes('Principal') ||
          cleanTitle.includes('Associate') ||
          cleanTitle.includes('Actuary') ||
          cleanTitle.includes('Underwriter') ||
          cleanTitle.includes('Agent') ||
          cleanTitle.includes('Counsel') ||
          cleanTitle.includes('Attorney') ||
          cleanTitle.includes('Chief of Staff') ||
          cleanTitle.includes('Copywriter') ||
          cleanTitle.includes('Sourcer') ||
          cleanTitle === 'Software Engineer' // Special case

        if (isMainTitle && !currentIndustry.jobTitles.includes(cleanTitle)) {
          currentIndustry.jobTitles.push(cleanTitle)
        }
      }
    }
  }

  // Push the last industry
  if (currentIndustry) {
    industries.push(currentIndustry)
  }

  return industries
}

async function seedIndustriesAndJobs() {
  try {
    console.log('🌱 Starting to seed industries and job titles...')

    const industriesData = await parseIndustriesJobFile()

    console.log(`📊 Found ${industriesData.length} industries`)

    for (const industryData of industriesData) {
      console.log(`\n📁 Processing industry: ${industryData.name}`)
      console.log(`   Found ${industryData.jobTitles.length} job titles`)

      // Insert industry
      const [insertedIndustry] = await db
        .insert(industry)
        .values({
          name: industryData.name,
          slug: createSlug(industryData.name),
        })
        .onConflictDoNothing()
        .returning({ id: industry.industryId })

      // Get industry ID (either inserted or existing)
      let industryId: number
      if (insertedIndustry) {
        industryId = insertedIndustry.id
        console.log(`   ✅ Inserted industry: ${industryData.name} (ID: ${industryId})`)
      } else {
        const [existing] = await db
          .select({ id: industry.industryId })
          .from(industry)
          .where(eq(industry.name, industryData.name))
        industryId = existing.id
        console.log(`   ⏭️  Industry already exists: ${industryData.name} (ID: ${industryId})`)
      }

      // Insert job titles for this industry
      for (const title of industryData.jobTitles) {
        try {
          await db
            .insert(jobTitle)
            .values({
              title: title,
              slug: createSlug(title),
              industryId: industryId,
            })
            .onConflictDoNothing()

          console.log(`      ✅ ${title}`)
        } catch (error) {
          console.log(`      ⚠️  Error inserting ${title}: ${error}`)
        }
      }
    }

    console.log('\n🎉 Seeding completed successfully!')

    // Print summary
    const totalIndustries = await db.select({ count: industry.industryId }).from(industry)
    const totalJobTitles = await db.select({ count: jobTitle.jobTitleId }).from(jobTitle)

    console.log('\n📊 Summary:')
    console.log(`   Total industries in database: ${totalIndustries.length}`)
    console.log(`   Total job titles in database: ${totalJobTitles.length}`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }

  process.exit(0)
}

seedIndustriesAndJobs()
