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

  useEffect(() => {
    setIsClient(true)
    refresh()

    const handleUpdate = () => refresh()
    window.addEventListener('storecraft_db_update', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('storecraft_db_update', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [refresh])

  const switchActiveStore = (storeId: string) => {
    db.setActiveStore(storeId)
    refresh()
  }

  const syncServer = (storeToSync = activeStore) => {
    if (!storeToSync || typeof window === 'undefined') return
    try {
      const allProducts = db.getProducts(storeToSync.id)
      fetch('/api/sync-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store: storeToSync, products: allProducts }),
      }).catch((err) => console.warn('Background store sync warning:', err))
    } catch (e) {
      // Non-blocking sync
    }
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
