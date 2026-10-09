'use client'

import { Product, ThemeConfig } from '@/lib/types'
import { Check, ChevronLeft, ChevronRight, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProductDrawerProps {
  product: Product | null
  theme: ThemeConfig
  isOpen: boolean
  onClose: () => void
  onAddToCart: (
    product: Product,
    quantity: number,
    variants: { size?: string; color?: string; finish?: string }
  ) => void
}

export function ProductDrawer({
  product,
  theme,
  isOpen,
  onClose,
  onAddToCart
}: ProductDrawerProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>()
  const [selectedColor, setSelectedColor] = useState<string | undefined>()
  const [selectedFinish, setSelectedFinish] = useState<string | undefined>()
  const [addedSuccess, setAddedSuccess] = useState(false)

  // Initialize or reset selections when a new product is selected
  useEffect(() => {
    if (product) {
      setSelectedImageIdx(0)
      setQuantity(1)
      setAddedSuccess(false)
      setSelectedSize(product.variants.sizes?.[0])
      setSelectedColor(product.variants.colors?.[0]?.name)
      setSelectedFinish(product.variants.finishes?.[0])
    }
  }, [product])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const isOutOfStock = product.inventory <= 0
  const isLowStock = product.inventory > 0 && product.inventory <= product.lowStockThreshold
  const maxAvailable = product.inventory

  const handleIncrement = () => {
    if (quantity < maxAvailable) {
      setQuantity((q) => q + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1)
    }
  }

  const handleAdd = () => {
    if (isOutOfStock) return
    onAddToCart(product, quantity, {
      size: selectedSize,
      color: selectedColor,
      finish: selectedFinish
    })
    setAddedSuccess(true)
    setTimeout(() => {
      setAddedSuccess(false)
    }, 2000)
  }

  const currentImage = product.images[selectedImageIdx] || product.images[0]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className="relative z-10 flex h-full w-full max-w-2xl flex-col shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: theme.surface,
          color: theme.ink
        }}
      >
        {/* Drawer Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: theme.inkMuted }}
            >
              {product.category}
            </span>
            <span className="text-xs opacity-40">·</span>
            <span className="font-mono text-xs opacity-60">{product.sku}</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-slate-200/50"
            aria-label="Close product details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left: Image Gallery */}
            <div className="flex flex-col gap-3">
              {/* Main Image with Zoom */}
              <div
                className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100 border"
                style={{ borderColor: theme.border }}
              >
                <img
                  src={currentImage}
                  alt={product.title}
                  className="h-full w-full object-cover object-center"
                />

                {/* Next / Previous image buttons if multiple images */}
                {product.images.length > 1 && (
                  <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between">
                    <button
                      onClick={() =>
                        setSelectedImageIdx((idx) =>
                          idx === 0 ? product.images.length - 1 : idx - 1
                        )
                      }
                      className="rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4 text-slate-800" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIdx((idx) =>
                          idx === product.images.length - 1 ? 0 : idx + 1
                        )
                      }
                      className="rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-white"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4 text-slate-800" />
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery Row */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIdx(i)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                        selectedImageIdx === i
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} thumbnail ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees */}
              <div
                className="mt-4 rounded-lg p-3 text-xs flex flex-col gap-2"
                style={{ backgroundColor: theme.surfaceSubtle }}
              >
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Authentic numbered edition</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <PackageCheck className="h-4 w-4 text-emerald-600" />
                  <span>Carbon-neutral insured shipping</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details, Variants, Inventory & Add-to-Cart */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Title and Subtitle */}
                <h2
                  className="text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ fontFamily: theme.fontHeadline }}
                >
                  {product.title}
                </h2>
                <p className="mt-1 text-sm font-medium" style={{ color: theme.inkMuted }}>
                  {product.subtitle}
                </p>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold" style={{ color: theme.ink }}>
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-base line-through opacity-50">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                      Save ${(product.compareAtPrice - product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Live Inventory Status Pill */}
                <div className="mt-4">
                  {isOutOfStock ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <span>Out of Stock</span>
                    </div>
                  ) : isLowStock ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>Low Stock: Only {product.inventory} units available</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>In Stock: {product.inventory} units ready to ship</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="mt-5 text-sm leading-relaxed" style={{ color: theme.inkMuted }}>
                  {product.description}
                </p>

                {/* Variant 1: Size Selector */}
                {product.variants.sizes && product.variants.sizes.length > 0 && (
                  <div className="mt-6">
                    <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: theme.ink }}>
                      Size: <span className="font-semibold normal-case text-emerald-600">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.sizes.map((size) => {
                        const isSelected = selectedSize === size
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`rounded px-3.5 py-1.5 text-xs font-semibold transition border ${
                              isSelected
                                ? 'border-black bg-black text-white shadow-sm ring-2 ring-black/20'
                                : 'border-slate-300 hover:border-slate-500'
                            }`}
                            style={{
                              backgroundColor: isSelected ? theme.accent : undefined,
                              color: isSelected ? theme.accentForeground : undefined,
                              borderColor: isSelected ? theme.accent : theme.border
                            }}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Variant 2: Color Swatches */}
                {product.variants.colors && product.variants.colors.length > 0 && (
                  <div className="mt-6">
                    <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: theme.ink }}>
                      Color: <span className="font-semibold normal-case text-emerald-600">{selectedColor}</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.colors.map((color) => {
                        const isSelected = selectedColor === color.name
                        return (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                              isSelected
                                ? 'ring-2 ring-offset-2'
                                : 'hover:opacity-100'
                            }`}
                            style={{
                              borderColor: theme.border,
                              boxShadow: isSelected ? `0 0 0 2px ${theme.accent}` : undefined
                            }}
                            title={color.name}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span>{color.name}</span>
                            {isSelected && <Check className="h-3 w-3" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Variant 3: Finish Selector */}
                {product.variants.finishes && product.variants.finishes.length > 0 && (
                  <div className="mt-6">
                    <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: theme.ink }}>
                      Finish: <span className="font-semibold normal-case text-emerald-600">{selectedFinish}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.finishes.map((finish) => {
                        const isSelected = selectedFinish === finish
                        return (
                          <button
                            key={finish}
                            onClick={() => setSelectedFinish(finish)}
                            className={`rounded px-3 py-1.5 text-xs font-semibold transition border ${
                              isSelected
                                ? 'shadow-sm'
                                : 'hover:border-slate-400'
                            }`}
                            style={{
                              backgroundColor: isSelected ? theme.surfaceSubtle : undefined,
                              borderColor: isSelected ? theme.accent : theme.border,
                              color: isSelected ? theme.accent : theme.ink
                            }}
                          >
                            {finish}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Features Bullet Points */}
                {product.features && product.features.length > 0 && (
                  <div className="mt-6 border-t pt-4" style={{ borderColor: theme.border }}>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Specifications</h4>
                    <ul className="space-y-1.5 text-xs" style={{ color: theme.inkMuted }}>
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-bold text-emerald-600">·</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Actions: Quantity Picker & Add-to-Cart */}
              <div className="mt-8 border-t pt-6" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-4">
                  {/* Quantity Picker */}
                  <div
                    className="flex items-center rounded-lg border p-1"
                    style={{ borderColor: theme.border }}
                  >
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= maxAvailable || isOutOfStock}
                      className="rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold shadow-md transition-all ${
                      isOutOfStock
                        ? 'cursor-not-allowed bg-slate-300 text-slate-500 opacity-60'
                        : addedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'hover:opacity-95 active:scale-[0.99]'
                    }`}
                    style={{
                      backgroundColor: isOutOfStock
                        ? undefined
                        : addedSuccess
                        ? undefined
                        : theme.accent,
                      color: isOutOfStock
                        ? undefined
                        : addedSuccess
                        ? undefined
                        : theme.accentForeground,
                      borderRadius: theme.buttonRadius
                    }}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : isOutOfStock ? (
                      <span>Sold Out</span>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        <span>
                          Add {quantity} to Bag · ${(product.price * quantity).toFixed(2)}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
