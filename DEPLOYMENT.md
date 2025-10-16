# Transpayra Deployment Guide

## Overview
This document outlines the complete deployment process of the Transpayra salary transparency platform to Vercel, including all issues encountered and their solutions.

**Deployment Date:** October 16, 2025
**Platform:** Vercel
**Domain:** transpayra.com (via GoDaddy)
**Status:** ✅ Successfully Deployed

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [TypeScript Build Issues](#typescript-build-issues)
4. [Duplicate Object Key Errors](#duplicate-object-key-errors)
5. [Missing Required Fields](#missing-required-fields)
6. [Environment Variables](#environment-variables)
7. [Favicon Configuration](#favicon-configuration)
8. [Custom Domain Setup](#custom-domain-setup)
9. [Final Deployment](#final-deployment)

---

## Prerequisites

### Required Software
- Node.js 22.x
- npm
- Vercel CLI (`npm i -g vercel`)
- Git

### Required Accounts
- Vercel account
- Supabase account
- GoDaddy domain registration

---

## Initial Setup

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link Project
```bash
vercel link
```

### 4. Initial Deployment Attempt
```bash
vercel --prod
```

**Result:** ❌ Build failed with TypeScript errors

---

## TypeScript Build Issues

The first deployment attempt failed with 15+ TypeScript compilation errors. Here's how we fixed them:

### Issue 1: Nullable Field Type Mismatches

**Error Location:** Multiple files
**Problem:** Database fields that can be `null` were typed as non-nullable

#### Files Affected:
- `src/app/actions/companies.ts`
- `src/app/actions/get-user-submissions.ts`
- `src/app/actions/search-salaries.ts`

#### Solution:
Updated interfaces to accept `null` values:

```typescript
// Before
export interface CompanySalarySubmission {
  bonus: string
  stockCompensation: string
  yearsAtCompany: number
}

// After
export interface CompanySalarySubmission {
  bonus: string | null
  stockCompensation: string | null
  yearsAtCompany: number | null
}
```

#### Handling Null Values in Calculations:
```typescript
// Before
const totalComp = parseFloat(row.baseSalary) + parseFloat(row.bonus) + parseFloat(row.stockCompensation)

// After
const totalComp = parseFloat(row.baseSalary) + parseFloat(row.bonus || '0') + parseFloat(row.stockCompensation || '0')
```

### Issue 2: Null vs Undefined Type Mismatches

**Error Location:** `src/app/dashboard/page.tsx`, `src/components/search/SalaryResultsList.tsx`
**Problem:** Functions expecting `undefined` but receiving `null`

#### Solution:
Use nullish coalescing operator to convert null to undefined:

```typescript
// Before
checkUserHasAccess(token, user?.id)

// After
checkUserHasAccess(token ?? undefined, user?.id)
```

### Issue 3: Promise Type Inference Error

**Error Location:** `src/app/actions/search.ts:101`
**Problem:** TypeScript couldn't infer the Promise type

#### Solution:
```typescript
// Before
let levelsPromise = Promise.resolve([])

// After
let levelsPromise: Promise<Array<{ id: number; name: string; companyName: string }>> = Promise.resolve([])
```

### Issue 4: Cookie Store Type Mismatch

**Error Location:** `src/lib/supabase-server.ts`
**Problem:** Next.js 15 returns a Promise for cookies()

#### Solution:
```typescript
// Before
export const createRouteHandlerClient = (cookieStore: ReturnType<typeof cookies>) =>

// After
export const createRouteHandlerClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) =>
```

### Issue 5: useRef Initialization

**Error Location:** `src/components/search/SearchAutocomplete.tsx:38`
**Problem:** useRef requires explicit initial value

#### Solution:
```typescript
// Before
const debounceTimerRef = useRef<NodeJS.Timeout>()

// After
const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
```

### Issue 6: Missing Props

**Error Location:** `src/components/company/OverviewTab.tsx:132`
**Problem:** Missing required `currency` prop

#### Solution:
```typescript
<SalaryCard
  key={submission.submissionId}
  // ... other props
  currency={submission.currency}  // Added this
/>
```

### Issue 7: Function Parameter Type

**Error Location:** `src/components/search/SalaryResultsTable.tsx`
**Problem:** formatCurrency function doesn't handle null

#### Solution:
```typescript
// Before
const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `$${Math.round(num).toLocaleString()}`
}

// After
const formatCurrency = (value: string | number | null) => {
  if (value === null) return '$0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `$${Math.round(num).toLocaleString()}`
}
```

---

## Duplicate Object Key Errors

After fixing TypeScript errors, the build failed due to duplicate keys in object literals (translation dictionaries).

### Issue: Duplicate Keys in Translation Files

**Error:** "An object literal cannot have multiple properties with the same name"

#### Files Affected:
1. `src/lib/db/restore-and-translate-properly.ts` (4 duplicates)
2. `src/lib/db/translate-and-dedupe-jobs-v2.ts` (1 duplicate)
3. `src/lib/db/translate-and-dedupe-jobs.ts` (1 duplicate)
4. `translate-job-seed.ts` (13 duplicates!)

#### Duplicates Found in `restore-and-translate-properly.ts`:
```typescript
'Assistant Achats': 'Purchasing Assistant',  // Line 60
'Assistant Achats': 'Purchasing Assistant',  // Line 392 - REMOVED

'ChargÉ/ Administrator': 'Payroll Administrator',  // Line 81
'ChargÉ/ Administrator': 'Payroll Administrator',  // Line 441 - REMOVED

'Justice Responsable': 'Legal Manager',  // Line 131
'Justice Responsable': 'Legal Manager',  // Line 474 - REMOVED

'Superviseur/ Manager Télévente': 'Telesales Manager',  // Line 165
'Superviseur/ Manager Télévente': 'Telesales Manager',  // Line 494 - REMOVED
```

#### Duplicates Found in `translate-job-seed.ts`:
Major duplicates removed:
- 'INGÉNIEUR' (lines 15 and 345)
- 'RÉGIONAL' (lines 62 and 340)
- 'SYSTÈMES' (lines 76 and 366)
- 'INFRASTRUCTURES' (lines 82 and 365)
- 'PRINCIPAL' (lines 90 and 362)
- 'GÉNÉRAL' (lines 94 and 373)
- 'CLIENTÈLE' (lines 131 and 347)
- 'LIGNE' (lines 197 and 343 - also had conflicting values!)
- 'DÉVELOPPEMENT' (lines 215 and 363)
- 'FONCTIONNEL' (lines 225 and 364)
- 'MANAGER' (lines 264 and 372)
- 'GRANDS' (lines 348 and 361)
- 'DEVOPS' (lines 73 and 370)

#### Solution:
Removed all duplicate keys, keeping only the first occurrence of each key.

---

## Missing Required Fields

### Issue: Missing Slug Fields in Seed Data

**Error Location:** `src/lib/db/seed.ts`
**Problem:** Database schema requires `slug` field for companies, job titles, and locations

#### Solution:
Added slug fields to all seed data:

```typescript
// Companies
const companies = await db.insert(company).values([
  { name: 'Google', slug: 'google', website: 'https://google.com', logoUrl: null },
  { name: 'Meta', slug: 'meta', website: 'https://meta.com', logoUrl: null },
  // ... etc
]).returning()

// Job Titles
const jobTitles = await db.insert(jobTitle).values([
  { title: 'Software Engineer', slug: 'software-engineer' },
  { title: 'Product Manager', slug: 'product-manager' },
  // ... etc
]).returning()

// Locations
const locations = await db.insert(location).values([
  { city: 'London', slug: 'london-united-kingdom', state: null, country: 'United Kingdom' },
  { city: 'Berlin', slug: 'berlin-germany', state: null, country: 'Germany' },
  // ... etc
]).returning()
```

---

## Environment Variables

### Required Environment Variables

The following environment variables must be configured on Vercel:

1. `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
3. `DATABASE_URL` - PostgreSQL connection string
4. `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)

### Adding Environment Variables via CLI

```bash
# Add each variable for production environment
echo "YOUR_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "YOUR_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "YOUR_DATABASE_URL" | vercel env add DATABASE_URL production
echo "YOUR_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### Verification

```bash
vercel env ls
```

---

## Favicon Configuration

### Issue: Favicon Not Showing

**Problem:** The favicon `transpayra_fav.png` in the public folder wasn't being used by Next.js 15 App Router.

### Solution

In Next.js 15 App Router, favicons must be placed directly in the `src/app` directory with the name `icon.png` (or `icon.ico`).

```bash
# Copy favicon to app directory
cp public/transpayra_fav.png src/app/icon.png
```

Next.js will automatically detect and use this file as the favicon for all pages.

### File Structure
```
src/
  app/
    icon.png          # ← Favicon (automatically detected)
    favicon.ico       # ← Alternative format (also works)
    layout.tsx
    page.tsx
```

---

## Custom Domain Setup

### Overview
Connected the Vercel deployment to the custom domain `transpayra.com` purchased from GoDaddy.

### Step 1: Add Domain to Vercel

```bash
# Add root domain
vercel domains add transpayra.com

# Add www subdomain
vercel domains add www.transpayra.com
```

**Output:**
```
WARN! This domain is not configured properly. To configure it you should either:
  a) Set the following record on your DNS provider to continue:
     A transpayra.com 76.76.21.21 [recommended]
  b) Change your Domains's nameservers to the intended set
```

### Step 2: Configure DNS Records on GoDaddy

#### Access DNS Management
1. Log into GoDaddy: https://dcc.godaddy.com/
2. Select domain: transpayra.com
3. Click "DNS" or "Manage DNS"

#### Initial DNS Configuration (Before Changes)
```
a      @      Parked                           600 seconds
ns     @      ns77.domaincontrol.com.          1 Hour
ns     @      ns78.domaincontrol.com.          1 Hour
cname  pay    paylinks.commerce.godaddy.com.   1 Hour
cname  www    transpayra.com.                  1 Hour
```

#### Required Changes

**1. Update Root Domain A Record**
- **Type:** A
- **Name:** @ (root)
- **Value:** Change from "Parked" to `76.76.21.21`
- **TTL:** 600 seconds
- **Action:** Edit existing record

**2. Remove www CNAME Record**
- **Record:** `cname    www    transpayra.com.    1 Hour`
- **Action:** Delete this record

**3. Add www A Record**
- **Type:** A
- **Name:** www
- **Value:** `76.76.21.21`
- **TTL:** 600 seconds
- **Action:** Add new record

#### Common Issue: "Record data is invalid"

If you get this error when adding the www A record:
- **Cause:** The CNAME record for www still exists
- **Solution:** Make sure to delete the CNAME record first, then wait a few seconds before adding the A record

#### Final DNS Configuration (After Changes)
```
a      @      76.76.21.21                      600 seconds    ✓
a      www    76.76.21.21                      600 seconds    ✓
ns     @      ns77.domaincontrol.com.          1 Hour
ns     @      ns78.domaincontrol.com.          1 Hour
cname  pay    paylinks.commerce.godaddy.com.   1 Hour
cname  _domainconnect  _domainconnect.gd...   1 Hour
soa    @      Primary nameserver: ns77...      1 Hour
txt    _dmarc v=DMARC1; p=quarantine...       1 Hour
```

**Note:** Keep the NS, SOA, TXT, and other CNAME records as they are.

### Step 3: Verify DNS Propagation

```bash
# Check DNS records
dig +short transpayra.com A
dig +short www.transpayra.com A

# Expected output
# 76.76.21.21
# 76.76.21.21
```

### Step 4: Verify Domain on Vercel

```bash
vercel domains ls
```

**Expected Output:**
```
Domain             Registrar      Nameservers    Creator    Age
transpayra.com     Third Party    Third Party    daviidy    25m
```

### DNS Propagation Timeline
- **Immediate:** Changes visible in GoDaddy dashboard
- **15-30 minutes:** Most DNS servers updated (typical)
- **Up to 48 hours:** Maximum propagation time

### SSL Certificate
Vercel automatically provisions SSL certificates (HTTPS) for verified domains. This happens automatically once DNS is properly configured.

---

## Final Deployment

### Final Deployment Command
```bash
vercel --prod
```

### Build Output Summary
```
✓ Compiled successfully in 15.2s
✓ Checking validity of types ... passed
✓ Collecting page data ... done
✓ Generating static pages (16/16)
✓ Finalizing page optimization ... done
✓ Collecting build traces ... done

Route (app)                         Size  First Load JS
┌ ○ /                            9.74 kB         180 kB
├ ○ /admin/dashboard              5.5 kB         175 kB
├ ƒ /company/[id]                9.49 kB         179 kB
├ ○ /contribute                  6.58 kB         177 kB
└ ... (13 more routes)
```

### Deployment URLs
- **Production:** https://transpayra.vercel.app
- **Custom Domain:** https://transpayra.com
- **With www:** https://www.transpayra.com

---

## Summary of Issues Fixed

### TypeScript Errors (15+ fixes)
1. ✅ Nullable field types in interfaces
2. ✅ Null vs undefined conversions
3. ✅ Promise type inference
4. ✅ Cookie store async handling
5. ✅ useRef initialization
6. ✅ Missing required props
7. ✅ Function parameter types

### Object Literal Errors (19 fixes)
1. ✅ 4 duplicates in `restore-and-translate-properly.ts`
2. ✅ 1 duplicate in `translate-and-dedupe-jobs-v2.ts`
3. ✅ 1 duplicate in `translate-and-dedupe-jobs.ts`
4. ✅ 13 duplicates in `translate-job-seed.ts`

### Configuration Issues (4 fixes)
1. ✅ Missing slug fields in seed data
2. ✅ Environment variables not configured
3. ✅ Favicon not in correct location
4. ✅ Custom domain DNS configuration

---

## Maintenance Notes

### Future Deployments
```bash
# Standard deployment
vercel --prod

# With build logs
vercel --prod --debug

# Check deployment status
vercel inspect <deployment-url> --logs
```

### Updating Environment Variables
```bash
# Add new variable
vercel env add VARIABLE_NAME production

# List all variables
vercel env ls

# Remove variable
vercel env rm VARIABLE_NAME production
```

### Domain Management
```bash
# List domains
vercel domains ls

# Check domain details
vercel domains inspect transpayra.com

# Remove domain
vercel domains rm transpayra.com
```

---

## Useful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Custom Domain Configuration](https://vercel.com/docs/concepts/projects/custom-domains)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

---

## Automatic Deployment Verification

**Git Integration Status:** Testing automatic deployment from main branch
**Test Date:** October 16, 2025

If you're seeing this in production, Git integration is working correctly! 🎉

---

## Contact & Support

**Project:** Transpayra - Salary Transparency Platform
**Deployed:** October 16, 2025
**Platform:** Vercel
**Status:** ✅ Production Ready

For issues or questions, refer to this documentation or Vercel support at https://vercel.com/support
