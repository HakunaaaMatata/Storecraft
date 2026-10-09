import fs from 'fs'
import path from 'path'
import { INITIAL_STORES, SAMPLE_CATEGORY_CATALOG } from './seed-data'
import { CartItem, Order, OrderItem, ShippingAddress, Store, ThemePresetId, User, Session, Product } from './types'
import { cookies } from 'next/headers'
import { getDb, isMongoConfigured } from './mongodb'
import { Db } from 'mongodb'

interface DbSchema {
  stores: Store[]
  orders: Order[]
  users: User[]
  sessions: Session[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'storecraft-db.json')

// In-memory cache for fallback
let memoryDb: DbSchema | null = null

const DEFAULT_DEMO_USER: User = {
  id: 'user-demo-jamie-davis',
  name: 'Jamie Davis',
  email: 'owner@storecraft.demo', // Match UI exactly
  passwordHash: 'dd79736083a9f0684080691cf3233a337c3ff22ee903b28f340d7769a0d224ed373cb0575f6df5932abc61bd46acc951e88c28c0c090aaceb1c428091ac3af94',
  salt: 'demo-salt-storecraft-2026',
  createdAt: '2026-01-01T00:00:00.000Z'
}

let isSeedingMongo = false

async function ensureMongoSeed(db: Db): Promise<void> {
  if (isSeedingMongo) return
  try {
    isSeedingMongo = true
    const storeCount = await db.collection('stores').countDocuments()
    if (storeCount === 0) {
      const storesToSeed = INITIAL_STORES.map((s) => ({
        ...s,
        ownerId: s.ownerId || 'user-demo-jamie-davis',
        ownerName: s.ownerName || 'Jamie Davis',
        ownerEmail: s.ownerEmail || 'owner@storecraft.demo',
      }))
      await db.collection('stores').insertMany(storesToSeed as any)
    }

    const userCount = await db.collection('users').countDocuments()
    if (userCount === 0) {
      await db.collection('users').insertOne(DEFAULT_DEMO_USER as any)
    }
  } catch (err) {
    console.warn('[MongoDB] Seed check warning:', err)
  } finally {
    isSeedingMongo = false
  }
}

export function ensureDbFile(): DbSchema {
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
            s.ownerEmail = s.ownerEmail || 'owner@storecraft.demo'
          }
        }
        if (!parsed.orders) parsed.orders = []
        
        // Ensure demo user exists and has correct password hash
        const demoUserIndex = parsed.users.findIndex((u: User) => u.email === 'demo@storecraft.com' || u.email === 'owner@storecraft.demo')
        if (demoUserIndex === -1) {
          parsed.users.push(DEFAULT_DEMO_USER)
        } else {
          parsed.users[demoUserIndex].email = 'owner@storecraft.demo'
          parsed.users[demoUserIndex].passwordHash = DEFAULT_DEMO_USER.passwordHash
          parsed.users[demoUserIndex].salt = DEFAULT_DEMO_USER.salt
        }
        
        memoryDb = parsed
        return parsed
      }
    }
  } catch (err) {
    console.warn('[DB] Failed reading disk DB, falling back to memory seed:', err)
  }

  if (!memoryDb) {
    memoryDb = {
      stores: JSON.parse(JSON.stringify(INITIAL_STORES)),
      orders: [],
      users: [DEFAULT_DEMO_USER],
      sessions: []
    }
    for (const s of memoryDb.stores) {
      s.ownerId = 'user-demo-jamie-davis'
      s.ownerName = 'Jamie Davis'
      s.ownerEmail = 'owner@storecraft.demo'
    }
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
    // Expected on read-only serverless platforms like Vercel
  }
}

export async function getAllStores(): Promise<Store[]> {
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await ensureMongoSeed(mongo)
      const stores = await mongo.collection<Store>('stores').find({}, { projection: { _id: 0 } }).toArray()
      if (stores.length > 0) return stores
    }
  }
  const db = ensureDbFile()
  return db.stores
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const normalizedSlug = slug.toLowerCase().trim()

  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await ensureMongoSeed(mongo)
      let found = await mongo.collection<Store>('stores').findOne({ slug: normalizedSlug }, { projection: { _id: 0 } })
      if (found) return found

      found = await mongo.collection<Store>('stores').findOne({ preset: normalizedSlug }, { projection: { _id: 0 } })
      if (found) return found
    }
  }

  const db = ensureDbFile()
  
  // Exact match
  let found = db.stores.find((s) => s.slug.toLowerCase() === normalizedSlug)
  if (found) return found

  // Match by preset name
  found = db.stores.find((s) => s.preset === normalizedSlug)
  if (found) return found

  // Fallback for demo: if unknown slug, clone default store with requested slug and name
  let fallbackStore = db.stores[0]
  
  // Try to use stateless session cookies if available
  try {
    const cookieStore = await cookies()
    const themeCookie = cookieStore.get('demo_store_theme')?.value
    let businessTypeCookie = cookieStore.get('demo_business_type')?.value
    const nameCookie = cookieStore.get('demo_store_name')?.value

    if (themeCookie) {
      const presetStore = db.stores.find(s => s.preset === themeCookie)
      if (presetStore) fallbackStore = presetStore
    }

    if (fallbackStore) {
      const clonedStore: Store = {
        ...fallbackStore,
        id: `store-${normalizedSlug}`,
        slug: normalizedSlug,
        name: nameCookie || (normalizedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Store')
      }

      // Hardcoded hackathon bypass for cross-origin wildcard domains
      if (normalizedSlug.includes('lenovo') || normalizedSlug.includes('tech') || normalizedSlug.includes('apple')) {
        businessTypeCookie = 'Technology & Electronics'
        clonedStore.name = 'Lenovo Store'
      }

      if (businessTypeCookie) {
        clonedStore.businessType = businessTypeCookie
        const templates = SAMPLE_CATEGORY_CATALOG[businessTypeCookie] || SAMPLE_CATEGORY_CATALOG['General Retail']
        if (templates) {
            let prodCounter = 1
            clonedStore.products = templates.map(t => {
                const p: Product = {
                    id: `${normalizedSlug}-p${prodCounter}`,
                    sku: `SKU-${normalizedSlug.substring(0, 3).toUpperCase()}-${100 + prodCounter}`,
                    title: t.title,
                    subtitle: t.subtitle,
                    category: 'Featured',
                    price: t.price,
                    compareAtPrice: Math.round(t.price * 1.2),
                    inventory: t.inventory,
                    lowStockThreshold: 5,
                    description: t.desc,
                    features: ['Quality checked prior to fulfillment'],
                    images: [t.img],
                    variants: {},
                }
                prodCounter++
                return p
            })
            clonedStore.categories = ['All', 'Featured']
        }
      }

      return clonedStore
    }
  } catch (e) {
    // cookies() might throw outside request context
  }

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

export async function updateStoreSettings(slug: string, updates: Partial<Store>): Promise<Store | null> {
  const normalizedSlug = slug.toLowerCase().trim()

  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await ensureMongoSeed(mongo)
      await mongo.collection<Store>('stores').updateOne(
        { slug: normalizedSlug },
        { $set: updates }
      )
      return await mongo.collection<Store>('stores').findOne({ slug: normalizedSlug }, { projection: { _id: 0 } })
    }
  }

  const db = ensureDbFile()
  const store = db.stores.find((s) => s.slug.toLowerCase() === normalizedSlug)
  if (!store) return null

  Object.assign(store, updates)
  persistDb(db)
  return store
}

export async function getAllOrders(): Promise<Order[]> {
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      return await mongo.collection<Order>('orders').find({}, { projection: { _id: 0 } }).toArray()
    }
  }
  const db = ensureDbFile()
  return db.orders
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      return await mongo.collection<Order>('orders').findOne({ id }, { projection: { _id: 0 } })
    }
  }
  const db = ensureDbFile()
  return db.orders.find((o) => o.id === id) || null
}

export async function getOrdersByStore(storeSlug: string): Promise<Order[]> {
  const normalized = storeSlug.toLowerCase().trim()
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      return await mongo.collection<Order>('orders').find({ storeSlug: normalized }, { projection: { _id: 0 } }).toArray()
    }
  }
  const db = ensureDbFile()
  return db.orders.filter((o) => o.storeSlug.toLowerCase() === normalized)
}

export interface CreateOrderParams {
  storeSlug: string
  customer: ShippingAddress
  paymentMethod: string
  items: CartItem[]
  idempotencyKey?: string
}

const idempotencyCache = new Map<string, Order>()

export async function createOrder({
  storeSlug,
  customer,
  paymentMethod,
  items,
  idempotencyKey
}: CreateOrderParams): Promise<{ success: boolean; order?: Order; error?: string }> {
  if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
    return { success: true, order: idempotencyCache.get(idempotencyKey) }
  }

  const store = await getStoreBySlug(storeSlug)

  if (!store) {
    return { success: false, error: 'Store not found' }
  }

  if (!items || items.length === 0) {
    return { success: false, error: 'Cart is empty' }
  }

  // 1. Check stock availability for all products and construct server-validated items
  const validatedItems: OrderItem[] = []
  
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
    
    validatedItems.push({
      productId: item.productId,
      sku: product.sku || item.sku,
      title: product.title || item.title,
      image: item.image,
      quantity: item.quantity,
      unitPrice: product.price,
      totalPrice: product.price * item.quantity,
      selectedVariants: {
        size: item.selectedSize,
        color: item.selectedColor,
        finish: item.selectedFinish
      }
    })
  }

  // 2. Decrement inventory
  for (const item of items) {
    const product = store.products.find((p) => p.id === item.productId)!
    product.inventory = Math.max(0, product.inventory - item.quantity)
  }

  // 3. Financials
  const subtotal = validatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const shipping = subtotal >= 100 ? 0 : 10
  const total = Math.round((subtotal + tax + shipping) * 100) / 100

  // 4. Create Order
  const orderNumber = Math.floor(10000 + Math.random() * 90000)
  const newOrder: Order = {
    id: `SC-${orderNumber}`,
    storeSlug: store.slug,
    storeName: store.name,
    createdAt: new Date().toISOString(),
    customer,
    paymentMethod: paymentMethod || 'Demo Card (Instant Auth)',
    items: validatedItems,
    subtotal,
    tax,
    shipping,
    total,
    status: 'Placed'
  }

  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await mongo.collection<Order>('orders').insertOne(newOrder as any)
      await mongo.collection<Store>('stores').updateOne(
        { slug: store.slug },
        { $set: { products: store.products } }
      )
    }
  }

  const db = ensureDbFile()
  db.orders.unshift(newOrder)
  const memoryStore = db.stores.find((s) => s.slug.toLowerCase() === store.slug.toLowerCase())
  if (memoryStore) {
    memoryStore.products = store.products
  }
  persistDb(db)

  if (idempotencyKey) {
    idempotencyCache.set(idempotencyKey, newOrder)
    if (idempotencyCache.size > 1000) {
      const firstKey = idempotencyCache.keys().next().value
      if (firstKey) idempotencyCache.delete(firstKey)
    }
  }

  return { success: true, order: newOrder }
}

export async function updateOrderStatusServer(orderId: string, status: string, note?: string): Promise<{ success: boolean; order?: Order; error?: string }> {
  const validStatuses = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']
  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid status' }
  }

  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      const order = await mongo.collection<Order>('orders').findOne({ id: orderId })
      if (!order) return { success: false, error: 'Order not found' }

      const statusHistory = order.statusHistory || []
      statusHistory.unshift({
        status: status as any,
        timestamp: new Date().toISOString(),
        note: note || `Updated to ${status}`
      })

      await mongo.collection<Order>('orders').updateOne(
        { id: orderId },
        { $set: { status: status as any, statusHistory } }
      )
      const updated = await mongo.collection<Order>('orders').findOne({ id: orderId }, { projection: { _id: 0 } })
      return { success: true, order: updated || undefined }
    }
  }

  const db = ensureDbFile()
  const order = db.orders.find(o => o.id === orderId)
  if (!order) return { success: false, error: 'Order not found' }

  order.status = status as any
  if (!order.statusHistory) order.statusHistory = []
  order.statusHistory.unshift({ 
    status: status as any, 
    timestamp: new Date().toISOString(), 
    note: note || `Updated to ${status}` 
  })

  // Restore inventory if cancelled
  if (status === 'Cancelled') {
    const store = db.stores.find(s => s.slug.toLowerCase() === order.storeSlug.toLowerCase())
    if (store) {
      for (const item of order.items) {
        const product = store.products.find(p => p.id === item.productId)
        if (product) {
          product.inventory += item.quantity
        }
      }
    }
  }

  persistDb(db)
  return { success: true, order }
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
export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.toLowerCase().trim()
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await ensureMongoSeed(mongo)
      const user = await mongo.collection<User>('users').findOne({ email: normalized }, { projection: { _id: 0 } })
      if (user) return user
    }
  }
  const db = ensureDbFile()
  return db.users.find((u) => u.email.toLowerCase().trim() === normalized) || null
}

export async function findUserById(id: string): Promise<User | null> {
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await ensureMongoSeed(mongo)
      const user = await mongo.collection<User>('users').findOne({ id }, { projection: { _id: 0 } })
      if (user) return user
    }
  }
  const db = ensureDbFile()
  return db.users.find((u) => u.id === id) || null
}

export async function createUser(user: User): Promise<User> {
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await ensureMongoSeed(mongo)
      await mongo.collection<User>('users').insertOne(user as any)
      return user
    }
  }
  const db = ensureDbFile()
  db.users.push(user)
  persistDb(db)
  return user
}

// Session methods
export async function saveSession(session: Session): Promise<void> {
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await mongo.collection<Session>('sessions').updateOne(
        { token: session.token },
        { $set: session },
        { upsert: true }
      )
      return
    }
  }
  const db = ensureDbFile()
  db.sessions = db.sessions.filter((s) => s.token !== session.token)
  db.sessions.push(session)
  persistDb(db)
}

export async function findSession(token: string): Promise<Session | null> {
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      const found = await mongo.collection<Session>('sessions').findOne({ token }, { projection: { _id: 0 } })
      if (!found) return null
      if (new Date(found.expiresAt) < new Date()) {
        await mongo.collection<Session>('sessions').deleteOne({ token })
        return null
      }
      return found
    }
  }
  const db = ensureDbFile()
  const found = db.sessions.find((s) => s.token === token)
  if (!found) return null

  if (new Date(found.expiresAt) < new Date()) {
    db.sessions = db.sessions.filter((s) => s.token !== token)
    persistDb(db)
    return null
  }

  return found
}

export async function deleteSession(token: string): Promise<void> {
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await mongo.collection<Session>('sessions').deleteOne({ token })
      return
    }
  }
  const db = ensureDbFile()
  db.sessions = db.sessions.filter((s) => s.token !== token)
  persistDb(db)
}

// Store methods
export async function slugExists(slug: string): Promise<boolean> {
  const normalized = slug.toLowerCase().trim()
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await ensureMongoSeed(mongo)
      const count = await mongo.collection<Store>('stores').countDocuments({ slug: normalized })
      if (count > 0) return true
    }
  }
  const db = ensureDbFile()
  return db.stores.some((s) => s.slug.toLowerCase().trim() === normalized)
}

export async function createStore(store: Store): Promise<{ success: boolean; store?: Store; error?: string }> {
  const normalizedSlug = store.slug.toLowerCase().trim()

  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await ensureMongoSeed(mongo)
      const existing = await mongo.collection<Store>('stores').findOne({ slug: normalizedSlug })
      if (existing) {
        return { success: false, error: `Store with slug "${store.slug}" already exists.` }
      }
      await mongo.collection<Store>('stores').insertOne(store as any)
      return { success: true, store }
    }
  }

  const db = ensureDbFile()
  if (db.stores.some((s) => s.slug.toLowerCase().trim() === normalizedSlug)) {
    return { success: false, error: `Store with slug "${store.slug}" already exists.` }
  }

  db.stores.unshift(store)
  persistDb(db)
  return { success: true, store }
}

export async function getStoresByOwner(ownerId: string): Promise<Store[]> {
  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await ensureMongoSeed(mongo)
      const stores = await mongo.collection<Store>('stores').find({ ownerId }, { projection: { _id: 0 } }).toArray()
      if (stores && stores.length > 0) return stores
    }
  }
  const db = ensureDbFile()
  return db.stores.filter((s) => s.ownerId === ownerId)
}

// Product methods
export async function getProductsByStore(storeSlug: string): Promise<Product[]> {
  const store = await getStoreBySlug(storeSlug)
  return store?.products || []
}

export async function saveProduct(storeSlug: string, product: Product): Promise<{ success: boolean; error?: string }> {
  const store = await getStoreBySlug(storeSlug)
  if (!store) return { success: false, error: 'Store not found' }

  // Enforce unique SKU
  const duplicate = store.products.find((p) => p.sku === product.sku && p.id !== product.id)
  if (duplicate) {
    return { success: false, error: 'SKU already exists in this store.' }
  }

  const existingIndex = store.products.findIndex((p) => p.id === product.id)
  if (existingIndex >= 0) {
    store.products[existingIndex] = product
  } else {
    store.products.unshift(product)
  }

  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await mongo.collection<Store>('stores').updateOne(
        { slug: store.slug.toLowerCase().trim() },
        { $set: { products: store.products } }
      )
      return { success: true }
    }
  }

  const db = ensureDbFile()
  const memStore = db.stores.find((s) => s.slug.toLowerCase() === storeSlug.toLowerCase())
  if (memStore) {
    memStore.products = store.products
    persistDb(db)
  }
  return { success: true }
}

export async function deleteProduct(storeSlug: string, productId: string): Promise<{ success: boolean; error?: string }> {
  const store = await getStoreBySlug(storeSlug)
  if (!store) return { success: false, error: 'Store not found' }

  store.products = store.products.filter((p) => p.id !== productId)

  if (isMongoConfigured()) {
    const mongo = await getDb()
    if (mongo) {
      await mongo.collection<Store>('stores').updateOne(
        { slug: store.slug.toLowerCase().trim() },
        { $set: { products: store.products } }
      )
      return { success: true }
    }
  }

  const db = ensureDbFile()
  const memStore = db.stores.find((s) => s.slug.toLowerCase() === storeSlug.toLowerCase())
  if (memStore) {
    memStore.products = store.products
    persistDb(db)
  }
  return { success: true }
}
