import { pgTable, bigserial, text, bigint, numeric, integer, timestamp, uuid, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Industry table
export const industry = pgTable('industry', {
  industryId: bigserial('industry_id', { mode: 'number' }).primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  icon: text('icon'),
})

// Job Title table
export const jobTitle = pgTable('job_title', {
  jobTitleId: bigserial('job_title_id', { mode: 'number' }).primaryKey(),
  title: text('title').unique().notNull(),
  industryId: bigint('industry_id', { mode: 'number' }).references(() => industry.industryId),
  category: text('category'),
  slug: text('slug').unique().notNull(),
})

// Company table
export const company = pgTable('company', {
  companyId: bigserial('company_id', { mode: 'number' }).primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  website: text('website'),
  logoUrl: text('logo_url'),
  industryId: bigint('industry_id', { mode: 'number' }).references(() => industry.industryId),
  headquarters: text('headquarters'),
  founded: integer('founded'),
  companyType: text('company_type'),
  description: text('description'),
})

// Location table
export const location = pgTable('location', {
  locationId: bigserial('location_id', { mode: 'number' }).primaryKey(),
  city: text('city').notNull(),
  state: text('state'),
  country: text('country').notNull(),
  slug: text('slug').unique().notNull(),
  region: text('region'),
}, (table) => ({
  uniqueLocation: unique().on(table.city, table.state, table.country),
}))

// Level table
export const level = pgTable('level', {
  levelId: bigserial('level_id', { mode: 'number' }).primaryKey(),
  companyId: bigint('company_id', { mode: 'number' }).notNull().references(() => company.companyId),
  jobTitleId: bigint('job_title_id', { mode: 'number' }).notNull().references(() => jobTitle.jobTitleId),
  levelName: text('level_name').notNull(),
  description: text('description'),
}, (table) => ({
  uniqueLevel: unique().on(table.companyId, table.jobTitleId, table.levelName),
  companyTitleIdx: index().on(table.companyId, table.jobTitleId),
}))

// Salary Submission table
export const salarySubmission = pgTable('salary_submission', {
  submissionId: bigserial('submission_id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id'), // nullable for anonymous submissions
  userTokenHash: text('user_token_hash'), // hashed anonymous token for tracking
  companyId: bigint('company_id', { mode: 'number' }).notNull().references(() => company.companyId),
  jobTitleId: bigint('job_title_id', { mode: 'number' }).notNull().references(() => jobTitle.jobTitleId),
  locationId: bigint('location_id', { mode: 'number' }).notNull().references(() => location.locationId),
  levelId: bigint('level_id', { mode: 'number' }).references(() => level.levelId), // nullable
  baseSalary: numeric('base_salary').notNull(),
  bonus: numeric('bonus').default('0'),
  stockCompensation: numeric('stock_compensation').default('0'),
  currency: text('currency').notNull().default('XOF'), // Currency code: XOF, EUR, USD
  yearsOfExperience: integer('years_of_experience').notNull(),
  yearsAtCompany: integer('years_at_company').default(0),
  submissionDate: timestamp('submission_date', { withTimezone: true }).notNull().defaultNow(),
  accessExpiresAt: timestamp('access_expires_at', { withTimezone: true }).notNull().defaultNow(), // 12-month access after submission
}, (table) => ({
  queryIdx: index().on(table.jobTitleId, table.companyId, table.locationId, table.levelId),
  tokenHashIdx: index().on(table.userTokenHash),
  userIdIdx: index().on(table.userId),
  accessExpiryIdx: index().on(table.accessExpiresAt),
}))

// Relations
export const industryRelations = relations(industry, ({ many }) => ({
  jobTitles: many(jobTitle),
  companies: many(company),
}))

export const companyRelations = relations(company, ({ one, many }) => ({
  industry: one(industry, {
    fields: [company.industryId],
    references: [industry.industryId],
  }),
  levels: many(level),
  salarySubmissions: many(salarySubmission),
}))

export const jobTitleRelations = relations(jobTitle, ({ one, many }) => ({
  industry: one(industry, {
    fields: [jobTitle.industryId],
    references: [industry.industryId],
  }),
  levels: many(level),
  salarySubmissions: many(salarySubmission),
}))

export const locationRelations = relations(location, ({ many }) => ({
  salarySubmissions: many(salarySubmission),
}))

export const levelRelations = relations(level, ({ one, many }) => ({
  company: one(company, {
    fields: [level.companyId],
    references: [company.companyId],
  }),
  jobTitle: one(jobTitle, {
    fields: [level.jobTitleId],
    references: [jobTitle.jobTitleId],
  }),
  salarySubmissions: many(salarySubmission),
}))

export const salarySubmissionRelations = relations(salarySubmission, ({ one }) => ({
  company: one(company, {
    fields: [salarySubmission.companyId],
    references: [company.companyId],
  }),
  jobTitle: one(jobTitle, {

    fields: [salarySubmission.jobTitleId],
    references: [jobTitle.jobTitleId],
  }),
  location: one(location, {
    fields: [salarySubmission.locationId],
    references: [location.locationId],
  }),
  level: one(level, {
    fields: [salarySubmission.levelId],
    references: [level.levelId],
  }),
}))