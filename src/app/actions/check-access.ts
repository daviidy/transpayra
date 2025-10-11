'use server'

import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { hashAnonymousToken } from '@/lib/anonymous-token'
import { eq, or } from 'drizzle-orm'

/**
 * Check if user has access to view all salary data
 * User has access if they have submitted at least once (either anonymous or authenticated)
 *
 * @param anonymousToken - The token from the user's cookie (for anonymous users)
 * @param userId - The user ID from Supabase (for authenticated users)
 * @returns true if user has submitted before (has access), false otherwise
 */
export async function checkUserHasAccess(
  anonymousToken?: string,
  userId?: string
): Promise<boolean> {
  if (!anonymousToken && !userId) {
    return false
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

    // Check if any submission exists with either condition
    const submission = await db
      .select({ submissionId: salarySubmission.submissionId })
      .from(salarySubmission)
      .where(or(...conditions))
      .limit(1)

    return submission.length > 0
  } catch (error) {
    console.error('Error checking user access:', error)
    return false
  }
}