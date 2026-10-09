import { getOrderById, updateOrderStatusServer, getStoresByOwner, getAllStores } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

async function isAuthorizedForStore(userId: string, userEmail: string, storeSlug: string) {
  const stores = getStoresByOwner(userId)
  const allStores = getAllStores()
  const matchingStores = allStores.filter(s => s.ownerEmail?.toLowerCase() === userEmail.toLowerCase() || s.ownerId === userId)
  const combined = [...stores, ...matchingStores]
  return combined.some(s => s.slug.toLowerCase() === storeSlug.toLowerCase() || s.id === storeSlug)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = getOrderById(id)

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Authorize
  const session = await getSessionUser()
  if (!session || !(await isAuthorizedForStore(session.user.id, session.user.email, order.storeSlug))) {
    return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 })
  }

  return NextResponse.json({ order })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = getOrderById(id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Authorize
    const session = await getSessionUser()
    if (!session || !(await isAuthorizedForStore(session.user.id, session.user.email, order.storeSlug))) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 })
    }

    const body = await request.json()
    const { status, note } = body

    if (!status) {
      return NextResponse.json({ error: 'Missing status field' }, { status: 400 })
    }

    const result = updateOrderStatusServer(id, status, note)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, order: result.order })
  } catch (error: any) {
    console.error('Order patch error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to update order' }, { status: 500 })
  }
}
