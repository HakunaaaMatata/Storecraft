'use client'

import React, { useState } from 'react'
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
  Plus
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'

export default function DashboardOverviewPage() {
  const router = useRouter()
  const { activeStore, products, orders, analytics } = useStorecraft()
  const [chartRange, setChartRange] = useState<'30' | '7' | 'all'>('30')
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: string } | null>(null)

  // Eligible orders (excluding cancelled)
  const eligibleOrders = orders.filter(o => o.status !== 'Cancelled')
  const lowStockProducts = products.filter(p => p.stock <= 5)
  const pendingOrders = orders.filter(o => o.status === 'Placed' || o.status === 'Packed')

  // Calculate chart points based on store orders or standard curve
  // Standard 5-point revenue points matching the UI reference
  const baseRevenue = analytics.totalRevenue > 0 ? analytics.totalRevenue : 24892.40
  const chartPoints = [
    { label: 'Sep 10', value: baseRevenue * 0.15, formatted: `$${(baseRevenue * 0.15).toFixed(0)}`, cx: 0, cy: 155 },
    { label: 'Sep 17', value: baseRevenue * 0.28, formatted: `$${(baseRevenue * 0.28).toFixed(0)}`, cx: 175, cy: 130 },
    { label: 'Sep 24', value: baseRevenue * 0.42, formatted: `$${(baseRevenue * 0.42).toFixed(0)}`, cx: 350, cy: 95 },
    { label: 'Oct 1', value: baseRevenue * 0.65, formatted: `$${(baseRevenue * 0.65).toFixed(0)}`, cx: 525, cy: 55 },
    { label: 'Oct 8', value: baseRevenue, formatted: `$${baseRevenue.toFixed(0)}`, cx: 700, cy: 20 },
  ]

  // Intelligent Contextual Next Move Recommendation (matching Image 2)
  let nextMove = {
    eyebrow: 'StoreCraft AI',
    title: 'One clear next move.',
    description: 'Your store is live and receiving orders. Add more products to increase average cart size.',
    ctaText: 'Add new product',
    ctaLink: '/dashboard/products'
  }

  if (lowStockProducts.length > 0) {
    const firstLow = lowStockProducts[0]
    nextMove = {
      eyebrow: 'Inventory Alert',
      title: 'Restock popular items.',
      description: `${firstLow.name} has only ${firstLow.stock} units remaining. Restock now to prevent missed orders.`,
      ctaText: 'Manage inventory',
      ctaLink: '/dashboard/products'
    }
  } else if (pendingOrders.length > 0) {
    nextMove = {
      eyebrow: 'Fulfillment Queue',
      title: 'Fulfill open orders.',
      description: `You have ${pendingOrders.length} order(s) placed and waiting to be packed or shipped.`,
      ctaText: 'View orders queue',
      ctaLink: '/dashboard/orders'
    }
  } else if (products.length === 0) {
    nextMove = {
      eyebrow: 'Catalog Setup',
      title: 'Add your first product.',
      description: 'Your catalog is empty. Upload products from a spreadsheet or add items manually.',
      ctaText: 'Import catalog',
      ctaLink: '/dashboard/products/import'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 4 KPI Metric Cards (Strictly required in Section 4) */}
      <div className="metric-grid">
        
        {/* KPI 1: Total Revenue */}
        <div>
          <small>Total Revenue</small>
          <strong>${analytics.totalRevenue.toFixed(2)}</strong>
          <span className="positive">
            <TrendingUp size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
            +18.2% <small>vs. last month</small>
          </span>
        </div>

        {/* KPI 2: Orders Count */}
        <div>
          <small>Orders Count</small>
          <strong>{analytics.totalOrders}</strong>
          <span className="positive">
            {analytics.totalDelivered} delivered · {analytics.totalProcessing} processing
          </span>
        </div>

        {/* KPI 3: Average Order Value */}
        <div>
          <small>Avg. Order Value</small>
          <strong>${analytics.averageOrderValue.toFixed(2)}</strong>
          <span className="positive">+4.6% <small>vs. last month</small></span>
        </div>

        {/* KPI 4: Low Stock Alerts */}
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

      {/* Grid: Revenue Overview Chart + One Clear Next Move Card */}
      <div className="dash-grid">
        
        {/* Revenue Overview Card */}
        <div className="dash-card revenue-card">
          <div className="card-top">
            <div>
              <h3>Revenue overview</h3>
              <p>Keep an eye on how your store is doing.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

          {/* SVG Line Chart with Gradient Fill & Hover Tooltips */}
          <div className="big-chart" style={{ position: 'relative' }}>
            <div className="chart-y">
              <span>$3k</span>
              <span>$2k</span>
              <span>$1k</span>
              <span>$0</span>
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
                {/* Gradient area under curve */}
                <path 
                  d="M0 205 C60 180 75 170 120 183 S190 150 230 164 S285 75 340 119 S390 148 430 98 S485 110 530 75 S590 92 630 47 S674 70 700 20 V230 H0Z" 
                  fill="url(#revenue-area-grad)" 
                />
                {/* Crisp emerald line */}
                <path 
                  d="M0 205 C60 180 75 170 120 183 S190 150 230 164 S285 75 340 119 S390 148 430 98 S485 110 530 75 S590 92 630 47 S674 70 700 20" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {chartPoints.map((pt, i) => (
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

              {/* Tooltip on hover */}
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
                {chartPoints.map((pt) => (
                  <span key={pt.label}>{pt.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: One Clear Next Move (Matching Dark Reference Card) */}
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

      {/* Recent Orders Section (Matching Reference Card) */}
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

        {orders.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--slate)', fontSize: '12px' }}>
            <ShoppingBag size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--navy)' }}>No orders yet</p>
            <p style={{ margin: 0 }}>Orders placed by customers on your live storefront will appear here automatically.</p>
          </div>
        ) : (
          <div className="orders" style={{ overflowX: 'auto' }}>
            {orders.slice(0, 5).map((o) => {
              const itemsSummary = o.items.map(i => `${i.name} × ${i.quantity}`).join(', ')
              const isDelivered = o.status === 'Delivered'
              const isProcessing = o.status === 'Placed' || o.status === 'Packed'
              const isCancelled = o.status === 'Cancelled'

              return (
                <div 
                  key={o.id} 
                  onClick={() => router.push(`/dashboard/orders?selected=${o.id}`)}
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s' }}
                  className="hover:bg-muted"
                >
                  <span className="order-id">{o.orderNumber}</span>
                  <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{o.customer.name}</span>
                  <span className="order-product" style={{ color: 'var(--slate)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {itemsSummary}
                  </span>
                  <strong>${o.total.toFixed(2)}</strong>
                  <b style={{
                    backgroundColor: isDelivered ? '#E4F8F0' : isProcessing ? '#FEF3C7' : isCancelled ? '#FEE2E2' : '#E0F2FE',
                    color: isDelivered ? '#07875D' : isProcessing ? '#A16207' : isCancelled ? '#B91C1C' : '#0369A1',
                  }}>
                    {o.status}
                  </b>
                </div>
<<<<<<< HEAD
              )
            })}
          </div>
        )}
=======
                <span>{activeStore.ownerName || 'Jamie Davis'}</span>
                <ChevronDown />
              </button>
            </div>
          </aside>

          {/* Main Dashboard Overview */}
          <main className="dashboard-main" style={{ padding: '28px' }}>
            
            {/* Header */}
            <div className="dashboard-header" style={{ marginBottom: '24px' }}>
              <div>
                <p className="eyebrow" style={{ margin: '0 0 4px' }}>Owner Dashboard</p>
                <h2 style={{ margin: 0 }}>Welcome back, {activeStore.ownerName || 'Jamie'}</h2>
              </div>
              <div className="dash-actions">
                <Link href="/dashboard/assistant" className="button button-green" style={{ padding: '8px 14px', fontSize: '11px' }}>
                  <Sparkles size={14} /> Launch Copilot Panel
                </Link>
              </div>
            </div>

            {/* Metric Grid from real database */}
            <div className="metric-grid" style={{ marginBottom: '20px' }}>
              <div>
                <small>Confirmed Net Revenue</small>
                <strong>${analytics.totalRevenue.toFixed(2)}</strong>
                <span className="positive">Live DB calculation</span>
              </div>
              <div>
                <small>Total Orders</small>
                <strong>{analytics.totalOrders}</strong>
                <span>{analytics.totalDelivered} completed</span>
              </div>
              <div>
                <small>Low Stock Alerts</small>
                <strong style={{ color: analytics.lowStockCount > 0 ? '#EA580C' : '#059669' }}>
                  {analytics.lowStockCount}
                </strong>
                <span><Package size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> Stock ≤ 5 units</span>
              </div>
              <div>
                <small>Awaiting Fulfillment</small>
                <strong style={{ color: analytics.totalProcessing > 0 ? '#7C3AED' : '#059669' }}>
                  {analytics.totalProcessing}
                </strong>
                <span>Placed or Packed</span>
              </div>
            </div>

            {/* AI Assistant Spotlight Card */}
            <div style={{
              background: 'linear-gradient(135deg, #101828 0%, #16243b 100%)',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '20px',
              border: '1px solid #1E293B',
              boxShadow: '0 8px 30px rgba(16, 24, 40, 0.12)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 1,
              }}>
                <div style={{ maxWidth: '640px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: '#10B981',
                      color: '#101828',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Sparkles size={14} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Task 5 • Grounded AI Business Assistant
                    </span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                    Query your store's real database without hallucinating figures.
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                    Access restock alerts (stock ≤ 5), best sellers from completed orders, net revenue sums, and fulfillment queues with verifiable evidence cards.
                  </p>

                  {/* Suggestion Prompt Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <Link href="/dashboard/assistant">
                      <button style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#1E293B',
                        color: '#FDBA74',
                        border: '1px solid #4338CA',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}>
                        <AlertTriangle size={12} color="#FB923C" />
                        <span>Restock alerts ({lowStockItems.length} low)</span>
                      </button>
                    </Link>

                    <Link href="/dashboard/assistant">
                      <button style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#1E293B',
                        color: '#7DD3FC',
                        border: '1px solid #0369A1',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}>
                        <TrendingUp size={12} color="#38BDF8" />
                        <span>Best sellers</span>
                      </button>
                    </Link>

                    <Link href="/dashboard/assistant">
                      <button style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#1E293B',
                        color: '#6EE7B7',
                        border: '1px solid #047857',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}>
                        <DollarSign size={12} color="#34D399" />
                        <span>Net revenue (${analytics.totalRevenue.toFixed(2)})</span>
                      </button>
                    </Link>

                    <Link href="/dashboard/assistant">
                      <button style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#1E293B',
                        color: '#C4B5FD',
                        border: '1px solid #6D28D9',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}>
                        <Truck size={12} color="#A78BFA" />
                        <span>Fulfillment queue ({pendingOrders.length})</span>
                      </button>
                    </Link>
                  </div>
                </div>

                <Link href="/dashboard/assistant">
                  <button className="button button-green" style={{ padding: '12px 20px', fontSize: '12px' }}>
                    Open Copilot <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </div>

            {/* Split Grid: Recent Orders & Catalog Low Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Orders Panel */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Recent Orders</h3>
                    <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748B' }}>Real database order log</p>
                  </div>
                  <Link href="/dashboard/assistant" style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                    Analyze with AI →
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} style={{
                      padding: '10px 12px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}>
                      <div>
                        <strong style={{ color: '#0F172A' }}>{o.orderNumber}</strong>
                        <span style={{ color: '#64748B', marginLeft: '8px' }}>{o.customer.name}</span>
                        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                          {o.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>${o.total.toFixed(2)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '10px',
                            backgroundColor: o.status === 'Delivered' ? '#DCFCE7' : '#FEF3C7',
                            color: o.status === 'Delivered' ? '#166534' : '#92400E',
                          }}>
                            {o.status}
                          </span>
                          {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                            <button
                              onClick={() => actions.updateOrderStatus(o.id, 'Delivered')}
                              style={{
                                fontSize: '9px',
                                padding: '2px 6px',
                                backgroundColor: '#10B981',
                                color: '#FFF',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                border: 'none'
                              }}
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Low Stock Watch */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Inventory Watchlist</h3>
                    <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748B' }}>Products with restock thresholds</p>
                  </div>
                  <Link href="/dashboard/assistant" style={{ fontSize: '11px', color: '#EA580C', fontWeight: 700 }}>
                    Restock Alerts →
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {products.map((p) => {
                    const isLow = p.stock <= 5
                    return (
                      <div key={p.id} style={{
                        padding: '10px 12px',
                        backgroundColor: isLow ? '#FFF7ED' : '#F8FAFC',
                        border: isLow ? '1px solid #FED7AA' : '1px solid #E2E8F0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                      }}>
                        <div>
                          <strong style={{ color: '#0F172A' }}>{p.name}</strong>
                          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                            {p.category} • SKU: {p.sku || 'N/A'} • ${p.price.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: isLow ? '#FEE2E2' : '#DCFCE7',
                            color: isLow ? '#991B1B' : '#166534',
                          }}>
                            {p.stock} units
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

          </main>

        </div>
>>>>>>> a412d8948cebfc156339f2f1431a38fe520bd292
      </div>

    </div>
  )
}
