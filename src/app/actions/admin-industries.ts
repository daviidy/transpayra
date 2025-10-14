'use server'

import { db } from '@/lib/db'
import { industry } from '@/lib/db/schema'
import { isAdminAuthenticated } from './admin-auth'

export type Industry = typeof industry.$inferSelect

export async function getAllIndustries(): Promise<{ success: boolean; data?: Industry[]; error?: string }> {
  try {
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      return { success: false, error: 'Unauthorized' }
    }

    const industries = await db.select().from(industry).orderBy(industry.name)
    return { success: true, data: industries }
  } catch (error) {
    console.error('Error fetching industries:', error)
    return { success: false, error: 'Failed to fetch industries' }
  }
}
