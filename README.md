# Transpayra 💰

> A salary transparency platform empowering technology professionals with anonymous, crowdsourced compensation data.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
- [Development](#development)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Key Concepts](#key-concepts)
- [Contributing](#contributing)
- [Documentation](#documentation)

---

## 🎯 Overview

Transpayra is a Next.js-based web application that provides transparent salary data for technology professionals. Users can:

- 🔍 **Search** salaries by job title, company, location, or industry
- 📊 **View** detailed compensation breakdowns (base, bonus, equity)
- 📈 **Analyze** salary distributions with percentile statistics
- ➕ **Contribute** their own salary data anonymously
- 🔒 **Access** full data after submitting their compensation

**Privacy-First Design**: No login required. Anonymous token system ensures contributors can access data without revealing identity.

---

## ✨ Features

### 🔎 Multi-Type Search
- Real-time autocomplete suggestions
- Search by: Job Title, Company, Location, Industry, Level
- Debounced queries with caching for performance
- Submission counts shown for each suggestion

### 📊 Salary Insights
- **Statistics Card**: Median, 25th, 75th, 90th percentile compensation
- **Detailed Breakdowns**: Base salary, stock, bonus displayed separately
- **Experience Tracking**: Years of experience and years at company
- **Location Data**: City, state, country information

### 🔐 Anonymous Access Control
- **Token-Based System**: Secure PBKDF2 hashing with salt
- **Privacy-Preserving**: Tokens never stored in plaintext
- **1-Year Validity**: Cookie-based, no account needed
- **Paywall System**: Show 2 entries, unlock rest after submission

### 📝 Contribution Flow
- **3-Step Wizard**: Role & Experience → Compensation → Review
- **Draft Saving**: Auto-save to localStorage, resume later
- **Smart Validation**: Progressive validation per step
- **Duplicate Prevention**: 1-minute cooldown between submissions

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router & Turbopack
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Database**: PostgreSQL via [Supabase](https://supabase.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: Supabase Auth (OAuth planned)
- **Runtime**: Next.js Server Actions & Route Handlers

### Development
- **Package Manager**: npm
- **Testing**: [Jest](https://jestjs.io/) + [Testing Library](https://testing-library.com/)
- **Linting**: ESLint
- **Version Control**: Git

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.18.0+ or 20.0.0+
- **npm**: 9.0.0+
- **Supabase Account**: [Sign up](https://supabase.com/) (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/transpayra.git
   cd transpayra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Environment Setup

1. **Create `.env.local`** in the project root:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Database (Supabase PostgreSQL)
   DATABASE_URL=postgresql://postgres.your-project:your-password@aws-1-region.pooler.supabase.com:6543/postgres

   # Anonymous Token Security (generate with: openssl rand -hex 32)
   ANONYMOUS_TOKEN_SALT=your-random-32-byte-hex-string
   ```

2. **Get Supabase credentials**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to **Project Settings → API**
   - Copy `URL` and `anon` key
   - Navigate to **Project Settings → Database**
   - Copy **Connection Pooling** URI (Transaction mode)

3. **Generate token salt**:
   ```bash
   openssl rand -hex 32
   ```
   Or use any 64-character hex string.

### Database Setup

1. **Apply database schema** (creates all tables):
   ```bash
   npm run db:push
   ```

2. **Verify tables created**:
   - Open Supabase Dashboard → Table Editor
   - Should see: `industry`, `company`, `job_title`, `location`, `level`, `salary_submission`

3. **(Optional) Seed data**:
   ```bash
   npm run db:seed
   ```

---

## 💻 Development

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Key Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack (fast refresh) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate new migration from schema changes |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio (visual database editor) |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |

### Making Database Changes

1. **Edit schema** in `src/lib/db/schema.ts`:
   ```typescript
   export const myNewTable = pgTable('my_new_table', {
     id: bigserial('id', { mode: 'number' }).primaryKey(),
     name: text('name').notNull(),
   })
   ```

2. **Generate migration**:
   ```bash
   npm run db:generate
   ```

3. **Apply to database**:
   ```bash
   npm run db:push
   ```

### Hot Reload

The dev server uses **Turbopack** for ultra-fast hot module replacement. Changes to:
- Pages (`src/app/`)
- Components (`src/components/`)
- Server actions (`src/app/actions/`)

...automatically refresh in the browser.

---

## 🧪 Testing

### Setup Test Database

**Option 1: Use Existing Database** (Quick Start)
```bash
# Tests will clean/restore data automatically
npm test
```

**Option 2: Separate Test Database** (Recommended)

1. Create new Supabase project: `transpayra-test`
2. Get connection string (Transaction pooler)
3. Create `.env.test`:
   ```env
   DATABASE_URL=postgresql://postgres.your-test-project:password@aws-region.pooler.supabase.com:6543/postgres
   ANONYMOUS_TOKEN_SALT=test-different-salt-than-production
   NODE_ENV=test
   ```
4. Apply schema:
   ```bash
   export NODE_ENV=test && npm run db:push
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/anonymous-token.test.ts

# Watch mode (auto-rerun on changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

### Writing Tests

Example test structure:

```typescript
// tests/my-feature.test.ts
import { seedTestData } from './setup'

describe('My Feature', () => {
  let testData

  beforeEach(async () => {
    testData = await seedTestData() // Fresh data for each test
  })

  test('should do something', async () => {
    // Test implementation
    expect(result).toBe(expected)
  })
})
```

See `FUNCTIONAL-TESTS.md` for comprehensive test suite documentation.

---

## 📁 Project Structure

```
transpayra/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── actions/                  # Server Actions
│   │   │   ├── check-access.ts      # Access verification
│   │   │   ├── search.ts            # Search suggestions
│   │   │   ├── search-salaries.ts   # Salary filtering
│   │   │   └── submit-salary.ts     # Submission handler
│   │   ├── salaries/search/         # Search results page
│   │   ├── contribute/              # Salary submission flow
│   │   └── page.tsx                 # Homepage
│   │
│   ├── components/                   # React components
│   │   ├── search/
│   │   │   ├── SearchAutocomplete.tsx    # Global search
│   │   │   └── SalaryResultsList.tsx     # Results with paywall
│   │   ├── contribute/
│   │   │   ├── SalarySubmissionWizard.tsx
│   │   │   └── steps/               # Multi-step form
│   │   └── ...
│   │
│   ├── lib/                          # Utilities & config
│   │   ├── db/
│   │   │   ├── schema.ts            # Database schema (Drizzle)
│   │   │   ├── migrations/          # SQL migrations
│   │   │   └── index.ts             # Database client
│   │   ├── hooks/
│   │   │   └── useAnonymousToken.ts # Token management
│   │   ├── anonymous-token.ts       # Token hashing utilities
│   │   └── supabase.ts              # Supabase client
│   │
│   └── contexts/                     # React contexts (Auth, etc.)
│
├── tests/                            # Test suite
│   ├── setup.ts                     # Test database utilities
│   ├── jest.setup.ts                # Test lifecycle
│   └── **/*.test.ts                 # Test files
│
├── public/                           # Static assets
├── design_samples/                   # Design references
│
├── .env.local                        # Dev environment variables
├── .env.test                         # Test environment variables
├── drizzle.config.ts                 # Drizzle ORM config
├── jest.config.js                    # Jest config
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
└── tsconfig.json                     # TypeScript config
```

### Key Directories

- **`src/app/`**: Next.js pages and API routes (App Router)
- **`src/components/`**: Reusable React components
- **`src/lib/db/`**: Database schema, migrations, and ORM
- **`src/app/actions/`**: Server-side logic (Server Actions)
- **`tests/`**: Test files and utilities

---

## 🔑 Key Concepts

### Anonymous Token System

**How it works:**

1. **First Visit**: Generate cryptographically random token, store in cookie (1 year)
2. **Submission**: Hash token with PBKDF2 + salt, store hash in DB
3. **Access Check**: Rehash cookie token, check if hash exists in submissions
4. **Privacy**: Original token never stored, can't be recovered from hash

**Implementation:**
- `src/lib/anonymous-token.ts` - Token generation & hashing
- `src/lib/hooks/useAnonymousToken.ts` - React hook for client
- `src/app/actions/check-access.ts` - Server-side verification

### Database Schema

**Core entities:**

```
industry (tech, finance, etc.)
  └─ jobTitle (software engineer, data scientist, etc.)
       ├─ level (L3, L4, Senior, etc.) [company-specific]
       └─ salarySubmission

company (Google, Meta, etc.)
  ├─ level (company + jobTitle specific)
  └─ salarySubmission

location (city, state, country)
  └─ salarySubmission
```

**Key tables:**
- `salary_submission` - Main data with base/bonus/stock
- `level` - Career levels (unique per company + job title)
- `job_title` - Job titles linked to industries
- `company` - Companies with metadata
- `location` - Geographic locations

### Search Architecture

**Multi-type search:**
- Query 5 entity types in parallel (jobs, companies, locations, industries, levels)
- Debounce: 300ms delay to reduce API calls
- Cache: In-memory cache for repeated queries
- Limit: 3 results per category for performance

**Implementation:**
- `src/app/actions/search.ts` - Suggestion queries
- `src/app/actions/search-salaries.ts` - Results filtering
- `src/components/search/SearchAutocomplete.tsx` - UI component

---

## 🤝 Contributing

### Development Workflow

1. **Create a branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes** following the patterns in existing code

3. **Write tests** for new features:
   ```bash
   npm test -- tests/my-feature.test.ts
   ```

4. **Run linter**:
   ```bash
   npm run lint
   ```

5. **Test database migrations** (if schema changed):
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add salary export feature"
   ```

7. **Push and create PR**:
   ```bash
   git push origin feature/my-feature
   ```

### Code Style

- **TypeScript**: Use strict types, avoid `any`
- **Components**: Functional components with TypeScript
- **Formatting**: Follow existing Tailwind/DaisyUI patterns
- **Naming**:
  - Components: PascalCase (`SearchAutocomplete.tsx`)
  - Functions: camelCase (`generateToken`)
  - Constants: UPPER_SNAKE_CASE (`TOKEN_EXPIRY_DAYS`)

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting, etc.)
refactor: Code refactoring
test: Add or update tests
chore: Maintenance tasks
```

---

## 📚 Documentation

Comprehensive documentation is available in the repository:

| Document | Description |
|----------|-------------|
| `CLAUDE.md` | Development guidelines for AI assistants |
| `IMPLEMENTATION-SUMMARY.md` | Complete feature documentation |
| `FUNCTIONAL-TESTS.md` | Full test suite with 15 test suites |
| `TEST-DB-SETUP-COMPLETE.md` | Test database setup guide |
| `SUPABASE-TEST-SETUP.md` | Supabase-specific test setup |
| `design.instructions.md` | UI/UX design system |
| `FORM-UPDATES.md` | Form implementation notes |

### Quick References

**Database queries:**
```typescript
import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Query submissions
const results = await db
  .select()
  .from(salarySubmission)
  .where(eq(salarySubmission.companyId, companyId))
```

**Server Actions:**
```typescript
'use server'

export async function myAction(data: FormData) {
  // Server-side logic here
  return { success: true, data: result }
}
```

**Token usage:**
```typescript
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken'

function MyComponent() {
  const { token, isLoading } = useAnonymousToken()
  // Use token for submissions
}
```

---

## 🔒 Security

- **Anonymous Tokens**: PBKDF2 with 100,000 iterations
- **Environment Variables**: Never commit `.env.local` or `.env.test`
- **SQL Injection**: Protected by Drizzle ORM parameterization
- **XSS Protection**: Next.js automatic escaping
- **CSRF Protection**: SameSite cookies

---

## 📈 Performance

- **Bundle Size**: Optimized with Turbopack
- **Database**: Indexed queries for <100ms response
- **Caching**: Search results cached client-side
- **CDN**: Static assets via Vercel Edge Network
- **Images**: Next.js automatic optimization

---

## 🚢 Deployment

### Deploy to Vercel

1. **Connect repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy**: Automatic on every push to main

### Environment Variables (Production)

Set these in Vercel → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
ANONYMOUS_TOKEN_SALT (use different value than dev!)
```

### Pre-Deployment Checklist

- [ ] Run migrations: `npm run db:push`
- [ ] Run tests: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set in Vercel
- [ ] Supabase project not paused (free tier auto-pauses)

---

## 🐛 Troubleshooting

### Common Issues

**"Database connection timeout"**
- Check Supabase project is active (not paused)
- Verify DATABASE_URL uses `.pooler.supabase.com` (connection pooling)
- Check firewall/VPN isn't blocking Supabase

**"Module not found: @/lib/..."**
- Verify `tsconfig.json` has path mapping:
  ```json
  {
    "compilerOptions": {
      "paths": { "@/*": ["./src/*"] }
    }
  }
  ```

**"Tests failing with 'relation does not exist'"**
- Run migrations on test database:
  ```bash
  export NODE_ENV=test && npm run db:push
  ```

**"Token hash doesn't match"**
- Check `ANONYMOUS_TOKEN_SALT` is set in environment
- Salt must be consistent across sessions
- Don't change salt after users have submitted (invalidates access)

### Get Help

1. Check [Issues](https://github.com/yourusername/transpayra/issues)
2. Review documentation in `/docs`
3. Ask in Discussions

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Supabase** for backend infrastructure
- **Drizzle** team for the excellent ORM
- **DaisyUI** for beautiful UI components

---

## 📞 Contact

- **Project Lead**: [Your Name](mailto:your.email@example.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/transpayra/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/transpayra/discussions)

---

**Built with ❤️ for salary transparency**

*Making compensation data accessible to everyone*
