'use client'

import React from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Palette, 
  Sparkles, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  CircleHelp, 
  ChevronDown, 
  Search, 
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Truck,
  Plus
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'

export default function DashboardOverviewPage() {
  const { activeStore, products, orders, analytics, actions, isClient } = useStorecraft()

  if (!isClient || !activeStore) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Loading StoreCraft Owner Dashboard...</p>
      </div>
    )
  }

  const lowStockItems = products.filter(p => p.stock <= 5)
  const pendingOrders = orders.filter(o => o.status === 'Placed' || o.status === 'Packed')

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#EEF3F1' }}>
      {/* Top Header */}
      <header className="site-header">
        <Link href="/" className="brand">
          <div className="brand-mark"><span /></div>
          <span className="brand-name">StoreCraft</span>
        </Link>
        <nav>
          <Link href="/dashboard" style={{ color: 'var(--navy)', fontWeight: 700 }}>Overview</Link>
          <Link href="/dashboard/assistant">AI Assistant</Link>
          <Link href="/dashboard/theme">Theme Customizer</Link>
          <Link href="/onboard">Store Setup</Link>
          <Link href={`/store/${activeStore.slug}`}>Live Storefront</Link>
        </nav>
        <div className="header-actions">
          <Link href="/dashboard/assistant" className="button button-green" style={{ padding: '9px 15px', fontSize: '11px' }}>
            <Sparkles size={14} /> Open AI Copilot
          </Link>
        </div>
      </header>

      {/* Dashboard Section */}
      <div className="dashboard-section" style={{ padding: '30px 4vw' }}>
        <div className="dashboard-shell" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          
          {/* Dashboard Nav Sidebar */}
          <aside className="dashboard-nav" style={{ width: '230px' }}>
            <div className="store-switch" style={{ margin: '10px 0 24px' }}>
              <div className="store-avatar">
                {activeStore.name.charAt(0)}
              </div>
              <div>
                <strong>{activeStore.name}</strong>
                <small>{activeStore.businessType || 'Store Owner'}</small>
              </div>
              <ChevronDown />
            </div>

            <nav>
              <button className="active" style={{ width: '100%' }}>
                <LayoutDashboard /> Overview
              </button>

              <Link href="/dashboard/theme" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%' }}>
                  <Palette /> Theme Studio
                </button>
              </Link>

              <Link href="/dashboard/assistant" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', color: '#059669', fontWeight: 700 }}>
                  <Sparkles size={14} /> AI Assistant
                </button>
              </Link>
            </nav>

            <div className="nav-bottom">
              <button>
                <CircleHelp /> Help center
              </button>
              <button>
                <div className="avatar small">
                  {activeStore.ownerName ? activeStore.ownerName.split(' ').map(n => n[0]).join('') : 'JD'}
                </div>
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
      </div>
    </main>
  )
}
