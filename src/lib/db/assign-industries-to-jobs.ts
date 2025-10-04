import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { jobTitle, industry } from './schema'
import { eq, isNull } from 'drizzle-orm'

// Mapping keywords in job titles to industries
const industryKeywords: Record<string, string[]> = {
  'Technology': [
    'informatique', 'developpeur', 'developer', 'ingenieur systemes', 'ingenieur reseaux',
    'devops', 'web', 'digital', 'it', 'cybersecurite', 'data analyst', 'product owner',
    'administrateur', 'software', 'systemes information', 'infrastructures', 'tests',
    'helpdesk', 'support', 'webmaster', 'mobile', 'ui', 'ux', 'designer'
  ],
  'Finance': [
    'comptable', 'financier', 'tresorerie', 'controle gestion', 'controleur',
    'audit', 'credit', 'risques', 'banque', 'bancaire', 'actuaire', 'fiscaliste',
    'tressorier', 'comptabilite', 'facturation', 'recouvrement', 'asset management',
    'trader', 'portefeuille', 'corporate banking', 'investissement', 'fonds'
  ],
  'Consulting': [
    'consultant', 'expert comptable', 'mission', 'auditeur'
  ],
  'Manufacturing': [
    'production', 'usine', 'maintenance', 'technicien', 'operateur', 'atelier',
    'mecanique', 'electricien', 'mecanicien', 'ligne', 'quart', 'fabrication',
    'conducteur ligne', 'magasinier', 'manutention', 'soudeur', 'operateur saisie'
  ],
  'Media & Entertainment': [
    'graphiste', 'infographiste', 'motion designer', 'directeur artistique',
    'medias', 'social media', 'communication', 'dessinateur'
  ],
  'E-commerce': [
    'category manager', 'e-commerce', 'digital marketing', 'community manager',
    'chef de secteur', 'distribution', 'magasin', 'supermarche', 'hypermarche',
    'vendeur', 'caissier'
  ],
  'Healthcare': [
    'medical', 'sante', 'prevoyance', 'assurance sante', 'pharmacie'
  ],
  'Education': [
    'formation', 'enseignement', 'formateur', 'pedagogie'
  ],
  'Biotechnology': [
    'laboratoire', 'essais', 'qualite', 'qhse', 'hse', 'bureau etudes', 'r&d'
  ],
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, ' ') // Keep only alphanumeric and spaces
    .replace(/\s+/g, ' ')
    .trim()
}

function findBestIndustry(
  title: string,
  industries: Array<{ industryId: number; name: string; slug: string }>
): number | null {
  const normalizedTitle = normalizeTitle(title)

  // Track score for each industry
  const scores: Record<string, number> = {}

  // Initialize scores
  industries.forEach(ind => {
    scores[ind.name] = 0
  })

  // Score based on keyword matches
  for (const [industryName, keywords] of Object.entries(industryKeywords)) {
    if (!scores.hasOwnProperty(industryName)) continue

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeTitle(keyword)
      if (normalizedTitle.includes(normalizedKeyword)) {
        scores[industryName] += 1
      }
    }
  }

  // Find industry with highest score
  let maxScore = 0
  let bestIndustry: string | null = null

  for (const [industryName, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestIndustry = industryName
    }
  }

  // If no match found, assign to Consulting as default for business roles
  if (!bestIndustry || maxScore === 0) {
    // Check if it's a general business/admin role
    const businessKeywords = ['directeur', 'manager', 'responsable', 'chef', 'assistant', 'gestionnaire']
    const hasBusinessKeyword = businessKeywords.some(kw => normalizedTitle.includes(kw))

    if (hasBusinessKeyword) {
      bestIndustry = 'Consulting'
    } else {
      // Default to Manufacturing for operational roles
      bestIndustry = 'Manufacturing'
    }
  }

  // Find the industry ID
  const industryRecord = industries.find(ind => ind.name === bestIndustry)
  return industryRecord ? industryRecord.industryId : null
}

async function assignIndustriesToJobs() {
  console.log('Starting industry assignment for job titles...\n')

  try {
    // Step 1: Fetch all industries
    const allIndustries = await db.select().from(industry)
    console.log(`Found ${allIndustries.length} industries in database\n`)

    // Step 2: Fetch all job titles with null industry_id
    const jobsWithoutIndustry = await db
      .select()
      .from(jobTitle)
      .where(isNull(jobTitle.industryId))

    console.log(`Found ${jobsWithoutIndustry.length} job titles without industry\n`)

    if (jobsWithoutIndustry.length === 0) {
      console.log('✓ All job titles already have industries assigned')
      return
    }

    // Step 3: Assign industries
    console.log('Assigning industries...\n')

    const updates: Array<{ jobTitleId: number; title: string; industryId: number; industryName: string }> = []

    for (const job of jobsWithoutIndustry) {
      const industryId = findBestIndustry(job.title, allIndustries)

      if (industryId) {
        const industryRecord = allIndustries.find(ind => ind.industryId === industryId)
        updates.push({
          jobTitleId: job.jobTitleId,
          title: job.title,
          industryId,
          industryName: industryRecord?.name || 'Unknown'
        })
      }
    }

    // Show sample of assignments
    console.log('Sample assignments:')
    updates.slice(0, 20).forEach(({ title, industryName }) => {
      console.log(`  • ${title} → ${industryName}`)
    })
    console.log()

    // Step 4: Update database
    console.log(`Updating ${updates.length} job titles...`)

    let updated = 0
    for (const update of updates) {
      await db
        .update(jobTitle)
        .set({ industryId: update.industryId })
        .where(eq(jobTitle.jobTitleId, update.jobTitleId))

      updated++

      if (updated % 50 === 0) {
        console.log(`  Updated ${updated}/${updates.length}...`)
      }
    }

    console.log(`\n✅ Successfully assigned industries to ${updated} job titles!`)

    // Show summary by industry
    const summary: Record<string, number> = {}
    updates.forEach(({ industryName }) => {
      summary[industryName] = (summary[industryName] || 0) + 1
    })

    console.log('\nSummary by industry:')
    Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([industry, count]) => {
        console.log(`  ${industry}: ${count} job titles`)
      })

  } catch (error) {
    console.error('❌ Error assigning industries:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

assignIndustriesToJobs()
