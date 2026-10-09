'use client'

import { CartItem, Order, ShippingAddress, Store, ThemeConfig } from '@/lib/types'
import { AlertCircle, Check, CreditCard, Loader2, Lock, ShieldCheck, Sparkles, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { OrderReceipt } from './order-receipt'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  store: Store
  theme: ThemeConfig
  cartItems: CartItem[]
  onOrderSuccess: (order: Order) => void
}

export function CheckoutModal({
  isOpen,
  onClose,
  store,
  theme,
  cartItems,
  onOrderSuccess
}: CheckoutModalProps) {
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  })

  const [paymentMethod, setPaymentMethod] = useState('Instant Demo Card (Pre-approved)')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

  if (!isOpen) return null

  // Financial calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const shipping = subtotal >= 100 ? 0 : 10
  const total = Math.round((subtotal + tax + shipping) * 100) / 100

  // 1-Click Autofill Demo Data
  const handleAutofill = () => {
    setFormData({
      fullName: 'Jamie Davis',
      email: 'jamie.davis@example.com',
      phone: '+1 (555) 392-8192',
      address: '428 Studio Lane, Suite 4B',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'United States'
    })
    setErrorMessage(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      setErrorMessage('Please fill in all required shipping fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          customer: formData,
          paymentMethod,
          items: cartItems,
          idempotencyKey
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process demo checkout')
      }

      // Order created successfully!
      setConfirmedOrder(data.order)
      // Reset idempotency key for future checkouts
      setIdempotencyKey(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7))
      onOrderSuccess(data.order)
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during checkout.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={confirmedOrder ? undefined : onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl transition-all"
        style={{
          backgroundColor: theme.surface,
          color: theme.ink
        }}
      >
        {/* If Order is Confirmed, show Order Confirmation Receipt */}
        {confirmedOrder ? (
          <div className="p-6 sm:p-8">
            <OrderReceipt
              order={confirmedOrder}
              theme={theme}
              onClose={() => {
                setConfirmedOrder(null)
                onClose()
              }}
            />
          </div>
        ) : (
          /* Otherwise show Checkout Form */
          <div>
            {/* Modal Header */}
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                <h2 className="text-base font-bold">Secure Demo Checkout</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofill}
                  className="flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                  title="Quick fill sample data"
                >
                  <Zap className="h-3 w-3 fill-emerald-600" />
                  <span>Autofill Sample Data</span>
                </button>

                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 opacity-60 hover:opacity-100"
                  aria-label="Close checkout"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Customer Shipping Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    1. Shipping Information
                  </h3>
                  <span className="text-[11px] text-slate-400">* Required</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Jamie Davis"
                      required
                      className="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        color: theme.ink
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. jamie@example.com"
                      required
                      className="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        color: theme.ink
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +1 555-0199"
                      className="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        color: theme.ink
                      }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. 428 Studio Lane, Suite 4B"
                      required
                      className="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        color: theme.ink
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Portland"
                      required
                      className="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        color: theme.ink
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. OR"
                        required
                        className="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                          color: theme.ink
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        ZIP / Postal *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="e.g. 97201"
                        required
                        className="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                          color: theme.ink
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  2. Payment Method (Sandbox Simulation)
                </h3>
                <div className="space-y-2">
                  {[
                    'Instant Demo Card (Pre-approved)',
                    'Store Credit Balance (Simulated $500.00)',
                    'Cash on Delivery / In-person'
                  ].map((method) => {
                    const isSelected = paymentMethod === method
                    return (
                      <label
                        key={method}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-xs font-semibold transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                            : 'hover:bg-slate-50'
                        }`}
                        style={{
                          borderColor: isSelected ? undefined : theme.border
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSelected}
                            onChange={() => setPaymentMethod(method)}
                            className="h-3.5 w-3.5 accent-emerald-600"
                          />
                          <span>{method}</span>
                        </div>
                        <CreditCard className="h-4 w-4 opacity-40" />
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Order Items & Totals Summary */}
              <div
                className="rounded-xl border p-4 text-xs"
                style={{
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.border
                }}
              >
                <div className="flex items-center justify-between font-bold mb-3">
                  <span>Order Summary ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-slate-500">Live Inventory Verification</span>
                </div>

                <div className="max-h-36 overflow-y-auto divide-y" style={{ borderColor: theme.border }}>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.quantity}×</span>
                        <span className="truncate max-w-[220px]">{item.title}</span>
                      </div>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t pt-2 space-y-1" style={{ borderColor: theme.border }}>
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-extrabold" style={{ borderColor: theme.border }}>
                    <span>Total Due</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentForeground,
                  borderRadius: theme.buttonRadius
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Decreasing Inventory & Authorizing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Complete Order · Pay ${total.toFixed(2)}</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-400">
                🔒 Simulated secure checkout. Decreases live product stock in database upon confirmation.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
