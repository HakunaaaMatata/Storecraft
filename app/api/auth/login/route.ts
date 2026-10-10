import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { findUserByEmail, getStoresByOwner } from '@/lib/db'
import { verifyPassword, createSessionForUser, sanitizeUser, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const errors: Record<string, string> = {}
    if (!email || typeof email !== 'string') {
      errors.email = 'Please provide your email address.'
    }
    if (!password || typeof password !== 'string') {
      errors.password = 'Please provide your password.'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await findUserByEmail(normalizedEmail)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password. Please verify your credentials.'
      }, { status: 401 })
    }

    // Verify password hash
    const isValid = verifyPassword(password, user.passwordHash, user.salt)
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password. Please verify your credentials.'
      }, { status: 401 })
    }

    // Create session & set cookie
    const session = await createSessionForUser(user.id)
    const userStores = await getStoresByOwner(user.id)
    const primaryStore = userStores[0]

    const response = NextResponse.json({
      success: true,
      user: sanitizeUser(user),
      hasStore: userStores.length > 0,
      storeSlug: primaryStore ? primaryStore.slug : undefined,
      message: 'Logged in successfully.',
    })

    response.cookies.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error: any) {
    console.error('[API] Login error:', error)
    return NextResponse.json({ success: false, error: error.message || String(error), stack: error.stack }, { status: 500 })
  }
}
