import { getStoreBySlug, updateStoreSettings } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { CustomThemeSettings, Store } from '@/lib/types'

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
  const { action, settings } = body

  const currentStore = getStoreBySlug(slug)
  if (!currentStore) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  let updates: Partial<Store> = {}

  if (action === 'save_draft') {
    updates = {
      draftThemeSettings: {
        ...currentStore.draftThemeSettings,
        ...settings,
        updatedAt: new Date().toISOString()
      }
    }
  } else if (action === 'publish') {
    updates = {
      themeSettings: {
        ...currentStore.draftThemeSettings,
        ...settings,
        updatedAt: new Date().toISOString()
      },
      draftThemeSettings: undefined,
      preset: settings.preset || currentStore.draftThemeSettings?.preset || currentStore.preset
    }
  } else if (action === 'reset_theme') {
    updates = {
      themeSettings: undefined,
      draftThemeSettings: undefined
    }
  } else if (body.preset && !action) {
    // Legacy preset change
    updates = { preset: body.preset }
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const updated = updateStoreSettings(slug, updates)
  
  if (!updated) {
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 })
  }

  return NextResponse.json({ store: updated })
}
