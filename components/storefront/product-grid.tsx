'use client'

import { Product, ThemeConfig } from '@/lib/types'
import { Check, Eye, Plus, Search, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

interface ProductGridProps {
  products: Product[]
  theme: ThemeConfig
  categories: string[]
  activeCategory: string
  onCategorySelect: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectProduct: (product: Product) => void
  onInstantAddToCart: (product: Product) => void
}

export function ProductGrid({
  products,
  theme,
  categories,
  activeCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onInstantAddToCart
}: ProductGridProps) {
  const [addedProductId, setAddedProductId] = useState<string | null>(null)

  // Filter products based on active category and live search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === 'All' || product.category.toLowerCase() === activeCategory.toLowerCase()

    const q = searchQuery.toLowerCase().trim()
    const matchesQuery =
      !q ||
      product.title.toLowerCase().includes(q) ||
      product.subtitle.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q)

    return matchesCategory && matchesQuery
  })

  const handleInstantAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    if (product.inventory <= 0) return

    onInstantAddToCart(product)
    setAddedProductId(product.id)
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current))
    }, 1500)
  }

  return (
    <section
      id="catalog"
      className="py-12 sm:py-16 md:py-20"
      style={{
        backgroundColor: theme.bg,
        color: theme.ink
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: theme.accent }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: theme.inkMuted }}
              >
                Catalog & Collection
              </span>
            </div>
            <h2
              className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
              style={{ fontFamily: theme.fontHeadline }}
            >
              Curated Goods
            </h2>
          </div>

          {/* Search Query Input */}
          <div className="flex items-center gap-2">
            <div
              className="flex w-full items-center gap-2 rounded-full border px-3.5 py-2 text-xs shadow-sm md:w-72"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.ink
              }}
            >
              <Search className="h-4 w-4 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products, materials, SKU..."
                className="w-full bg-transparent outline-none"
                style={{ color: theme.ink }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-xs opacity-50 hover:opacity-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mb-8 flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const count =
              category === 'All'
                ? products.length
                : products.filter((p) => p.category.toLowerCase() === category.toLowerCase()).length

            const isActive = activeCategory === category

            return (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'shadow-sm ring-1 ring-inset ring-black/10'
                    : 'border hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? theme.accent : theme.surface,
                  color: isActive ? theme.accentForeground : theme.ink,
                  borderColor: theme.border
                }}
              >
                <span>{category}</span>
                <span
                  className="rounded-full px-1.5 py-0.2 text-[10px] font-bold"
                  style={{
                    backgroundColor: isActive
                      ? 'rgba(255, 255, 255, 0.25)'
                      : theme.surfaceSubtle,
                    color: isActive ? theme.accentForeground : theme.inkMuted
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between text-xs" style={{ color: theme.inkMuted }}>
          <span>
            Showing <strong>{filteredProducts.length}</strong> of {products.length} products
            {activeCategory !== 'All' && ` in ${activeCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>

        {/* Empty Search State */}
        {filteredProducts.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface
            }}
          >
            <ShoppingBag className="mb-3 h-10 w-10 opacity-30" />
            <h3 className="text-base font-bold" style={{ color: theme.ink }}>
              No products found
            </h3>
            <p className="mt-1 max-w-sm text-xs" style={{ color: theme.inkMuted }}>
              We could not find any items matching your filters. Try clearing your search or switching categories.
            </p>
            <button
              onClick={() => {
                onSearchChange('')
                onCategorySelect('All')
              }}
              className="mt-4 rounded-md px-4 py-2 text-xs font-bold"
              style={{
                backgroundColor: theme.accent,
                color: theme.accentForeground,
                borderRadius: theme.buttonRadius
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Responsive Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.inventory <= 0
            const isLowStock = product.inventory > 0 && product.inventory <= product.lowStockThreshold
            const isJustAdded = addedProductId === product.id

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group relative flex cursor-pointer flex-col overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  borderRadius: theme.cardRadius,
                  borderColor: theme.border,
                  backgroundColor: theme.surface
                }}
              >
                {/* Product Image Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'}
                    alt={product.title}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Stock Availability Pill Badges */}
                  <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    {isOutOfStock ? (
                      <span className="flex items-center gap-1 rounded-full bg-rose-500/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-sm animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        Only {product.inventory} Left!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
                        In Stock ({product.inventory})
                      </span>
                    )}

                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md">
                      <Eye className="h-3.5 w-3.5" />
                      Quick View
                    </span>
                  </div>
                </div>

                {/* Product Meta & Information */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className="font-semibold uppercase tracking-wider"
                        style={{ color: theme.inkMuted }}
                      >
                        {product.category}
                      </span>
                      <span className="font-mono text-[10px] opacity-60">
                        {product.sku}
                      </span>
                    </div>

                    <h3
                      className="mt-1 text-sm font-bold tracking-tight sm:text-base"
                      style={{
                        color: theme.ink,
                        fontFamily: theme.fontHeadline
                      }}
                    >
                      {product.title}
                    </h3>

                    <p
                      className="mt-1 line-clamp-1 text-xs"
                      style={{ color: theme.inkMuted }}
                    >
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Price & Instant Add to Cart */}
                  <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: theme.border }}>
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold sm:text-lg" style={{ color: theme.ink }}>
                          ${product.price.toFixed(2)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs line-through opacity-50">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Instant Add to Cart Action */}
                    <button
                      onClick={(e) => handleInstantAdd(e, product)}
                      disabled={isOutOfStock}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all ${
                        isOutOfStock
                          ? 'cursor-not-allowed opacity-40 bg-slate-300 text-slate-700'
                          : isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'shadow-sm hover:scale-105 active:scale-95'
                      }`}
                      style={{
                        backgroundColor: isOutOfStock
                          ? undefined
                          : isJustAdded
                          ? undefined
                          : theme.accent,
                        color: isOutOfStock
                          ? undefined
                          : isJustAdded
                          ? undefined
                          : theme.accentForeground,
                        borderRadius: theme.buttonRadius
                      }}
                      title={isOutOfStock ? 'Product out of stock' : 'Instant Add to Cart'}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Added!</span>
                        </>
                      ) : isOutOfStock ? (
                        <span>Sold Out</span>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
