# Test Database Setup for Supabase

Since you're using Supabase, you have **two options** for test databases:

---

## Option 1: Use Same Supabase Database (Recommended for Quick Start)

This approach uses your existing Supabase instance but with data isolation through setup/teardown.

### Setup

Your `.env.test` file should use the **same** DATABASE_URL:

```bash
# .env.test
DATABASE_URL=postgresql://postgres.dtcughegkgzffsueoqky:Transpayra%402025%401914@aws-1-us-east-2.pooler.supabase.com:5432/postgres
ANONYMOUS_TOKEN_SALT=test-4f8a9d2b6c1e7f3a5d8b9c2e4f6a8d1b2c3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a
NODE_ENV=test
```

**Pros:**
✅ No additional setup needed
✅ Tests run against real Supabase features
✅ Free (uses existing database)

**Cons:**
⚠️ Tests modify production tables (cleaned before/after each test)
⚠️ Can't run tests while dev server uses database
⚠️ Slower than local database

---

## Option 2: Create Separate Supabase Project (Recommended for Production)

Create a dedicated test project on Supabase.

### Step 1: Create New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it: `transpayra-test`
4. Choose same region as main project
5. Set password

### Step 2: Get Connection String

1. Go to Project Settings → Database
2. Copy the connection string
3. Replace password placeholder with your password

### Step 3: Update `.env.test`

```bash
# .env.test
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
ANONYMOUS_TOKEN_SALT=test-4f8a9d2b6c1e7f3a5d8b9c2e4f6a8d1b2c3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a
NODE_ENV=test
```

### Step 4: Run Migrations

```bash
NODE_ENV=test npm run db:push
```

**Pros:**
✅ Complete isolation from dev/prod
✅ Can run tests anytime
✅ Safer for CI/CD

**Cons:**
❌ Requires separate Supabase project (still free tier)

---

## Quick Start (Option 1)

Since you're just getting started with tests, use **Option 1**:

### 1. Update `.env.test`

Already created! Just verify it exists:

```bash
cat .env.test
```

Should show:
```
DATABASE_URL=postgresql://postgres.dtcughegkgzffsueoqky:Transpayra%402025%401914@aws-1-us-east-2.pooler.supabase.com:5432/postgres
ANONYMOUS_TOKEN_SALT=test-4f8a9d2b6c1e7f3a5d8b9c2e4f6a8d1b2c3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a
NODE_ENV=test
```

### 2. Install Test Dependencies

```bash
npm install --save-dev jest @types/jest ts-node @testing-library/react @testing-library/jest-dom
```

Or use the script:
```bash
bash scripts/install-test-deps.sh
```

### 3. Verify Schema Exists

```bash
NODE_ENV=test npm run db:push
```

This ensures your test environment has the latest schema.

### 4. Run First Test

```bash
npm test -- tests/anonymous-token.test.ts
```

Should see:
```
 PASS  tests/anonymous-token.test.ts
  Anonymous Token System
    ✓ should generate unique 64-character hex tokens
    ✓ should hash tokens consistently
    ✓ should produce different hashes for different tokens
    ✓ should verify tokens correctly
    ✓ should reject incorrect tokens

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

---

## Important Notes

### Data Isolation

Tests automatically clean the database before/after:

```typescript
// tests/jest.setup.ts
beforeEach(async () => {
  await cleanDatabase()  // Deletes all test data
  await seedTestData()   // Inserts fresh test data
})
```

So even though you're using the same database, tests:
1. Start with clean slate
2. Run with test data
3. Clean up after

### Don't Run Tests During Development

If you use **Option 1**, make sure to:
- Stop dev server before running tests (`npm run dev`)
- Or use separate database (Option 2)

### CI/CD Considerations

For GitHub Actions, you'll want **Option 2** with a dedicated test project, so tests don't interfere with production.

---

## Troubleshooting

### Connection Error

If you get connection timeout:
```bash
Error: connect ETIMEDOUT
```

Check:
1. Supabase project is not paused (free tier pauses after inactivity)
2. Connection string password is correct
3. Using pooler connection string (includes `.pooler.supabase.com`)

### Permission Error

If you get permission denied:
```bash
Error: permission denied for table salary_submission
```

The test uses the `postgres` user from your connection string, which should have full permissions.

### Schema Not Found

If tables don't exist:
```bash
Error: relation "salary_submission" does not exist
```

Run migrations:
```bash
NODE_ENV=test npm run db:push
```

---

## Next Steps

1. ✅ Choose Option 1 or Option 2 above
2. 📦 Install test dependencies
3. 🧪 Run first test: `npm test -- tests/anonymous-token.test.ts`
4. 📖 Read `TEST-SETUP-GUIDE.md` for detailed test documentation

---

**Recommendation:** Start with Option 1 for now. Switch to Option 2 when you're ready for CI/CD or if you encounter conflicts with dev server.
