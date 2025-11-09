import { config } from 'dotenv'
config({ path: '.env.local' })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// Disable prefetch as it is not supported for "Transaction" pool mode
// Add connection timeout and idle timeout to prevent connection issues
export const client = postgres(connectionString, {
  prepare: false,
  connect_timeout: 10, // 10 seconds connection timeout
  idle_timeout: 20, // 20 seconds idle timeout
  max_lifetime: 60 * 30, // 30 minutes max connection lifetime
})
export const db = drizzle(client, { schema })