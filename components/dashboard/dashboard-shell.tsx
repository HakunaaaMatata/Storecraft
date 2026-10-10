'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Upload, 
  ShoppingBag, 
  Palette, 
  Sparkles, 
  CircleHelp, 
  ChevronDown, 
  Search, 
  Bell, 
  Check, 
  Plus, 
  ExternalLink, 
  Menu, 
  X, 
  LogOut, 
  RotateCcw,
  Store as StoreIcon,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { useAuth } from '@/lib/use-auth'

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { activeStore, stores, products, orders, analytics, actions, isClient } = useStorecraft()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [authLoading, isAuthenticated, pathname, router])

  // Dropdown states
  const [storeMenuOpen, setStoreMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notifMenuOpen, setNotifMenuOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [readNotifs, setReadNotifs] = useState<string[]>([])

  const storeMenuRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notifMenuRef = useRef<HTMLDivElement>(null)

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target as Node)) {
        setStoreMenuOpen(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (!isClient || authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF3F1' }}>
        <p style={{ color: 'var(--slate)', fontSize: '14px', fontWeight: 600 }}>Loading StoreCraft Dashboard...</p>
      </div>
    )
  }

  // Handle zero stores state gracefully
  if (!activeStore && stores.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF3F1', padding: '20px' }}>
        <div style={{ maxWidth: '420px', backgroundColor: '#FFFFFF', padding: '36px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--line)', boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <StoreIcon size={24} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: 'var(--navy)' }}>No Store Found</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate)', lineHeight: '1.6', margin: '0 0 24px' }}>
            You haven't set up a store yet. Launch your storefront in minutes with our store wizard.
          </p>
          <Link href="/onboard" className="button button-green" style={{ width: '100%' }}>
            Build Your Store <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  // Notifications generated from real store inventory and order states
  const lowStockItems = products.filter(p => p.stock <= 5)
  const notifications = [
    ...lowStockItems.map(p => ({
      id: `low-${p.id}`,
      type: 'warning',
      title: `Low Stock: ${p.name}`,
      description: `Only ${p.stock} units remaining in inventory.`,
      link: '/dashboard/products',
      time: 'Inventory alert'
    })),
    ...orders.slice(0, 3).map(o => ({
      id: `ord-${o.id}`,
      type: 'order',
      title: `Order ${o.orderNumber} (${o.status})`,
      description: `${o.customer.name} - $${o.total.toFixed(2)}`,
      link: '/dashboard/orders',
      time: 'Recent order'
    })),
    {
      id: 'store-live',
      type: 'success',
      title: 'Storefront Active',
      description: `${activeStore?.name} is live and ready for customers.`,
      link: `/store/${activeStore?.slug}`,
      time: 'System'
    }
  ]

  const unreadCount = notifications.filter(n => !readNotifs.includes(n.id)).length

  const markAllRead = () => {
    setReadNotifs(notifications.map(n => n.id))
  }

  // Navigation Items
  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Products', href: '/dashboard/products', icon: Package, exact: true },
    { label: 'Import Products', href: '/dashboard/products/import', icon: Upload, exact: true },
    { label: 'Orders', href: '/dashboard/orders', icon: ShoppingBag, exact: false },
    { label: 'Theme Studio', href: '/dashboard/theme', icon: Palette, exact: false },
    { label: 'AI Assistant', href: '/dashboard/assistant', icon: Sparkles, exact: false },
  ]

  const isNavActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname?.startsWith(item.href)
  }

  const displayName = user?.name || activeStore?.ownerName || 'Jamie Davis'
  const ownerInitials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EEF3F1', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Global Header */}
      <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            style={{ display: 'inline-flex', padding: '6px', marginRight: '4px' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/" className="brand">
            <div className="brand-mark"><span /></div>
            <span className="brand-name">StoreCraft</span>
          </Link>
          <span style={{ color: 'var(--line)', fontSize: '18px', display: 'none' }} className="md:inline">/</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate)', display: 'none' }} className="md:inline">
            Store Owner Workspace
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link 
            href="/dashboard" 
            style={{ color: pathname === '/dashboard' ? 'var(--navy)' : 'var(--slate)', fontWeight: pathname === '/dashboard' ? 800 : 600, fontSize: '13px' }}
          >
            Dashboard
          </Link>
          <Link 
            href="/dashboard/products" 
            style={{ color: pathname.startsWith('/dashboard/products') ? 'var(--navy)' : 'var(--slate)', fontWeight: pathname.startsWith('/dashboard/products') ? 800 : 600, fontSize: '13px' }}
          >
            Products
          </Link>
          <Link 
            href="/dashboard/orders" 
            style={{ color: pathname.startsWith('/dashboard/orders') ? 'var(--navy)' : 'var(--slate)', fontWeight: pathname.startsWith('/dashboard/orders') ? 800 : 600, fontSize: '13px' }}
          >
            Orders
          </Link>
        </nav>

        <div className="header-actions">
          {activeStore && (
            <Link 
              href={`https://${activeStore.slug}.stores.prosess.in`} 
              target="_blank"
              className="button button-green" 
              style={{ padding: '8px 14px', fontSize: '11px' }}
            >
              <span>Live Storefront</span>
              <ExternalLink size={13} />
            </Link>
          )}
        </div>
      </header>

      {/* Main Container Shell */}
      <div className="dashboard-section" style={{ padding: '24px 4vw', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="dashboard-shell" style={{ borderRadius: '8px', overflow: 'hidden', flex: 1, position: 'relative' }}>
          
          {/* Mobile Sidebar Overlay Drawer */}
          {mobileMenuOpen && (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(16, 24, 40, 0.5)',
                zIndex: 50,
                display: 'flex'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div 
                style={{
                  width: '260px',
                  backgroundColor: '#FFFFFF',
                  height: '100%',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <Link href="/" className="brand">
                    <div className="brand-mark"><span /></div>
                    <span className="brand-name">StoreCraft</span>
                  </Link>
                  <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', padding: '4px' }}>
                    <X size={18} />
                  </button>
                </div>

                <div className="store-switch" style={{ margin: '0 0 20px', cursor: 'pointer' }} onClick={() => setStoreMenuOpen(!storeMenuOpen)}>
                  <div className="store-avatar">
                    {activeStore ? activeStore.name.charAt(0) : 'S'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeStore?.name}</strong>
                    <small>{activeStore?.businessType || 'Pro Plan'}</small>
                  </div>
                  <ChevronDown size={14} />
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {navItems.map((item) => {
                    const active = isNavActive(item)
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                        <button 
                          className={active ? 'active' : ''} 
                          style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', fontSize: '12px' }}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </button>
                      </Link>
                    )
                  })}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                  <button 
                    onClick={() => { setHelpModalOpen(true); setMobileMenuOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', color: 'var(--slate)', fontSize: '11px', background: 'none' }}
                  >
                    <CircleHelp size={14} /> Help center
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar Navigation */}
          <aside className="dashboard-nav" style={{ width: '230px', flexShrink: 0 }}>
            
            {/* Store Switcher Dropdown */}
            <div ref={storeMenuRef} style={{ position: 'relative' }}>
              <div 
                className="store-switch" 
                style={{ margin: '10px 0 24px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setStoreMenuOpen(!storeMenuOpen)}
                aria-haspopup="true"
                aria-expanded={storeMenuOpen}
              >
                <div className="store-avatar">
                  {activeStore ? activeStore.name.charAt(0) : 'S'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeStore?.name}</strong>
                  <small>{activeStore?.businessType || 'Pro Plan'}</small>
                </div>
                <ChevronDown size={14} style={{ transform: storeMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {storeMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '-16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 30,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', fontSize: '10px', fontWeight: 800, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Your Stores
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {stores.map((s) => (
                      <div 
                        key={s.id}
                        onClick={() => {
                          actions.switchActiveStore(s.id)
                          setStoreMenuOpen(false)
                        }}
                        style={{
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: s.id === activeStore?.id ? '#F0FDF4' : 'transparent',
                          borderBottom: '1px solid #F1F5F9',
                          fontSize: '11px'
                        }}
                        className="hover:bg-muted"
                      >
                        <div>
                          <strong style={{ display: 'block', color: 'var(--navy)' }}>{s.name}</strong>
                          <span style={{ fontSize: '9px', color: 'var(--slate)' }}>/{s.slug}</span>
                        </div>
                        {s.id === activeStore?.id && <Check size={14} color="#10B981" />}
                      </div>
                    ))}
                  </div>
                  <Link 
                    href="/onboard"
                    onClick={() => setStoreMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#07875D',
                      backgroundColor: '#F8FAFC',
                      textDecoration: 'none'
                    }}
                  >
                    <Plus size={14} /> Build New Store
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar Navigation Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => {
                const active = isNavActive(item)
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                    <button 
                      className={active ? 'active' : ''} 
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        fontWeight: active ? 800 : 500,
                        backgroundColor: active ? '#E4F8F0' : 'transparent',
                        color: active ? '#07875D' : '#667085'
                      }}
                    >
                      <Icon size={14} /> {item.label}
                    </button>
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Section */}
            <div className="nav-bottom" style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <button onClick={() => setHelpModalOpen(true)} style={{ width: '100%', textAlign: 'left' }}>
                <CircleHelp size={14} /> Help center
              </button>

              {/* User Profile Menu */}
              <div ref={profileMenuRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar small" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                      {ownerInitials}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--navy)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeStore?.ownerName || 'Store Owner'}
                    </span>
                  </div>
                  <ChevronDown size={12} style={{ color: 'var(--slate)' }} />
                </button>

                {profileMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    right: 0,
                    marginBottom: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    zIndex: 30,
                    padding: '8px 0',
                    fontSize: '11px'
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>
                      <strong style={{ display: 'block', color: 'var(--navy)' }}>{user?.name || activeStore?.ownerName || 'Jamie Davis'}</strong>
                      <span style={{ fontSize: '10px', color: 'var(--slate)' }}>{user?.email || activeStore?.email || 'owner@storecraft.app'}</span>
                    </div>
                    <button 
                      onClick={() => {
                        actions.resetDemo()
                        setProfileMenuOpen(false)
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--navy)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                      className="hover:bg-muted"
                    >
                      <RotateCcw size={13} color="#64748B" /> Reset Demo Data
                    </button>
                    <button 
                      onClick={async () => {
                        await logout()
                        router.push('/login')
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        color: '#DC2626',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                      className="hover:bg-muted"
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Dashboard Area */}
          <main className="dashboard-main" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            {/* Top Bar inside Dashboard Shell */}
            <header className="dashboard-header" style={{ marginBottom: '20px' }}>
              <div>
                <p className="eyebrow" style={{ margin: '0 0 4px' }}>
                  {pathname === '/dashboard' ? 'Overview' :
                   pathname === '/dashboard/products' ? 'Inventory Manager' :
                   pathname === '/dashboard/products/import' ? 'Catalog Import' :
                   pathname === '/dashboard/orders' ? 'Fulfillment' :
                   pathname === '/dashboard/theme' ? 'Theme Studio' : 'Workspace'}
                </p>
                <h2 style={{ margin: 0 }}>
                  {pathname === '/dashboard' ? `Good morning, ${activeStore?.ownerName?.split(' ')[0] || 'Jamie'}` :
                   pathname === '/dashboard/products' ? 'Products & Inventory' :
                   pathname === '/dashboard/products/import' ? 'Import Products' :
                   pathname === '/dashboard/orders' ? 'Orders & Fulfillment' :
                   pathname === '/dashboard/theme' ? 'Storefront Theme Studio' : activeStore?.name}
                </h2>
              </div>

              <div className="dash-actions" style={{ position: 'relative' }}>
                
                {/* Notification Bell with Badge & Dropdown */}
                <div ref={notifMenuRef} style={{ position: 'relative' }}>
                  <button 
                    className="notification" 
                    onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                    aria-label="Notifications"
                    style={{ position: 'relative', cursor: 'pointer' }}
                  >
                    <Bell size={14} color="#667085" />
                    {unreadCount > 0 && <span />}
                  </button>

                  {notifMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      width: '320px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                      zIndex: 50,
                      overflow: 'hidden'
                    }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>Store Notifications</strong>
                          <span style={{ fontSize: '10px', color: 'var(--slate)', display: 'block' }}>{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</span>
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllRead} 
                            style={{ fontSize: '10px', color: '#07875D', fontWeight: 700, background: 'none', cursor: 'pointer' }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--slate)', fontSize: '12px' }}>
                            No notifications right now.
                          </div>
                        ) : (
                          notifications.map((n) => {
                            const isRead = readNotifs.includes(n.id)
                            return (
                              <Link 
                                key={n.id} 
                                href={n.link}
                                onClick={() => {
                                  setReadNotifs(prev => [...prev, n.id])
                                  setNotifMenuOpen(false)
                                }}
                                style={{
                                  display: 'block',
                                  padding: '10px 14px',
                                  borderBottom: '1px solid #F1F5F9',
                                  backgroundColor: isRead ? '#FFFFFF' : '#F0FDF4',
                                  textDecoration: 'none'
                                }}
                                className="hover:bg-muted"
                              >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  {n.type === 'warning' ? (
                                    <AlertTriangle size={14} color="#EA580C" style={{ flexShrink: 0, marginTop: '2px' }} />
                                  ) : n.type === 'order' ? (
                                    <ShoppingBag size={14} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                                  ) : (
                                    <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                  )}
                                  <div>
                                    <strong style={{ fontSize: '11px', color: 'var(--navy)', display: 'block' }}>{n.title}</strong>
                                    <p style={{ fontSize: '11px', color: 'var(--slate)', margin: '2px 0 0', lineHeight: '1.4' }}>{n.description}</p>
                                    <span style={{ fontSize: '9px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>{n.time}</span>
                                  </div>
                                </div>
                              </Link>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar Badge */}
                <div className="avatar" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                  {ownerInitials}
                </div>
              </div>
            </header>

            {/* Live Storefront Status Banner (Matching UI Reference) */}
            {activeStore && (
              <div className="demo-banner" style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 0 3px #D1FAE5' }} />
                  <span>
                    Store is live: <strong>{activeStore.slug}.stores.prosess.in</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Link 
                    href={`https://${activeStore.slug}.stores.prosess.in`} 
                    target="_blank" 
                    style={{ fontSize: '11px', fontWeight: 800, color: '#087D58', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Visit Storefront <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            )}

            {/* Page Main Content */}
            <div style={{ flex: 1, minHeight: 0 }}>
              {children}
            </div>

          </main>

        </div>
      </div>

      {/* Help Center Modal */}
      {helpModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 24, 40, 0.5)',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            border: '1px solid var(--line)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>StoreCraft Help Center</h3>
                <p style={{ fontSize: '12px', color: 'var(--slate)', margin: '4px 0 0' }}>Quick answers for running your store.</p>
              </div>
              <button onClick={() => setHelpModalOpen(false)} style={{ background: 'none', cursor: 'pointer', color: 'var(--slate)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px', color: 'var(--navy)' }}>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Managing Products</strong>
                <p style={{ margin: 0, color: 'var(--slate)', lineHeight: '1.5' }}>
                  Navigate to <strong>Products</strong> to add, edit, or remove catalog items. Items with stock ≤ 5 will automatically trigger low-stock alerts.
                </p>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Order Fulfillment Workflow</strong>
                <p style={{ margin: 0, color: 'var(--slate)', lineHeight: '1.5' }}>
                  Orders advance step-by-step: <strong>Placed → Packed → Shipped → Delivered</strong>. Status transitions are recorded with exact timestamps.
                </p>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Catalog Importer</strong>
                <p style={{ margin: 0, color: 'var(--slate)', lineHeight: '1.5' }}>
                  Go to <strong>Import Products</strong> to upload CSV files. Map column headers, preview valid and invalid rows, and confirm import with one click.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={() => setHelpModalOpen(false)} 
                className="button button-dark" 
                style={{ padding: '9px 18px', fontSize: '11px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
