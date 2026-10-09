'use client'

import { THEME_PRESETS, resolveTheme } from '@/lib/theme-presets'
import { CartItem, Order, Product, Store, ThemePresetId } from '@/lib/types'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { CartDrawer } from './cart-drawer'
import { CheckoutModal } from './checkout-modal'
import { ProductDrawer } from './product-drawer'
import { ProductGrid } from './product-grid'
import { StoreHeader } from './store-header'
import { StoreHero } from './store-hero'
import { ThemeBar } from './theme-bar'

interface StorefrontViewProps {
  initialStore: Store
}

export function StorefrontView({ initialStore }: StorefrontViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  // Store and Theme Preset state
  const [store, setStore] = useState<Store>(initialStore)
  const [currentPreset, setCurrentPreset] = useState<ThemePresetId>(initialStore.preset)
  const theme = resolveTheme(currentPreset, store.themeSettings)

  // Filters & Search
  const initialCategory = searchParams.get('category') || 'All'
  const initialSearch = searchParams.get('search') || ''
  
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  // Drawers and Modals
  const productIdFromUrl = searchParams.get('product')
  const initialProduct = productIdFromUrl ? initialStore.products.find(p => p.id === productIdFromUrl) || null : null

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct)
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(!!initialProduct)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Shopping Bag Cart State
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`storecraft_cart_${store.slug}`)
      if (stored) {
        setCart(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Could not load cart from storage', e)
    }
  }, [store.slug])

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`storecraft_cart_${store.slug}`, JSON.stringify(cart))
    } catch (e) {
      console.warn('Could not save cart to storage', e)
    }
  }, [cart, store.slug])

  // Handle Preset Switching
  const handlePresetChange = async (newPreset: ThemePresetId) => {
    setCurrentPreset(newPreset)
    // Optionally persist preset to backend
    try {
      await fetch(`/api/store/${store.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: newPreset })
      })
    } catch (err) {
      console.warn('Failed to update preset in backend', err)
    }
  }

  // Reload store from API to get live inventory counts
  const refreshStoreData = async () => {
    try {
      const res = await fetch(`/api/store/${store.slug}`)
      if (res.ok) {
        const data = await res.json()
        if (data.store) {
          setStore(data.store)
        }
      }
    } catch (err) {
      console.warn('Failed to refresh store inventory', err)
    }
  }

  // Reset demo stock
  const handleResetDb = async () => {
    try {
      // Re-fetch seed store data
      const res = await fetch(`/api/store/${store.slug}`)
      if (res.ok) {
        const data = await res.json()
        if (data.store) {
          setStore(data.store)
        }
      }
    } catch (e) {
      console.warn(e)
    }
  }

  // URL State Handlers
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category)
    router.push(pathname + '?' + createQueryString('category', category === 'All' ? '' : category), { scroll: false })
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    router.push(pathname + '?' + createQueryString('search', query), { scroll: false })
  }

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsProductDrawerOpen(true)
    router.push(pathname + '?' + createQueryString('product', product.id), { scroll: false })
  }

  const handleCloseProductDrawer = () => {
    setIsProductDrawerOpen(false)
    router.push(pathname + '?' + createQueryString('product', ''), { scroll: false })
    setTimeout(() => setSelectedProduct(null), 300) // Clear after animation
  }

  // Cart Operations
  const handleInstantAddToCart = (product: Product) => {
    const defaultSize = product.variants.sizes?.[0]
    const defaultColor = product.variants.colors?.[0]?.name
    const defaultFinish = product.variants.finishes?.[0]
    const itemId = `${product.id}_${defaultSize || ''}_${defaultColor || ''}_${defaultFinish || ''}`

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId)
      if (existing) {
        if (existing.quantity >= product.inventory) return prev
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1, maxInventory: product.inventory }
            : item
        )
      } else {
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            sku: product.sku,
            title: product.title,
            price: product.price,
            image: product.images[0],
            quantity: 1,
            selectedSize: defaultSize,
            selectedColor: defaultColor,
            selectedFinish: defaultFinish,
            maxInventory: product.inventory
          }
        ]
      }
    })
  }

  const handleAddToCartFromDrawer = (
    product: Product,
    quantity: number,
    variants: { size?: string; color?: string; finish?: string }
  ) => {
    const itemId = `${product.id}_${variants.size || ''}_${variants.color || ''}_${variants.finish || ''}`

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId)
      if (existing) {
        const updatedQty = Math.min(product.inventory, existing.quantity + quantity)
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: updatedQty, maxInventory: product.inventory }
            : item
        )
      } else {
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            sku: product.sku,
            title: product.title,
            price: product.price,
            image: product.images[0],
            quantity,
            selectedSize: variants.size,
            selectedColor: variants.color,
            selectedFinish: variants.finish,
            maxInventory: product.inventory
          }
        ]
      }
    })

    setIsProductDrawerOpen(false)
    setIsCartOpen(true)
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: Math.min(item.maxInventory, newQuantity)
          }
        }
        return item
      })
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  // Handle Order Success
  const handleOrderSuccess = (order: Order) => {
    // 1. Clear cart
    setCart([])
    // 2. Refresh store products to update remaining inventory in the UI
    refreshStoreData()
    
    // 3. Bridge the API-created order into the Dashboard's client-side localStorage DB
    try {
      // Map API Order to Dashboard Order format
      const dashboardOrder = {
        id: order.id,
        storeId: store.id, // Using store.id instead of slug
        orderNumber: order.id.replace('SC-', '#'),
        customer: {
          name: order.customer.fullName,
          email: order.customer.email,
          phone: order.customer.phone || '',
          address: `${order.customer.address}, ${order.customer.city}, ${order.customer.state} ${order.customer.postalCode}`
        },
        items: order.items.map(i => ({
          productId: i.productId,
          name: i.title,
          price: i.unitPrice,
          quantity: i.quantity,
          selectedVariant: i.selectedVariants?.size || i.selectedVariants?.color || undefined,
          image: i.image
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        status: 'Placed',
        paymentStatus: 'Paid (Demo)',
        statusHistory: [{ status: 'Placed', timestamp: order.createdAt, note: 'Order received via public storefront' }],
        createdAt: order.createdAt
      };

      const rawOrders = localStorage.getItem('storecraft_orders_v1');
      const orders = rawOrders ? JSON.parse(rawOrders) : [];
      orders.unshift(dashboardOrder);
      localStorage.setItem('storecraft_orders_v1', JSON.stringify(orders));

      // Also deduct inventory in the dashboard's product DB
      const rawProducts = localStorage.getItem('storecraft_products_v1');
      if (rawProducts) {
        const products = JSON.parse(rawProducts);
        let updated = false;
        order.items.forEach(item => {
          const p = products.find((p: any) => p.id === item.productId && p.storeId === store.id);
          if (p) {
            p.stock = Math.max(0, p.stock - item.quantity);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem('storecraft_products_v1', JSON.stringify(products));
        }
      }
      
      // Dispatch event to trigger useStorecraft refresh in other tabs
      window.dispatchEvent(new CustomEvent('storecraft_db_update'));
    } catch (e) {
      console.warn('Failed to sync order to dashboard DB', e);
    }
  }

  // Scrolling
  const handleScrollToCatalog = () => {
    const el = document.getElementById('catalog')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const defaultSections = [
    { id: 'announcement', name: 'Announcement Bar', enabled: true },
    { id: 'hero', name: 'Hero Banner', enabled: true },
    { id: 'categories', name: 'Categories', enabled: true },
    { id: 'catalog', name: 'Product Catalog', enabled: true },
    { id: 'footer', name: 'Footer', enabled: true }
  ];
  
  const activeSections = store.themeSettings?.sections || defaultSections;
  const isSectionEnabled = (id: string) => activeSections.find(s => s.id === id)?.enabled !== false;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: theme.bg,
        color: theme.ink,
        fontFamily: theme.fontBody
      }}
    >
      {/* 1. Theme Preset Engine Bar */}
      <ThemeBar
        currentPreset={currentPreset}
        currentSlug={store.slug}
        onPresetChange={handlePresetChange}
        onResetDb={handleResetDb}
      />

      {/* Render sections based on activeSections order, but here we just toggle them since they are complex components */}
      
      {/* 2. Store Announcement & Header (Always render Header, conditionally render announcement via themeSettings) */}
      <StoreHeader
        store={store}
        theme={theme}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
        showAnnouncement={isSectionEnabled('announcement')}
      />

      {/* 3. Hero Visuals */}
      {isSectionEnabled('hero') && (
        <StoreHero
          store={store}
          theme={theme}
          onScrollToCatalog={handleScrollToCatalog}
        />
      )}

      {/* 4. Product Catalog Grid */}
      {isSectionEnabled('catalog') && (
        <ProductGrid
          products={store.products}
          theme={theme}
          categories={store.categories}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSelectProduct={handleSelectProduct}
          onInstantAddToCart={handleInstantAddToCart}
          showCategories={isSectionEnabled('categories')}
        />
      )}

      {/* 5. Product Detail Drawer / Modal */}
      <ProductDrawer
        product={selectedProduct}
        theme={theme}
        isOpen={isProductDrawerOpen}
        onClose={handleCloseProductDrawer}
        onAddToCart={handleAddToCartFromDrawer}
      />

      {/* 6. Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        theme={theme}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false)
          setIsCheckoutOpen(true)
        }}
      />

      {/* 7. Functional Demo Checkout Modal & Receipt */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        store={store}
        theme={theme}
        cartItems={cart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Storefront Footer */}
      {isSectionEnabled('footer') && (
        <footer
          className="border-t py-12 px-4 transition-colors sm:px-6"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.ink
          }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-3">
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
                <div>
                  <strong className="text-sm font-bold">{store.name}</strong>
                  <p className="text-xs" style={{ color: theme.inkMuted }}>
                    {store.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs" style={{ color: theme.inkMuted }}>
                <span className="font-semibold uppercase tracking-wider">
                  Preset: <strong>{theme.name}</strong>
                </span>
                <span>•</span>
                <span>Powered by StoreCraft Engine</span>
              </div>
            </div>

            <div
              className="mt-8 border-t pt-6 text-center text-[11px]"
              style={{ borderColor: theme.border, color: theme.inkMuted }}
            >
              © {new Date().getFullYear()} {store.name}. All rights reserved. Demo storefront environment.
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
