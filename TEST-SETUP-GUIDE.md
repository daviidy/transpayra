# Test Database Setup Guide

This guide will help you set up the test database for running functional tests.

---

## Prerequisites

✅ PostgreSQL installed and running
✅ Node.js 18+ installed
✅ Project dependencies installed (`npm install`)

---

## Quick Setup (Automated)

Run the automated setup script:

```bash
npm run test:setup
```

This will:
1. Create `transpayra_test` database
2. Generate `.env.test` file
3. Run database migrations
4. Verify setup

---

## Manual Setup

If you prefer manual setup or the script fails:

### Step 1: Check PostgreSQL is Running

```bash
pg_isready
```

Should output: `accepting connections`

If not running:
- **macOS**: `brew services start postgresql`
- **Linux**: `sudo systemctl start postgresql`
- **Windows**: Start PostgreSQL service

### Step 2: Create Test Database

```bash
createdb transpayra_test
```

Or using psql:
```bash
psql postgres
CREATE DATABASE transpayra_test;
\q
```

### Step 3: Create `.env.test` File

Create `.env.test` in the project root:

```env
DATABASE_URL=postgresql://localhost:5432/transpayra_test
ANONYMOUS_TOKEN_SALT=test-4f8a9d2b6c1e7f3a5d8b9c2e4f6a8d1b2c3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a
NODE_ENV=test
```

**Important**: Use a different salt than production!

### Step 4: Run Migrations

```bash
NODE_ENV=test npm run db:push
```

This applies the database schema to the test database.

### Step 5: Install Test Dependencies

```bash
bash scripts/install-test-deps.sh
```

Or manually:
```bash
npm install --save-dev jest @types/jest ts-node @testing-library/react @testing-library/jest-dom @testing-library/react-hooks
```

---

## Verify Setup

### 1. Check Database Exists

```bash
psql -l | grep transpayra_test
```

Should show `transpayra_test` in the list.

### 2. Check Tables Created

```bash
psql transpayra_test
\dt
```

Should show tables:
- `industry`
- `company`
- `job_title`
- `location`
- `level`
- `salary_submission`

### 3. Run Sample Test

```bash
npm test -- tests/anonymous-token.test.ts
```

Should pass all 5 token tests.

---

## Common Issues

### Issue: `createdb: error: connection to server failed`

**Problem**: PostgreSQL not running

**Fix**:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Issue: `database "transpayra_test" already exists`

**Problem**: Database exists from previous setup

**Fix**:
```bash
dropdb transpayra_test
createdb transpayra_test
NODE_ENV=test npm run db:push
```

### Issue: `Cannot find module '@/lib/db'`

**Problem**: Path aliases not configured

**Fix**: Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: `ANONYMOUS_TOKEN_SALT is not set`

**Problem**: `.env.test` not loaded

**Fix**:
1. Verify `.env.test` exists in project root
2. Verify `NODE_ENV=test` is set when running tests
3. Run: `NODE_ENV=test npm test`

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- tests/anonymous-token.test.ts
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run with Coverage Report
```bash
npm run test:coverage
```

### Run Only Integration Tests
```bash
npm test -- tests/integration/
```

---

## Test Database Management

### Reset Database (Clean Slate)
```bash
dropdb transpayra_test && createdb transpayra_test && NODE_ENV=test npm run db:push
```

### Connect to Test Database
```bash
psql transpayra_test
```

Useful queries:
```sql
-- Check submission count
SELECT COUNT(*) FROM salary_submission;

-- View all tables
\dt

-- Check recent submissions
SELECT * FROM salary_submission ORDER BY submission_date DESC LIMIT 5;

-- Clear all data (reset between test runs)
TRUNCATE salary_submission, level, location, job_title, company, industry CASCADE;
```

### Backup Test Data
```bash
pg_dump transpayra_test > test-backup.sql
```

### Restore Test Data
```bash
psql transpayra_test < test-backup.sql
```

---

## CI/CD Setup

For GitHub Actions or other CI/CD pipelines, see `.github/workflows/test.yml` example in `FUNCTIONAL-TESTS.md`.

Key points:
- Use PostgreSQL service container
- Set `DATABASE_URL` environment variable
- Run migrations before tests
- Generate coverage reports

---

## Next Steps

1. ✅ Verify setup works: `npm test -- tests/anonymous-token.test.ts`
2. 📝 Read `FUNCTIONAL-TESTS.md` for full test suite documentation
3. 🧪 Write tests for new features as you develop
4. 📊 Check coverage: `npm run test:coverage`

---

## Troubleshooting

If tests are failing:

1. **Check Database Connection**:
   ```bash
   psql transpayra_test -c "SELECT 1"
   ```

2. **Verify Schema is Current**:
   ```bash
   NODE_ENV=test npm run db:push
   ```

3. **Check Environment Variables**:
   ```bash
   cat .env.test
   ```

4. **View Test Logs**:
   ```bash
   npm test -- --verbose
   ```

5. **Reset Everything**:
   ```bash
   dropdb transpayra_test
   npm run test:setup
   ```

---

## Support

If you encounter issues not covered here:

1. Check `FUNCTIONAL-TESTS.md` for detailed test documentation
2. Review Jest configuration in `jest.config.js`
3. Inspect test setup in `tests/setup.ts`
4. Check database schema in `src/lib/db/schema.ts`

---

**Last Updated**: January 2025
**Compatible With**: Transpayra v1.0