'use client'

import { useState, useEffect, useCallback } from 'react'
import { db, Store, Product, Order, ThemeConfig, OrderStatus } from './store-data'

export function useStorecraft(storeSlugOrId?: string) {
  const [isClient, setIsClient] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [activeStore, setActiveStore] = useState<Store>(db.getActiveStore())
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const refresh = useCallback(() => {
    db.initDefault()
    const allStores = db.getStores()
    setStores(allStores)

    let current: Store | undefined
    if (storeSlugOrId) {
      current = db.getStoreBySlug(storeSlugOrId) || db.getStoreById(storeSlugOrId)
    }
    if (!current) {
      current = db.getActiveStore()
    }
    setActiveStore(current)

    if (current) {
      setProducts(db.getProducts(current.id))
      setOrders(db.getOrders(current.id))
    }
  }, [storeSlugOrId])

  const syncServer = useCallback((storeToSync?: Store) => {
    const targetStore = storeToSync || db.getActiveStore()
    if (!targetStore || typeof window === 'undefined') return
    try {
      const allProducts = db.getProducts(targetStore.id)
      fetch('/api/sync-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store: targetStore, products: allProducts }),
      }).catch((err) => console.warn('Background store sync warning:', err))

      // Also sync orders down from the server
      fetch(`/api/store/${targetStore.slug}/orders`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.orders) {
            const mappedOrders = data.orders.map((o: any) => ({
              id: o.id,
              storeId: targetStore.id,
              orderNumber: o.id.startsWith('SC-') ? `#${o.id.substring(3)}` : `#${o.id}`,
              customer: {
                name: o.customer?.fullName || o.customer?.name || 'Unknown',
                email: o.customer?.email || '',
                phone: o.customer?.phone || '',
                address: o.customer?.address || ''
              },
              items: o.items.map((i: any) => ({
                productId: i.productId,
                name: i.title || i.name || 'Item',
                price: i.unitPrice || i.price || 0,
                quantity: i.quantity,
                selectedVariant: Object.values(i.selectedVariants || {}).filter(Boolean).join(', ') || undefined,
                image: i.image
              })),
              subtotal: o.subtotal,
              tax: o.tax,
              shipping: o.shipping, total: o.total, status: o.status,
              total: o.total,
              status: o.status,
              paymentStatus: o.paymentMethod || 'Paid',
              statusHistory: o.statusHistory || [{ status: o.status, timestamp: o.createdAt }],
              createdAt: o.createdAt
            }))
            
            const currentOrders = db.getOrders(targetStore.id)
            if (JSON.stringify(currentOrders) !== JSON.stringify(mappedOrders)) {
              db.setStoreOrders(targetStore.id, mappedOrders)
            }
          }
        }).catch(err => console.warn('Background orders sync warning:', err))
    } catch (e) {
      // Non-blocking sync
    }
  }, [])

  useEffect(() => {
    setIsClient(true)
    refresh()

    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.stores && data.stores.length > 0) {
          localStorage.setItem('storecraft_stores_v1', JSON.stringify(data.stores))
          refresh()
          syncServer(data.primaryStore || data.stores[0])
        }
      })
      .catch(() => {})

    const handleUpdate = () => refresh()
    window.addEventListener('storecraft_db_update', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('storecraft_db_update', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [refresh, syncServer])

  const switchActiveStore = (storeId: string) => {
    db.setActiveStore(storeId)
    refresh()
  }

  const updateTheme = (theme: ThemeConfig) => {
    if (!activeStore) return
    db.updateStoreTheme(activeStore.id, theme)
    refresh()
    const updatedStore = { ...activeStore, theme }
    syncServer(updatedStore)
  }

  const saveProduct = (product: Product) => {
    db.saveProduct(product)
    refresh()
    syncServer()
  }

  const deleteProduct = (productId: string) => {
    if (!activeStore) return
    db.deleteProduct(activeStore.id, productId)
    refresh()
    syncServer()
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    db.updateOrderStatus(orderId, status, note)
    refresh()
    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    }).catch(console.warn)
  }

  const createOrder = (orderData: Parameters<typeof db.createOrder>[0]) => {
    const res = db.createOrder(orderData)
    refresh()
    return res
  }

  const importProducts = (newProducts: Product[]) => {
    if (!activeStore) return []
    const res = db.importProducts(activeStore.id, newProducts)
    refresh()
    syncServer()
    return res
  }

  const resetDemo = () => {
    db.resetToDemo()
    refresh()
  }

  const eligibleOrders = orders.filter((o) => o.status !== 'Cancelled')
  const totalRevenue = eligibleOrders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = eligibleOrders.length
  const rawOrdersCount = orders.length
  const totalDelivered = orders.filter((o) => o.status === 'Delivered').length
  const totalProcessing = orders.filter((o) => o.status === 'Placed' || o.status === 'Packed').length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const lowStockThreshold = 5
  const lowStockCount = products.filter((p) => p.stock <= lowStockThreshold).length

  // Poll for orders every 10 seconds
  useEffect(() => {
    if (!activeStore || !isClient) return;
    
    const pollInterval = setInterval(() => {
      fetch(`/api/store/${activeStore.slug}/orders`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.orders) {
            const mappedOrders = data.orders.map((o: any) => ({
              id: o.id,
              storeId: activeStore.id,
              orderNumber: o.id.startsWith('SC-') ? `#${o.id.substring(3)}` : `#${o.id}`,
              customer: {
                name: o.customer?.fullName || o.customer?.name || 'Unknown',
                email: o.customer?.email || '',
                phone: o.customer?.phone || '',
                address: o.customer?.address || ''
              },
              items: o.items.map((i: any) => ({
                productId: i.productId,
                name: i.title || i.name || 'Item',
                price: i.unitPrice || i.price || 0,
                quantity: i.quantity,
                selectedVariant: Object.values(i.selectedVariants || {}).filter(Boolean).join(', ') || undefined,
                image: i.image
              })),
              subtotal: o.subtotal,
              tax: o.tax,
              shipping: o.shipping,
              total: o.total,
              status: o.status,
              paymentStatus: o.paymentMethod || 'Paid',
              statusHistory: o.statusHistory || [{ status: o.status, timestamp: o.createdAt }],
              createdAt: o.createdAt
            }));
            
            const currentOrders = db.getOrders(activeStore.id);
            if (JSON.stringify(currentOrders) !== JSON.stringify(mappedOrders)) {
              db.setStoreOrders(activeStore.id, mappedOrders);
            }
          }
        })
        .catch(console.warn);
    }, 10000);
    
    return () => clearInterval(pollInterval);
  }, [activeStore, isClient]);

  return {
    isClient,
    stores,
    activeStore,
    products,
    orders,
    analytics: {
      totalRevenue,
      totalOrders,
      rawOrdersCount,
      totalDelivered,
      totalProcessing,
      averageOrderValue,
      lowStockThreshold,
      lowStockCount,
      totalProducts: products.length,
    },
    actions: {
      switchActiveStore,
      updateTheme,
      saveProduct,
      deleteProduct,
      importProducts,
      updateOrderStatus,
      createOrder,
      resetDemo,
      refresh,
    },
  }
}
