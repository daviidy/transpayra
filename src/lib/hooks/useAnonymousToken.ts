'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

const TOKEN_COOKIE_NAME = 'anonymous_user_token'
const TOKEN_EXPIRY_DAYS = 365 // 1 year

/**
 * Generate a secure random token on the client side
 * Uses Web Crypto API for cryptographically secure random values
 */
function generateClientToken(): string {
  const array = new Uint8Array(32) // 256 bits
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hook to manage anonymous user token
 * - Generates token on first visit
 * - Stores in cookie
 * - Returns existing token on subsequent visits
 */
export function useAnonymousToken() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if token already exists
    let existingToken = Cookies.get(TOKEN_COOKIE_NAME)

    if (!existingToken) {
      // Generate new token
      existingToken = generateClientToken()

      // Store in cookie (1 year expiration)
      Cookies.set(TOKEN_COOKIE_NAME, existingToken, {
        expires: TOKEN_EXPIRY_DAYS,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    }

    setToken(existingToken)
    setIsLoading(false)
  }, [])

  return { token, isLoading }
}