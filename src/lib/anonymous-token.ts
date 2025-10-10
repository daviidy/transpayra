import crypto from 'crypto'

/**
 * Generate a secure anonymous token (256-bit random string)
 * This token is stored in the user's browser cookie
 */
export function generateAnonymousToken(): string {
  return crypto.randomBytes(32).toString('hex') // 64 character hex string
}

/**
 * Hash an anonymous token with salt
 * Uses PBKDF2 for secure password-based key derivation
 *
 * @param token - The anonymous token from the cookie
 * @returns The hashed token to store in the database
 */
export function hashAnonymousToken(token: string): string {
  const salt = process.env.ANONYMOUS_TOKEN_SALT || 'default-salt-change-me'
  const iterations = 100000
  const keylen = 64
  const digest = 'sha512'

  const hash = crypto.pbkdf2Sync(token, salt, iterations, keylen, digest)
  return hash.toString('hex')
}

/**
 * Verify if a token matches a hash
 *
 * @param token - The token from the cookie
 * @param hash - The hash stored in the database
 * @returns true if the token matches the hash
 */
export function verifyAnonymousToken(token: string, hash: string): boolean {
  const computedHash = hashAnonymousToken(token)
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(hash, 'hex')
  )
}
