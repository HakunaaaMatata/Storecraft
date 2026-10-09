import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Store, Product } from '@/lib/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'storecraft-db.json')

export async function POST(req: Request) {
  try {
    const { store, products } = await req.json()
    
    let db: { stores: Store[]; orders: any[] } = { stores: [], orders: [] }
    if (fs.existsSync(DB_FILE)) {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
    }

    // Map StoreType from onboarding to Store from lib/types.ts
    const newServerStore: Store = {
      id: store.id,
      slug: store.slug,
      name: store.name,
      tagline: store.description || 'Welcome to our store',
      announcement: 'Welcome to our new store!',
      preset: store.theme.preset,
      categories: store.categories,
      heroHeadline: store.theme.heroTitle,
      heroHeadlineEm: '',
      heroSubtitle: store.theme.heroSubtitle,
      heroImage: store.theme.heroImage,
      products: products ? products.map((p: any) => ({
        id: p.id,
        sku: p.sku,
        title: p.name,
        subtitle: p.category,
        category: p.category,
        price: p.price,
        inventory: p.stock,
        lowStockThreshold: 5,
        description: p.description,
        features: [],
        images: p.images,
        variants: {}
      })) : []
    }

    // Replace if exists, else unshift
    const idx = db.stores.findIndex((s: any) => s.id === store.id || s.slug === store.slug)
    if (idx >= 0) {
      db.stores[idx] = newServerStore
    } else {
      db.stores.unshift(newServerStore)
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
