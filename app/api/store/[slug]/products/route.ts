import { NextRequest, NextResponse } from 'next/server'
import { getStoreBySlug, saveProduct, deleteProduct } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const store = getStoreBySlug(slug)
  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  const session = await getSessionUser()
  const isOwner = session && session.user.id === store.ownerId

  let products = store.products || []
  if (!isOwner) {
    products = products.filter(p => p.status !== 'draft')
  }

  return NextResponse.json({ products })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const session = await getSessionUser()
  
  const store = getStoreBySlug(slug)
  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  if (!session || session.user.id !== store.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const product = { ...data, id: data.id || `prod-${Date.now()}` }
    const result = saveProduct(slug, product)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ product, success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const session = await getSessionUser()
  
  const store = getStoreBySlug(slug)
  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  if (!session || session.user.id !== store.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { productIds, updates } = await request.json()
    let updatedCount = 0
    for (const pid of productIds) {
      const existing = store.products.find(p => p.id === pid)
      if (existing) {
        const updated = { ...existing, ...updates }
        saveProduct(slug, updated)
        updatedCount++
      }
    }
    return NextResponse.json({ success: true, count: updatedCount })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
