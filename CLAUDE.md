# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Transpayra** is a salary transparency platform for technology engineers. This is a Next.js application using the App Router pattern, deployed on Vercel, with Supabase for database/auth/storage. The goal is to provide transparent salary data with filters by company, job title, location, and experience level.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Database operations
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio
```

## Technology Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM with migrations in `src/lib/db/migrations/`
- **Auth**: Supabase Auth with GitHub and Google providers
- **Styling**: Tailwind CSS + DaisyUI with custom "transpayra" theme
- **Forms**: React Hook Form + Zod validation
- **UI Components**: DaisyUI as primary component library, HyperUI and Meraki UI for sections
- **Icons**: Lucide React

## Architecture & Key Patterns

### Database Schema
The core entities follow the PRD data model:
- `Company` → has many `Level`s and `SalarySubmission`s
- `JobTitle` → has many `Level`s and `SalarySubmission`s
- `Level` → unique by `(company_id, job_title_id, level_name)`
- `SalarySubmission` → references Company, JobTitle, Location, and optional Level
- `Location` → unique by `(city, state, country)`

Schema defined in `src/lib/db/schema.ts` using Drizzle ORM.

### Authentication
- Supabase Auth integration with AuthContext provider
- Anonymous submissions supported (userId can be null)
- Auth state managed via `src/contexts/AuthContext.tsx`
- OAuth callback handled in `src/app/auth/callback/route.ts`

### Data Access Patterns
- **Public reads**: Direct Supabase client calls with Row Level Security (RLS)
- **Secure writes**: Next.js Server Actions or Route Handlers using server-side credentials
- **Validation**: Zod schemas for client and server-side validation

### Design System
Uses custom DaisyUI theme with brand colors:
- **Primary**: `#F0DFC8` (light cream for backgrounds/highlights)
- **Secondary**: `#795833` (brown for text/primary actions)
- **Accent**: `#795833` (same as secondary for consistency)

Design principles emphasize clarity, accessibility (WCAG AA), and performance-aware visuals.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── lib/
│   ├── db/            # Database schema, connection, migrations
│   ├── supabase.ts    # Supabase client configuration
│   └── supabase-server.ts  # Server-side Supabase client
```

## Environment Setup

Environment variables in `.env.local`:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- Supabase keys for client/server authentication

## Development Guidelines

### Database Changes
1. Modify schema in `src/lib/db/schema.ts`
2. Generate migrations: `npm run db:generate`
3. Apply to database: `npm run db:push`

### Design System Compliance
- Always use the custom "transpayra" DaisyUI theme
- Follow design tokens from `design.instructions.md`
- Normalize external component templates to brand colors
- Maintain WCAG AA contrast requirements

### Security Considerations
- Never commit sensitive data or credentials
- Use Row Level Security (RLS) for database access control
- Server Actions for secure mutations, client for public reads
- Support anonymous contributions (no PII stored)

## Key Business Logic

This is a salary transparency platform with these core features:
- **Search & Discovery**: Filter by job title, company, location, years of experience, level
- **Anonymous Contribution**: Multi-step form with dependent selects (Company → Job Title → Level)
- **Company Pages**: Show levels per job title with salary distributions
- **Job Title Tabs**: Homepage organized by engineering roles

The data model supports company-specific career levels that vary by job title, enabling accurate salary benchmarking within career progression paths.