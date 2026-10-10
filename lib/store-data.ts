export type StoreThemePreset = 'atelier' | 'market' | 'forma' | 'circuit'

export interface ThemeConfig {
  preset: StoreThemePreset
  primaryColor: string
  accentColor: string
  fontHeading: string
  fontBody: string
  heroTitle: string
  heroSubtitle: string
  heroCta: string
  heroImage: string
  announcement: string
}

export interface ProductVariant {
  name: string
  options: string[]
}

export interface Product {
  id: string
  storeId: string
  name: string
  slug: string
  description: string
  category: string
  price: number
  compareAtPrice?: number
  stock: number
  sku: string
  images: string[]
  variants?: ProductVariant[]
  featured?: boolean
  createdAt: string
}

export type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled'

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return false
  if (current === 'Delivered' || current === 'Cancelled') return false
  if (next === 'Cancelled') return true // Can cancel from Placed, Packed, Shipped
  if (current === 'Placed' && next === 'Packed') return true
  if (current === 'Packed' && next === 'Shipped') return true
  if (current === 'Shipped' && next === 'Delivered') return true
  return false
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  selectedVariant?: string
  image?: string
}

export interface Order {
  id: string
  storeId: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: OrderStatus
  paymentStatus: 'Paid (Demo)'
  statusHistory: {
    status: OrderStatus
    timestamp: string
    note?: string
  }[]
  createdAt: string
}

export interface Store {
  id: string
  slug: string
  name: string
  ownerName: string
  email: string
  phone: string
  businessType: string
  address: string
  description: string
  logoUrl?: string
  categories: string[]
  theme: ThemeConfig
  createdAt: string
}

export const THEME_PRESETS: Record<StoreThemePreset, ThemeConfig> = {
  atelier: {
    preset: 'atelier',
    primaryColor: '#2F2924',
    accentColor: '#A86043',
    fontHeading: 'DM Serif Display',
    fontBody: 'Manrope',
    heroTitle: 'Tailored silhouettes for the modern wardrobe.',
    heroSubtitle: 'Hand-finished garments cut from organic Italian cotton and Scottish wool.',
    heroCta: 'Explore Collection',
    heroImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85',
    announcement: 'Complimentary worldwide express shipping on orders over $250',
  },
  market: {
    preset: 'market',
    primaryColor: '#203126',
    accentColor: '#7A9B58',
    fontHeading: 'Manrope',
    fontBody: 'Manrope',
    heroTitle: 'Farm-fresh staples, delivered to your door.',
    heroSubtitle: 'Sustainably grown, small-batch artisanal pantry goods from local producers.',
    heroCta: 'Shop Fresh Goods',
    heroImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
    announcement: 'Harvest box subscriptions now open for Autumn 2026',
  },
  forma: {
    preset: 'forma',
    primaryColor: '#111210',
    accentColor: '#10B981', // Kept emerald green to match original UI
    fontHeading: 'DM Serif Display',
    fontBody: 'Manrope',
    heroTitle: 'Objects with a point of view.',
    heroSubtitle: 'Minimalist lighting, stoneware, and textiles engineered for tranquil living.',
    heroCta: 'Shop Objects',
    heroImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=85',
    announcement: 'New Autumn collection — Studio edition batch 04 now live',
  },
  circuit: {
    preset: 'circuit',
    primaryColor: '#0A0F14',
    accentColor: '#00F0FF',
    fontHeading: 'Manrope',
    fontBody: 'Manrope',
    heroTitle: 'Engineered for uncompromising performance.',
    heroSubtitle: 'Precision desktop hardware, tactile peripherals, and acoustically tuned audio.',
    heroCta: 'Explore Hardware',
    heroImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85',
    announcement: 'Next-generation low-latency wireless protocol now available',
  },
}

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-northstar',
    slug: 'northstar-goods',
    name: 'Northstar Goods',
    ownerName: 'Jamie Davis',
    email: 'jamie@northstargoods.com',
    phone: '+1 (555) 349-2041',
    businessType: 'Home & Living',
    address: '420 Design Row, Portland, OR 97209',
    description: 'Curated home goods, ceramic lighting, and tranquil living essentials.',
    categories: ['Lighting', 'Ceramics', 'Textiles', 'Furniture'],
    theme: THEME_PRESETS.forma,
    createdAt: '2026-09-12T10:00:00.000Z',
  },
  {
    id: 'store-atelier',
    slug: 'atelier-studio',
    name: 'Atelier Studio',
    ownerName: 'Elena Rostova',
    email: 'elena@atelierstudio.co',
    phone: '+1 (555) 781-9920',
    businessType: 'Fashion',
    address: '18 Mercer St, New York, NY 10013',
    description: 'Bespoke tailoring, outerwear, and minimal luxury essentials.',
    categories: ['Outerwear', 'Knitwear', 'Footwear', 'Accessories'],
    theme: THEME_PRESETS.atelier,
    createdAt: '2026-09-15T14:30:00.000Z',
  },
]

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-forma-lamp',
    storeId: 'store-northstar',
    name: 'Forma Desk Lamp',
    slug: 'forma-desk-lamp',
    description: 'Machined anodized aluminum with warm ambient dimming and integrated Qi wireless charging dock in base.',
    category: 'Lighting',
    price: 148,
    compareAtPrice: 180,
    stock: 24,
    sku: 'NG-LMP-01',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'],
    variants: [{ name: 'Finish', options: ['Matte Black', 'Brushed Bone', 'Terracotta'] }],
    featured: true,
    createdAt: '2026-09-12T11:00:00.000Z',
  },
  {
    id: 'prod-mug',
    storeId: 'store-northstar',
    name: 'Hand-thrown Ceramic Mug',
    slug: 'hand-thrown-ceramic-mug',
    description: 'Locally crafted stoneware mug with raw volcanic clay base and silky white satin interior glaze.',
    category: 'Ceramics',
    price: 34,
    stock: 4,
    sku: 'NG-CRM-02',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
    variants: [{ name: 'Glaze', options: ['Speckled Sand', 'Chalk White'] }],
    featured: true,
    createdAt: '2026-09-12T11:05:00.000Z',
  },
  {
    id: 'prod-trench',
    storeId: 'store-atelier',
    name: 'Double-Breasted Wool Trench',
    slug: 'wool-trench-coat',
    description: 'Structured silhouette tailored from water-repellent Melton wool with horn buttons and storm flap.',
    category: 'Outerwear',
    price: 495,
    stock: 12,
    sku: 'AT-OUT-01',
    images: ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'],
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'] }],
    featured: true,
    createdAt: '2026-09-15T15:00:00.000Z',
  },
]

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1048',
    storeId: 'store-northstar',
    orderNumber: '#1048',
    customer: { name: 'Olivia Martin', email: 'olivia.m@example.com', phone: '+1 (555) 234-5678', address: '742 Evergreen Terrace, Springfield, OR 97477' },
    items: [
      { productId: 'prod-forma-lamp', name: 'Forma Desk Lamp', price: 148, quantity: 1, selectedVariant: 'Matte Black', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80' },
    ],
    subtotal: 148, tax: 12.58, shipping: 0, total: 160.58, status: 'Delivered', paymentStatus: 'Paid (Demo)',
    statusHistory: [
      { status: 'Placed', timestamp: '2026-10-06T14:20:00.000Z', note: 'Customer completed demo checkout' },
      { status: 'Packed', timestamp: '2026-10-07T09:15:00.000Z', note: 'Carefully packaged at fulfillment center' },
      { status: 'Shipped', timestamp: '2026-10-07T14:30:00.000Z', note: 'Carrier dispatched tracking #SC-89104' },
      { status: 'Delivered', timestamp: '2026-10-08T16:10:00.000Z', note: 'Delivered to front porch' },
    ],
    createdAt: '2026-10-06T14:20:00.000Z',
  },
  {
    id: 'ord-1047',
    storeId: 'store-northstar',
    orderNumber: '#1047',
    customer: { name: 'Theo Walker', email: 'theo.w@example.com', phone: '+1 (555) 876-5432', address: '88 Market St, Suite 400, San Francisco, CA 94105' },
    items: [
      { productId: 'prod-mug', name: 'Hand-thrown Ceramic Mug', price: 34, quantity: 2, selectedVariant: 'Speckled Sand', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
    ],
    subtotal: 68, tax: 5.78, shipping: 10, total: 83.78, status: 'Packed', paymentStatus: 'Paid (Demo)',
    statusHistory: [
      { status: 'Placed', timestamp: '2026-10-07T11:45:00.000Z', note: 'Payment verified via Instant Demo Auth' },
      { status: 'Packed', timestamp: '2026-10-08T10:20:00.000Z', note: 'Packed and waiting for carrier pickup' },
    ],
    createdAt: '2026-10-07T11:45:00.000Z',
  },
  {
    id: 'ord-1046',
    storeId: 'store-northstar',
    orderNumber: '#1046',
    customer: { name: 'Maya Chen', email: 'maya.chen@example.com', phone: '+1 (555) 432-1098', address: '124 Beacon St, Boston, MA 02116' },
    items: [
      { productId: 'prod-mug', name: 'Hand-thrown Ceramic Mug', price: 34, quantity: 1, selectedVariant: 'Chalk White', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
      { productId: 'prod-forma-lamp', name: 'Forma Desk Lamp', price: 148, quantity: 1, selectedVariant: 'Terracotta', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80' },
    ],
    subtotal: 182, tax: 15.47, shipping: 0, total: 197.47, status: 'Placed', paymentStatus: 'Paid (Demo)',
    statusHistory: [
      { status: 'Placed', timestamp: '2026-10-08T15:30:00.000Z', note: 'Customer completed demo checkout' },
    ],
    createdAt: '2026-10-08T15:30:00.000Z',
  },
]

const STORAGE_KEYS = {
  STORES: 'storecraft_stores_v1',
  PRODUCTS: 'storecraft_products_v1',
  ORDERS: 'storecraft_orders_v1',
  ACTIVE_STORE: 'storecraft_active_store_v1',
}

class StorecraftDatabase {
  private isBrowser(): boolean { return typeof window !== 'undefined' }

  private dispatchUpdate() {
    if (this.isBrowser()) window.dispatchEvent(new CustomEvent('storecraft_db_update'))
  }

  getStores(): Store[] {
    if (!this.isBrowser()) return INITIAL_STORES
    const raw = localStorage.getItem(STORAGE_KEYS.STORES)
    if (!raw) { this.initDefault(); return INITIAL_STORES }
    try { return JSON.parse(raw) } catch { return INITIAL_STORES }
  }

  getStoreById(id: string): Store | undefined { return this.getStores().find((s) => s.id === id) }
  getStoreBySlug(slug: string): Store | undefined { return this.getStores().find((s) => s.slug === slug.toLowerCase()) }

  getActiveStore(): Store {
    const stores = this.getStores()
    if (!this.isBrowser()) return stores[0] || INITIAL_STORES[0]
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_STORE)
    return stores.find((s) => s.id === activeId) || stores[0] || INITIAL_STORES[0]
  }

  setActiveStore(storeId: string) {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STORE, storeId)
      this.dispatchUpdate()
    }
  }

  saveStore(store: Store): Store {
    const stores = this.getStores()
    const index = stores.findIndex((s) => s.id === store.id)
    if (index >= 0) stores[index] = store
    else stores.push(store)
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores))
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STORE, store.id)
      this.dispatchUpdate()
    }
    return store
  }

  updateStoreTheme(storeId: string, theme: ThemeConfig) {
    const store = this.getStoreById(storeId)
    if (store) {
      store.theme = theme
      this.saveStore(store)
    }
  }

  getProducts(storeId?: string): Product[] {
    if (!this.isBrowser()) return storeId ? INITIAL_PRODUCTS.filter((p) => p.storeId === storeId) : INITIAL_PRODUCTS
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    const list: Product[] = raw ? JSON.parse(raw) : INITIAL_PRODUCTS
    return storeId ? list.filter((p) => p.storeId === storeId) : list
  }

  getProductById(storeId: string, productId: string): Product | undefined {
    return this.getProducts(storeId).find((p) => p.id === productId)
  }

  saveProduct(product: Product): Product {
    const all = this.getProducts()
    const index = all.findIndex((p) => p.id === product.id && p.storeId === product.storeId)
    if (index >= 0) all[index] = product
    else all.unshift(product)
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(all))
      this.dispatchUpdate()
    }
    return product
  }

  deleteProduct(storeId: string, productId: string): boolean {
    const all = this.getProducts()
    const filtered = all.filter((p) => !(p.id === productId && p.storeId === storeId))
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered))
      this.dispatchUpdate()
    }
    return true
  }

  getOrders(storeId?: string): Order[] {
    if (!this.isBrowser()) return storeId ? INITIAL_ORDERS.filter((o) => o.storeId === storeId) : INITIAL_ORDERS
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS)
    const list: Order[] = raw ? JSON.parse(raw) : INITIAL_ORDERS
    return storeId ? list.filter((o) => o.storeId === storeId) : list
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>): Order {
    const all = this.getOrders()
    const nextNum = 1050 + all.length
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `#${nextNum}`,
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: orderData.status, timestamp: new Date().toISOString(), note: 'Placed' }],
    }
    for (const item of newOrder.items) {
      const product = this.getProductById(newOrder.storeId, item.productId)
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity)
        this.saveProduct(product)
      }
    }
    all.unshift(newOrder)
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all))
      this.dispatchUpdate()
    }
    return newOrder
  }

  importProducts(storeId: string, newProducts: Product[]): Product[] {
    const all = this.getProducts()
    for (const prod of newProducts) {
      const idx = all.findIndex((p) => p.id === prod.id && p.storeId === storeId)
      if (idx >= 0) all[idx] = prod
      else all.unshift(prod)
    }
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(all))
      this.dispatchUpdate()
    }
    return this.getProducts(storeId)
  }

  setStoreOrders(storeId: string, storeOrders: Order[]) {
    const all = this.getOrders().filter(o => o.storeId !== storeId)
    const newAll = [...storeOrders, ...all]
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newAll))
      this.dispatchUpdate()
    }
  }

  updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Order | undefined {
    const all = this.getOrders()
    const order = all.find((o) => o.id === orderId)
    if (!order) return undefined

    // Validate transition
    if (order.status !== status && !canTransitionOrderStatus(order.status, status)) {
      console.warn(`Invalid order status transition from ${order.status} to ${status}`)
      return order
    }

    order.status = status
    if (!order.statusHistory) order.statusHistory = []
    order.statusHistory.unshift({ status, timestamp: new Date().toISOString(), note: note || `Updated to ${status}` })
    
    // If cancelled, restore inventory
    if (status === 'Cancelled') {
      const allProducts = this.getProducts()
      let productsUpdated = false
      for (const item of order.items) {
        const product = allProducts.find(p => p.id === item.productId && p.storeId === order.storeId)
        if (product) {
          product.stock += item.quantity
          productsUpdated = true
        }
      }
      if (productsUpdated && this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProducts))
      }
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all))
      this.dispatchUpdate()
    }
    return order
  }

  initDefault() {
    if (this.isBrowser()) {
      if (!localStorage.getItem(STORAGE_KEYS.STORES)) localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(INITIAL_STORES))
      if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS))
      if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_STORE)) localStorage.setItem(STORAGE_KEYS.ACTIVE_STORE, INITIAL_STORES[0].id)
    }
  }

  resetToDemo() {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(INITIAL_STORES))
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS))
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STORE, INITIAL_STORES[0].id)
      this.dispatchUpdate()
    }
  }
}

export const db = new StorecraftDatabase()
