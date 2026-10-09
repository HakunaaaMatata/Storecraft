import { getStoreBySlug, updateStorePreset } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
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

  // Filter out draft products for public view
  const filteredStore = {
    ...store,
    products: isOwner ? store.products : store.products.filter(p => p.status !== 'draft')
  }

  return NextResponse.json({ store: filteredStore })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json()
  const { preset } = body

  if (!preset) {
    return NextResponse.json({ error: 'Preset is required' }, { status: 400 })
  }

  const updated = updateStorePreset(slug, preset)
  if (!updated) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  return NextResponse.json({ store: updated })
}
