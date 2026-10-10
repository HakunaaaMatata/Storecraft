import { getOrdersByStore, getStoreBySlug } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const store = await getStoreBySlug(slug)

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  const session = await getSessionUser()
  const isOwner = session && session.user.id === store.ownerId

  if (!isOwner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const allOrders = await getOrdersByStore(slug)

  return NextResponse.json({ success: true, orders: allOrders })
}
