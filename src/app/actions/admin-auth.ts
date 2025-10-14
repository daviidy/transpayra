'use server'

import { cookies } from 'next/headers'

const ADMIN_USERNAME = 'daviidy'
const ADMIN_PASSWORD = 'Transpayra@2025'
const ADMIN_SESSION_COOKIE = 'admin_session'

export async function adminLogin(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set secure session cookie
    const cookieStore = await cookies()
    cookieStore.set(ADMIN_SESSION_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better persistence
      maxAge: 60 * 60 * 24 * 7, // Extended to 7 days
      path: '/',
    })

    return { success: true }
  }

  return { success: false, error: 'Invalid username or password' }
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)
  return session?.value === 'authenticated'
}
