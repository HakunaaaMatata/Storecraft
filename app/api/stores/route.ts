import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createStore, slugExists } from '@/lib/db'
import { THEME_PRESETS } from '@/lib/theme-presets'
import { Product, Store, ThemePresetId } from '@/lib/types'
import { SAMPLE_CATEGORY_CATALOG } from '@/lib/seed-data'

export async function POST(request: Request) {
  try {
    // 1. Check Authentication
    const sessionData = await getSessionUser()
    if (!sessionData) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please sign in or register before launching a store.'
      }, { status: 401 })
    }
    const { user } = sessionData

    // 2. Parse & Validate Payload
    const body = await request.json()
    const {
      name,
      logoUrl,
      ownerName,
      email,
      phone,
      address,
      businessType,
      description,
      categories,
      productsOption,
      importedProducts,
      themePreset,
      themeSettings,
    } = body

    const errors: Record<string, string> = {}

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Store name must be at least 2 characters.'
    } else if (name.trim().length > 60) {
      errors.name = 'Store name cannot exceed 60 characters.'
    }

    if (!ownerName || typeof ownerName !== 'string' || ownerName.trim().length < 2) {
      errors.ownerName = 'Owner name must be at least 2 characters.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid contact email.'
    }

    const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/
    if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone.trim())) {
      errors.phone = 'Please provide a valid contact phone number (at least 7 digits).'
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      errors.address = 'Business address must be at least 5 characters.'
    }

    if (!businessType || typeof businessType !== 'string') {
      errors.businessType = 'Please select a business type.'
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      errors.categories = 'Please select or add at least one category.'
    }

    const validPresets: ThemePresetId[] = ['atelier', 'market', 'forma', 'circuit']
    const selectedPreset: ThemePresetId = validPresets.includes(themePreset) ? themePreset : 'forma'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    // Deduplicate and clean categories
    const cleanedCategories: string[] = Array.from(new Set(
      categories
        .filter((c: unknown): c is string => typeof c === 'string' && c.trim().length > 0)
        .map((c: string) => c.trim())
    ))

    if (cleanedCategories.length === 0) {
      cleanedCategories.push('General')
    }

    // 3. Generate unique, collision-free slug
    let baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    if (!baseSlug) baseSlug = 'store'

    let finalSlug = baseSlug
    let counter = 1
    while (await slugExists(finalSlug)) {
      counter += 1
      finalSlug = `${baseSlug}-${counter}`
    }

    // 4. Generate stable store ID
    const storeId = `store-${finalSlug}-${Date.now().toString(36)}`

    // 5. Generate Products
    let generatedProducts: Product[] = []

    if (productsOption === 'sample') {
      // Pick products based on businessType
      let prodCounter = 1
      const catalogMap = SAMPLE_CATEGORY_CATALOG as Record<string, typeof SAMPLE_CATEGORY_CATALOG['Other']>
      
      let templates = catalogMap[businessType]
      if (!templates || templates.length === 0) {
        templates = catalogMap['General Retail'] || catalogMap['Other']
      }

      for (const t of templates) {
        // Distribute the products evenly across the user's chosen categories
        const cat = cleanedCategories[(prodCounter - 1) % cleanedCategories.length] || 'General'
        
        generatedProducts.push({
          id: `${finalSlug}-p${prodCounter}`,
          sku: `SKU-${finalSlug.substring(0, 3).toUpperCase()}-${100 + prodCounter}`,
          title: t.title,
          subtitle: t.subtitle,
          category: cat,
          price: t.price,
          compareAtPrice: Math.round(t.price * 1.2),
          inventory: t.inventory,
          lowStockThreshold: 5,
          description: t.desc,
          features: [
            'Original studio design specification',
            'Sustainably verified materials',
            'Quality checked prior to fulfillment',
          ],
          images: [t.img],
          variants: {
            colors: [{ name: 'Default', hex: '#101828' }],
          },
        })
        prodCounter += 1
      }
    } else if (productsOption === 'csv' && Array.isArray(importedProducts) && importedProducts.length > 0) {
      generatedProducts = importedProducts.map((p, idx) => ({
        id: `${finalSlug}-p${idx + 1}`,
        sku: p.sku || `SKU-${finalSlug.substring(0, 3).toUpperCase()}-${100 + idx + 1}`,
        title: p.title || p.name || `Imported Item ${idx + 1}`,
        subtitle: p.subtitle || p.category || 'Imported product catalog',
        category: p.category || cleanedCategories[0] || 'General',
        price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 25,
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
        inventory: typeof p.inventory === 'number' ? p.inventory : (p.stock ? Number(p.stock) : 10),
        lowStockThreshold: 5,
        description: p.description || 'Imported catalog item ready for display.',
        features: p.features || ['Imported via catalog setup'],
        images: p.images?.length > 0 ? p.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        variants: p.variants || {},
      }))
    }

    const themeConfig = THEME_PRESETS[selectedPreset]

    // 6. Assemble Store
    const newStore: Store = {
      id: storeId,
      slug: finalSlug,
      name: name.trim(),
      tagline: description?.trim() || `${name.trim()} — Curated ${businessType}`,
      announcement: themeSettings?.announcement || themeConfig.heroBadge || 'Complimentary worldwide shipping on inaugural orders',
      preset: selectedPreset,
      categories: ['All', ...cleanedCategories],
      heroHeadline: themeSettings?.heroHeadline || themeConfig.heroHeadline,
      heroHeadlineEm: themeSettings?.heroHeadlineEm || themeConfig.heroHeadlineEm,
      heroSubtitle: themeSettings?.heroSubtitle || description?.trim() || themeConfig.heroSubtitle,
      heroImage: themeSettings?.heroImage || themeConfig.heroImage,
      products: generatedProducts,
      themeSettings: themeSettings,
      // Metadata
      ownerId: user.id,
      ownerName: ownerName.trim(),
      ownerEmail: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      businessType,
      description: description?.trim() || '',
      logoUrl: logoUrl || undefined,
      createdAt: new Date().toISOString(),
    }

    // 7. Persist to DB
    const res = await createStore(newStore)
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error || 'Failed to save store' }, { status: 409 })
    }

    const response = NextResponse.json({
      success: true,
      store: newStore,
      slug: finalSlug,
      id: storeId,
      message: 'Store created successfully!',
    }, { status: 201 })

    // Vercel Serverless Hack: Save to cookie so the next stateless request can recreate the demo store
    response.cookies.set('demo_business_type', businessType, { path: '/' })
    response.cookies.set('demo_store_theme', selectedPreset, { path: '/' })
    response.cookies.set('demo_store_name', name.trim(), { path: '/' })

    return response
  } catch (error) {
    console.error('[API] Create store error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
