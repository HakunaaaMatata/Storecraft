'use client'

import { Store, ThemeConfig } from '@/lib/types'
import { ArrowDown, Sparkles } from 'lucide-react'

interface StoreHeroProps {
  store: Store
  theme: ThemeConfig
  onScrollToCatalog: () => void
}

export function StoreHero({ store, theme, onScrollToCatalog }: StoreHeroProps) {
  // Preset specific visual adjustments
  const isDark = theme.id === 'circuit'
  const isEditorial = theme.id === 'atelier'
  const isMarket = theme.id === 'market'

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24 md:py-32"
      style={{
        backgroundColor: theme.bg,
        color: theme.ink
      }}
    >
      {/* Background Graphic or Subtle Gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, ${theme.accent} 0%, transparent 60%)`
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headlines & Call to Action */}
          <div className="lg:col-span-7">
            {/* Theme Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeInk,
                fontFamily: theme.fontBody
              }}
            >
              <Sparkles className="h-3 w-3" />
              <span>{theme.heroBadge || `${store.preset.toUpperCase()} PRESET`}</span>
            </div>

            {/* Main Headline with Serif / Em typography */}
            <h1
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
              style={{
                fontFamily: theme.fontHeadline,
                lineHeight: 1.05
              }}
            >
              <span>{store.heroHeadline || theme.heroHeadline}</span>{' '}
              <em
                className={`font-normal ${isEditorial ? 'italic' : ''}`}
                style={{
                  color: isDark ? theme.accent : undefined
                }}
              >
                {store.heroHeadlineEm || theme.heroHeadlineEm}
              </em>
            </h1>

            {/* Subtitle */}
            <p
              className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
              style={{
                color: theme.inkMuted,
                fontFamily: theme.fontBody
              }}
            >
              {store.heroSubtitle || theme.heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onScrollToCatalog}
                className="group flex items-center gap-2 px-6 py-3.5 text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentForeground,
                  borderRadius: theme.buttonRadius
                }}
              >
                <span>{theme.heroCta}</span>
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </button>

              <div
                className="text-xs font-medium"
                style={{ color: theme.inkMuted }}
              >
                <span>{store.products.length} curated products in catalog</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5">
            <div
              className="relative overflow-hidden shadow-2xl transition-transform hover:scale-[1.01]"
              style={{
                borderRadius: theme.cardRadius,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface
              }}
            >
              {/* Product hero photo with atmospheric overlay */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
                <img
                  src={store.heroImage || theme.heroImage}
                  alt={store.name}
                  className="h-full w-full object-cover object-center"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(180deg, transparent 40%, rgba(12, 18, 25, 0.95))'
                      : 'linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.45))'
                  }}
                />

                {/* Floating pill badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                      Featured Collection
                    </span>
                    <h3 className="text-sm font-bold sm:text-base">
                      {store.name} Edition
                    </h3>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      color: '#ffffff'
                    }}
                  >
                    Autumn 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
