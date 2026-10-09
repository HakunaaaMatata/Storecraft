'use client'

import { Store, ThemeConfig } from '@/lib/types'
import { Search, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'

interface StoreHeaderProps {
  store: Store
  theme: ThemeConfig
  cartCount: number
  cartTotal: number
  onOpenCart: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  activeCategory: string
  onCategorySelect: (category: string) => void
  showAnnouncement?: boolean
}

export function StoreHeader({
  store,
  theme,
  cartCount,
  cartTotal,
  onOpenCart,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategorySelect,
  showAnnouncement = true
}: StoreHeaderProps) {
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true)
  
  const isActuallyShowingAnnouncement = showAnnouncement && isAnnouncementVisible && !!store.announcement;
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-8 z-40 w-full transition-colors duration-300">
      {/* 1. Announcement Banner */}
      {isActuallyShowingAnnouncement && (
        <div
          className="relative px-4 py-2 text-center text-xs font-medium tracking-wide transition-colors"
          style={{
            backgroundColor: theme.announcementBg,
            color: theme.announcementInk,
            fontFamily: theme.fontBody
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 pr-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <p className="truncate text-[11px] sm:text-xs">{store.announcement}</p>
          </div>
          <button
            onClick={() => setIsAnnouncementVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"
            aria-label="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div
        className="backdrop-blur-md transition-colors"
        style={{
          backgroundColor: `${theme.surface}e6`,
          borderBottom: `1px solid ${theme.border}`,
          color: theme.ink
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                onCategorySelect('All')
                onSearchChange('')
              }}
              className="text-left font-bold tracking-tight transition-transform hover:scale-[1.01]"
              style={{
                fontFamily: theme.fontHeadline,
                fontSize: theme.id === 'atelier' ? '1.5rem' : '1.35rem'
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center text-xs font-black"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.accentForeground,
                    borderRadius: theme.buttonRadius
                  }}
                >
                  {store.name.charAt(0)}
                </span>
                <span>{store.name}</span>
              </div>
            </button>

            {/* Desktop Category navigation */}
            <nav className="hidden items-center gap-5 lg:flex">
              {store.categories.slice(0, 5).map((category) => (
                <button
                  key={category}
                  onClick={() => onCategorySelect(category)}
                  className={`text-xs font-semibold tracking-wider uppercase transition-colors ${
                    activeCategory === category ? 'underline underline-offset-8' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    fontFamily: theme.fontBody,
                    color: activeCategory === category ? theme.accent : theme.ink
                  }}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Action Icons (Search, Cart) */}
          <div className="flex items-center gap-3">
            {/* Live Search bar toggle or input */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs shadow-inner"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.bg,
                    color: theme.ink
                  }}
                >
                  <Search className="h-3.5 w-3.5 opacity-60" />
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    className="w-28 bg-transparent text-xs outline-none sm:w-44"
                    style={{ color: theme.ink }}
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false)
                      onSearchChange('')
                    }}
                    className="opacity-60 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border p-2 text-xs font-medium transition hover:shadow-sm sm:px-3 sm:py-1.5"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    color: theme.ink
                  }}
                  title="Search products"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              )}
            </div>

            {/* Cart Slide-out trigger button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{
                backgroundColor: theme.accent,
                color: theme.accentForeground,
                borderRadius: theme.buttonRadius
              }}
              aria-label={`Open shopping bag, ${cartCount} items`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black shadow-sm"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.ink
                  }}
                >
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="hidden text-[11px] font-semibold opacity-90 md:inline">
                  · ${cartTotal.toFixed(2)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
