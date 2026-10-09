'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Plus,
  Loader2
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'

export default function DashboardOverviewPage() {
  const router = useRouter()
  const { activeStore } = useStorecraft()
  const [chartRange, setChartRange] = useState<'30' | '7' | 'all'>('30')
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: string } | null>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeStore) return;
    setLoading(true)
    fetch(`/api/store/${activeStore.slug}/analytics?period=${chartRange}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [activeStore, chartRange])

  if (!activeStore) return null

  const analytics = data?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    productsSold: 0,
    lowStockCount: 0,
    totalDelivered: 0,
    totalProcessing: 0
  }
  
  const recentOrders = data?.recentOrders || []
  const chartPointsRaw = data?.chartPoints || []

  // Ensure maxVal isn't 0
  const maxVal = Math.max(...chartPointsRaw.map((p: any) => p.value), 1000)
  
  const chartPoints = chartPointsRaw.map((pt: any, i: number) => {
    const cx = i * (700 / Math.max(1, chartPointsRaw.length - 1))
    const cy = 205 - (pt.value / maxVal) * (205 - 20)
    return {
      ...pt,
      cx,
      cy
    }
  })

  let pathD = ''
  if (chartPoints.length > 0) {
    pathD = `M ${chartPoints[0].cx} ${chartPoints[0].cy} `
    for (let i = 1; i < chartPoints.length; i++) {
      const prev = chartPoints[i - 1]
      const curr = chartPoints[i]
      const cp1x = prev.cx + (curr.cx - prev.cx) / 2
      const cp1y = prev.cy
      const cp2x = prev.cx + (curr.cx - prev.cx) / 2
      const cp2y = curr.cy
      pathD += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.cx} ${curr.cy} `
    }
  }

  let nextMove = {
    eyebrow: 'StoreCraft AI',
    title: 'One clear next move.',
    description: 'Your store is live and receiving orders. Add more products to increase average cart size.',
    ctaText: 'Add new product',
    ctaLink: '/dashboard/products'
  }

  if (analytics.lowStockCount > 0) {
    nextMove = {
      eyebrow: 'Inventory Alert',
      title: 'Restock popular items.',
      description: `You have ${analytics.lowStockCount} items running low on stock. Restock now to prevent missed orders.`,
      ctaText: 'Manage inventory',
      ctaLink: '/dashboard/products'
    }
  } else if (analytics.totalProcessing > 0) {
    nextMove = {
      eyebrow: 'Fulfillment Queue',
      title: 'Fulfill open orders.',
      description: `You have ${analytics.totalProcessing} order(s) placed and waiting to be packed or shipped.`,
      ctaText: 'View orders queue',
      ctaLink: '/dashboard/orders'
    }
  }

  // Calculate dynamic axis labels based on maxVal
  const yLabels = [
    `$${(maxVal).toFixed(0)}`,
    `$${(maxVal * 0.66).toFixed(0)}`,
    `$${(maxVal * 0.33).toFixed(0)}`,
    '$0'
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}>
      
      <div className="metric-grid">
        
        <div>
          <small>Total Revenue</small>
          <strong>${analytics.totalRevenue.toFixed(2)}</strong>
          <span className="positive">
            <TrendingUp size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
            Current period
          </span>
        </div>

        <div>
          <small>Orders Count</small>
          <strong>{analytics.totalOrders}</strong>
          <span className="positive">
            {analytics.totalDelivered} delivered · {analytics.totalProcessing} processing
          </span>
        </div>

        <div>
          <small>Avg. Order Value</small>
          <strong>${analytics.averageOrderValue.toFixed(2)}</strong>
          <span className="positive">Current period</span>
        </div>

        <div>
          <small>Low Stock Alerts</small>
          <strong style={{ color: analytics.lowStockCount > 0 ? '#B54708' : '#07875D' }}>
            {analytics.lowStockCount}
          </strong>
          <span style={{ color: analytics.lowStockCount > 0 ? '#B54708' : 'var(--slate)' }}>
            <Package size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
            {analytics.lowStockCount > 0 ? `${analytics.lowStockCount} items ≤ 5 units` : 'All inventory healthy'}
          </span>
        </div>

      </div>

      <div className="dash-grid">
        
        <div className="dash-card revenue-card">
          <div className="card-top">
            <div>
              <h3>Revenue overview</h3>
              <p>Keep an eye on how your store is doing.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading && <Loader2 size={14} className="animate-spin text-slate-400" />}
              <select 
                value={chartRange} 
                onChange={(e) => setChartRange(e.target.value as any)}
                style={{
                  fontSize: '11px',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  background: '#FFFFFF',
                  color: 'var(--slate)',
                  cursor: 'pointer'
                }}
              >
                <option value="30">Last 30 days</option>
                <option value="7">Last 7 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>

          <div className="big-chart" style={{ position: 'relative' }}>
            <div className="chart-y">
              {yLabels.map((lbl, idx) => <span key={idx}>{lbl}</span>)}
            </div>

            <div className="chart-area" style={{ position: 'relative' }}>
              <div className="chart-lines">
                <i /><i /><i /><i />
              </div>

              <svg 
                viewBox="0 0 700 230" 
                preserveAspectRatio="none" 
                style={{ width: '100%', height: '190px', position: 'absolute', bottom: '24px' }}
              >
                <defs>
                  <linearGradient id="revenue-area-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {pathD && (
                  <>
                    <path 
                      d={`${pathD} L 700 230 L 0 230 Z`}
                      fill="url(#revenue-area-grad)" 
                    />
                    <path 
                      d={pathD} 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                    />
                  </>
                )}

                {chartPoints.map((pt: any, i: number) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    r={hoveredPoint?.label === pt.label ? 6 : 4}
                    fill="#10b981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredPoint({ x: pt.cx, y: pt.cy, label: pt.label, value: pt.formatted })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              {hoveredPoint && (
                <div style={{
                  position: 'absolute',
                  left: `${(hoveredPoint.x / 700) * 100}%`,
                  top: `${hoveredPoint.y - 35}px`,
                  transform: 'translateX(-50%)',
                  backgroundColor: '#101828',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  {hoveredPoint.label}: {hoveredPoint.value}
                </div>
              )}

              <div className="chart-labels">
                {chartPoints.map((pt: any) => (
                  <span key={pt.label}>{pt.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dash-card ai-insight" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="ai-icon">
              <Sparkles size={13} />
            </div>
            <p className="eyebrow">{nextMove.eyebrow}</p>
            <h3>{nextMove.title}</h3>
            <p>{nextMove.description}</p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <Link href={nextMove.ctaLink}>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>{nextMove.ctaText}</span>
                <ArrowRight size={13} />
              </button>
            </Link>
          </div>
        </div>

      </div>

      <div className="dash-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Recent Orders Section */}
        <div className="dash-card orders-card">
          <div className="card-top">
            <div>
              <h3>Recent orders</h3>
              <p>Stay close to every customer.</p>
            </div>
            <Link href="/dashboard/orders" className="text-button" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--slate)', fontSize: '12px' }}>
              <ShoppingBag size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--navy)' }}>No orders yet</p>
              <p style={{ margin: 0 }}>Orders placed by customers on your live storefront will appear here automatically.</p>
            </div>
          ) : (
            <div className="orders" style={{ overflowX: 'auto' }}>
              {recentOrders.slice(0, 5).map((o: any) => {
                const itemsSummary = o.items.map((i: any) => `${i.title || i.name} × ${i.quantity}`).join(', ')
                const isDelivered = o.status === 'Delivered'
                const isProcessing = o.status === 'Placed' || o.status === 'Packed' || o.status === 'PROCESSING'
                const isCancelled = o.status === 'Cancelled'

                // Check if orderNumber is available, if not use part of ID
                const displayOrderNum = o.orderNumber || o.id

                return (
                  <div 
                    key={o.id} 
                    onClick={() => router.push(`/dashboard/orders?selected=${o.id}`)}
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s' }}
                    className="hover:bg-muted"
                  >
                    <span className="order-id">{displayOrderNum}</span>
                    <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{o.customer.fullName || o.customer.name}</span>
                    <span className="order-product" style={{ color: 'var(--slate)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {itemsSummary}
                    </span>
                    <strong>${(o.total || 0).toFixed(2)}</strong>
                    <b style={{
                      backgroundColor: isDelivered ? '#E4F8F0' : isProcessing ? '#FEF3C7' : isCancelled ? '#FEE2E2' : '#E0F2FE',
                      color: isDelivered ? '#07875D' : isProcessing ? '#A16207' : isCancelled ? '#B91C1C' : '#0369A1',
                    }}>
                      {o.status}
                    </b>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="dash-card">
          <div className="card-top">
            <div>
              <h3>Recent activity</h3>
              <p>Store event history.</p>
            </div>
          </div>
          
          {data?.recentActivity?.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--slate)', fontSize: '12px' }}>
              <Clock size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--navy)' }}>No activity yet</p>
              <p style={{ margin: 0 }}>Events will appear here as they happen.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {data?.recentActivity?.slice(0, 5).map((activity: any) => (
                <div key={activity.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activity.type === 'order_created' ? '#10b981' : '#3b82f6', marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--navy)' }}>{activity.title}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--slate)' }}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
