import { ThemePresetId, StoreSectionId, StoreSection } from './types'
import { THEME_PRESETS } from './theme-presets'

export interface GenerateStoreInput {
  businessName: string
  businessCategory: string
  description?: string
  targetAudience?: string
  preferredTone?: string
  preferredTheme?: ThemePresetId
  brandColors?: {
    primary?: string
    accent?: string
  }
  location?: {
    isOnlineOnly?: boolean
    address?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    coordinates?: {
      latitude?: number
      longitude?: number
    }
    pickupAvailable?: boolean
    operatingHours?: string
  }
  delivery?: {
    serviceArea?: string
    shippingPolicy?: string
    estimatedShippingDays?: string
    freeShippingThreshold?: number
  }
  providedProducts?: Array<{
    title: string
    category?: string
    price?: number
    description?: string
  }>
  currency?: string
  language?: string
}

export interface GeneratedStoreLocation {
  isOnlineOnly: boolean
  formattedAddress?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  operatingHours?: string
  pickupAvailable?: boolean
  coordinates?: {
    latitude?: number
    longitude?: number
  }
}

export interface GeneratedDeliveryDetails {
  shippingPolicy?: string
  estimatedDelivery?: string
  serviceArea?: string
  freeShippingThreshold?: number
  deliveryMethods?: string[]
}

export interface GeneratedNavigationItem {
  label: string
  href: string
}

export interface GeneratedFeatureItem {
  title: string
  description: string
  icon?: string
}

export interface GeneratedSampleProductBlueprint {
  title: string
  subtitle: string
  category: string
  suggestedPrice: number
  description: string
  features: string[]
  tags: string[]
  isAiSample: true
}

export interface GeneratedStorePlan {
  storeName: string
  slugSuggestion: string
  tagline: string
  businessCategory: string
  description: string
  recommendedTheme: ThemePresetId
  themeSettings: {
    preset: ThemePresetId
    primaryColor: string
    accentColor: string
    bgColor: string
    surfaceColor: string
    fontHeadline: string
    fontBody: string
    heroHeadline: string
    heroHeadlineEm: string
    heroSubtitle: string
    heroCta: string
    heroImage: string
    announcement: string
    announcementEnabled: boolean
    footerText: string
  }
  navigation: GeneratedNavigationItem[]
  sections: StoreSection[]
  features: GeneratedFeatureItem[]
  categories: string[]
  sampleProductBlueprints: GeneratedSampleProductBlueprint[]
  location?: GeneratedStoreLocation
  delivery?: GeneratedDeliveryDetails
  meta: {
    generatedAt: string
    provider: 'gemini' | 'deterministic-fallback'
    modelUsed?: string
    disclaimer: string
  }
}

/**
 * Validate and sanitize incoming generation request payload.
 */
export function validateGenerateStoreInput(body: unknown): {
  isValid: boolean
  errors?: Record<string, string>
  sanitized?: GenerateStoreInput
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: { body: 'Request body must be a valid JSON object.' }
    }
  }

  const raw = body as Record<string, any>
  const errors: Record<string, string> = {}

  // 1. Business Name
  if (!raw.businessName || typeof raw.businessName !== 'string' || raw.businessName.trim().length < 2) {
    errors.businessName = 'Store/Business name must be at least 2 characters long.'
  } else if (raw.businessName.trim().length > 80) {
    errors.businessName = 'Store/Business name cannot exceed 80 characters.'
  }

  // 2. Business Category
  if (!raw.businessCategory || typeof raw.businessCategory !== 'string' || raw.businessCategory.trim().length < 2) {
    errors.businessCategory = 'Business category is required (at least 2 characters).'
  } else if (raw.businessCategory.trim().length > 60) {
    errors.businessCategory = 'Business category cannot exceed 60 characters.'
  }

  // 3. Optional string bounds
  if (raw.description && (typeof raw.description !== 'string' || raw.description.length > 1000)) {
    errors.description = 'Description cannot exceed 1000 characters.'
  }
  if (raw.targetAudience && (typeof raw.targetAudience !== 'string' || raw.targetAudience.length > 300)) {
    errors.targetAudience = 'Target audience cannot exceed 300 characters.'
  }
  if (raw.preferredTone && (typeof raw.preferredTone !== 'string' || raw.preferredTone.length > 100)) {
    errors.preferredTone = 'Preferred tone cannot exceed 100 characters.'
  }

  // 4. Preferred Theme
  const validThemes: ThemePresetId[] = ['atelier', 'market', 'forma', 'circuit']
  if (raw.preferredTheme && !validThemes.includes(raw.preferredTheme)) {
    errors.preferredTheme = `Preferred theme must be one of: ${validThemes.join(', ')}`
  }

  // 5. Provided Products size check
  if (raw.providedProducts && (!Array.isArray(raw.providedProducts) || raw.providedProducts.length > 30)) {
    errors.providedProducts = 'Provided products must be an array of at most 30 items.'
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors }
  }

  const sanitized: GenerateStoreInput = {
    businessName: sanitizeText(raw.businessName.trim()),
    businessCategory: sanitizeText(raw.businessCategory.trim()),
    description: raw.description ? sanitizeText(raw.description.trim()) : undefined,
    targetAudience: raw.targetAudience ? sanitizeText(raw.targetAudience.trim()) : undefined,
    preferredTone: raw.preferredTone ? sanitizeText(raw.preferredTone.trim()) : undefined,
    preferredTheme: raw.preferredTheme as ThemePresetId | undefined,
    brandColors: raw.brandColors && typeof raw.brandColors === 'object' ? {
      primary: sanitizeColor(raw.brandColors.primary),
      accent: sanitizeColor(raw.brandColors.accent)
    } : undefined,
    location: raw.location && typeof raw.location === 'object' ? {
      isOnlineOnly: Boolean(raw.location.isOnlineOnly),
      address: raw.location.address ? sanitizeText(String(raw.location.address).slice(0, 200)) : undefined,
      city: raw.location.city ? sanitizeText(String(raw.location.city).slice(0, 100)) : undefined,
      state: raw.location.state ? sanitizeText(String(raw.location.state).slice(0, 100)) : undefined,
      postalCode: raw.location.postalCode ? sanitizeText(String(raw.location.postalCode).slice(0, 30)) : undefined,
      country: raw.location.country ? sanitizeText(String(raw.location.country).slice(0, 100)) : undefined,
      operatingHours: raw.location.operatingHours ? sanitizeText(String(raw.location.operatingHours).slice(0, 200)) : undefined,
      pickupAvailable: Boolean(raw.location.pickupAvailable),
      coordinates: raw.location.coordinates && typeof raw.location.coordinates === 'object' ? {
        latitude: typeof raw.location.coordinates.latitude === 'number' ? raw.location.coordinates.latitude : undefined,
        longitude: typeof raw.location.coordinates.longitude === 'number' ? raw.location.coordinates.longitude : undefined
      } : undefined
    } : undefined,
    delivery: raw.delivery && typeof raw.delivery === 'object' ? {
      serviceArea: raw.delivery.serviceArea ? sanitizeText(String(raw.delivery.serviceArea).slice(0, 200)) : undefined,
      shippingPolicy: raw.delivery.shippingPolicy ? sanitizeText(String(raw.delivery.shippingPolicy).slice(0, 500)) : undefined,
      estimatedShippingDays: raw.delivery.estimatedShippingDays ? sanitizeText(String(raw.delivery.estimatedShippingDays).slice(0, 100)) : undefined,
      freeShippingThreshold: typeof raw.delivery.freeShippingThreshold === 'number' ? Math.max(0, raw.delivery.freeShippingThreshold) : undefined
    } : undefined,
    providedProducts: Array.isArray(raw.providedProducts) ? raw.providedProducts.slice(0, 30).map((p: any) => ({
      title: sanitizeText(String(p.title || p.name || 'Product').slice(0, 100)),
      category: p.category ? sanitizeText(String(p.category).slice(0, 50)) : undefined,
      price: typeof p.price === 'number' ? Math.max(0, p.price) : undefined,
      description: p.description ? sanitizeText(String(p.description).slice(0, 500)) : undefined
    })) : undefined,
    currency: raw.currency ? sanitizeText(String(raw.currency).slice(0, 10)) : 'USD',
    language: raw.language ? sanitizeText(String(raw.language).slice(0, 10)) : 'en'
  }

  return { isValid: true, sanitized }
}

/**
 * Sanitize text to prevent executable code injection and script tags.
 */
function sanitizeText(str: string): string {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

/**
 * Sanitize color hex strings.
 */
function sanitizeColor(val: unknown): string | undefined {
  if (!val || typeof val !== 'string') return undefined
  const cleaned = val.trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleaned)) {
    return cleaned
  }
  return undefined
}

/**
 * Generate a unique slug suggestion from a store name.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'store'
}

/**
 * Map business category to the best fitting StoreCraft theme preset.
 */
function recommendThemeForCategory(category: string, preferred?: ThemePresetId): ThemePresetId {
  if (preferred && ['atelier', 'market', 'forma', 'circuit'].includes(preferred)) {
    return preferred
  }

  const cat = category.toLowerCase()
  if (cat.includes('fashion') || cat.includes('apparel') || cat.includes('luxury') || cat.includes('jewelry') || cat.includes('beauty')) {
    return 'atelier'
  }
  if (cat.includes('food') || cat.includes('beverage') || cat.includes('grocery') || cat.includes('organic') || cat.includes('market') || cat.includes('bakery')) {
    return 'market'
  }
  if (cat.includes('tech') || cat.includes('electronic') || cat.includes('hardware') || cat.includes('audio') || cat.includes('gear') || cat.includes('sport')) {
    return 'circuit'
  }
  // Default to Forma (minimal, design-focused, home & lifestyle)
  return 'forma'
}

/**
 * Default section layout configuration.
 */
function getDefaultSections(): StoreSection[] {
  return [
    { id: 'announcement', name: 'Announcement Bar', enabled: true },
    { id: 'hero', name: 'Hero Banner', enabled: true },
    { id: 'categories', name: 'Categories', enabled: true },
    { id: 'catalog', name: 'Product Catalog', enabled: true },
    { id: 'features', name: 'Store Features', enabled: true },
    { id: 'footer', name: 'Footer', enabled: true }
  ]
}

/**
 * Call Gemini REST API securely on the server with candidate models and timeout.
 */
async function callGeminiApi(apiKey: string, prompt: string): Promise<{ text: string; modelUsed: string }> {
  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash'
  ].filter(Boolean) as string[]

  let lastError: Error | null = null

  for (const model of candidateModels) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s timeout

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.95,
            maxOutputTokens: 3000,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const status = res.status
        const errorText = await res.text().catch(() => '')

        // If model not found (404), fall through to next candidate model
        if (status === 404 && candidateModels.length > 1) {
          lastError = new Error(`Model ${model} returned 404`)
          continue
        }

        let cleanError = `Gemini API returned status ${status}`
        try {
          const parsed = JSON.parse(errorText)
          if (parsed.error?.message) {
            cleanError = parsed.error.message.replace(apiKey, '[REDACTED]')
          }
        } catch {}

        throw new Error(cleanError)
      }

      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text || typeof text !== 'string') {
        throw new Error('Gemini API returned an empty or malformed candidates response.')
      }

      return { text, modelUsed: model }
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        throw new Error('AI generation request timed out after 20 seconds.')
      }
      lastError = err
      if (!err.message?.includes('404')) {
        throw err
      }
    }
  }

  throw lastError || new Error('All candidate Gemini models failed.')
}

/**
 * Validate and normalize Gemini's raw output against StoreCraft plan schema.
 */
function normalizeAndValidatePlan(raw: any, input: GenerateStoreInput, modelUsed?: string): GeneratedStorePlan {
  const chosenTheme = recommendThemeForCategory(input.businessCategory, input.preferredTheme || raw.recommendedTheme)
  const baseTheme = THEME_PRESETS[chosenTheme]
  const slug = generateSlug(input.businessName || raw.storeName || 'store')

  // Theme settings normalization
  const rawTheme = raw.themeSettings || {}
  const themeSettings = {
    preset: chosenTheme,
    primaryColor: input.brandColors?.primary || sanitizeColor(rawTheme.primaryColor) || baseTheme.ink,
    accentColor: input.brandColors?.accent || sanitizeColor(rawTheme.accentColor) || baseTheme.accent,
    bgColor: sanitizeColor(rawTheme.bgColor) || baseTheme.bg,
    surfaceColor: sanitizeColor(rawTheme.surfaceColor) || baseTheme.surface,
    fontHeadline: sanitizeText(rawTheme.fontHeadline) || baseTheme.fontHeadline,
    fontBody: sanitizeText(rawTheme.fontBody) || baseTheme.fontBody,
    heroHeadline: sanitizeText(rawTheme.heroHeadline) || `${input.businessName} — Crafted with Intent`,
    heroHeadlineEm: sanitizeText(rawTheme.heroHeadlineEm) || 'Distinctly Yours.',
    heroSubtitle: sanitizeText(rawTheme.heroSubtitle) || input.description || baseTheme.heroSubtitle,
    heroCta: sanitizeText(rawTheme.heroCta) || baseTheme.heroCta,
    heroImage: (typeof rawTheme.heroImage === 'string' && rawTheme.heroImage.startsWith('https://'))
      ? rawTheme.heroImage
      : baseTheme.heroImage,
    announcement: sanitizeText(rawTheme.announcement) || 'Welcome to our newly designed online boutique.',
    announcementEnabled: rawTheme.announcementEnabled !== false,
    footerText: sanitizeText(rawTheme.footerText) || `© ${new Date().getFullYear()} ${input.businessName}. All rights reserved.`
  }

  // Navigation
  const defaultNav: GeneratedNavigationItem[] = [
    { label: 'Collection', href: '#catalog' },
    { label: 'About', href: '#features' },
    { label: 'Contact', href: '#footer' }
  ]
  const navigation = Array.isArray(raw.navigation) && raw.navigation.length > 0
    ? raw.navigation.slice(0, 6).map((item: any) => ({
        label: sanitizeText(String(item.label || 'Link').slice(0, 30)),
        href: sanitizeText(String(item.href || '#').slice(0, 50))
      }))
    : defaultNav

  // Features
  const defaultFeatures: GeneratedFeatureItem[] = [
    { title: 'Quality Assurance', description: 'Every product is curated and verified for superior standards.' },
    { title: 'Local Reliability', description: 'Dedicated customer support and transparent fulfillment.' },
    { title: 'Seamless Checkout', description: 'Fast, secure, and intuitive shopping experience.' }
  ]
  const features = Array.isArray(raw.features) && raw.features.length > 0
    ? raw.features.slice(0, 4).map((f: any) => ({
        title: sanitizeText(String(f.title || 'Feature').slice(0, 50)),
        description: sanitizeText(String(f.description || '').slice(0, 150))
      }))
    : defaultFeatures

  // Categories
  const categories: string[] = Array.isArray(raw.categories) && raw.categories.length > 0
    ? raw.categories.slice(0, 8).map((c: any) => sanitizeText(String(c).slice(0, 40))).filter(Boolean)
    : ['Featured', input.businessCategory]

  // Sample Product Blueprints (Always strictly marked with isAiSample: true)
  const sampleProductBlueprints: GeneratedSampleProductBlueprint[] = []

  if (Array.isArray(raw.sampleProductBlueprints) && raw.sampleProductBlueprints.length > 0) {
    for (const p of raw.sampleProductBlueprints.slice(0, 6)) {
      if (p && typeof p === 'object' && p.title) {
        sampleProductBlueprints.push({
          title: sanitizeText(String(p.title).slice(0, 100)),
          subtitle: sanitizeText(String(p.subtitle || p.category || input.businessCategory).slice(0, 100)),
          category: sanitizeText(String(p.category || categories[0] || 'General').slice(0, 50)),
          suggestedPrice: typeof p.suggestedPrice === 'number' && p.suggestedPrice >= 0 ? Math.round(p.suggestedPrice * 100) / 100 : 35.00,
          description: sanitizeText(String(p.description || 'Artisan demonstration item ready for preview.').slice(0, 300)),
          features: Array.isArray(p.features)
            ? p.features.slice(0, 4).map((feat: any) => sanitizeText(String(feat).slice(0, 80)))
            : ['Curated design specification', 'Quality checked'],
          tags: Array.isArray(p.tags)
            ? p.tags.slice(0, 5).map((t: any) => sanitizeText(String(t).slice(0, 30)))
            : [input.businessCategory],
          isAiSample: true
        })
      }
    }
  }

  // Location details
  let location: GeneratedStoreLocation | undefined
  if (input.location) {
    const isOnline = Boolean(input.location.isOnlineOnly)
    const formatted = isOnline ? undefined : (
      input.location.address ? `${input.location.address}${input.location.city ? `, ${input.location.city}` : ''}` : undefined
    )
    location = {
      isOnlineOnly: isOnline,
      formattedAddress: formatted,
      city: input.location.city,
      state: input.location.state,
      postalCode: input.location.postalCode,
      country: input.location.country,
      operatingHours: input.location.operatingHours || (isOnline ? 'Open 24/7 Online' : 'Mon - Sat: 10:00 AM - 7:00 PM'),
      pickupAvailable: Boolean(input.location.pickupAvailable),
      coordinates: input.location.coordinates
    }
  }

  // Delivery details
  let delivery: GeneratedDeliveryDetails | undefined
  if (input.delivery || raw.delivery) {
    const rawDel = raw.delivery || {}
    delivery = {
      shippingPolicy: sanitizeText(input.delivery?.shippingPolicy || rawDel.shippingPolicy || 'Standard tracked shipping on all qualifying orders.'),
      estimatedDelivery: sanitizeText(input.delivery?.estimatedShippingDays || rawDel.estimatedDelivery || '3 - 5 business days'),
      serviceArea: sanitizeText(input.delivery?.serviceArea || rawDel.serviceArea || 'Regional & National Coverage'),
      freeShippingThreshold: input.delivery?.freeShippingThreshold ?? rawDel.freeShippingThreshold ?? 75,
      deliveryMethods: Array.isArray(rawDel.deliveryMethods)
        ? rawDel.deliveryMethods.slice(0, 3).map((m: any) => sanitizeText(String(m).slice(0, 40)))
        : ['Standard Shipping', 'Express Courier']
    }
  }

  return {
    storeName: input.businessName,
    slugSuggestion: slug,
    tagline: sanitizeText(raw.tagline || `${input.businessName} — Handcrafted ${input.businessCategory}`),
    businessCategory: input.businessCategory,
    description: sanitizeText(raw.description || input.description || `Welcome to ${input.businessName}, offering fine ${input.businessCategory}.`),
    recommendedTheme: chosenTheme,
    themeSettings,
    navigation,
    sections: getDefaultSections(),
    features,
    categories,
    sampleProductBlueprints,
    location,
    delivery,
    meta: {
      generatedAt: new Date().toISOString(),
      provider: modelUsed ? 'gemini' : 'deterministic-fallback',
      modelUsed,
      disclaimer: 'Generated store architecture blueprint. Sample product items are illustrative and not verified inventory.'
    }
  }
}

/**
 * Generate a complete store plan using Google Gemini.
 */
export async function generateStorePlan(input: GenerateStoreInput, apiKey: string): Promise<GeneratedStorePlan> {
  const chosenTheme = recommendThemeForCategory(input.businessCategory, input.preferredTheme)

  const prompt = `You are StoreCraft's AI E-Commerce Architecture Generator.
Generate a structured, elegant website plan for the following merchant.

MERCHANT DETAILS:
- Store Name: "${input.businessName}"
- Category: "${input.businessCategory}"
- Description: "${input.description || 'N/A'}"
- Target Audience: "${input.targetAudience || 'Discerning customers'}"
- Preferred Tone: "${input.preferredTone || 'Curated, warm, professional'}"
- Store Type: ${input.location?.isOnlineOnly ? 'Online-only boutique' : 'Physical retail & online storefront'}
${input.location?.city ? `- Location: ${input.location.city}, ${input.location.state || ''} ${input.location.country || ''}` : ''}
${input.delivery?.serviceArea ? `- Delivery Coverage: ${input.delivery.serviceArea}` : ''}

STORECRAFT THEMES (Select the most appropriate):
1. "atelier": Editorial fashion, luxury goods, couture, fine jewelry
2. "market": Local provisions, farmstead, food & beverage, artisanal groceries
3. "forma": Scandinavian design, furniture, homeware, ceramics, lighting
4. "circuit": Technology, electronics, audio, gaming, workstation gear

RULES:
1. Output MUST be ONLY valid JSON matching the schema below.
2. Never output executable JavaScript, HTML <script> tags, or markdown.
3. Suggest 3 to 4 sample product blueprints matching the category. Mark each with "isAiSample": true.
4. Do NOT invent verified physical claims, fake awards, or certified inventory facts.
5. Provide high-converting brand copy: heroHeadline, heroHeadlineEm, heroSubtitle, heroCta, announcement.

OUTPUT JSON SCHEMA:
{
  "storeName": "string",
  "tagline": "string",
  "description": "string",
  "recommendedTheme": "${chosenTheme}",
  "themeSettings": {
    "preset": "${chosenTheme}",
    "primaryColor": "hex string",
    "accentColor": "hex string",
    "bgColor": "hex string",
    "surfaceColor": "hex string",
    "fontHeadline": "string",
    "fontBody": "string",
    "heroHeadline": "string",
    "heroHeadlineEm": "string",
    "heroSubtitle": "string",
    "heroCta": "string",
    "heroImage": "valid https image url",
    "announcement": "string",
    "announcementEnabled": true,
    "footerText": "string"
  },
  "navigation": [
    { "label": "string", "href": "string" }
  ],
  "features": [
    { "title": "string", "description": "string" }
  ],
  "categories": ["string"],
  "sampleProductBlueprints": [
    {
      "title": "string",
      "subtitle": "string",
      "category": "string",
      "suggestedPrice": 0,
      "description": "string",
      "features": ["string"],
      "tags": ["string"],
      "isAiSample": true
    }
  ],
  "delivery": {
    "shippingPolicy": "string",
    "estimatedDelivery": "string",
    "serviceArea": "string",
    "freeShippingThreshold": 0,
    "deliveryMethods": ["string"]
  }
}`

  const { text, modelUsed } = await callGeminiApi(apiKey, prompt)

  let parsed: any
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    parsed = JSON.parse(cleaned)
  } catch (err) {
    throw new Error('Failed to parse Gemini response as JSON.')
  }

  return normalizeAndValidatePlan(parsed, input, modelUsed)
}

/**
 * Deterministic offline fallback generator when AI API key is unconfigured.
 */
export function generateDeterministicStorePlan(input: GenerateStoreInput): GeneratedStorePlan {
  const chosenTheme = recommendThemeForCategory(input.businessCategory, input.preferredTheme)
  const baseTheme = THEME_PRESETS[chosenTheme]

  const sampleProducts: GeneratedSampleProductBlueprint[] = [
    {
      title: `${input.businessName} Signature Edition`,
      subtitle: `Handcrafted ${input.businessCategory}`,
      category: input.businessCategory,
      suggestedPrice: 89.00,
      description: `Signature artisan edition designed with premium sustainable materials and timeless styling.`,
      features: ['Handcrafted studio standard', 'Quality inspected prior to fulfillment'],
      tags: [input.businessCategory, 'Signature'],
      isAiSample: true
    },
    {
      title: 'Studio Reserve Piece',
      subtitle: 'Limited batch release',
      category: input.businessCategory,
      suggestedPrice: 125.00,
      description: `Small-batch release focusing on tactile finishes, enduring craftsmanship, and daily utility.`,
      features: ['Limited production batch', 'Numbered packaging'],
      tags: [input.businessCategory, 'Reserve'],
      isAiSample: true
    },
    {
      title: 'Essential Daily Collection',
      subtitle: 'Everyday lifestyle staple',
      category: input.businessCategory,
      suggestedPrice: 42.00,
      description: `Thoughtfully engineered for seamless daily routines with durable, easy-to-care-for elements.`,
      features: ['Ergonomic build', 'Backed by 1-year warranty'],
      tags: [input.businessCategory, 'Essentials'],
      isAiSample: true
    }
  ]

  const mockRaw = {
    storeName: input.businessName,
    tagline: `${input.businessName} — Thoughtful ${input.businessCategory}`,
    description: input.description || `Welcome to ${input.businessName}, your destination for curated ${input.businessCategory}.`,
    recommendedTheme: chosenTheme,
    themeSettings: {
      preset: chosenTheme,
      primaryColor: input.brandColors?.primary || baseTheme.ink,
      accentColor: input.brandColors?.accent || baseTheme.accent,
      bgColor: baseTheme.bg,
      surfaceColor: baseTheme.surface,
      fontHeadline: baseTheme.fontHeadline,
      fontBody: baseTheme.fontBody,
      heroHeadline: `${input.businessName} — Objects with`,
      heroHeadlineEm: 'Intentional Clarity.',
      heroSubtitle: input.description || baseTheme.heroSubtitle,
      heroCta: 'Explore Collection',
      heroImage: baseTheme.heroImage,
      announcement: input.delivery?.freeShippingThreshold
        ? `Complimentary delivery on orders over $${input.delivery.freeShippingThreshold}`
        : 'Welcome to our newly curated digital storefront.',
      announcementEnabled: true,
      footerText: `© ${new Date().getFullYear()} ${input.businessName}. Designed with StoreCraft.`
    },
    categories: ['All', input.businessCategory, 'Featured'],
    sampleProductBlueprints: sampleProducts,
    delivery: {
      shippingPolicy: input.delivery?.shippingPolicy || 'Fast, reliable tracked delivery directly to your door.',
      estimatedDelivery: input.delivery?.estimatedShippingDays || '3 - 5 business days',
      serviceArea: input.delivery?.serviceArea || 'Standard Regional Delivery',
      freeShippingThreshold: input.delivery?.freeShippingThreshold || 75,
      deliveryMethods: ['Standard Ground', 'Local Express']
    }
  }

  return normalizeAndValidatePlan(mockRaw, input, undefined)
}
