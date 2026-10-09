import { NextRequest, NextResponse } from 'next/server'
import { getStoreBySlug, saveProduct, deleteProduct } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productId: string }> }
) {
  const { slug, productId } = await params
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
    const product = { ...data, id: productId }
    const result = saveProduct(slug, product)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ product, success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productId: string }> }
) {
  const { slug, productId } = await params
  const session = await getSessionUser()
  
  const store = getStoreBySlug(slug)
  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  if (!session || session.user.id !== store.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = deleteProduct(slug, productId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
