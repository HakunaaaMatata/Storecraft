'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Store, 
  Package, 
  Palette, 
  Rocket, 
  Upload, 
  Sparkles, 
  Plus, 
  X, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Lock,
  Layers,
  Edit2
} from 'lucide-react'
import { useAuth } from '@/lib/use-auth'
import { THEME_PRESETS, ThemeConfig } from '@/lib/theme-presets'
import { ThemePresetId, Product } from '@/lib/types'
import { db } from '@/lib/store-data'
import { getSampleProductsSummary } from '@/lib/sample-catalog'
import { SampleProductImportModal } from '@/components/onboarding/sample-product-modal'
import { DummySampleProduct } from '@/lib/dummy-sample-products'

const PREDEFINED_CATEGORIES = [
  'Fashion',
  'Electronics',
  'Beauty and Skincare',
  'Home and Living',
  'Food and Beverages',
  'Sports and Fitness',
  'Books and Stationery',
  'Toys and Games',
  'Jewelry and Accessories',
  'Other',
]

const BUSINESS_TYPES = [
  'Home & Living',
  'Fashion & Apparel',
  'Technology & Electronics',
  'Food & Beverages',
  'Beauty & Wellness',
  'Sports & Fitness',
  'Books & Stationery',
  'Artisanal & Crafts',
  'General Retail',
]

const STEPS = [
  { id: 1, title: 'Business Info', subtitle: 'Store details & branding', icon: Store },
  { id: 2, title: 'Categories', subtitle: 'Catalog hierarchy', icon: Package },
  { id: 3, title: 'Product Setup', subtitle: 'Catalog population', icon: Upload },
  { id: 4, title: 'Theme Selection', subtitle: 'Brand point of view', icon: Palette },
  { id: 5, title: 'Review & Launch', subtitle: 'Verify & open doors', icon: Rocket },
]

const DRAFT_STORAGE_KEY = 'storecraft_onboarding_draft_v2'

export default function OnboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [step, setStep] = useState(1)

  const [isClient, setIsClient] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchError, setLaunchError] = useState<string | null>(null)
  const [launchSuccess, setLaunchSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'Home & Living',
    description: '',
    logoUrl: '',
    logoName: '',
    categories: ['Home and Living'],
    productsOption: 'sample' as 'sample' | 'csv' | 'none',
    themePreset: 'forma' as ThemePresetId,
    themeSettings: null as any
  })

  // Field Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [customCategory, setCustomCategory] = useState('')
  const [categoryError, setCategoryError] = useState<string | null>(null)

  // CSV Import State
  const [csvFile, setCsvFile] = useState<{ name: string; size: number; count: number; rows: Partial<Product>[] } | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Step 1 Sample Product Import Modal State
  const [showStep1SampleModal, setShowStep1SampleModal] = useState(false)
  const [sampleProductsSuccessToast, setSampleProductsSuccessToast] = useState<string | null>(null)

  const handleConfirmSampleProductsOnStep1 = (products: DummySampleProduct[], category: string) => {
    const parsedRows = products.map(p => ({
      title: p.name,
      price: p.price,
      description: p.description,
      category: p.category,
      inventory: p.stock,
      sku: p.sku,
      images: [p.image],
    }))

    setCsvFile({
      name: `${category} Sample Products`,
      size: 1024,
      count: parsedRows.length,
      rows: parsedRows,
    })

    setFormData(prev => ({
      ...prev,
      productsOption: 'csv',
      categories: Array.from(new Set([...prev.categories, category].filter(Boolean))),
    }))

    setSampleProductsSuccessToast('5 sample products added successfully.')
    setTimeout(() => {
      setSampleProductsSuccessToast(null)
    }, 4000)
  }

  // Load saved draft and prefill with user info on mount
  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.step) setStep(parsed.step)
        if (parsed.formData) setFormData(parsed.formData)
        if (parsed.csvFile) setCsvFile(parsed.csvFile)
      } catch (e) {
        console.warn('Failed to parse onboarding draft:', e)
      }
    }
  }, [])

  // Enforce auth gate
  useEffect(() => {
    if (isClient && !authLoading && !isAuthenticated) {
      router.push('/login?redirect=/onboard')
    }
  }, [isClient, authLoading, isAuthenticated, router])

  // Auto-fill user credentials when authenticated
  useEffect(() => {
    if (user && isClient) {
      setFormData(prev => ({
        ...prev,
        ownerName: prev.ownerName || user.name,
        email: prev.email || user.email,
      }))
    }
  }, [user, isClient])

  // Persist draft across refreshes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        step,
        formData,
        csvFile: csvFile ? { name: csvFile.name, size: csvFile.size, count: csvFile.count } : null
      }))
    }
  }, [step, formData, csvFile, isClient])

  if (!isClient || authLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div style={{ width: '100%', maxWidth: '900px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', minHeight: '600px' }}>
          {/* Sidebar Skeleton */}
          <div style={{ width: '280px', backgroundColor: '#F1F5F9', padding: '40px 32px', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '140px', height: '24px', backgroundColor: '#CBD5E1', borderRadius: '4px', marginBottom: '48px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#CBD5E1', flexShrink: 0, animation: 'pulse 1.5s infinite ease-in-out' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ width: '80%', height: '16px', backgroundColor: '#CBD5E1', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                    <div style={{ width: '60%', height: '12px', backgroundColor: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Main Area Skeleton */}
          <div style={{ flex: 1, padding: '48px 64px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '60%', height: '32px', backgroundColor: '#E2E8F0', borderRadius: '4px', marginBottom: '16px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ width: '40%', height: '16px', backgroundColor: '#E2E8F0', borderRadius: '4px', marginBottom: '48px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
              <div style={{ width: '100%', height: '64px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
              <div style={{ width: '100%', height: '64px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
              <div style={{ width: '100%', height: '64px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    )
  }

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      setFieldErrors(prev => ({ ...prev, logo: 'Please select a valid image file (PNG, JPG, WEBP, or SVG).' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, logo: 'Logo file size cannot exceed 5MB.' }))
      return
    }

    setFieldErrors(prev => {
      const rest = { ...prev }
      delete rest.logo
      return rest
    })

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string
      setFormData(prev => ({
        ...prev,
        logoUrl: result,
        logoName: file.name,
      }))
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '', logoName: '' }))
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  // Handle CSV Import
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvError(null)

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setCsvError('Please upload a valid .csv file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
        if (lines.length < 2) {
          setCsvError('CSV file must contain a header row and at least 1 product record.')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
        const titleIdx = headers.findIndex(h => h.includes('name') || h.includes('title') || h.includes('product'))
        const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('cost'))
        const stockIdx = headers.findIndex(h => h.includes('stock') || h.includes('inventory') || h.includes('qty'))

        if (titleIdx === -1 || priceIdx === -1) {
          setCsvError('CSV must include at least "Title/Name" and "Price" columns.')
          return
        }

        const parsedRows: Partial<Product>[] = []
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
          if (cols[titleIdx]) {
            parsedRows.push({
              title: cols[titleIdx],
              price: parseFloat(cols[priceIdx]) || 25,
              inventory: stockIdx !== -1 ? parseInt(cols[stockIdx]) || 10 : 10,
              category: formData.categories[0] || 'General',
            })
          }
        }

        setCsvFile({
          name: file.name,
          size: file.size,
          count: parsedRows.length,
          rows: parsedRows,
        })
      } catch (err) {
        setCsvError('Failed to parse CSV file. Ensure standard comma-separated format.')
      }
    }
    reader.readAsText(file)
  }

  // Category Actions
  const toggleCategory = (cat: string) => {
    setCategoryError(null)
    setFormData(prev => {
      const exists = prev.categories.includes(cat)
      if (exists) {
        if (prev.categories.length === 1) {
          setCategoryError('Store must have at least one category.')
          return prev
        }
        return { ...prev, categories: prev.categories.filter(c => c !== cat) }
      } else {
        return { ...prev, categories: [...prev.categories, cat] }
      }
    })
  }

  const handleAddCustomCategory = () => {
    const trimmed = customCategory.trim()
    setCategoryError(null)

    if (!trimmed) {
      setCategoryError('Category name cannot be empty.')
      return
    }

    if (formData.categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategoryError(`"${trimmed}" is already added to categories.`)
      return
    }

    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, trimmed],
    }))
    setCustomCategory('')
  }

  // Step Validation
  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        errors.name = 'Store name must be at least 2 characters.'
      } else if (formData.name.trim().length > 60) {
        errors.name = 'Store name cannot exceed 60 characters.'
      }

      if (!formData.ownerName.trim() || formData.ownerName.trim().length < 2) {
        errors.ownerName = 'Owner name must be at least 2 characters.'
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
        errors.email = 'Please provide a valid contact email.'
      }

      const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/
      if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
        errors.phone = 'Please provide a valid phone number (at least 7 digits).'
      }

      if (!formData.address.trim() || formData.address.trim().length < 5) {
        errors.address = 'Please enter a valid business address.'
      }
      
      if (!formData.businessType) {
        errors.businessType = 'Please select a business type.'
      }
    }

    if (currentStep === 2) {
      if (formData.categories.length === 0) {
        errors.categories = 'Please select at least one product category.'
      }
    }

    if (currentStep === 3) {
      if (formData.productsOption === 'csv' && (!csvFile || csvFile.count === 0)) {
        errors.products = 'Please upload a CSV file or choose "Generate sample products".'
      }
    }
    
    if (currentStep === 4) {
      if (!formData.themePreset || !THEME_PRESETS[formData.themePreset]) {
        errors.themePreset = 'Please select a valid theme preset.'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 5))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    setFieldErrors({})
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Launch Store Submission
  const handleLaunch = async () => {
    if (isLaunching) return

    // Final client verification
    if (!validateStep(1) || !validateStep(2)) {
      setLaunchError('Please verify all business details and categories before launching.')
      return
    }

    // Auth gate check
    if (!isAuthenticated) {
      router.push('/login?redirect=/onboard')
      return
    }

    setIsLaunching(true)
    setLaunchError(null)

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          logoUrl: formData.logoUrl,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          businessType: formData.businessType,
          description: formData.description,
          categories: formData.categories,
          productsOption: formData.productsOption,
          importedProducts: csvFile?.rows,
          themePreset: formData.themePreset,
          themeSettings: formData.themeSettings,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setLaunchError(data.error || (data.errors ? Object.values(data.errors)[0] as string : 'Failed to launch store.'))
        setIsLaunching(false)
        return
      }

      // Also persist to client localStorage db so client hooks immediately recognize it
      const createdStore = data.store
      if (createdStore) {
        db.saveStore({
          id: createdStore.id,
          slug: createdStore.slug,
          name: createdStore.name,
          ownerName: createdStore.ownerName || formData.ownerName,
          email: createdStore.ownerEmail || formData.email,
          phone: createdStore.phone || formData.phone,
          businessType: createdStore.businessType || formData.businessType,
          address: createdStore.address || formData.address,
          description: createdStore.description || formData.description,
          logoUrl: createdStore.logoUrl,
          categories: createdStore.categories.filter((c: string) => c !== 'All'),
          theme: {
            preset: createdStore.preset,
            primaryColor: '#101828',
            accentColor: '#10B981',
            fontHeading: 'DM Serif Display',
            fontBody: 'Manrope',
            heroTitle: createdStore.heroHeadline,
            heroSubtitle: createdStore.heroSubtitle,
            heroCta: 'Explore Collection',
            heroImage: createdStore.heroImage,
            announcement: createdStore.announcement,
          },
          createdAt: createdStore.createdAt || new Date().toISOString(),
        })

        // Save generated products to client db
        if (createdStore.products && Array.isArray(createdStore.products)) {
          for (const p of createdStore.products) {
            db.saveProduct({
              id: p.id,
              storeId: createdStore.id,
              name: p.title,
              slug: p.id,
              description: p.description,
              category: p.category,
              price: p.price,
              compareAtPrice: p.compareAtPrice,
              stock: p.inventory,
              sku: p.sku,
              images: p.images || [],
              createdAt: new Date().toISOString(),
            })
          }
        }

        db.setActiveStore(createdStore.id)
      }

      // Clear draft
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      setLaunchSuccess(true)

      // Redirect to owner dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)

    } catch (err) {
      setLaunchError('Network error connecting to store server. Please try again.')
      setIsLaunching(false)
    }
  }

  const activeThemeConfig = THEME_PRESETS[formData.themePreset]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      
      {/* Wizard Header */}
      <header className="site-header">
        <Link href="/" className="brand">
          <img src="/images/storecraft-logo.png" alt="StoreCraft logo" className="brand-mark" style={{ objectFit: 'contain' }} />
          <span className="brand-name">StoreCraft</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748B' }}>Signed in as</span>
              <strong style={{ color: '#0F172A' }}>{user?.name}</strong>
            </div>
          ) : (
            <Link href="/login?redirect=/onboard" style={{ color: '#059669', fontWeight: 700 }}>
              Sign in to save progress →
            </Link>
          )}
        </div>
      </header>

      {/* Main Wizard Container */}
      <main style={{ flex: 1, padding: '36px 4vw 60px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>


            {/* Step Indicator */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '20px 28px',
              marginBottom: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              {/* Progress bar */}
              <div style={{
                height: '4px',
                backgroundColor: '#E2E8F0',
                borderRadius: '9999px',
                marginBottom: '18px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#10B981',
                  width: `${(step / STEPS.length) * 100}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
                gap: '8px',
              }}>
                {STEPS.map((s) => {
                  const Icon = s.icon
                  const isPast = step > s.id
                  const isCurrent = step === s.id
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        if (s.id < step) setStep(s.id)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: s.id < step ? 'pointer' : 'default',
                        opacity: isCurrent || isPast ? 1 : 0.45,
                      }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: isPast ? '#10B981' : isCurrent ? '#101828' : '#F1F5F9',
                        color: isPast ? '#FFFFFF' : isCurrent ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}>
                        {isPast ? <Check size={14} /> : s.id}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: isCurrent ? '#101828' : '#64748B' }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: '9px', color: '#94A3B8' }}>
                          {s.subtitle}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Wizard Step Body */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px -2px rgba(16, 24, 40, 0.05)',
              padding: '36px',
            }}>
          
          {/* STEP 1: BUSINESS DETAILS */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <span className="eyebrow" style={{ color: '#059669' }}>Step 1 of 5</span>
                <h2 style={{ fontSize: '26px', margin: '4px 0 8px', letterSpacing: '-0.03em' }}>
                  Tell us about your business.
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  These details establish your store identity, legal footer, and owner profile.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Store Name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Northstar Goods, Atelier Minimal, Apex Audio"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${fieldErrors.name ? '#EF4444' : '#CBD5E1'}`,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  {fieldErrors.name && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{fieldErrors.name}</p>
                  )}
                </div>

                {/* Store Logo Upload */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    Store Brand Logo (Optional)
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    border: `1px dashed ${fieldErrors.logo ? '#EF4444' : '#CBD5E1'}`,
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                  }}>
                    {formData.logoUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}>
                          <img src={formData.logoUrl} alt="Store Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '12px', color: '#0F172A', display: 'block' }}>{formData.logoName || 'store-logo.png'}</strong>
                          <span style={{ fontSize: '10px', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> Ready for storefront
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeLogo}
                          style={{
                            background: '#FEE2E2',
                            color: '#991B1B',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '8px',
                          backgroundColor: '#E2E8F0',
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <ImageIcon size={20} />
                        </div>
                        <div>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                            onChange={handleLogoUpload}
                            style={{ display: 'none' }}
                            id="store-logo-input"
                          />
                          <label
                            htmlFor="store-logo-input"
                            style={{
                              backgroundColor: '#101828',
                              color: '#FFFFFF',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-block',
                              marginBottom: '4px',
                            }}
                          >
                            Upload Brand Logo
                          </label>
                          <p style={{ margin: 0, fontSize: '10px', color: '#64748B' }}>
                            Supports PNG, JPG, WEBP, SVG up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {fieldErrors.logo && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{fieldErrors.logo}</p>
                  )}
                </div>

                {/* Owner Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="e.g. Jamie Davis"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${fieldErrors.ownerName ? '#EF4444' : '#CBD5E1'}`,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  {fieldErrors.ownerName && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{fieldErrors.ownerName}</p>
                  )}
                </div>

                {/* Business Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    Primary Business Type *
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                    }}
                  >
                    {BUSINESS_TYPES.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@yourstore.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${fieldErrors.email ? '#EF4444' : '#CBD5E1'}`,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  {fieldErrors.email && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{fieldErrors.email}</p>
                  )}
                </div>

                {/* Contact Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 234-5678"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${fieldErrors.phone ? '#EF4444' : '#CBD5E1'}`,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  {fieldErrors.phone && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Business Address */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    Business Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 420 Design Row, Portland, OR 97209"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${fieldErrors.address ? '#EF4444' : '#CBD5E1'}`,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  {fieldErrors.address && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{fieldErrors.address}</p>
                  )}
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    Store Headline & Bio (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short summary of your brand story and product collection..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {sampleProductsSuccessToast && (
                <div style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span>{sampleProductsSuccessToast}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CATEGORIES */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <span className="eyebrow" style={{ color: '#059669' }}>Step 2 of 5</span>
                <h2 style={{ fontSize: '26px', margin: '4px 0 8px', letterSpacing: '-0.03em' }}>
                  Select store categories.
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Choose which product categories your store sells, or add custom bespoke tags.
                </p>
              </div>

              {categoryError && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <AlertCircle size={15} />
                  <span>{categoryError}</span>
                </div>
              )}

              {/* Predefined Category Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: '10px',
                marginBottom: '24px',
              }}>
                {PREDEFINED_CATEGORIES.map(cat => {
                  const isSelected = formData.categories.includes(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        border: `1px solid ${isSelected ? '#10B981' : '#E2E8F0'}`,
                        backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                        color: isSelected ? '#065F46' : '#1E293B',
                        fontWeight: isSelected ? 800 : 500,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{cat}</span>
                      {isSelected ? (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} />
                        </div>
                      ) : (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #CBD5E1' }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Add Custom Category Input */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: '20px',
              }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                  Add Custom Category
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomCategory()
                      }
                    }}
                    placeholder="e.g. Specialty Tea, Vintage Watches, Ceramic Art"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="button button-dark"
                    style={{ padding: '9px 16px', fontSize: '11px' }}
                  >
                    <Plus size={14} /> Add Category
                  </button>
                </div>
              </div>

              {/* Selected Categories Summary */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>
                  Selected Categories ({formData.categories.length}):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Array.from(new Set(formData.categories)).map((c, idx) => (
                    <span
                      key={`${c}-${idx}`}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#101828',
                        color: '#FFFFFF',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => toggleCategory(c)}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PRODUCT SETUP */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <span className="eyebrow" style={{ color: '#059669' }}>Step 3 of 5</span>
                <h2 style={{ fontSize: '26px', margin: '4px 0 8px', letterSpacing: '-0.03em' }}>
                  Populate your initial product catalog.
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Choose how your store's inventory should be configured at launch.
                </p>
              </div>

              {fieldErrors.products && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <AlertCircle size={15} />
                  <span>{fieldErrors.products}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {/* Option 1: Generate Sample Products */}
                <div
                  onClick={() => setFormData({ ...formData, productsOption: 'sample' })}
                  style={{
                    padding: '24px',
                    borderRadius: '8px',
                    border: `2px solid ${formData.productsOption === 'sample' ? '#10B981' : '#E2E8F0'}`,
                    backgroundColor: formData.productsOption === 'sample' ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#10B981',
                      color: '#101828',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}>
                      <Sparkles size={18} />
                    </div>
                    <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                      Generate Realistic Sample Products (Recommended)
                    </strong>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                      Automatically generate high-quality product records matching your selected categories with real SKUs, photography, pricing, and inventory.
                    </p>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '11px', fontWeight: 800, color: '#059669' }}>
                    {formData.productsOption === 'sample' ? '✓ Selected for launch' : 'Select option'}
                  </div>
                </div>

                {/* Option 2: Import CSV / Excel File */}
                <div
                  onClick={() => setFormData({ ...formData, productsOption: 'csv' })}
                  style={{
                    padding: '24px',
                    borderRadius: '8px',
                    border: `2px solid ${formData.productsOption === 'csv' ? '#10B981' : '#E2E8F0'}`,
                    backgroundColor: formData.productsOption === 'csv' ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#101828',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}>
                      <Upload size={18} />
                    </div>
                    <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                      Import CSV / Spreadsheet
                    </strong>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                      Upload an existing inventory spreadsheet containing product titles, prices, and stock counts.
                    </p>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '11px', fontWeight: 800, color: formData.productsOption === 'csv' ? '#059669' : '#64748B' }}>
                    {formData.productsOption === 'csv' ? '✓ Selected for launch' : 'Select option'}
                  </div>
                </div>
              </div>

              {/* Conditional Sample Products Confirmation & Preview UI */}
              {formData.productsOption === 'sample' && (() => {
                const summary = getSampleProductsSummary(formData.categories)
                return (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#F0FDF4',
                    borderRadius: '8px',
                    border: '1px solid #BBF7D0',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color="#059669" />
                        <strong style={{ fontSize: '13px', color: '#065F46' }}>
                          Sample Catalog Generation Preview ({summary.count} Products)
                        </strong>
                      </div>
                      <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '3px 10px', borderRadius: '12px' }}>
                        Deterministic & Collision-Free
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#166534', margin: '0 0 12px', lineHeight: 1.5 }}>
                      We will automatically generate realistic, coherent product records mapped directly to your {formData.categories.length} selected categories ({formData.categories.join(', ')}).
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {summary.categoryBreakdown.map((b) => (
                        <span key={b.category} style={{ fontSize: '11px', padding: '4px 10px', backgroundColor: '#FFFFFF', border: '1px solid #86EFAC', borderRadius: '4px', color: '#14532D', fontWeight: 600 }}>
                          {b.category}: {b.count} products
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: '#15803D' }}>
                      <strong>Sample titles included:</strong> {summary.previewNames.join(', ')}
                    </div>
                  </div>
                )
              })()}

              {/* Conditional CSV Upload UI */}
              {formData.productsOption === 'csv' && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Upload Product Spreadsheet</strong>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>Requires headers: Title, Price, Inventory</span>
                    </div>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCsvUpload}
                        style={{ display: 'none' }}
                        id="csv-file-upload"
                      />
                      <label
                        htmlFor="csv-file-upload"
                        className="button button-dark"
                        style={{ padding: '8px 14px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Choose .CSV File
                      </label>
                    </div>
                  </div>

                  {csvError && (
                    <p style={{ fontSize: '11px', color: '#DC2626', margin: '8px 0 0' }}>{csvError}</p>
                  )}

                  {csvFile ? (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      marginTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="#059669" />
                        <div>
                          <strong style={{ fontSize: '12px', color: '#0F172A', display: 'block' }}>{csvFile.name}</strong>
                          <span style={{ fontSize: '10px', color: '#059669' }}>
                            ✓ {csvFile.count} products parsed and ready to import
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCsvFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      border: '1px dashed #CBD5E1',
                      textAlign: 'center',
                      color: '#64748B',
                      fontSize: '11px',
                    }}>
                      No spreadsheet attached yet. (Integration boundary: products will not be marked as imported until a file is selected).
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: THEME SELECTION */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <span className="eyebrow" style={{ color: '#059669' }}>Step 4 of 5</span>
                <h2 style={{ fontSize: '26px', margin: '4px 0 8px', letterSpacing: '-0.03em' }}>
                  Choose a brand starting point.
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Select from four distinct aesthetic presets. You can fine-tune colors, fonts, and banners in the Theme Studio later.
                </p>
              </div>

              {/* Theme Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '28px',
              }}>
                {(Object.keys(THEME_PRESETS) as ThemePresetId[]).map((presetId) => {
                  const t = THEME_PRESETS[presetId]
                  const isSelected = formData.themePreset === presetId
                  return (
                    <div
                      key={presetId}
                      onClick={() => setFormData({ ...formData, themePreset: presetId })}
                      style={{
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? '#10B981' : '#E2E8F0'}`,
                        backgroundColor: '#FFFFFF',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 8px 20px -4px rgba(16, 185, 129, 0.2)' : 'none',
                      }}
                    >
                      <div style={{
                        height: '110px',
                        backgroundImage: `url('${t.heroImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        padding: '10px',
                      }}>
                        <div style={{
                          backgroundColor: isSelected ? '#10B981' : 'rgba(0,0,0,0.6)',
                          color: isSelected ? '#101828' : '#FFFFFF',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 800,
                          display: 'inline-block',
                          textTransform: 'capitalize',
                        }}>
                          {presetId}
                        </div>
                      </div>
                      <div style={{ padding: '12px' }}>
                        <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', textTransform: 'capitalize' }}>
                          {t.name}
                        </strong>
                        <span style={{ fontSize: '10px', color: '#64748B', display: 'block', marginTop: '2px' }}>
                          {t.type}
                        </span>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: t.bg, border: '1px solid #CBD5E1' }} />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: t.accent }} />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: t.ink }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Live Preview Banner */}
              <div style={{
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                backgroundColor: activeThemeConfig.bg,
                color: activeThemeConfig.ink,
              }}>
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: activeThemeConfig.announcementBg,
                  color: activeThemeConfig.announcementInk,
                  fontSize: '10px',
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {activeThemeConfig.heroBadge}
                </div>
                <div style={{
                  padding: '36px 40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}>
                  <div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: activeThemeConfig.accent,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      display: 'block',
                      marginBottom: '6px',
                    }}>
                      {formData.name || 'Your Store Name'}
                    </span>
                    <h3 style={{
                      fontSize: '28px',
                      margin: '0 0 10px',
                      letterSpacing: '-0.03em',
                      fontFamily: activeThemeConfig.fontHeadline,
                      color: activeThemeConfig.ink,
                    }}>
                      {activeThemeConfig.heroHeadline} <em>{activeThemeConfig.heroHeadlineEm}</em>
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: activeThemeConfig.inkMuted,
                      margin: '0 0 16px',
                      maxWidth: '460px',
                      lineHeight: 1.6,
                    }}>
                      {formData.description || activeThemeConfig.heroSubtitle}
                    </p>
                    <button style={{
                      backgroundColor: activeThemeConfig.accent,
                      color: activeThemeConfig.accentForeground,
                      padding: '9px 16px',
                      borderRadius: activeThemeConfig.buttonRadius,
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}>
                      {activeThemeConfig.heroCta} →
                    </button>
                  </div>
                  <div style={{
                    width: '180px',
                    height: '140px',
                    borderRadius: activeThemeConfig.cardRadius,
                    backgroundImage: `url('${activeThemeConfig.heroImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: `1px solid ${activeThemeConfig.border}`,
                    flexShrink: 0,
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & LAUNCH */}
          {step === 5 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <span className="eyebrow" style={{ color: '#059669' }}>Step 5 of 5</span>
                <h2 style={{ fontSize: '26px', margin: '4px 0 8px', letterSpacing: '-0.03em' }}>
                  Review and launch your store.
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Confirm your store configuration before publishing to the live server.
                </p>
              </div>

              {launchError && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <AlertCircle size={16} />
                  <span>{launchError}</span>
                </div>
              )}

              {launchSuccess && (
                <div style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '14px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <CheckCircle2 size={18} />
                  <span>Store published successfully! Opening your Owner Dashboard...</span>
                </div>
              )}

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                
                {/* Card 1: Business Details */}
                <div style={{
                  padding: '18px 20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Store size={14} color="#059669" /> Business Details
                    </strong>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{ background: 'none', border: 'none', color: '#059669', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><span style={{ color: '#64748B' }}>Store Name:</span> <strong>{formData.name}</strong></div>
                    <div><span style={{ color: '#64748B' }}>Owner:</span> {formData.ownerName}</div>
                    <div><span style={{ color: '#64748B' }}>Email:</span> {formData.email}</div>
                    <div><span style={{ color: '#64748B' }}>Phone:</span> {formData.phone}</div>
                    <div><span style={{ color: '#64748B' }}>Type:</span> {formData.businessType}</div>
                    <div><span style={{ color: '#64748B' }}>Address:</span> {formData.address}</div>
                    {formData.logoUrl && (
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#64748B' }}>Logo:</span>
                        <img src={formData.logoUrl} alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #CBD5E1' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Categories & Products */}
                <div style={{
                  padding: '18px 20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Package size={14} color="#0284C7" /> Catalog & Inventory
                    </strong>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      style={{ background: 'none', border: 'none', color: '#059669', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', marginBottom: '4px' }}>Categories:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {Array.from(new Set(formData.categories)).map((c, idx) => (
                          <span key={`${c}-${idx}`} style={{ padding: '2px 8px', backgroundColor: '#E2E8F0', borderRadius: '12px', fontSize: '10px', fontWeight: 600 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                      <span style={{ color: '#64748B' }}>Setup Method:</span>{' '}
                      <strong>
                        {formData.productsOption === 'sample' ? 'Auto-Generate Sample Products' : formData.productsOption === 'csv' ? `Imported CSV (${csvFile?.count || 0} items)` : 'Manual / Empty Catalog'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card 3: Theme Preset */}
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '18px 20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: activeThemeConfig.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}>
                      <Palette size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', textTransform: 'capitalize' }}>
                        Active Theme: {activeThemeConfig.name} ({formData.themePreset})
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {activeThemeConfig.type} • {activeThemeConfig.fontHeadline}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    style={{ background: 'none', border: 'none', color: '#059669', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Edit2 size={11} /> Change Theme
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Navigation Footer Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #E2E8F0',
          }}>
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="button button-light"
                  style={{ border: '1px solid #CBD5E1', fontSize: '12px' }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              {step === 1 && (
                <button
                  type="button"
                  onClick={() => setShowStep1SampleModal(true)}
                  style={{
                    padding: '9px 15px',
                    borderRadius: '6px',
                    border: '1px solid #10B981',
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <Package size={15} /> Add Sample Products
                </button>
              )}
              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="button button-green"
                  style={{ fontSize: '12px', padding: '12px 20px' }}
                >
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={isLaunching}
                  className="button button-green"
                  style={{
                    fontSize: '13px',
                    padding: '13px 26px',
                    fontWeight: 800,
                    cursor: isLaunching ? 'not-allowed' : 'pointer',
                    opacity: isLaunching ? 0.8 : 1,
                  }}
                >
                  {isLaunching ? 'Publishing Store to Live Server...' : 'Launch Store & Open Dashboard'}
                  <Rocket size={15} style={{ marginLeft: '6px' }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Step 1 Sample Product Import Modal */}
      <SampleProductImportModal
        isOpen={showStep1SampleModal}
        initialCategory={formData.businessType}
        onClose={() => setShowStep1SampleModal(false)}
        onConfirmImport={handleConfirmSampleProductsOnStep1}
      />
    </div>
  )
}

