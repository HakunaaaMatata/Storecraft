import { createOrder } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeSlug, customer, paymentMethod, items, idempotencyKey } = body

    if (!storeSlug || !customer || !items || !items.length) {
      return NextResponse.json(
        { error: 'Missing required order fields (customer, store, or cart items).' },
        { status: 400 }
      )
    }

    const result = await createOrder({
      storeSlug,
      customer,
      paymentMethod,
      items,
      idempotencyKey
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, order: result.order })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process checkout order' },
      { status: 500 }
    )
  }
}
