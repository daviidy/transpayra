# Transpayra Development Guide

Complete guide for developers working on Transpayra, a salary transparency platform for technology engineers in Europe and Africa.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Database Setup](#database-setup)
5. [Database Migrations](#database-migrations)
6. [Seeding Data](#seeding-data)
7. [Development Workflow](#development-workflow)
8. [Project Structure](#project-structure)
9. [Key Features](#key-features)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

Transpayra is a Next.js application that provides transparent salary data for tech professionals. Users can:
- Browse salaries by company, location, or industry
- Filter by job title, experience level, and compensation type
- Contribute their own salary anonymously
- View comprehensive salary breakdowns and statistics

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth (GitHub & Google OAuth)
- **Styling**: Tailwind CSS + DaisyUI
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transpayra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Database Configuration (for Drizzle)
   DATABASE_URL=postgresql://postgres.your-project:[YOUR-PASSWORD]@aws-region.pooler.supabase.com:6543/postgres
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## Database Setup

### Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **API**
   - Copy `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public key)
   - Copy `SUPABASE_SERVICE_ROLE_KEY` (secret key)

3. Navigate to **Project Settings** → **Database**
   - Scroll to **Connection String** section
   - **Use "Connection Pooling"** (Transaction or Session mode)
   - Copy the connection string that looks like:
     ```
     postgresql://postgres.your-project:[YOUR-PASSWORD]@aws-region.pooler.supabase.com:6543/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - Use port **6543** (pooler) NOT 5432 (direct connection)

### Why Use Connection Pooling?

- **Connection Pooling (port 6543)**: Suitable for serverless environments, unlimited connections
- **Direct Connection (port 5432)**: Limited to 60 concurrent connections, not recommended for development

### Database Schema

The database schema is defined in `src/lib/db/schema.ts` using Drizzle ORM.

**Core Tables:**
- `industry` - Industries (Technology, Finance, etc.)
- `job_title` - Job titles with industry relationships
- `company` - Companies with metadata
- `location` - Cities/locations with regions
- `level` - Company-specific career levels (unique per company + job title)
- `salary_submission` - Anonymous salary submissions

**Key Relationships:**
- `job_title` → `industry` (many-to-one)
- `level` → `company` + `job_title` (many-to-one for both)
- `salary_submission` → `company`, `job_title`, `location`, `level` (many-to-one for all)

---

## Database Migrations

### Creating Migrations

When you modify the database schema in `src/lib/db/schema.ts`:

1. **Generate migration files**
   ```bash
   npm run db:generate
   ```
   This creates SQL migration files in `src/lib/db/migrations/`

2. **Review the generated migration**
   Check the generated SQL in `src/lib/db/migrations/` to ensure it's correct

3. **Apply migrations to database**
   ```bash
   npm run db:push
   ```

### Common Migration Issues

**Issue: "password authentication failed" Error**

This happens when Drizzle can't connect to the database. The fix:

1. **Check your DATABASE_URL** in `.env.local`
   - Must use the connection pooling URL (port 6543)
   - Password must be correctly URL-encoded
   - Format: `postgresql://postgres.PROJECT:[PASSWORD]@aws-region.pooler.supabase.com:6543/postgres`

2. **Verify environment variables are loaded**

   The database connection file (`src/lib/db/index.ts`) must load `.env.local`:
   ```typescript
   import { config } from 'dotenv'
   config({ path: '.env.local' })

   import { drizzle } from 'drizzle-orm/postgres-js'
   import postgres from 'postgres'
   import * as schema from './schema'

   const connectionString = process.env.DATABASE_URL!
   const client = postgres(connectionString, { prepare: false })
   export const db = drizzle(client, { schema })
   ```

3. **Password URL Encoding**

   If your password contains special characters, URL-encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `!` → `%21`
   - etc.

   Example:
   ```
   Password: MyPass@2025!
   Encoded:  MyPass%402025%21
   ```

### Opening Drizzle Studio

To visually browse and edit your database:

```bash
npm run db:studio
```

Opens at [https://local.drizzle.studio](https://local.drizzle.studio)

---

## Seeding Data

### Initial Data Setup

The application requires seed data for typeahead autocomplete to work in forms.

**Seed Script Location**: `src/lib/db/seed-all.ts`

### Running the Seed Script

```bash
npx tsx src/lib/db/seed-all.ts
```

**What gets seeded:**
- 10 industries (Technology, Finance, Healthcare, etc.)
- 18 job titles (Software Engineer, Product Manager, etc.)
- 13 companies (Google, Meta, Andela, Flutterwave, etc.)
- 16 locations (San Francisco, Lagos, London, Berlin, etc.)

### Seed Script Requirements

The seed script must load environment variables. It includes:

```typescript
import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import { industry, jobTitle, company, location } from './schema'
// ... rest of seed logic
```

### Troubleshooting Seed Errors

**Error: "password authentication failed"**

Solution:
1. Ensure `.env.local` has the correct DATABASE_URL
2. Verify `src/lib/db/index.ts` loads dotenv at the top
3. Check password is URL-encoded if it contains special characters

**Error: "relation does not exist"**

Solution: Run migrations first
```bash
npm run db:push
npx tsx src/lib/db/seed-all.ts
```

### Alternative: Manual SQL Seed

If the Node.js seed script fails, use `seed-data.sql`:

1. Go to Supabase Dashboard → SQL Editor
2. Open `seed-data.sql` from the project root
3. Copy and paste the contents
4. Click **Run**

---

## Development Workflow

### Starting Development

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000)

### Code Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by feature
- `src/lib/db/` - Database schema, connection, and migrations
- `src/contexts/` - React contexts (Auth, etc.)

### Making Database Changes

1. **Update schema** in `src/lib/db/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Review the SQL** in `src/lib/db/migrations/`
4. **Apply migration**: `npm run db:push`
5. **Test locally** to ensure it works
6. **Commit both** schema.ts and migration files

### Creating New Features

1. **Plan the feature** - document requirements
2. **Database changes** (if needed) - follow migration workflow above
3. **Create components** in `src/components/`
4. **Add server actions** in `src/app/actions/` for data fetching
5. **Create pages** in `src/app/` using App Router
6. **Test thoroughly**
7. **Commit and push**

---

## Project Structure

```
transpayra/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── actions/                  # Server actions
│   │   │   ├── companies.ts          # Company data actions
│   │   │   ├── directories.ts        # Directory listings
│   │   │   ├── industry-overview.ts  # Industry statistics
│   │   │   ├── salary-breakdown.ts   # Salary analytics
│   │   │   ├── submit-salary.ts      # Form submission
│   │   │   └── typeahead.ts          # Autocomplete search
│   │   ├── company/[id]/             # Company pages
│   │   ├── contribute/               # Salary submission
│   │   │   ├── page.tsx              # Chooser page
│   │   │   ├── manual/               # Multi-step form
│   │   │   └── success/              # Success page
│   │   ├── salaries/                 # Salary directories
│   │   │   ├── by-company/
│   │   │   ├── by-industry/
│   │   │   ├── by-location/
│   │   │   ├── industry/[slug]/      # Industry overview
│   │   │   └── location/[slug]/      # Location breakdown
│   │   ├── submission/[id]/          # Individual submissions
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Homepage
│   ├── components/                   # React components
│   │   ├── company/                  # Company-specific
│   │   │   ├── CompanyHeader.tsx
│   │   │   ├── CompanyTabs.tsx
│   │   │   ├── OverviewTab.tsx
│   │   │   └── SalariesTab.tsx
│   │   ├── contribute/               # Salary submission
│   │   │   ├── SalarySubmissionChooser.tsx
│   │   │   ├── SalarySubmissionWizard.tsx
│   │   │   ├── types.ts              # Form types
│   │   │   └── steps/                # Wizard steps
│   │   │       ├── Step1Combined.tsx
│   │   │       ├── Step2Compensation.tsx
│   │   │       ├── Step6Review.tsx
│   │   │       └── TypeaheadInput.tsx
│   │   ├── directory/                # Directory listings
│   │   ├── industry/                 # Industry pages
│   │   ├── navbar/                   # Navigation
│   │   ├── salary-breakdown/         # Analytics
│   │   ├── CompanyLogo.tsx
│   │   └── Footer.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication
│   └── lib/
│       ├── db/                       # Database
│       │   ├── schema.ts             # Drizzle schema
│       │   ├── index.ts              # DB connection
│       │   ├── migrations/           # SQL migrations
│       │   ├── seed-all.ts           # Seed script
│       │   └── seed-industries.ts
│       ├── supabase.ts               # Client-side
│       └── supabase-server.ts        # Server-side
├── design_samples/                   # Design references
├── .env.local                        # Environment variables
├── drizzle.config.ts                 # Drizzle configuration
├── tailwind.config.ts                # Tailwind CSS config
├── seed-data.sql                     # Manual seed SQL
└── CLAUDE.md                         # AI assistant instructions
```

---

## Key Features

### 1. Salary Submission Workflow

**Location**: `/contribute`

- **Chooser Page**: Upload PDF (coming soon) or Enter Manually
- **3-Step Form Wizard**:
  - Step 1: Role, Company & Experience
  - Step 2: Compensation (Cash + Equity)
  - Step 3: Review & Submit
- **Features**:
  - Typeahead autocomplete for all searchable fields
  - Auto-save draft to localStorage
  - Real-time validation
  - Total compensation calculation
  - Anonymous submission

**Implementation**: `src/components/contribute/`

### 2. Company Pages

**Location**: `/company/[id]`

- Overview Tab: Company info, statistics
- Salaries Tab: Submissions grouped by job title (collapsible)
- Paywall: First 3 submissions visible, rest require contribution

**Implementation**: `src/components/company/`

### 3. Salary Breakdowns

**Location**: `/salaries/location/[slug]`

- Median salary with percentiles (25th, 75th, 90th)
- Compensation distribution chart
- Level filtering
- Top paying companies and locations

**Implementation**: `src/components/salary-breakdown/`

### 4. Industry Overview

**Location**: `/salaries/industry/[slug]`

- Top 4 highest-paying roles
- Location filter
- Salary table with paywall
- Top paying companies and locations leaderboards

**Implementation**: `src/components/industry/`

### 5. Directories

- **By Company**: `/salaries/by-company`
- **By Location**: `/salaries/by-location` (grouped by region)
- **By Industry**: `/salaries/by-industry`

All show only entities with submissions.

**Implementation**: `src/components/directory/`

---

## Troubleshooting

### Database Connection Issues

**Symptom**: "password authentication failed for user 'davidyao'" or similar

**Cause**: Environment variables not loaded or DATABASE_URL incorrect

**Solution**:
1. Verify `.env.local` exists and has correct DATABASE_URL
2. Ensure `src/lib/db/index.ts` loads dotenv at the top:
   ```typescript
   import { config } from 'dotenv'
   config({ path: '.env.local' })
   ```
3. Use connection pooling URL (port 6543), not direct connection
4. URL-encode password special characters

### Typeahead Not Working

**Symptom**: No suggestions appear when typing

**Cause**: Database tables are empty

**Solution**:
```bash
npx tsx src/lib/db/seed-all.ts
```

### Migration Conflicts

**Symptom**: "relation already exists" or schema conflicts

**Solution**:
1. Check Drizzle Studio: `npm run db:studio`
2. Review existing migrations in `src/lib/db/migrations/`
3. Drop conflicting tables or use `ALTER TABLE` instead of `CREATE TABLE`
4. Use `ON CONFLICT DO NOTHING` for inserts

### Build Errors

**Symptom**: TypeScript errors or import issues

**Solution**:
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Restart dev server: `npm run dev`

### Supabase Connection Timeout

**Symptom**: Queries hang or timeout

**Solution**:
1. Use connection pooling (port 6543), not direct connection
2. Check Supabase dashboard for database status
3. Verify network connection
4. Check if database is paused (free tier auto-pauses after 1 week of inactivity)

---

## Environment Variables Reference

### Required Variables

```env
# Supabase - Get from Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database - Get from Project Settings → Database → Connection Pooling
DATABASE_URL=postgresql://postgres.PROJECT:PASSWORD@aws-region.pooler.supabase.com:6543/postgres
```

### Variable Details

- **NEXT_PUBLIC_SUPABASE_URL**: Public Supabase project URL (client-side safe)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public anonymous key (client-side safe)
- **SUPABASE_SERVICE_ROLE_KEY**: Secret service role key (server-side only!)
- **DATABASE_URL**: PostgreSQL connection string for Drizzle ORM

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the code structure above
3. Test thoroughly locally
4. Commit with clear messages
5. Push and create a pull request
6. Wait for review

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check existing GitHub issues
2. Review error messages carefully
3. Verify environment variables are correct
4. Check Supabase dashboard for database status
5. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Error messages (full stack trace)
   - Environment details (OS, Node version, etc.)

---

**Last Updated**: January 2025
