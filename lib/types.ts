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
  products: Product[]
  ownerId?: string
  ownerName?: string
  ownerEmail?: string
  phone?: string
  address?: string
  businessType?: string
  description?: string
  logoUrl?: string
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
  status: 'PAID' | 'PROCESSING' | 'SHIPPED'
}
