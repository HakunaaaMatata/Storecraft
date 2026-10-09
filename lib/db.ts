import fs from 'fs'
import path from 'path'
import { INITIAL_STORES } from './seed-data'
import { CartItem, Order, OrderItem, ShippingAddress, Store, ThemePresetId, User, Session } from './types'

interface DbSchema {
  stores: Store[]
  orders: Order[]
  users: User[]
  sessions: Session[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'storecraft-db.json')

// In-memory cache
let memoryDb: DbSchema | null = null

const DEFAULT_DEMO_USER: User = {
  id: 'user-demo-jamie-davis',
  name: 'Jamie Davis',
  email: 'demo@storecraft.com',
  passwordHash: '4c99de07bfb04d6b05259fe8d3ca9f463f67d3210580b2a9a2afd4533bd3f0c10ae5d03d59a827a8736c25b2b96268c27a4295c1b766b119f61016afd603e1c9',
  salt: 'demo-salt-storecraft-2026',
  createdAt: '2026-01-01T00:00:00.000Z'
}

function ensureDbFile(): DbSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (parsed) {
        if (!parsed.users) parsed.users = []
        if (!parsed.sessions) parsed.sessions = []
        if (!parsed.stores) parsed.stores = JSON.parse(JSON.stringify(INITIAL_STORES))
        for (const s of parsed.stores) {
          if (!s.ownerId) {
            s.ownerId = 'user-demo-jamie-davis'
            s.ownerName = s.ownerName || 'Jamie Davis'
            s.ownerEmail = s.ownerEmail || 'demo@storecraft.com'
          }
        }
        if (!parsed.orders) parsed.orders = []
        if (!parsed.users.some((u: User) => u.email === 'demo@storecraft.com')) {
          parsed.users.push(DEFAULT_DEMO_USER)
        }
        persistDb(parsed)
        memoryDb = parsed
        return parsed
      }
    }
  } catch (err) {
    console.warn('[DB] Error reading DB file, fallback:', err)
  }

  if (memoryDb) {
    return memoryDb
  }

  // Initialize with seed data
  memoryDb = {
    stores: JSON.parse(JSON.stringify(INITIAL_STORES)),
    orders: [],
    users: [DEFAULT_DEMO_USER],
    sessions: []
  }

  persistDb(memoryDb)
  return memoryDb
}


function persistDb(data: DbSchema) {
  memoryDb = data
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[DB] Failed to persist file:', err)
  }
}

export function getAllStores(): Store[] {
  const db = ensureDbFile()
  return db.stores
}

export function getStoreBySlug(slug: string): Store | null {
  const db = ensureDbFile()
  const normalizedSlug = slug.toLowerCase().trim()
  
  // Exact match
  let found = db.stores.find((s) => s.slug.toLowerCase() === normalizedSlug)
  if (found) return found

  // Match by preset name
  found = db.stores.find((s) => s.preset === normalizedSlug)
  if (found) return found

  // Fallback for demo: if unknown slug, clone default store with requested slug and name
  const fallbackStore = db.stores[0]
  if (fallbackStore) {
    return {
      ...fallbackStore,
      id: `store-${normalizedSlug}`,
      slug: normalizedSlug,
      name: normalizedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Store'
    }
  }

  return null
}

export function updateStorePreset(slug: string, preset: ThemePresetId): Store | null {
  const db = ensureDbFile()
  const store = db.stores.find((s) => s.slug.toLowerCase() === slug.toLowerCase())
  if (!store) return null

  store.preset = preset
  persistDb(db)
  return store
}

export function getAllOrders(): Order[] {
  const db = ensureDbFile()
  return db.orders
}

export function getOrderById(id: string): Order | null {
  const db = ensureDbFile()
  return db.orders.find((o) => o.id === id) || null
}

export function getOrdersByStore(storeSlug: string): Order[] {
  const db = ensureDbFile()
  return db.orders.filter((o) => o.storeSlug.toLowerCase() === storeSlug.toLowerCase())
}

export interface CreateOrderParams {
  storeSlug: string
  customer: ShippingAddress
  paymentMethod: string
  items: CartItem[]
}

export function createOrder({
  storeSlug,
  customer,
  paymentMethod,
  items
}: CreateOrderParams): { success: boolean; order?: Order; error?: string } {
  const db = ensureDbFile()
  const store = db.stores.find((s) => s.slug.toLowerCase() === storeSlug.toLowerCase())
    || db.stores[0] // fallback if dynamic slug

  if (!store) {
    return { success: false, error: 'Store not found' }
  }

  if (!items || items.length === 0) {
    return { success: false, error: 'Cart is empty' }
  }

  // 1. Check stock availability for all products
  for (const item of items) {
    const product = store.products.find((p) => p.id === item.productId)
    if (!product) {
      return { success: false, error: `Product "${item.title}" no longer exists.` }
    }
    if (product.inventory < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${item.title}". Only ${product.inventory} available.`
      }
    }
  }

  // 2. Decrement inventory in the database
  for (const item of items) {
    const product = store.products.find((p) => p.id === item.productId)!
    product.inventory = Math.max(0, product.inventory - item.quantity)
  }

  // 3. Calculate order financials
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const shipping = subtotal >= 100 ? 0 : 10
  const total = Math.round((subtotal + tax + shipping) * 100) / 100

  // 4. Create Order record
  const orderNumber = Math.floor(10000 + Math.random() * 90000)
  const newOrder: Order = {
    id: `SC-${orderNumber}`,
    storeSlug: store.slug,
    storeName: store.name,
    createdAt: new Date().toISOString(),
    customer,
    paymentMethod: paymentMethod || 'Demo Card (Instant Auth)',
    items: items.map((item): OrderItem => ({
      productId: item.productId,
      sku: item.sku,
      title: item.title,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      selectedVariants: {
        size: item.selectedSize,
        color: item.selectedColor,
        finish: item.selectedFinish
      }
    })),
    subtotal,
    tax,
    shipping,
    total,
    status: 'PAID'
  }

  db.orders.unshift(newOrder)
  persistDb(db)

  return { success: true, order: newOrder }
}

export function resetDatabase() {
  const db: DbSchema = {
    stores: JSON.parse(JSON.stringify(INITIAL_STORES)),
    orders: [],
    users: [],
    sessions: []
  }
  persistDb(db)
  return db
}

// User methods
export function findUserByEmail(email: string): User | null {
  const db = ensureDbFile()
  const normalized = email.toLowerCase().trim()
  return db.users.find((u) => u.email.toLowerCase().trim() === normalized) || null
}

export function findUserById(id: string): User | null {
  const db = ensureDbFile()
  return db.users.find((u) => u.id === id) || null
}

export function createUser(user: User): User {
  const db = ensureDbFile()
  db.users.push(user)
  persistDb(db)
  return user
}

// Session methods
export function saveSession(session: Session): void {
  const db = ensureDbFile()
  // Clean any old session for this token
  db.sessions = db.sessions.filter((s) => s.token !== session.token)
  db.sessions.push(session)
  persistDb(db)
}

export function findSession(token: string): Session | null {
  const db = ensureDbFile()
  const found = db.sessions.find((s) => s.token === token)
  if (!found) return null

  // Check expiration
  if (new Date(found.expiresAt) < new Date()) {
    db.sessions = db.sessions.filter((s) => s.token !== token)
    persistDb(db)
    return null
  }

  return found
}

export function deleteSession(token: string): void {
  const db = ensureDbFile()
  db.sessions = db.sessions.filter((s) => s.token !== token)
  persistDb(db)
}

// Store methods
export function slugExists(slug: string): boolean {
  const db = ensureDbFile()
  const normalized = slug.toLowerCase().trim()
  return db.stores.some((s) => s.slug.toLowerCase().trim() === normalized)
}

export function createStore(store: Store): { success: boolean; store?: Store; error?: string } {
  const db = ensureDbFile()
  
  if (slugExists(store.slug)) {
    return { success: false, error: `Store with slug "${store.slug}" already exists.` }
  }

  db.stores.unshift(store)
  persistDb(db)
  return { success: true, store }
}

export function getStoresByOwner(ownerId: string): Store[] {
  const db = ensureDbFile()
  return db.stores.filter((s) => s.ownerId === ownerId)
}

