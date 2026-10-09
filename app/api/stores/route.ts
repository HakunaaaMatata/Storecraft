import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createStore, slugExists } from '@/lib/db'
import { THEME_PRESETS } from '@/lib/theme-presets'
import { Product, Store, ThemePresetId } from '@/lib/types'

// Realistic product generators per category
const SAMPLE_CATEGORY_CATALOG: Record<string, { title: string; subtitle: string; price: number; inventory: number; desc: string; img: string }[]> = {
  'Fashion & Apparel': [
    { title: 'Tailored Wool Overcoat', subtitle: 'Italian Melton wool with storm flap', price: 340, inventory: 8, desc: 'Structured heavy-weight wool coat cut with modern proportions.', img: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80' },
    { title: 'Organic Cotton Oxford Shirt', subtitle: 'Garment-washed relaxed fit', price: 88, inventory: 4, desc: 'Heavyweight organic cotton oxford cloth with mother of pearl buttons.', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80' },
    { title: 'Selvedge Denim Trouser', subtitle: '14oz raw Japanese indigo', price: 165, inventory: 15, desc: 'Vintage shuttle loom denim with custom copper hardware.', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' },
  ],
  'Technology & Electronics': [
    { title: 'Acoustic Studio Monitors', subtitle: 'Precision tuned balanced armature', price: 290, inventory: 6, desc: 'Flat frequency response desktop monitors engineered for sound design.', img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80' },
    { title: 'Mechanical Wireless Keyboard', subtitle: 'CNC aluminum chassis with hot-swap switches', price: 175, inventory: 3, desc: 'Tactile low-profile mechanical keyboard with multi-device Bluetooth.', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
    { title: 'Fast GaN Desktop Charger', subtitle: '140W triple USB-C power delivery', price: 68, inventory: 22, desc: 'Compact gallium nitride charging hub for high-demand workstations.', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80' },
  ],
  'Beauty & Wellness': [
    { title: 'Botanical Barrier Cream', subtitle: 'Cold-pressed squalane and ceramides', price: 54, inventory: 12, desc: 'Deeply nourishing facial moisturizer that restores protective skin lipid barrier.', img: 'https://images.unsplash.com/photo-1608248597359-21626f2964a7?auto=format&fit=crop&w=800&q=80' },
    { title: 'Antioxidant Glow Serum', subtitle: '15% stabilized Vitamin C with Ferulic acid', price: 68, inventory: 4, desc: 'Brightening daily serum targeting hyperpigmentation and sun damage.', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80' },
  ],
  'Home & Living': [
    { title: 'Forma Desk Lamp', subtitle: 'Cast aluminum adjustable task light', price: 148, inventory: 14, desc: 'Cast aluminum task light with balanced counterweight pivot and touch dimming.', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80' },
    { title: 'Hand-thrown Ceramic Mug', subtitle: 'Raw volcanic clay with satin interior', price: 34, inventory: 4, desc: 'Studio handcrafted stoneware mug made in small kiln batches.', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
    { title: 'Heavy Woven Linen Throw', subtitle: '100% Normandy flax washed linen', price: 120, inventory: 9, desc: 'Textured soft linen blanket that grows softer with every wash.', img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80' },
  ],
  'Food & Beverages': [
    { title: 'Single-Origin Ethiopian Coffee', subtitle: 'Heirloom washed roast with citrus notes', price: 22, inventory: 25, desc: 'Specialty whole bean coffee sourced directly from Yirgacheffe cooperative.', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80' },
    { title: 'Cold-Pressed Olive Oil', subtitle: 'Koroneiki early harvest extra virgin', price: 36, inventory: 5, desc: 'Single estate unfiltered olive oil with high polyphenol antioxidant count.', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' },
  ],
  'Sports & Fitness': [
    { title: 'Natural Rubber Yoga Mat', subtitle: '5mm high density grip surface', price: 78, inventory: 11, desc: 'Biodegradable natural tree rubber mat with alignment markings.', img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80' },
    { title: 'Insulated Steel Hydration Flask', subtitle: 'Vacuum insulated 32oz canteen', price: 38, inventory: 2, desc: 'Keeps liquids iced for 24 hours without metallic aftertaste.', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' },
  ],
  'Books & Stationery': [
    { title: 'Hardcover Grid Notebook', subtitle: '120gsm fountain pen friendly paper', price: 28, inventory: 18, desc: 'Smyth-sewn layflat binding with durable linen bookcloth cover.', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
    { title: 'Solid Brass Rollerball Pen', subtitle: 'Weighted balanced writing instrument', price: 62, inventory: 4, desc: 'Precision machined raw brass pen that develops a unique patina over time.', img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80' },
  ],
  'Artisanal & Crafts': [
    { title: 'Handwoven Tapestry Wall Hanging', subtitle: 'Natural wool and driftwood', price: 145, inventory: 3, desc: 'Unique handwoven textile art piece made with locally sourced materials.', img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80' },
  ],
  'General Retail': [
    { title: 'Minimalist Daily Tote', subtitle: 'Heavyweight organic canvas', price: 45, inventory: 30, desc: 'Durable everyday carry bag with reinforced stitching and interior pockets.', img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80' },
  ],
  Other: [
    { title: 'Artisanal Studio Candle', subtitle: 'Coconut wax with amber and cedarwood', price: 32, inventory: 15, desc: 'Hand-poured candle in reusable amber apothecary glass vessel.', img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80' },
  ],
}

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
    while (slugExists(finalSlug)) {
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
      announcement: themeConfig.heroBadge || 'Complimentary worldwide shipping on inaugural orders',
      preset: selectedPreset,
      categories: ['All', ...cleanedCategories],
      heroHeadline: themeConfig.heroHeadline,
      heroHeadlineEm: themeConfig.heroHeadlineEm,
      heroSubtitle: description?.trim() || themeConfig.heroSubtitle,
      heroImage: themeConfig.heroImage,
      products: generatedProducts,
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
    const res = createStore(newStore)
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error || 'Failed to save store' }, { status: 409 })
    }

    return NextResponse.json({
      success: true,
      store: newStore,
      slug: finalSlug,
      id: storeId,
      message: 'Store created successfully!',
    }, { status: 201 })
  } catch (error) {
    console.error('[API] Create store error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
