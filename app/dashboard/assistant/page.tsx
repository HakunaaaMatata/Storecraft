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
  ArrowLeft 
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { CopilotChat } from '@/components/dashboard/copilot-chat'

export default function AssistantDashboardPage() {
  const { activeStore, analytics, isClient } = useStorecraft()

  if (!isClient || !activeStore) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Loading StoreCraft Business Copilot...</p>
      </div>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#EEF3F1' }}>
      {/* Top Navbar */}
      <header className="site-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" className="brand">
            <div className="brand-mark"><span /></div>
            <span className="brand-name">StoreCraft</span>
          </Link>
          <span style={{ color: 'var(--line)', fontSize: '18px' }}>/</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#10B981" /> AI Business Assistant
          </span>
        </div>

        <div className="header-actions">
          <Link href="/dashboard" className="button button-dark" style={{ padding: '8px 14px', fontSize: '11px' }}>
            <ArrowLeft size={13} /> Return to Overview
          </Link>
        </div>
      </header>

      {/* Owner Dashboard Container */}
      <div className="dashboard-section" style={{ padding: '30px 4vw' }}>
        <div className="dashboard-shell" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          
          {/* Dashboard Sidebar Navigation */}
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
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%' }}>
                  <LayoutDashboard /> Overview
                </button>
              </Link>

              <Link href="/dashboard/theme" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%' }}>
                  <Palette /> Theme Studio
                </button>
              </Link>

              <button className="active" style={{ width: '100%' }}>
                <Sparkles /> AI Assistant
              </button>
            </nav>

            {/* Quick Live Telemetry in sidebar */}
            <div style={{
              margin: '24px 0',
              padding: '12px',
              backgroundColor: '#F8FAFC',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              fontSize: '11px',
            }}>
              <div style={{ fontWeight: 800, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                Database Feeds
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: '4px' }}>
                <span>Net Rev:</span>
                <strong style={{ color: '#0F172A' }}>${analytics.totalRevenue.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: '4px' }}>
                <span>Low Stock:</span>
                <strong style={{ color: analytics.lowStockCount > 0 ? '#EA580C' : '#059669' }}>
                  {analytics.lowStockCount} items
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Pending Fulfill:</span>
                <strong style={{ color: analytics.totalProcessing > 0 ? '#7C3AED' : '#64748B' }}>
                  {analytics.totalProcessing} orders
                </strong>
              </div>
            </div>

            <div className="nav-bottom">
              <button>
                <CircleHelp /> Help center
              </button>
              <button>
                <div className="avatar small">
                  {activeStore.ownerName ? activeStore.ownerName.split(' ').map(n => n[0]).join('') : 'JD'}
                </div>
                <span>{activeStore.ownerName || 'Store Owner'}</span>
                <ChevronDown />
              </button>
            </div>
          </aside>

          {/* Main Dashboard Copilot Workspace */}
          <main className="dashboard-main" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <div>
                <p className="eyebrow" style={{ margin: '0 0 4px', color: '#059669' }}>
                  Owner Copilot Panel
                </p>
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
                  Grounded AI Business Assistant
                </h1>
              </div>

              {/* Status Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#065F46',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                Real-Time Grounding Active
              </div>
            </div>

            {/* Dedicated Copilot Panel */}
            <CopilotChat />
          </main>

        </div>
      </div>
    </main>
  )
}
