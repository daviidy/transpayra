import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Load environment variables from .env.local FIRST
config({ path: '.env.local' })

// Then create the database connection
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { prepare: false })
const db = drizzle(client, { schema })

const { company, jobTitle, location, level, salarySubmission } = schema

async function seed() {
  console.log('Starting seed...')

  // Debug: Check if DATABASE_URL is loaded
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not defined!')
    console.error('Make sure .env.local exists and contains DATABASE_URL')
    process.exit(1)
  }
  console.log('DATABASE_URL loaded:', process.env.DATABASE_URL.substring(0, 50) + '...')

  // Insert companies
  const companies = await db.insert(company).values([
    { name: 'Google', website: 'https://google.com', logoUrl: null },
    { name: 'Meta', website: 'https://meta.com', logoUrl: null },
    { name: 'Amazon', website: 'https://amazon.com', logoUrl: null },
    { name: 'Microsoft', website: 'https://microsoft.com', logoUrl: null },
    { name: 'Apple', website: 'https://apple.com', logoUrl: null },
  ]).returning()
  console.log('Companies seeded:', companies.length)

  // Insert job titles
  const jobTitles = await db.insert(jobTitle).values([
    { title: 'Software Engineer' },
    { title: 'Product Manager' },
    { title: 'Data Scientist' },
    { title: 'UI/UX Designer' },
    { title: 'DevOps Engineer' },
  ]).returning()
  console.log('Job titles seeded:', jobTitles.length)

  // Insert locations
  const locations = await db.insert(location).values([
    { city: 'London', state: null, country: 'United Kingdom' },
    { city: 'Berlin', state: null, country: 'Germany' },
    { city: 'Paris', state: null, country: 'France' },
    { city: 'Amsterdam', state: null, country: 'Netherlands' },
    { city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
    { city: 'Nairobi', state: null, country: 'Kenya' },
  ]).returning()
  console.log('Locations seeded:', locations.length)

  // Insert levels for each company-jobTitle pair (sample for Software Engineers at Google)
  const levels = await db.insert(level).values([
    { companyId: companies[0].companyId, jobTitleId: jobTitles[0].jobTitleId, levelName: 'L3', description: 'Entry Level' },
    { companyId: companies[0].companyId, jobTitleId: jobTitles[0].jobTitleId, levelName: 'L4', description: 'Mid Level' },
    { companyId: companies[0].companyId, jobTitleId: jobTitles[0].jobTitleId, levelName: 'L5', description: 'Senior' },
    { companyId: companies[1].companyId, jobTitleId: jobTitles[0].jobTitleId, levelName: 'E3', description: 'Entry Level' },
    { companyId: companies[1].companyId, jobTitleId: jobTitles[0].jobTitleId, levelName: 'E4', description: 'Mid Level' },
  ]).returning()
  console.log('Levels seeded:', levels.length)

  // Insert salary submissions
  const submissions = await db.insert(salarySubmission).values([
    // Software Engineer submissions
    {
      userId: null,
      companyId: companies[0].companyId,
      jobTitleId: jobTitles[0].jobTitleId,
      locationId: locations[0].locationId,
      levelId: levels[0].levelId,
      baseSalary: '85000',
      bonus: '10000',
      stockCompensation: '15000',
      yearsOfExperience: 2,
      yearsAtCompany: 1,
    },
    {
      userId: null,
      companyId: companies[0].companyId,
      jobTitleId: jobTitles[0].jobTitleId,
      locationId: locations[0].locationId,
      levelId: levels[1].levelId,
      baseSalary: '110000',
      bonus: '15000',
      stockCompensation: '25000',
      yearsOfExperience: 5,
      yearsAtCompany: 3,
    },
    {
      userId: null,
      companyId: companies[1].companyId,
      jobTitleId: jobTitles[0].jobTitleId,
      locationId: locations[1].locationId,
      levelId: levels[3].levelId,
      baseSalary: '80000',
      bonus: '12000',
      stockCompensation: '20000',
      yearsOfExperience: 3,
      yearsAtCompany: 2,
    },
    {
      userId: null,
      companyId: companies[2].companyId,
      jobTitleId: jobTitles[0].jobTitleId,
      locationId: locations[2].locationId,
      levelId: null,
      baseSalary: '75000',
      bonus: '8000',
      stockCompensation: '12000',
      yearsOfExperience: 4,
      yearsAtCompany: 2,
    },
    {
      userId: null,
      companyId: companies[3].companyId,
      jobTitleId: jobTitles[0].jobTitleId,
      locationId: locations[3].locationId,
      levelId: null,
      baseSalary: '95000',
      bonus: '10000',
      stockCompensation: '18000',
      yearsOfExperience: 6,
      yearsAtCompany: 4,
    },
    {
      userId: null,
      companyId: companies[4].companyId,
      jobTitleId: jobTitles[0].jobTitleId,
      locationId: locations[0].locationId,
      levelId: null,
      baseSalary: '105000',
      bonus: '14000',
      stockCompensation: '22000',
      yearsOfExperience: 7,
      yearsAtCompany: 5,
    },
    {
      userId: null,
      companyId: companies[0].companyId,
      jobTitleId: jobTitles[0].jobTitleId,
      locationId: locations[4].locationId,
      levelId: levels[0].levelId,
      baseSalary: '45000',
      bonus: '5000',
      stockCompensation: '8000',
      yearsOfExperience: 2,
      yearsAtCompany: 1,
    },
    {
      userId: null,
      companyId: companies[1].companyId,
      jobTitleId: jobTitles[0].jobTitleId,
      locationId: locations[5].locationId,
      levelId: null,
      baseSalary: '38000',
      bonus: '4000',
      stockCompensation: '6000',
      yearsOfExperience: 3,
      yearsAtCompany: 2,
    },
    // Product Manager submissions
    {
      userId: null,
      companyId: companies[0].companyId,
      jobTitleId: jobTitles[1].jobTitleId,
      locationId: locations[0].locationId,
      levelId: null,
      baseSalary: '120000',
      bonus: '20000',
      stockCompensation: '30000',
      yearsOfExperience: 5,
      yearsAtCompany: 2,
    },
    {
      userId: null,
      companyId: companies[1].companyId,
      jobTitleId: jobTitles[1].jobTitleId,
      locationId: locations[1].locationId,
      levelId: null,
      baseSalary: '115000',
      bonus: '18000',
      stockCompensation: '28000',
      yearsOfExperience: 6,
      yearsAtCompany: 3,
    },
    {
      userId: null,
      companyId: companies[2].companyId,
      jobTitleId: jobTitles[1].jobTitleId,
      locationId: locations[2].locationId,
      levelId: null,
      baseSalary: '95000',
      bonus: '15000',
      stockCompensation: '20000',
      yearsOfExperience: 4,
      yearsAtCompany: 2,
    },
    {
      userId: null,
      companyId: companies[3].companyId,
      jobTitleId: jobTitles[1].jobTitleId,
      locationId: locations[0].locationId,
      levelId: null,
      baseSalary: '110000',
      bonus: '17000',
      stockCompensation: '25000',
      yearsOfExperience: 7,
      yearsAtCompany: 4,
    },
    // Data Scientist submissions
    {
      userId: null,
      companyId: companies[0].companyId,
      jobTitleId: jobTitles[2].jobTitleId,
      locationId: locations[0].locationId,
      levelId: null,
      baseSalary: '100000',
      bonus: '15000',
      stockCompensation: '20000',
      yearsOfExperience: 4,
      yearsAtCompany: 2,
    },
    {
      userId: null,
      companyId: companies[1].companyId,
      jobTitleId: jobTitles[2].jobTitleId,
      locationId: locations[1].locationId,
      levelId: null,
      baseSalary: '92000',
      bonus: '12000',
      stockCompensation: '18000',
      yearsOfExperience: 3,
      yearsAtCompany: 1,
    },
    {
      userId: null,
      companyId: companies[2].companyId,
      jobTitleId: jobTitles[2].jobTitleId,
      locationId: locations[2].locationId,
      levelId: null,
      baseSalary: '88000',
      bonus: '10000',
      stockCompensation: '15000',
      yearsOfExperience: 5,
      yearsAtCompany: 3,
    },
    {
      userId: null,
      companyId: companies[3].companyId,
      jobTitleId: jobTitles[2].jobTitleId,
      locationId: locations[3].locationId,
      levelId: null,
      baseSalary: '105000',
      bonus: '14000',
      stockCompensation: '22000',
      yearsOfExperience: 6,
      yearsAtCompany: 4,
    },
    // UI/UX Designer submissions
    {
      userId: null,
      companyId: companies[0].companyId,
      jobTitleId: jobTitles[3].jobTitleId,
      locationId: locations[0].locationId,
      levelId: null,
      baseSalary: '75000',
      bonus: '8000',
      stockCompensation: '12000',
      yearsOfExperience: 3,
      yearsAtCompany: 2,
    },
    {
      userId: null,
      companyId: companies[1].companyId,
      jobTitleId: jobTitles[3].jobTitleId,
      locationId: locations[1].locationId,
      levelId: null,
      baseSalary: '70000',
      bonus: '7000',
      stockCompensation: '10000',
      yearsOfExperience: 4,
      yearsAtCompany: 2,
    },
    {
      userId: null,
      companyId: companies[4].companyId,
      jobTitleId: jobTitles[3].jobTitleId,
      locationId: locations[0].locationId,
      levelId: null,
      baseSalary: '85000',
      bonus: '10000',
      stockCompensation: '15000',
      yearsOfExperience: 5,
      yearsAtCompany: 3,
    },
    {
      userId: null,
      companyId: companies[2].companyId,
      jobTitleId: jobTitles[3].jobTitleId,
      locationId: locations[2].locationId,
      levelId: null,
      baseSalary: '65000',
      bonus: '6000',
      stockCompensation: '9000',
      yearsOfExperience: 2,
      yearsAtCompany: 1,
    },
    // DevOps Engineer submissions
    {
      userId: null,
      companyId: companies[0].companyId,
      jobTitleId: jobTitles[4].jobTitleId,
      locationId: locations[0].locationId,
      levelId: null,
      baseSalary: '95000',
      bonus: '12000',
      stockCompensation: '18000',
      yearsOfExperience: 5,
      yearsAtCompany: 3,
    },
    {
      userId: null,
      companyId: companies[3].companyId,
      jobTitleId: jobTitles[4].jobTitleId,
      locationId: locations[3].locationId,
      levelId: null,
      baseSalary: '90000',
      bonus: '11000',
      stockCompensation: '16000',
      yearsOfExperience: 6,
      yearsAtCompany: 4,
    },
    {
      userId: null,
      companyId: companies[2].companyId,
      jobTitleId: jobTitles[4].jobTitleId,
      locationId: locations[2].locationId,
      levelId: null,
      baseSalary: '80000',
      bonus: '9000',
      stockCompensation: '14000',
      yearsOfExperience: 4,
      yearsAtCompany: 2,
    },
    {
      userId: null,
      companyId: companies[4].companyId,
      jobTitleId: jobTitles[4].jobTitleId,
      locationId: locations[0].locationId,
      levelId: null,
      baseSalary: '100000',
      bonus: '13000',
      stockCompensation: '20000',
      yearsOfExperience: 7,
      yearsAtCompany: 5,
    },
  ]).returning()
  console.log('Salary submissions seeded:', submissions.length)

  console.log('Seed completed successfully!')
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})