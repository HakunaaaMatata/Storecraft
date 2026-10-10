import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { findUserByEmail, createUser } from '@/lib/db'
import { hashPassword, createSessionForUser, sanitizeUser, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validation
    const errors: Record<string, string> = {}
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Please provide a full name (at least 2 characters).'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid email address.'
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await findUserByEmail(normalizedEmail)
    if (existing) {
      return NextResponse.json({
        success: false,
        errors: { email: 'An account with this email address already exists. Please log in instead.' }
      }, { status: 409 })
    }

    // Securely hash password with unique salt
    const { hash, salt } = hashPassword(password)
    const newUser = await createUser({
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
    })

    // Create session and set cookie
    const session = await createSessionForUser(newUser.id)
    const response = NextResponse.json({
      success: true,
      user: sanitizeUser(newUser),
      message: 'Account successfully registered.',
    }, { status: 201 })

    response.cookies.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('[API] Register error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
