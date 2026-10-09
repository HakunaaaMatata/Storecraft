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

const SECRET = process.env.NEXTAUTH_SECRET || 'hackathon_default_secret_key_12345'

/**
 * Sign a payload statically so it survives Vercel Serverless restarts
 */
function signToken(payload: any): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64')
  return `${data}.${signature}`
}

/**
 * Verify a stateless token
 */
function verifyToken(token: string): any | null {
  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) return null
    
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64')
    if (signature !== expectedSignature) return null
    
    return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

/**
 * Create a stateless session token
 */
export async function createSessionForUser(userId: string): Promise<Session> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  const user = await findUserById(userId)
  
  const token = signToken({
    userId,
    user: user ? sanitizeUser(user) : null,
    expiresAt
  })
  
  const session: Session = {
    token,
    userId,
    expiresAt,
    createdAt: new Date().toISOString(),
  }
  
  await saveSession(session)
  return session
}

/**
 * Server-side helper to read the authenticated session statelessly
 */
export async function getSessionUser(): Promise<{ user: SafeUser; session: Session } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload || !payload.user) return null
    
    if (new Date(payload.expiresAt) < new Date()) {
      return null
    }

    const session: Session = {
      token,
      userId: payload.userId,
      expiresAt: payload.expiresAt,
      createdAt: new Date().toISOString(),
    }

    return { user: payload.user, session }
  } catch (err) {
    console.warn('[AUTH] Error resolving stateless session:', err)
    return null
  }
}
