import { cleanDatabase, seedTestData } from './setup'
import { client } from '@/lib/db'

// Clean and seed database before each test
beforeEach(async () => {
  await cleanDatabase()
  await seedTestData()
})

// Clean up after all tests
afterAll(async () => {
  await cleanDatabase()
  await client.end() // Close database connection
})

// Set test timeout to 10 seconds
jest.setTimeout(10000)
