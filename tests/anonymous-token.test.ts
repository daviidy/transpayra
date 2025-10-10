import { generateAnonymousToken, hashAnonymousToken, verifyAnonymousToken } from '@/lib/anonymous-token'

describe('Anonymous Token System', () => {
  test('should generate unique 64-character hex tokens', () => {
    const token1 = generateAnonymousToken()
    const token2 = generateAnonymousToken()

    expect(token1).toHaveLength(64)
    expect(token2).toHaveLength(64)
    expect(token1).not.toBe(token2)
    expect(token1).toMatch(/^[0-9a-f]{64}$/)
  })

  test('should hash tokens consistently', () => {
    const token = generateAnonymousToken()
    const hash1 = hashAnonymousToken(token)
    const hash2 = hashAnonymousToken(token)

    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(128) // 64 bytes = 128 hex chars
  })

  test('should produce different hashes for different tokens', () => {
    const token1 = generateAnonymousToken()
    const token2 = generateAnonymousToken()

    const hash1 = hashAnonymousToken(token1)
    const hash2 = hashAnonymousToken(token2)

    expect(hash1).not.toBe(hash2)
  })

  test('should verify tokens correctly', () => {
    const token = generateAnonymousToken()
    const hash = hashAnonymousToken(token)

    expect(verifyAnonymousToken(token, hash)).toBe(true)
  })

  test('should reject incorrect tokens', () => {
    const token1 = generateAnonymousToken()
    const token2 = generateAnonymousToken()
    const hash1 = hashAnonymousToken(token1)

    expect(verifyAnonymousToken(token2, hash1)).toBe(false)
  })
})