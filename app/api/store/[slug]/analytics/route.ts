import { getOrdersByStore, getProductsByStore, getStoreBySlug } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { Order } from '@/lib/types'

function getDaysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

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

  if (!isOwner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const url = new URL(request.url)
  const period = url.searchParams.get('period') || '30'

  const allOrders = getOrdersByStore(slug)
  const products = getProductsByStore(slug)

  let startDate: Date | null = null
  if (period === '7') {
    startDate = getDaysAgo(7)
  } else if (period === '30') {
    startDate = getDaysAgo(30)
  }

  // Filter orders by date range
  const filteredOrders = allOrders.filter(o => {
    if (!startDate) return true
    return new Date(o.createdAt) >= startDate
  })

  const eligibleOrders = filteredOrders.filter(o => o.status !== 'Cancelled')
  const totalRevenue = eligibleOrders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = eligibleOrders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  let productsSold = 0
  eligibleOrders.forEach(o => {
    o.items.forEach(item => {
      productsSold += item.quantity
    })
  })

  // Low stock calculation
  const lowStockThreshold = 5
  const lowStockCount = products.filter(p => p.inventory <= lowStockThreshold).length

  const totalDelivered = filteredOrders.filter(o => o.status === 'Delivered').length
  const totalProcessing = filteredOrders.filter(o => o.status === 'Placed' || o.status === 'Packed').length

  // Generate trend data (e.g. 5 points for chart)
  let chartPoints = []
  if (eligibleOrders.length === 0) {
    // Empty state
    chartPoints = Array.from({ length: 5 }, (_, i) => ({
      label: `Point ${i+1}`,
      value: 0,
      formatted: '$0'
    }))
  } else {
    const now = new Date()
    const start = startDate ? startDate : new Date(Math.min(...eligibleOrders.map(o => new Date(o.createdAt).getTime())))
    const diffTime = Math.abs(now.getTime() - start.getTime())
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    
    // Create 5 buckets
    const numBuckets = 5
    const bucketSize = diffDays / numBuckets
    const buckets = Array.from({ length: numBuckets }, () => 0)
    const labels = Array.from({ length: numBuckets }, (_, i) => {
      const bucketDate = new Date(start.getTime() + (i * bucketSize + bucketSize / 2) * 24 * 60 * 60 * 1000)
      return bucketDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    eligibleOrders.forEach(o => {
      const oDate = new Date(o.createdAt)
      const daysSinceStart = (oDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      let bucketIdx = Math.floor(daysSinceStart / bucketSize)
      if (bucketIdx >= numBuckets) bucketIdx = numBuckets - 1
      if (bucketIdx < 0) bucketIdx = 0
      buckets[bucketIdx] += o.total
    })

    for (let i = 0; i < numBuckets; i++) {
      chartPoints.push({
        label: labels[i],
        value: buckets[i],
        formatted: `$${buckets[i].toFixed(0)}`
      })
    }
  }

  // Get recent activity (e.g. status changes or new orders)
  const activities = []
  for (const o of allOrders) {
    activities.push({
      id: `created-${o.id}`,
      type: 'order_created',
      title: `Order ${o.id} placed`,
      timestamp: o.createdAt,
      orderId: o.id
    })
    if (o.statusHistory) {
      for (const h of o.statusHistory) {
        activities.push({
          id: `status-${o.id}-${h.timestamp}`,
          type: 'order_status',
          title: `Order ${o.id} marked as ${h.status}`,
          timestamp: h.timestamp,
          orderId: o.id
        })
      }
    }
  }
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json({
    metrics: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      productsSold,
      lowStockCount,
      totalDelivered,
      totalProcessing,
      rawOrdersCount: filteredOrders.length
    },
    chartPoints,
    recentOrders: allOrders.slice(0, 5),
    recentActivity: activities.slice(0, 10),
    isDemo: false
  })
}
