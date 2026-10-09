'use client'

import { CartItem, ThemeConfig } from '@/lib/types'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { useEffect } from 'react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  theme: ThemeConfig
  onUpdateQuantity: (itemId: string, newQuantity: number) => void
  onRemoveItem: (itemId: string) => void
  onProceedToCheckout: () => void
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  theme,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}: CartDrawerProps) {
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

  if (!isOpen) return null

  // Real-time calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const freeShippingThreshold = 100
  const isFreeShipping = subtotal >= freeShippingThreshold
  const shipping = items.length === 0 ? 0 : isFreeShipping ? 0 : 10
  const total = Math.round((subtotal + tax + shipping) * 100) / 100
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal)
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="relative z-10 flex h-full w-full max-w-md flex-col shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: theme.surface,
          color: theme.ink
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-base font-bold">Your Bag ({items.reduce((s, i) => s + i.quantity, 0)})</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-slate-200/50"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div
          className="border-b px-6 py-3 text-xs"
          style={{
            backgroundColor: theme.surfaceSubtle,
            borderColor: theme.border
          }}
        >
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-600" />
              {isFreeShipping ? (
                <span className="text-emerald-700 font-bold">
                  Unlocked Free Standard Shipping! 🎉
                </span>
              ) : (
                <span>
                  Add <strong>${amountToFreeShipping.toFixed(2)}</strong> for Free Shipping
                </span>
              )}
            </span>
            <span className="text-[11px] opacity-75">{shippingProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${shippingProgress}%`,
                backgroundColor: isFreeShipping ? '#10b981' : theme.accent
              }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.surfaceSubtle }}
              >
                <ShoppingBag className="h-8 w-8 opacity-40" />
              </div>
              <h3 className="mt-4 text-base font-bold">Your bag is empty</h3>
              <p className="mt-1 max-w-xs text-xs opacity-60">
                Explore the catalog and discover artisan-crafted goods for your space.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-lg px-5 py-2.5 text-xs font-bold shadow"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentForeground,
                  borderRadius: theme.buttonRadius
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 border-b pb-4 last:border-b-0"
                  style={{ borderColor: theme.border }}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-20 flex-shrink-0 rounded-md object-cover border"
                    style={{ borderColor: theme.border }}
                  />

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold leading-tight">{item.title}</h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 transition hover:text-rose-500"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Variant Tags */}
                      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-500">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && (
                          <span>· Color: {item.selectedColor}</span>
                        )}
                        {item.selectedFinish && (
                          <span>· Finish: {item.selectedFinish}</span>
                        )}
                      </div>

                      <div className="mt-1 font-mono text-[10px] opacity-40">
                        {item.sku}
                      </div>
                    </div>

                    {/* Quantity & Line Total */}
                    <div className="mt-2 flex items-center justify-between">
                      {/* Counter */}
                      <div
                        className="flex items-center rounded border p-0.5"
                        style={{ borderColor: theme.border }}
                      >
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxInventory}
                          className="p-1 hover:bg-slate-100 disabled:opacity-30"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Financial Calculations */}
        {items.length > 0 && (
          <div
            className="border-t p-6 shadow-lg"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border
            }}
          >
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Sales Tax (8%)</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Standard Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div
                className="flex justify-between border-t pt-2.5 text-sm font-extrabold"
                style={{ borderColor: theme.border }}
              >
                <span>Estimated Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="mt-4 flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: theme.accent,
                color: theme.accentForeground,
                borderRadius: theme.buttonRadius
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-2 text-center text-[10px] text-slate-400">
              Demo Checkout · No real credit card or charges required
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
