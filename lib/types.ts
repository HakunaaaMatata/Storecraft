export type ThemePresetId = 'atelier' | 'market' | 'forma' | 'circuit'

export interface ThemeConfig {
  id: ThemePresetId
  name: string
  type: string
  fontHeadline: string
  fontBody: string
  bg: string
  surface: string
  surfaceSubtle: string
  border: string
  ink: string
  inkMuted: string
  accent: string
  accentHover: string
  accentForeground: string
  announcementBg: string
  announcementInk: string
  badgeBg: string
  badgeInk: string
  heroImage: string
  heroBadge: string
  heroHeadline: string
  heroHeadlineEm: string
  heroSubtitle: string
  heroCta: string
  cardRadius: string
  buttonRadius: string
  tagStyle: string
  headerVariant: 'centered' | 'full' | 'minimal' | 'bordered'
  productCardVariant: 'editorial' | 'compact' | 'minimal' | 'glass'
  heroLayout: 'split' | 'banner' | 'immersive'
  containerWidth: 'max-w-6xl' | 'max-w-7xl' | 'max-w-screen-2xl'
  buttonStyle: 'sharp' | 'pill' | 'rounded' | 'outline'
  priceStyle: 'serif-italic' | 'bold-emerald' | 'mono' | 'classic'
  badgeStyle: 'pill' | 'square' | 'subtle' | 'glow'
  footerStyle: 'editorial' | 'grid' | 'clean' | 'dark'
}

export type StoreSectionId = 'announcement' | 'hero' | 'categories' | 'catalog' | 'features' | 'footer'

export interface StoreSection {
  id: StoreSectionId
  name: string
  enabled: boolean
}

export interface CustomThemeSettings {
  preset: ThemePresetId
  primaryColor?: string
  accentColor?: string
  bgColor?: string
  surfaceColor?: string
  fontHeadline?: string
  fontBody?: string
  logoUrl?: string
  heroImage?: string
  heroHeadline?: string
  heroHeadlineEm?: string
  heroSubtitle?: string
  heroCta?: string
  announcement?: string
  announcementEnabled?: boolean
  footerText?: string
  contactEmail?: string
  sections?: StoreSection[]
  updatedAt?: string
}

export interface ProductVariant {
  sizes?: string[]
  colors?: { name: string; hex: string }[]
  finishes?: string[]
}

export interface Product {
  id: string
  sku: string
  title: string
  name?: string
  subtitle: string
  category: string
  price: number
  compareAtPrice?: number
  inventory: number
  lowStockThreshold: number
  description: string
  features: string[]
  images: string[]
  variants: ProductVariant
  status?: 'draft' | 'published'
}

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  salt: string
  createdAt: string
}

export interface Session {
  token: string
  userId: string
  expiresAt: string
  createdAt: string
}

export interface Store {
  id: string
  slug: string
  name: string
  tagline: string
  announcement: string
  preset: ThemePresetId
  categories: string[]
  heroHeadline: string
  heroHeadlineEm: string
  heroSubtitle: string
  heroImage: string
  logoUrl?: string
  contactEmail?: string
  footerText?: string
  sections?: StoreSection[]
  themeSettings?: CustomThemeSettings
  draftThemeSettings?: CustomThemeSettings
  products: Product[]
  ownerId?: string
  ownerName?: string
  ownerEmail?: string
  phone?: string
  address?: string
  businessType?: string
  description?: string
  createdAt?: string
}


export interface CartItem {
  id: string
  productId: string
  sku: string
  title: string
  price: number
  image: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
  selectedFinish?: string
  maxInventory: number
}

export interface ShippingAddress {
  fullName: string
  email: string
  phone?: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface OrderItem {
  productId: string
  sku: string
  title: string
  image: string
  quantity: number
  unitPrice: number
  totalPrice: number
  selectedVariants: {
    size?: string
    color?: string
    finish?: string
  }
}

export interface Order {
  id: string
  storeSlug: string
  storeName: string
  createdAt: string
  customer: ShippingAddress
  paymentMethod: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'PAID' | 'PROCESSING' | 'SHIPPED' | 'Delivered' | 'Cancelled' | 'Placed' | 'Packed' | string
  statusHistory?: { status: string; timestamp: string; note?: string }[]
}
