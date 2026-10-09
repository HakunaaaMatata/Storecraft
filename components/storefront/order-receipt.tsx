'use client'

import { Order, ThemeConfig } from '@/lib/types'
import { CheckCircle2, Clock, Download, ExternalLink, Package, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'

interface OrderReceiptProps {
  order: Order
  theme: ThemeConfig
  onClose: () => void
}

export function OrderReceipt({ order, theme, onClose }: OrderReceiptProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="flex flex-col items-center">
      {/* Success Badge */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
        <CheckCircle2 className="h-10 w-10 animate-bounce" />
      </div>

      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
        Order Confirmed & Paid
      </span>
      <h2
        className="mt-1 text-center text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ fontFamily: theme.fontHeadline, color: theme.ink }}
      >
        Thank you for your order!
      </h2>
      <p className="mt-1 text-center text-xs text-slate-500">
        A confirmation receipt has been generated and dispatched to{' '}
        <strong className="text-slate-700">{order.customer.email}</strong>.
      </p>

      {/* Printable Receipt Card */}
      <div
        className="mt-6 w-full overflow-hidden rounded-xl border bg-white p-6 shadow-sm"
        style={{ borderColor: theme.border }}
      >
        {/* Receipt Header */}
        <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Order Reference
            </span>
            <div className="font-mono text-base font-extrabold text-slate-900">
              #{order.id}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Date & Status
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>{order.status}</span> · <span className="text-slate-500">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Fulfillment Timeline */}
        <div className="my-5 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Order Placed</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <span>Payment Authorized</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Truck className="h-4 w-4" />
              <span>Ready for Dispatch</span>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-2/3 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-500">
            Estimated delivery window: <strong>3 – 5 business days</strong> via Express Courier
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="grid grid-cols-1 gap-4 border-b pb-4 text-xs sm:grid-cols-2">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Shipping Destination
            </h4>
            <div className="mt-1 font-semibold text-slate-800">{order.customer.fullName}</div>
            <div className="text-slate-500">{order.customer.address}</div>
            <div className="text-slate-500">
              {order.customer.city}, {order.customer.state} {order.customer.postalCode},{' '}
              {order.customer.country}
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Payment & Merchant
            </h4>
            <div className="mt-1 font-semibold text-slate-800">{order.paymentMethod}</div>
            <div className="text-slate-500">Store: {order.storeName}</div>
            <div className="text-slate-500 font-mono text-[11px]">Database Record: Active</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Items Purchased ({order.items.reduce((s, i) => s + i.quantity, 0)})
          </h4>
          <div className="divide-y text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-10 w-10 rounded border object-cover"
                  />
                  <div>
                    <span className="font-bold text-slate-800">{item.title}</span>
                    <div className="text-[10px] text-slate-500">
                      Qty: {item.quantity} · SKU: {item.sku}
                      {item.selectedVariants?.size && ` · Size: ${item.selectedVariants.size}`}
                      {item.selectedVariants?.color && ` · Color: ${item.selectedVariants.color}`}
                    </div>
                  </div>
                </div>
                <div className="text-right font-bold text-slate-900">
                  ${item.totalPrice.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mt-4 border-t pt-3 text-xs space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Sales Tax (8%)</span>
            <span className="font-semibold">${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="font-semibold">
              {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2 text-sm font-extrabold text-slate-900">
            <span>Total Paid</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
        <button
          onClick={onClose}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold shadow transition hover:opacity-90"
          style={{
            backgroundColor: theme.accent,
            color: theme.accentForeground,
            borderRadius: theme.buttonRadius
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Continue Shopping</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          <span>Print Receipt</span>
        </button>
      </div>
    </div>
  )
}
