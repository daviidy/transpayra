import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!

const migrationClient = postgres(connectionString, { max: 1, prepare: false })
const db = drizzle(migrationClient)

async function runMigrate() {
  console.log('Running migrations...')

  await migrate(db, { migrationsFolder: './src/lib/db/migrations' })

  console.log('Migrations completed!')
  await migrationClient.end()
}

runMigrate().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})