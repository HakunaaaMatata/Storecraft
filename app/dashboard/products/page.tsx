'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Package, 
  Plus, 
  Search, 
  Upload, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  Image as ImageIcon,
  ArrowRight,
  Filter
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { Product } from '@/lib/store-data'

export default function ProductsPage() {
  const { activeStore, products, analytics, actions } = useStorecraft()

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK'>('ALL')

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  // Form State
  const initialFormState = {
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: ''
  }
  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Available categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach(p => { if (p.category) set.add(p.category) })
    if (activeStore?.categories) {
      activeStore.categories.forEach(c => set.add(c))
    }
    return Array.from(set)
  }, [products, activeStore])

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))

      // Category
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory

      // Stock
      const isLow = p.stock <= analytics.lowStockThreshold
      const matchesStock = 
        stockFilter === 'ALL' ? true :
        stockFilter === 'LOW' ? isLow : !isLow

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [products, searchQuery, selectedCategory, stockFilter, analytics.lowStockThreshold])

  // Validate form
  const validateForm = (isEdit: boolean, currentId?: string): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Product name is required.'
    }

    if (!formData.sku.trim()) {
      errors.sku = 'SKU is required.'
    } else {
      // Check SKU uniqueness in current store
      const duplicate = products.find(p => 
        p.sku?.toLowerCase() === formData.sku.trim().toLowerCase() && 
        (!isEdit || p.id !== currentId)
      )
      if (duplicate) {
        errors.sku = 'This SKU is already in use by another product in this store.'
      }
    }

    const priceNum = parseFloat(formData.price)
    if (isNaN(priceNum) || priceNum < 0) {
      errors.price = 'Price must be a valid non-negative number.'
    }

    const stockNum = parseInt(formData.stock, 10)
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(Number(formData.stock))) {
      errors.stock = 'Stock must be a valid non-negative integer.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Add Product Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(false)) return
    if (!activeStore) return

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      storeId: activeStore.id,
      name: formData.name.trim(),
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: formData.description.trim(),
      category: formData.category.trim() || 'General',
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      sku: formData.sku.trim().toUpperCase(),
      images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      createdAt: new Date().toISOString()
    }

    actions.saveProduct(newProd)
    setIsAddModalOpen(false)
    setFormData(initialFormState)
    setFormErrors({})
  }

  // Handle Edit Product Click
  const openEditModal = (p: Product) => {
    setEditingProduct(p)
    setFormData({
      name: p.name,
      sku: p.sku || '',
      description: p.description || '',
      category: p.category || '',
      price: p.price.toString(),
      stock: p.stock.toString(),
      imageUrl: p.images?.[0] || ''
    })
    setFormErrors({})
  }

  // Handle Edit Product Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct || !activeStore) return
    if (!validateForm(true, editingProduct.id)) return

    const updated: Product = {
      ...editingProduct,
      name: formData.name.trim(),
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: formData.description.trim(),
      category: formData.category.trim() || 'General',
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      sku: formData.sku.trim().toUpperCase(),
      images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : editingProduct.images
    }

    actions.saveProduct(updated)
    setEditingProduct(null)
    setFormData(initialFormState)
    setFormErrors({})
  }

  // Handle Delete Confirm
  const handleDeleteConfirm = () => {
    if (!deletingProduct) return
    actions.deleteProduct(deletingProduct.id)
    setDeletingProduct(null)
  }

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${hasError ? '#EF4444' : 'var(--line)'}`,
    borderRadius: '4px',
    fontSize: '12px',
    backgroundColor: '#FFFFFF',
    color: 'var(--navy)',
    outline: 'none',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '6px',
        border: '1px solid var(--line)'
      }}>
        {/* Search & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
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
              placeholder="Search products, SKU, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '11px', width: '100%', background: 'transparent' }}
            />
          </div>

          {/* Category Filter */}
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--line)',
              borderRadius: '4px',
              fontSize: '11px',
              backgroundColor: '#FFFFFF',
              color: 'var(--slate)',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select 
            value={stockFilter} 
            onChange={(e) => setStockFilter(e.target.value as any)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--line)',
              borderRadius: '4px',
              fontSize: '11px',
              backgroundColor: '#FFFFFF',
              color: 'var(--slate)',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW">Low Stock Only (≤ 5 units)</option>
            <option value="IN_STOCK">Healthy Stock ({'>'} 5 units)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/dashboard/products/import" style={{ textDecoration: 'none' }}>
            <button 
              className="button button-light" 
              style={{ padding: '8px 14px', fontSize: '11px', border: '1px solid var(--line)' }}
            >
              <Upload size={13} /> Import CSV
            </button>
          </Link>
          <button 
            className="button button-green" 
            onClick={() => {
              setFormData(initialFormState)
              setFormErrors({})
              setIsAddModalOpen(true)
            }}
            style={{ padding: '8px 14px', fontSize: '11px' }}
          >
            <Plus size={13} /> Add Product
          </button>
        </div>
      </div>

      {/* Product Table Container */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '6px',
        border: '1px solid var(--line)',
        overflow: 'hidden'
      }}>
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--slate)' }}>
            <Package size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 6px', color: 'var(--navy)' }}>
              {products.length === 0 ? 'No products in your catalog yet' : 'No matching products found'}
            </h4>
            <p style={{ fontSize: '12px', margin: '0 0 20px', maxWidth: '380px', marginInline: 'auto' }}>
              {products.length === 0 
                ? 'Get started by creating your first product or importing an existing inventory spreadsheet.'
                : 'Try adjusting your search query or filters to find what you are looking for.'}
            </p>
            {products.length === 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="button button-green" 
                  style={{ padding: '8px 16px', fontSize: '11px' }}
                >
                  <Plus size={13} /> Add First Product
                </button>
                <Link href="/dashboard/products/import" style={{ textDecoration: 'none' }}>
                  <button className="button button-light" style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid var(--line)' }}>
                    <Upload size={13} /> Import CSV / Excel
                  </button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', width: '60px' }}>Item</th>
                  <th style={{ padding: '12px 16px' }}>Title & Description</th>
                  <th style={{ padding: '12px 16px' }}>SKU</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Stock Count</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLowStock = p.stock <= analytics.lowStockThreshold
                  const thumb = p.images?.[0]

                  return (
                    <tr 
                      key={p.id} 
                      style={{ borderBottom: '1px solid var(--line)', transition: 'background-color 0.15s' }}
                      className="hover:bg-muted"
                    >
                      {/* Thumbnail */}
                      <td style={{ padding: '12px 16px' }}>
                        {thumb ? (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '4px',
                            backgroundImage: `url(${thumb})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid var(--line)'
                          }} />
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '4px',
                            backgroundColor: '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94A3B8'
                          }}>
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>

                      {/* Title & Description */}
                      <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                        <strong style={{ display: 'block', color: 'var(--navy)', fontSize: '12px' }}>{p.name}</strong>
                        {p.description && (
                          <span style={{ display: 'block', color: 'var(--slate)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                            {p.description}
                          </span>
                        )}
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '12px 16px', color: 'var(--slate)', fontFamily: 'monospace', fontSize: '11px' }}>
                        {p.sku || 'N/A'}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          {p.category || 'General'}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--navy)' }}>
                        ${p.price.toFixed(2)}
                      </td>

                      {/* Stock Count & Low Stock Badge */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: isLowStock ? '#FFF1E8' : '#E4F8F0',
                          color: isLowStock ? '#B54708' : '#07875D'
                        }}>
                          {isLowStock && <AlertTriangle size={11} />}
                          {p.stock} units
                          {isLowStock && ' (Low Stock)'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            style={{
                              background: '#F8FAFC',
                              border: '1px solid var(--line)',
                              borderRadius: '4px',
                              padding: '5px 8px',
                              color: 'var(--slate)',
                              cursor: 'pointer'
                            }}
                            className="hover:text-navy hover:bg-muted"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            onClick={() => setDeletingProduct(p)}
                            title="Delete Product"
                            style={{
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: '4px',
                              padding: '5px 8px',
                              color: '#DC2626',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 24, 40, 0.5)',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>Add New Product</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', cursor: 'pointer', color: 'var(--slate)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                  Product Name *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Ceramic Pour-Over Dripper"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle(!!formErrors.name)}
                />
                {formErrors.name && <span style={{ color: '#EF4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{formErrors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                    SKU (Unique) *
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. NG-CRM-08"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={inputStyle(!!formErrors.sku)}
                  />
                  {formErrors.sku && <span style={{ color: '#EF4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{formErrors.sku}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ceramics"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={inputStyle(false)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                    Price ($) *
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={inputStyle(!!formErrors.price)}
                  />
                  {formErrors.price && <span style={{ color: '#EF4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{formErrors.price}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                    Stock Quantity *
                  </label>
                  <input 
                    type="number" 
                    step="1"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={inputStyle(!!formErrors.stock)}
                  />
                  {formErrors.stock && <span style={{ color: '#EF4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{formErrors.stock}</span>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                  Image URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={inputStyle(false)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea 
                  rows={3}
                  placeholder="Detailed description of product materials and specifications..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...inputStyle(false), resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="button button-light"
                  style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid var(--line)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button button-green"
                  style={{ padding: '8px 18px', fontSize: '11px' }}
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 24, 40, 0.5)',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>Edit Product</h3>
                <span style={{ fontSize: '10px', color: 'var(--slate)' }}>ID: {editingProduct.id}</span>
              </div>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', cursor: 'pointer', color: 'var(--slate)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                  Product Name *
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle(!!formErrors.name)}
                />
                {formErrors.name && <span style={{ color: '#EF4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{formErrors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                    SKU (Unique) *
                  </label>
                  <input 
                    type="text" 
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={inputStyle(!!formErrors.sku)}
                  />
                  {formErrors.sku && <span style={{ color: '#EF4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{formErrors.sku}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={inputStyle(false)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                    Price ($) *
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={inputStyle(!!formErrors.price)}
                  />
                  {formErrors.price && <span style={{ color: '#EF4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{formErrors.price}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                    Stock Quantity *
                  </label>
                  <input 
                    type="number" 
                    step="1"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={inputStyle(!!formErrors.stock)}
                  />
                  {formErrors.stock && <span style={{ color: '#EF4444', fontSize: '10px', marginTop: '2px', display: 'block' }}>{formErrors.stock}</span>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                  Image URL
                </label>
                <input 
                  type="url" 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={inputStyle(false)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...inputStyle(false), resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="button button-light"
                  style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid var(--line)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button button-green"
                  style={{ padding: '8px 18px', fontSize: '11px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 24, 40, 0.5)',
          zIndex: 60,
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
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 8px', color: 'var(--navy)' }}>Delete Product</h3>
            <p style={{ fontSize: '12px', color: 'var(--slate)', margin: '0 0 16px', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{deletingProduct.name}</strong> (SKU: {deletingProduct.sku})? This will permanently remove it from your inventory and update your store metrics.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setDeletingProduct(null)}
                className="button button-light"
                style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid var(--line)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
