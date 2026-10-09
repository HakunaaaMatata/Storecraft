'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  Check, 
  ChevronRight, 
  X, 
  AlertTriangle, 
  Package, 
  Truck, 
  CheckCircle2, 
  Ban,
  ArrowRight
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { Order, OrderStatus, canTransitionOrderStatus } from '@/lib/store-data'

function OrdersContent() {
  const searchParams = useSearchParams()
  const { activeStore, orders, actions } = useStorecraft()

  // Status Filter & Search
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  // Auto-select order if query param present
  useEffect(() => {
    const selectedId = searchParams.get('selected')
    if (selectedId) {
      const found = orders.find(o => o.id === selectedId || o.orderNumber === selectedId)
      if (found) setSelectedOrder(found)
    }
  }, [searchParams, orders])

  // Sync selectedOrder with orders state changes
  useEffect(() => {
    if (selectedOrder) {
      const refreshed = orders.find(o => o.id === selectedOrder.id)
      if (refreshed) setSelectedOrder(refreshed)
    }
  }, [orders, selectedOrder?.id])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Filter status
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter

      // Search query
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || 
        o.orderNumber.toLowerCase().includes(q) || 
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [orders, statusFilter, searchQuery])

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: orders.length,
      placed: orders.filter(o => o.status === 'Placed').length,
      packed: orders.filter(o => o.status === 'Packed').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
    }
  }, [orders])

  // Handle Status Update
  const handleTransition = (order: Order, nextStatus: OrderStatus, note?: string) => {
    if (!canTransitionOrderStatus(order.status, nextStatus)) return
    actions.updateOrderStatus(order.id, nextStatus, note)
  }

  // Handle Cancel Order
  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return
    const note = cancelReason.trim() ? `Cancelled: ${cancelReason.trim()}` : 'Order cancelled by store owner'
    actions.updateOrderStatus(cancelModalOrder.id, 'Cancelled', note)
    setCancelModalOrder(null)
    setCancelReason('')
  }

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#E4F8F0', color: '#07875D', border: '#A7F3D0' }
      case 'Shipped':
        return { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' }
      case 'Packed':
        return { bg: '#EDE9FE', color: '#7C3AED', border: '#DDD6FE' }
      case 'Placed':
        return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' }
      case 'Cancelled':
        return { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' }
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' }
    }
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    } catch {
      return isoString
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* Top Filter and Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        padding: '14px 20px',
        borderRadius: '6px',
        border: '1px solid var(--line)'
      }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', maxWidth: '100%' }}>
          {[
            { id: 'ALL', label: 'All Orders', count: counts.all },
            { id: 'Placed', label: 'Placed', count: counts.placed },
            { id: 'Packed', label: 'Packed', count: counts.packed },
            { id: 'Shipped', label: 'Shipped', count: counts.shipped },
            { id: 'Delivered', label: 'Delivered', count: counts.delivered },
            { id: 'Cancelled', label: 'Cancelled', count: counts.cancelled },
          ].map((tab) => {
            const active = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: active ? 800 : 500,
                  backgroundColor: active ? 'var(--navy)' : '#F1F5F9',
                  color: active ? '#FFFFFF' : 'var(--slate)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '9px',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  backgroundColor: active ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                  color: active ? '#FFFFFF' : '#475569'
                }}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid var(--line)',
          padding: '6px 10px',
          borderRadius: '4px',
          backgroundColor: '#FFFFFF',
          minWidth: '220px'
        }}>
          <Search size={14} color="#667085" />
          <input 
            type="text"
            placeholder="Search order ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '11px', width: '100%', background: 'transparent' }}
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '6px',
        border: '1px solid var(--line)',
        overflow: 'hidden'
      }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--slate)' }}>
            <ShoppingBag size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 6px', color: 'var(--navy)' }}>
              {orders.length === 0 ? 'No orders yet' : 'No matching orders found'}
            </h4>
            <p style={{ fontSize: '12px', margin: 0 }}>
              {orders.length === 0 
                ? 'When customers checkout through your live storefront, orders will appear here automatically.'
                : 'Try clearing your filters or search query.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Order ID</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Items Summary</th>
                  <th style={{ padding: '12px 16px' }}>Total</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const badge = getStatusBadgeStyle(o.status)
                  const itemsSummary = o.items.map(i => `${i.name} × ${i.quantity}`).join(', ')
                  const isSelected = selectedOrder?.id === o.id

                  return (
                    <tr 
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      style={{
                        borderBottom: '1px solid var(--line)',
                        backgroundColor: isSelected ? '#F0FDF4' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                      className="hover:bg-muted"
                    >
                      {/* Order ID */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--navy)' }}>{o.orderNumber}</span>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ display: 'block', color: 'var(--navy)' }}>{o.customer.name}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--slate)' }}>{o.customer.email}</span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: '11px' }}>
                        {formatDate(o.createdAt)}
                      </td>

                      {/* Items */}
                      <td style={{ padding: '12px 16px', color: 'var(--slate)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {itemsSummary}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--navy)' }}>
                        ${o.total.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}>
                          {o.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOrder(o)
                          }}
                          style={{
                            background: 'none',
                            color: '#07875D',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          View Details <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAILS DRAWER / SIDE PANEL */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '460px',
          maxWidth: '100vw',
          backgroundColor: '#FFFFFF',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.15)',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--line)'
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F8FAFC'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>
                  Order {selectedOrder.orderNumber}
                </h3>
                {(() => {
                  const b = getStatusBadgeStyle(selectedOrder.status)
                  return (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: b.bg,
                      color: b.color,
                      border: `1px solid ${b.border}`
                    }}>
                      {selectedOrder.status}
                    </span>
                  )
                })()}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--slate)', display: 'block', marginTop: '4px' }}>
                Placed on {formatDate(selectedOrder.createdAt)}
              </span>
            </div>

            <button 
              onClick={() => setSelectedOrder(null)}
              style={{ background: 'none', cursor: 'pointer', color: 'var(--slate)' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* WORKFLOW ACTION BUTTONS */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
                Fulfillment Workflow
              </span>

              {selectedOrder.status === 'Placed' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleTransition(selectedOrder, 'Packed', 'Order packed and prepared for pickup')}
                    className="button button-green" 
                    style={{ flex: 1, padding: '9px 12px', fontSize: '11px' }}
                  >
                    <Package size={14} /> Mark as Packed
                  </button>
                  <button 
                    onClick={() => setCancelModalOrder(selectedOrder)}
                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {selectedOrder.status === 'Packed' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleTransition(selectedOrder, 'Shipped', 'Handed off to carrier for delivery')}
                    style={{ flex: 1, backgroundColor: '#0284C7', color: '#FFFFFF', padding: '9px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Truck size={14} /> Mark as Shipped
                  </button>
                  <button 
                    onClick={() => setCancelModalOrder(selectedOrder)}
                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {selectedOrder.status === 'Shipped' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleTransition(selectedOrder, 'Delivered', 'Delivered to recipient address')}
                    className="button button-green" 
                    style={{ flex: 1, padding: '9px 12px', fontSize: '11px' }}
                  >
                    <CheckCircle2 size={14} /> Mark as Delivered
                  </button>
                  <button 
                    onClick={() => setCancelModalOrder(selectedOrder)}
                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {selectedOrder.status === 'Delivered' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#07875D', fontSize: '12px', fontWeight: 700 }}>
                  <CheckCircle2 size={16} /> Order has been successfully fulfilled & delivered.
                </div>
              )}

              {selectedOrder.status === 'Cancelled' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '12px', fontWeight: 700 }}>
                  <Ban size={16} /> This order has been cancelled and cannot proceed.
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Customer Details
              </span>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--line)', borderRadius: '6px', padding: '14px', fontSize: '12px' }}>
                <strong style={{ display: 'block', color: 'var(--navy)', marginBottom: '4px' }}>
                  {selectedOrder.customer.name}
                </strong>
                <div style={{ color: 'var(--slate)', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
                  <span>Email: {selectedOrder.customer.email}</span>
                  <span>Phone: {selectedOrder.customer.phone || 'Not provided'}</span>
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#FFFBEB', borderRadius: '4px', border: '1px solid #FEF3C7', color: '#B45309', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ margin: 0, lineHeight: 1.4 }}>
                      <strong>Email/SMS notifications are not configured.</strong><br/>
                      The customer will not receive automated updates for status changes. They must check their tracking link manually.
                    </p>
                  </div>
                  <span>Address: {selectedOrder.customer.address || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Items in Order ({selectedOrder.items.length})
              </span>
              <div style={{ border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--line)' : 'none',
                      fontSize: '11px'
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--navy)', display: 'block' }}>{item.name}</strong>
                      <span style={{ color: 'var(--slate)', fontSize: '10px' }}>
                        Qty: {item.quantity} · Unit Price: ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <strong style={{ color: 'var(--navy)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--slate)', fontSize: '11px' }}>
                <span>Subtotal:</span>
                <span>${selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--slate)', fontSize: '11px' }}>
                <span>Estimated Tax (8%):</span>
                <span>${selectedOrder.tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--slate)', fontSize: '11px' }}>
                <span>Shipping:</span>
                <span>${selectedOrder.shipping.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--line)', fontWeight: 800, fontSize: '13px', color: 'var(--navy)' }}>
                <span>Total:</span>
                <span>${selectedOrder.total.toFixed(2)}</span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '10px', color: '#07875D', fontWeight: 600 }}>
                Payment Method: {selectedOrder.paymentStatus}
              </div>
            </div>

            {/* Status Timeline History */}
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
                Status History & Timestamps
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '8px' }}>
                {selectedOrder.statusHistory?.map((h, hIdx) => {
                  const b = getStatusBadgeStyle(h.status)
                  return (
                    <div key={hIdx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', position: 'relative' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: b.color,
                        marginTop: '4px',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1, fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: 'var(--navy)' }}>{h.status}</strong>
                          <span style={{ fontSize: '9px', color: '#94A3B8' }}>{formatDate(h.timestamp)}</span>
                        </div>
                        {h.note && (
                          <p style={{ margin: '2px 0 0', color: 'var(--slate)', fontSize: '10px', lineHeight: '1.4' }}>
                            {h.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {cancelModalOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 24, 40, 0.5)',
          zIndex: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 8px', color: 'var(--navy)' }}>
              Cancel Order {cancelModalOrder.orderNumber}?
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate)', margin: '0 0 16px', lineHeight: '1.5' }}>
              Are you sure you want to cancel this order? Cancelled orders cannot be resumed through the fulfillment workflow and will be excluded from revenue analytics.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                Cancellation Reason (Optional)
              </label>
              <input 
                type="text" 
                placeholder="e.g. Customer requested cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setCancelModalOrder(null)}
                className="button button-light"
                style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid var(--line)' }}
              >
                Go Back
              </button>
              <button 
                onClick={handleConfirmCancel}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', color: 'var(--slate)' }}>Loading Orders...</div>}>
      <OrdersContent />
    </Suspense>
  )
}
