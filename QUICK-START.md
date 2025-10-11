# Quick Start Guide ⚡

Get Transpayra running in **10 minutes**!

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18.18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Supabase account created (free tier)
- [ ] Git installed

---

## 🚀 5-Step Setup

### Step 1: Clone & Install (2 min)

```bash
git clone https://github.com/yourusername/transpayra.git
cd transpayra
npm install
```

### Step 2: Supabase Setup (3 min)

1. Go to https://supabase.com/dashboard/projects
2. Create new project (name: `transpayra-dev`)
3. Wait for provisioning (~2 min)
4. Copy credentials:
   - **Settings → API** → Copy URL and anon key
   - **Settings → Database** → Copy Transaction Pooler URI

### Step 3: Environment Config (2 min)

Create `.env.local`:

```bash
cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (use Transaction Pooler URI)
DATABASE_URL=postgresql://postgres.xxx:password@aws-region.pooler.supabase.com:6543/postgres

# Security (generate with: openssl rand -hex 32)
ANONYMOUS_TOKEN_SALT=replace-with-64-char-hex-string
EOF
```

Replace placeholder values with your Supabase credentials.

Generate salt:
```bash
openssl rand -hex 32
```

### Step 4: Database Setup (1 min)

```bash
npm run db:push
```

This creates all tables automatically.

### Step 5: Start Dev Server (30 sec)

```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## ✅ Verify Setup

Your setup is complete if:

1. ✅ Homepage loads without errors
2. ✅ Search bar is visible
3. ✅ Can navigate to "Contribute" page
4. ✅ No console errors

---

## 🧪 Optional: Test Database Setup

For running tests:

```bash
# Create separate test project on Supabase
# Name: transpayra-test

# Create .env.test
cat > .env.test << 'EOF'
DATABASE_URL=postgresql://postgres.xxx:password@aws-region.pooler.supabase.com:6543/postgres
ANONYMOUS_TOKEN_SALT=test-salt-different-from-dev
NODE_ENV=test
EOF

# Apply schema
export NODE_ENV=test && npm run db:push

# Run tests
npm test
```

---

## 🎯 Next Steps

Now that you're set up:

1. **Explore the app**:
   - Try searching for "Software Engineer"
   - Submit a salary (test data)
   - See the unlock mechanism

2. **Read documentation**:
   - `README.md` - Full documentation
   - `IMPLEMENTATION-SUMMARY.md` - Feature details
   - `CLAUDE.md` - Development guidelines

3. **Start developing**:
   - Create a branch: `git checkout -b feature/my-feature`
   - Make changes with hot reload
   - Write tests for new features
   - Submit PR

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check Supabase project is not paused (Dashboard → Project)
- Verify DATABASE_URL uses `.pooler.supabase.com` (not direct connection)
- Test connection in Supabase SQL Editor

### "Module not found @/lib/..."
- Run `npm install` again
- Check `tsconfig.json` has correct path mapping

### "Tables don't exist"
- Run `npm run db:push` again
- Check Supabase → Table Editor for tables

### Still stuck?
- Check `README.md` → Troubleshooting section
- Review logs in terminal
- Check Supabase project logs

---

## 📚 Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run linter

# Database
npm run db:push          # Apply schema changes
npm run db:studio        # Open visual DB editor
npm run db:seed          # Seed test data

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## 🎓 Learning Path

**Day 1**: Setup + Explore
- Complete this quick start
- Browse the app interface
- Read README.md overview

**Day 2**: Architecture
- Review `IMPLEMENTATION-SUMMARY.md`
- Understand anonymous token system
- Study database schema

**Day 3**: Development
- Make a small change
- Write a test
- Submit first PR

**Week 2+**: Deep dive
- Implement new feature
- Add comprehensive tests
- Review `FUNCTIONAL-TESTS.md`

---

**Total Setup Time**: ~10 minutes
**Ready to code!** 🚀

For detailed documentation, see [README.md](README.md)
