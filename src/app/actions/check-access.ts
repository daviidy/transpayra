'use server'

import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { hashAnonymousToken } from '@/lib/anonymous-token'
import { eq, or, and, gte, desc } from 'drizzle-orm'

/**
 * Check if user has access to view all salary data
 * User has access if they have submitted at least once AND access hasn't expired
 * Access is granted for 12 months from the most recent submission
 *
 * @param anonymousToken - The token from the user's cookie (for anonymous users)
 * @param userId - The user ID from Supabase (for authenticated users)
 * @returns Object with access status and expiration date
 */
export async function checkUserHasAccess(
  anonymousToken?: string,
  userId?: string
): Promise<{ hasAccess: boolean; expiresAt?: Date; daysUntilExpiry?: number }> {
  if (!anonymousToken && !userId) {
    return { hasAccess: false }
  }

  try {
    const conditions = []

    // Check by userId (for authenticated users)
    if (userId) {
      conditions.push(eq(salarySubmission.userId, userId))
    }

    // Check by token hash (for anonymous users or pre-migration submissions)
    if (anonymousToken) {
      const tokenHash = hashAnonymousToken(anonymousToken)
      conditions.push(eq(salarySubmission.userTokenHash, tokenHash))
    }

    // Get the most recent submission with valid (non-expired) access
    const now = new Date()
    const submissions = await db
      .select({
        submissionId: salarySubmission.submissionId,
        accessExpiresAt: salarySubmission.accessExpiresAt,
      })
      .from(salarySubmission)
      .where(
        and(
          or(...conditions),
          gte(salarySubmission.accessExpiresAt, now)
        )
      )
      .orderBy(desc(salarySubmission.accessExpiresAt))
      .limit(1)

    if (submissions.length === 0) {
      return { hasAccess: false }
    }

    const expiresAt = submissions[0].accessExpiresAt
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

    return {
      hasAccess: true,
      expiresAt,
      daysUntilExpiry,
    }
  } catch (error) {
    console.error('Error checking user access:', error)
    return { hasAccess: false }
  }
}