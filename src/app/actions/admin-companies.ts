'use server'

import { db } from '@/lib/db'
import { company, industry } from '@/lib/db/schema'
import { eq, or, sql } from 'drizzle-orm'
import { isAdminAuthenticated } from './admin-auth'

export type Company = typeof company.$inferSelect & { industryName?: string | null }
export type CreateCompanyInput = Omit<Company, 'companyId' | 'industryName'>
export type UpdateCompanyInput = Partial<CreateCompanyInput> & { companyId: number }

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function getAllCompanies(
  searchQuery?: string,
  offset: number = 0,
  limit: number = 20
): Promise<{ success: boolean; data?: Company[]; total?: number; error?: string }> {
  try {
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      return { success: false, error: 'Unauthorized' }
    }

    // Build WHERE conditions for search
    let whereConditions = undefined
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = `%${searchQuery.trim().toLowerCase()}%`
      whereConditions = or(
        sql`LOWER(${company.name}) LIKE ${searchTerm}`,
        sql`LOWER(${company.slug}) LIKE ${searchTerm}`,
        sql`LOWER(COALESCE(${company.headquarters}, '')) LIKE ${searchTerm}`
      )
    }

    // Get total count with same filter
    const totalQueryBase = db
      .select({ count: sql<number>`count(*)` })
      .from(company)

    const totalResult = whereConditions
      ? await totalQueryBase.where(whereConditions).execute()
      : await totalQueryBase.execute()
    const total = Number(totalResult[0]?.count || 0)

    // Get companies with filter and include industry name
    const queryBase = db
      .select({
        companyId: company.companyId,
        name: company.name,
        slug: company.slug,
        website: company.website,
        logoUrl: company.logoUrl,
        industryId: company.industryId,
        industryName: industry.name,
        headquarters: company.headquarters,
        founded: company.founded,
        companyType: company.companyType,
        description: company.description,
      })
      .from(company)
      .leftJoin(industry, eq(company.industryId, industry.industryId))

    const companies = whereConditions
      ? await queryBase
          .where(whereConditions)
          .orderBy(company.name)
          .limit(limit)
          .offset(offset)
      : await queryBase
          .orderBy(company.name)
          .limit(limit)
          .offset(offset)

    return { success: true, data: companies, total }
  } catch (error) {
    console.error('Error fetching companies:', error)
    return { success: false, error: 'Failed to fetch companies' }
  }
}

export async function createCompany(
  input: Omit<CreateCompanyInput, 'slug'> & { slug?: string }
): Promise<{ success: boolean; data?: Company; error?: string }> {
  try {
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      return { success: false, error: 'Unauthorized' }
    }

    // Generate slug if not provided
    const slug = input.slug || generateSlug(input.name)

    const [newCompany] = await db
      .insert(company)
      .values({
        ...input,
        slug,
      })
      .returning()

    return { success: true, data: newCompany }
  } catch (error: unknown) {
    console.error('Error creating company:', error)

    // Handle unique constraint violations
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      if ('constraint' in error && typeof error.constraint === 'string' && error.constraint.includes('name')) {
        return { success: false, error: 'A company with this name already exists' }
      }
      if ('constraint' in error && typeof error.constraint === 'string' && error.constraint.includes('slug')) {
        return { success: false, error: 'A company with this slug already exists' }
      }
    }

    return { success: false, error: 'Failed to create company' }
  }
}

export async function updateCompany(
  input: UpdateCompanyInput
): Promise<{ success: boolean; data?: Company; error?: string }> {
  try {
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      return { success: false, error: 'Unauthorized' }
    }

    const { companyId, ...updates } = input

    // If name is being updated, regenerate slug
    if (updates.name && !updates.slug) {
      updates.slug = generateSlug(updates.name)
    }

    const [updatedCompany] = await db
      .update(company)
      .set(updates)
      .where(eq(company.companyId, companyId))
      .returning()

    if (!updatedCompany) {
      return { success: false, error: 'Company not found' }
    }

    return { success: true, data: updatedCompany }
  } catch (error: unknown) {
    console.error('Error updating company:', error)

    // Handle unique constraint violations
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      if ('constraint' in error && typeof error.constraint === 'string' && error.constraint.includes('name')) {
        return { success: false, error: 'A company with this name already exists' }
      }
      if ('constraint' in error && typeof error.constraint === 'string' && error.constraint.includes('slug')) {
        return { success: false, error: 'A company with this slug already exists' }
      }
    }

    return { success: false, error: 'Failed to update company' }
  }
}

export async function deleteCompany(
  companyId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      return { success: false, error: 'Unauthorized' }
    }

    await db.delete(company).where(eq(company.companyId, companyId))

    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting company:', error)

    // Handle foreign key constraint violations
    if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
      return {
        success: false,
        error: 'Cannot delete company: it has related salary submissions or levels'
      }
    }

    return { success: false, error: 'Failed to delete company' }
  }
}
