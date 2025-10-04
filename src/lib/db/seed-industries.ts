import { db } from './index'
import { industry } from './schema'

const industries = [
  { name: 'Technology', slug: 'technology', icon: '💻' },
  { name: 'Finance', slug: 'finance', icon: '💰' },
  { name: 'Healthcare', slug: 'healthcare', icon: '🏥' },
  { name: 'Biotechnology', slug: 'biotechnology', icon: '🧬' },
  { name: 'E-commerce', slug: 'e-commerce', icon: '🛒' },
  { name: 'Gaming', slug: 'gaming', icon: '🎮' },
  { name: 'Education', slug: 'education', icon: '📚' },
  { name: 'Media & Entertainment', slug: 'media-entertainment', icon: '🎬' },
  { name: 'Consulting', slug: 'consulting', icon: '💼' },
  { name: 'Manufacturing', slug: 'manufacturing', icon: '🏭' },
]

async function seedIndustries() {
  console.log('Seeding industries...')

  for (const ind of industries) {
    try {
      await db.insert(industry).values(ind).onConflictDoNothing()
      console.log(`✓ ${ind.name}`)
    } catch (error) {
      console.error(`✗ ${ind.name}:`, error)
    }
  }

  console.log('Done!')
  process.exit(0)
}

seedIndustries()
