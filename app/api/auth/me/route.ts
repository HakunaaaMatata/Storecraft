import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getStoresByOwner, getAllStores } from '@/lib/db'

export async function GET() {
  try {
    const sessionData = await getSessionUser()
    if (!sessionData) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        stores: [],
      }, { status: 401 })
    }

    const { user } = sessionData
    // Fetch stores associated with this owner
    const stores = await getStoresByOwner(user.id)
    
    const combinedStores = stores

    return NextResponse.json({
      authenticated: true,
      user,
      stores: combinedStores,
      primaryStore: combinedStores[0] || null,
    })
  } catch (error) {
    console.error('[API] Auth me error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
