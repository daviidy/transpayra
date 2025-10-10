'use server'

import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { hashAnonymousToken } from '@/lib/anonymous-token'
import { eq } from 'drizzle-orm'

/**
 * Check if user has access to view all salary data
 * User has access if they have submitted at least once
 *
 * @param anonymousToken - The token from the user's cookie
 * @returns true if user has submitted before (has access), false otherwise
 */
export async function checkUserHasAccess(anonymousToken?: string): Promise<boolean> {
  if (!anonymousToken) {
    return false
  }

  try {
    // Hash the token to match against database
    const tokenHash = hashAnonymousToken(anonymousToken)

    // Check if any submission exists with this token hash
    const submission = await db
      .select({ submissionId: salarySubmission.submissionId })
      .from(salarySubmission)
      .where(eq(salarySubmission.userTokenHash, tokenHash))
      .limit(1)

    return submission.length > 0
  } catch (error) {
    console.error('Error checking user access:', error)
    return false
  }
}