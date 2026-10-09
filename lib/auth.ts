import crypto from 'crypto'
import { cookies } from 'next/headers'
import { User, Session } from './types'
import { findUserByEmail, findUserById, createUser, saveSession, findSession, deleteSession } from './db'

export const SESSION_COOKIE_NAME = 'storecraft_session'

export interface SafeUser {
  id: string
  name: string
  email: string
  createdAt: string
}

export function sanitizeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }
}

/**
 * Securely hashes password using crypto.scryptSync with a cryptographically secure random salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { hash, salt }
}

/**
 * Timing-safe password verification
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64).toString('hex')
    const hashBuffer = Buffer.from(hash, 'hex')
    const derivedBuffer = Buffer.from(derived, 'hex')
    if (hashBuffer.length !== derivedBuffer.length) return false
    return crypto.timingSafeEqual(hashBuffer, derivedBuffer)
  } catch {
    return false
  }
}

/**
 * Generate cryptographically secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a new session in database
 */
export function createSessionForUser(userId: string): Session {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  const session: Session = {
    token,
    userId,
    expiresAt,
    createdAt: new Date().toISOString(),
  }
  saveSession(session)
  return session
}

/**
 * Server-side helper to read the authenticated session and return the current user
 */
export async function getSessionUser(): Promise<{ user: SafeUser; session: Session } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!token) return null

    const session = findSession(token)
    if (!session) return null

    const user = findUserById(session.userId)
    if (!user) return null

    return { user: sanitizeUser(user), session }
  } catch (err) {
    console.warn('[AUTH] Error resolving session:', err)
    return null
  }
}
