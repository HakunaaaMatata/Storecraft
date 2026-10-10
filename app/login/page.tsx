'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/use-auth'
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  const { login, register, isAuthenticated } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect)
    }
  }, [isAuthenticated, redirect, router])

  const validate = () => {
    const errors: Record<string, string> = {}
    if (mode === 'register') {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        errors.name = 'Please enter your full name (at least 2 characters).'
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.'
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)

    if (!validate()) return

    setIsLoading(true)

    try {
      if (mode === 'register') {
        const res = await register(formData.name, formData.email, formData.password)
        if (res.success) {
          setSuccessMessage('Account created successfully! Redirecting...')
          setTimeout(() => {
            router.push('/onboard')
          }, 800)
        } else {
          if (res.errors) setFieldErrors(res.errors)
          setGeneralError(res.error || 'Failed to create account.')
        }
      } else {
        const res = await login(formData.email, formData.password)
        if (res.success) {
          setSuccessMessage('Welcome back! Redirecting to your workspace...')
          setTimeout(() => {
            if (res.hasStore) {
              router.push(redirect || '/dashboard')
            } else {
              router.push('/onboard')
            }
          }, 600)
        } else {
          if (res.errors) setFieldErrors(res.errors)
          setGeneralError(res.error || 'Invalid email or password.')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoFill = () => {
    setFormData({
      name: 'Jamie Davis',
      email: 'owner@storecraft.demo',
      password: 'password123',
    })
    setFieldErrors({})
    setGeneralError(null)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header className="site-header">
        <Link href="/" className="brand">
          <img src="/images/storecraft-logo.png" alt="StoreCraft logo" className="brand-mark" style={{ objectFit: 'contain' }} />
          <span className="brand-name">StoreCraft</span>
        </Link>
        <div className="header-actions">
          <span style={{ fontSize: '12px', color: 'var(--slate)' }}>
            {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setFieldErrors({})
              setGeneralError(null)
            }}
            className="button button-dark"
            style={{ padding: '8px 14px', fontSize: '11px' }}
          >
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px -15px rgba(16, 24, 40, 0.08)',
          padding: '36px',
        }}>
          {/* Card Title */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#101828',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <ShieldCheck size={22} />
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '0 0 8px',
              color: '#101828',
            }}>
              {mode === 'login' ? 'Welcome back to StoreCraft' : 'Start your business journey'}
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#64748B',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {mode === 'login'
                ? 'Sign in to access your store dashboard and copilot.'
                : 'Create your owner account to begin building your store.'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            padding: '4px',
            borderRadius: '6px',
            marginBottom: '24px',
          }}>
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setFieldErrors({})
                setGeneralError(null)
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#101828' : '#64748B',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setFieldErrors({})
                setGeneralError(null)
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: mode === 'register' ? '#101828' : '#64748B',
                boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Alerts */}
          {generalError && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertCircle size={16} />
              <span>{generalError}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${fieldErrors.name ? '#EF4444' : '#CBD5E1'}`,
                  borderRadius: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#FFFFFF',
                }}>
                  <User size={15} color="#94A3B8" style={{ marginRight: '8px' }} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jamie Davis"
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '13px',
                      color: '#0F172A',
                    }}
                  />
                </div>
                {fieldErrors.name && (
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{fieldErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${fieldErrors.email ? '#EF4444' : '#CBD5E1'}`,
                borderRadius: '6px',
                padding: '8px 12px',
                backgroundColor: '#FFFFFF',
              }}>
                <Mail size={15} color="#94A3B8" style={{ marginRight: '8px' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="owner@yourstore.com"
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '13px',
                    color: '#0F172A',
                  }}
                />
              </div>
              {fieldErrors.email && (
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${fieldErrors.password ? '#EF4444' : '#CBD5E1'}`,
                borderRadius: '6px',
                padding: '8px 12px',
                backgroundColor: '#FFFFFF',
              }}>
                <Lock size={15} color="#94A3B8" style={{ marginRight: '8px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '13px',
                    color: '#0F172A',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="button button-green full"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                marginTop: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.8 : 1,
              }}
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account & Continue'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Demo helper */}
          <div style={{
            marginTop: '24px',
            paddingTop: '18px',
            borderTop: '1px solid #E2E8F0',
            textAlign: 'center',
          }}>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Sparkles size={12} />
              <span>Fill Demo Credentials for Quick Testing</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
