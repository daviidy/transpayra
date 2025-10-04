import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { industry, jobTitle, company, location } from './schema'

async function seedAll() {
  console.log('Starting database seed...\n')

  try {
    // 1. Seed Industries
    console.log('Seeding industries...')
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

    const insertedIndustries = await db
      .insert(industry)
      .values(industries)
      .onConflictDoNothing()
      .returning()

    console.log(`✓ Seeded ${insertedIndustries.length} industries\n`)

    // Get technology industry ID for job titles
    const techIndustry = await db
      .select()
      .from(industry)
      .where(eq(industry.slug, 'technology'))
      .limit(1)

    const techIndustryId = techIndustry[0]?.industryId

    // 2. Seed Job Titles
    console.log('Seeding job titles...')
    const jobTitles = [
      { title: 'Software Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'software-engineer' },
      { title: 'Senior Software Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'senior-software-engineer' },
      { title: 'Staff Software Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'staff-software-engineer' },
      { title: 'Principal Software Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'principal-software-engineer' },
      { title: 'Frontend Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'frontend-engineer' },
      { title: 'Backend Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'backend-engineer' },
      { title: 'Full Stack Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'full-stack-engineer' },
      { title: 'DevOps Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'devops-engineer' },
      { title: 'Site Reliability Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'site-reliability-engineer' },
      { title: 'Data Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'data-engineer' },
      { title: 'Machine Learning Engineer', industryId: techIndustryId, category: 'Engineering', slug: 'machine-learning-engineer' },
      { title: 'Data Scientist', industryId: techIndustryId, category: 'Data', slug: 'data-scientist' },
      { title: 'Product Manager', industryId: techIndustryId, category: 'Product', slug: 'product-manager' },
      { title: 'Senior Product Manager', industryId: techIndustryId, category: 'Product', slug: 'senior-product-manager' },
      { title: 'Product Designer', industryId: techIndustryId, category: 'Design', slug: 'product-designer' },
      { title: 'UX Designer', industryId: techIndustryId, category: 'Design', slug: 'ux-designer' },
      { title: 'Engineering Manager', industryId: techIndustryId, category: 'Management', slug: 'engineering-manager' },
      { title: 'Security Engineer', industryId: techIndustryId, category: 'Security', slug: 'security-engineer' },
    ]

    const insertedJobTitles = await db
      .insert(jobTitle)
      .values(jobTitles)
      .onConflictDoNothing()
      .returning()

    console.log(`✓ Seeded ${insertedJobTitles.length} job titles\n`)

    // 3. Seed Companies
    console.log('Seeding companies...')
    const companies = [
      { name: 'Google', slug: 'google', website: 'https://google.com', industry: 'Technology', headquarters: 'Mountain View, CA' },
      { name: 'Meta', slug: 'meta', website: 'https://meta.com', industry: 'Technology', headquarters: 'Menlo Park, CA' },
      { name: 'Amazon', slug: 'amazon', website: 'https://amazon.com', industry: 'Technology', headquarters: 'Seattle, WA' },
      { name: 'Microsoft', slug: 'microsoft', website: 'https://microsoft.com', industry: 'Technology', headquarters: 'Redmond, WA' },
      { name: 'Apple', slug: 'apple', website: 'https://apple.com', industry: 'Technology', headquarters: 'Cupertino, CA' },
      { name: 'Netflix', slug: 'netflix', website: 'https://netflix.com', industry: 'Technology', headquarters: 'Los Gatos, CA' },
      { name: 'Uber', slug: 'uber', website: 'https://uber.com', industry: 'Technology', headquarters: 'San Francisco, CA' },
      { name: 'Airbnb', slug: 'airbnb', website: 'https://airbnb.com', industry: 'Technology', headquarters: 'San Francisco, CA' },
      { name: 'Stripe', slug: 'stripe', website: 'https://stripe.com', industry: 'Technology', headquarters: 'San Francisco, CA' },
      { name: 'Shopify', slug: 'shopify', website: 'https://shopify.com', industry: 'Technology', headquarters: 'Ottawa, Canada' },
      { name: 'Andela', slug: 'andela', website: 'https://andela.com', industry: 'Technology', headquarters: 'Lagos, Nigeria' },
      { name: 'Flutterwave', slug: 'flutterwave', website: 'https://flutterwave.com', industry: 'Technology', headquarters: 'Lagos, Nigeria' },
      { name: 'Interswitch', slug: 'interswitch', website: 'https://interswitch.com', industry: 'Technology', headquarters: 'Lagos, Nigeria' },
    ]

    const insertedCompanies = await db
      .insert(company)
      .values(companies)
      .onConflictDoNothing()
      .returning()

    console.log(`✓ Seeded ${insertedCompanies.length} companies\n`)

    // 4. Seed Locations
    console.log('Seeding locations...')
    const locations = [
      { city: 'San Francisco', state: 'CA', country: 'United States', slug: 'san-francisco-ca-usa', region: 'North America' },
      { city: 'New York', state: 'NY', country: 'United States', slug: 'new-york-ny-usa', region: 'North America' },
      { city: 'Seattle', state: 'WA', country: 'United States', slug: 'seattle-wa-usa', region: 'North America' },
      { city: 'Austin', state: 'TX', country: 'United States', slug: 'austin-tx-usa', region: 'North America' },
      { city: 'Boston', state: 'MA', country: 'United States', slug: 'boston-ma-usa', region: 'North America' },
      { city: 'Los Angeles', state: 'CA', country: 'United States', slug: 'los-angeles-ca-usa', region: 'North America' },
      { city: 'London', state: null, country: 'United Kingdom', slug: 'london-uk', region: 'Europe' },
      { city: 'Berlin', state: null, country: 'Germany', slug: 'berlin-germany', region: 'Europe' },
      { city: 'Amsterdam', state: null, country: 'Netherlands', slug: 'amsterdam-netherlands', region: 'Europe' },
      { city: 'Paris', state: null, country: 'France', slug: 'paris-france', region: 'Europe' },
      { city: 'Lagos', state: null, country: 'Nigeria', slug: 'lagos-nigeria', region: 'Africa' },
      { city: 'Nairobi', state: null, country: 'Kenya', slug: 'nairobi-kenya', region: 'Africa' },
      { city: 'Cape Town', state: null, country: 'South Africa', slug: 'cape-town-south-africa', region: 'Africa' },
      { city: 'Cairo', state: null, country: 'Egypt', slug: 'cairo-egypt', region: 'Africa' },
      { city: 'Toronto', state: 'ON', country: 'Canada', slug: 'toronto-on-canada', region: 'North America' },
      { city: 'Vancouver', state: 'BC', country: 'Canada', slug: 'vancouver-bc-canada', region: 'North America' },
    ]

    const insertedLocations = await db
      .insert(location)
      .values(locations)
      .onConflictDoNothing()
      .returning()

    console.log(`✓ Seeded ${insertedLocations.length} locations\n`)

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

// Import eq for the query
import { eq } from 'drizzle-orm'

seedAll()
