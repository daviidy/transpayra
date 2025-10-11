'use server'

import { db } from '@/lib/db'
import { salarySubmission } from '@/lib/db/schema'
import { hashAnonymousToken } from '@/lib/anonymous-token'
import { eq, and, isNull } from 'drizzle-orm'

/**
 * Migrate anonymous salary submissions to authenticated user account
 *
 * When a user signs in with OAuth after making anonymous submissions,
 * this links all their anonymous submissions to their user account.
 *
 * @param userId - The authenticated user's ID from Supabase
 * @param anonymousToken - The token from the user's cookie
 * @returns Object with success status and count of migrated submissions
 */
export async function migrateAnonymousSubmissions(
  userId: string,
  anonymousToken: string
): Promise<{ success: boolean; migratedCount: number; error?: string }> {
  try {
    // Hash the token to match against database
    const tokenHash = hashAnonymousToken(anonymousToken)

    // Find all submissions with this token hash that aren't linked to a user yet
    const submissions = await db
      .select({ submissionId: salarySubmission.submissionId })
      .from(salarySubmission)
      .where(
        and(
          eq(salarySubmission.userTokenHash, tokenHash),
          isNull(salarySubmission.userId)
        )
      )

    // Link them to the authenticated user
    if (submissions.length > 0) {
      await db
        .update(salarySubmission)
        .set({ userId })
        .where(
          and(
            eq(salarySubmission.userTokenHash, tokenHash),
            isNull(salarySubmission.userId)
          )
        )

      console.log(`✅ Successfully migrated ${submissions.length} anonymous submission(s) to user ${userId}`)
    } else {
      console.log(`ℹ️ No anonymous submissions found to migrate for user ${userId}`)
    }

    return {
      success: true,
      migratedCount: submissions.length,
    }
  } catch (error) {
    console.error('❌ Token migration error:', error)
    return {
      success: false,
      migratedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
