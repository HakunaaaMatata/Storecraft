'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  Package, Plus, Search, Upload, Edit3, Trash2, AlertTriangle, 
  X, Check, Image as ImageIcon, ChevronLeft, ChevronRight, Filter
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { Product } from '@/lib/types'

export default function ProductsPage() {
  const { activeStore } = useStorecraft()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{type: 'success'|'error', msg: string} | null>(null)

  const fetchProducts = async () => {
    if (!activeStore) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/store/${activeStore.slug}/products`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeStore) {
      fetchProducts()
    }
  }, [activeStore])

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK'>('ALL')
  const [sortOrder, setSortOrder] = useState<'newest'|'price_asc'|'price_desc'>('newest')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')
  const [bulkActionValue, setBulkActionValue] = useState('')

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form State
  const initialForm = {
    name: '', sku: '', description: '', category: '', 
    price: '', compareAtPrice: '', stock: '', imageUrl: '', status: 'published' as 'draft'|'published',
    variantSizes: '', variantColors: '', variantFinishes: ''
  }
  const [formData, setFormData] = useState(initialForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Derived state
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))), [products])

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory
      
      const threshold = p.lowStockThreshold || 5
      const isLow = p.inventory <= threshold
      const matchesStock = stockFilter === 'ALL' ? true : stockFilter === 'LOW' ? isLow : !isLow
      
      return matchesSearch && matchesCategory && matchesStock
    })

    if (sortOrder === 'price_asc') result.sort((a,b) => a.price - b.price)
    else if (sortOrder === 'price_desc') result.sort((a,b) => b.price - a.price)
    else result.sort((a,b) => b.id.localeCompare(a.id))

    return result
  }, [products, searchQuery, selectedCategory, stockFilter, sortOrder])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, stockFilter, sortOrder])

  // Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleBulkUpdate = async () => {
    if (!activeStore || selectedIds.size === 0 || !bulkAction) return
    const ids = Array.from(selectedIds)
    
    let updates: any = {}
    if (bulkAction === 'status') updates.status = bulkActionValue
    if (bulkAction === 'category') updates.category = bulkActionValue

    if (Object.keys(updates).length === 0) return

    try {
      const res = await fetch(`/api/store/${activeStore.slug}/products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: ids, updates })
      })
      if (!res.ok) throw new Error('Bulk update failed')
      const data = await res.json()
      notify(`Successfully updated ${data.count} products`, 'success')
      fetchProducts()
      setSelectedIds(new Set())
      setBulkAction('')
    } catch (err: any) {
      notify(err.message, 'error')
    }
  }

  const handleBulkDelete = async () => {
    if (!activeStore || selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) return
    
    let successCount = 0
    let failCount = 0
    for (const id of Array.from(selectedIds)) {
      try {
        const res = await fetch(`/api/store/${activeStore.slug}/products/${id}`, { method: 'DELETE' })
        if (res.ok) successCount++
        else failCount++
      } catch (err) { failCount++ }
    }
    notify(`Deleted ${successCount} products${failCount > 0 ? `, ${failCount} failed` : ''}`, successCount > 0 ? 'success' : 'error')
    fetchProducts()
    setSelectedIds(new Set())
  }

  const openAdd = () => {
    setEditingProduct(null)
    setFormData(initialForm)
    setFormErrors({})
    setIsModalOpen(true)
  }
  
  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setFormData({
      name: p.title,
      sku: p.sku || '',
      description: p.description || '',
      category: p.category || '',
      price: p.price.toString(),
      compareAtPrice: p.compareAtPrice?.toString() || '',
      stock: p.inventory.toString(),
      imageUrl: p.images?.[0] || '',
      status: p.status || 'published',
      variantSizes: p.variants?.sizes?.join(', ') || '',
      variantColors: p.variants?.colors?.map(c => c.name).join(', ') || '',
      variantFinishes: p.variants?.finishes?.join(', ') || ''
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.name) errs.name = 'Required'
    if (!formData.sku) errs.sku = 'Required'
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) errs.price = 'Invalid price'
    if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) errs.stock = 'Invalid stock (cannot be negative)'
    if (formData.compareAtPrice && isNaN(parseFloat(formData.compareAtPrice))) errs.compareAtPrice = 'Invalid price'
    
    const duplicate = products.find(p => p.sku === formData.sku && p.id !== editingProduct?.id)
    if (duplicate) errs.sku = 'SKU must be unique'

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !activeStore) return
    
    const payload = {
      ...(editingProduct || {}),
      title: formData.name,
      sku: formData.sku,
      description: formData.description,
      category: formData.category || 'General',
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      inventory: parseInt(formData.stock),
      lowStockThreshold: 5,
      images: formData.imageUrl ? [formData.imageUrl] : editingProduct?.images || [],
      status: formData.status,
      variants: {
        sizes: formData.variantSizes ? formData.variantSizes.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        colors: formData.variantColors ? formData.variantColors.split(',').map(s => ({ name: s.trim(), hex: '#000' })).filter(c => c.name) : undefined,
        finishes: formData.variantFinishes ? formData.variantFinishes.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      },
      features: editingProduct?.features || [],
      subtitle: editingProduct?.subtitle || ''
    }

    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const url = editingProduct 
        ? `/api/store/${activeStore.slug}/products/${editingProduct.id}`
        : `/api/store/${activeStore.slug}/products`
        
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save product')
      
      notify(editingProduct ? 'Product updated' : 'Product created')
      setIsModalOpen(false)
      fetchProducts()
    } catch (err: any) {
      notify(err.message, 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!activeStore) return
    try {
      const res = await fetch(`/api/store/${activeStore.slug}/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      notify('Product deleted')
      setDeletingId(null)
      fetchProducts()
    } catch (err: any) {
      notify(err.message, 'error')
    }
  }


  const inputStyle = (hasError: boolean) => ({
    width: '100%', padding: '8px 12px', border: `1px solid ${hasError ? '#EF4444' : 'var(--line)'}`,
    borderRadius: '4px', fontSize: '12px', backgroundColor: '#FFFFFF', color: 'var(--navy)', outline: 'none'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div style={{ padding: '12px 16px', borderRadius: '4px', backgroundColor: notification.type === 'success' ? '#DCFCE7' : '#FEE2E2', color: notification.type === 'success' ? '#166534' : '#991B1B' }}>
          {notification.msg}
        </div>
      )}

      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '6px', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--line)', padding: '6px 10px', borderRadius: '4px', minWidth: '220px' }}>
            <Search size={14} color="#667085" />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '11px', width: '100%', background: 'transparent' }} />
          </div>

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '11px' }}>
            <option value="ALL">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as any)} style={{ padding: '6px 10px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '11px' }}>
            <option value="ALL">All Stock</option>
            <option value="LOW">Low Stock (≤ 5)</option>
            <option value="IN_STOCK">Healthy Stock</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} style={{ padding: '6px 10px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '11px' }}>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="button button-green" onClick={openAdd} style={{ padding: '8px 14px', fontSize: '11px' }}>
            <Plus size={13} /> Add Product
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#166534' }}>{selectedIds.size} selected</span>
          <select value={bulkAction} onChange={(e) => { setBulkAction(e.target.value); setBulkActionValue(''); }} style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--line)' }}>
            <option value="">Bulk Action</option>
            <option value="status">Change Status</option>
            <option value="category">Change Category</option>
            <option value="delete">Delete</option>
          </select>

          {bulkAction === 'status' && (
            <select value={bulkActionValue} onChange={(e) => setBulkActionValue(e.target.value)} style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--line)' }}>
              <option value="">Select Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          )}

          {bulkAction === 'category' && (
            <input type="text" placeholder="New Category" value={bulkActionValue} onChange={(e) => setBulkActionValue(e.target.value)} style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--line)' }} />
          )}

          {bulkAction === 'delete' ? (
            <button onClick={handleBulkDelete} className="button" style={{ background: '#DC2626', color: 'white', padding: '4px 12px', fontSize: '11px' }}>Confirm Delete</button>
          ) : (
            bulkAction && bulkActionValue && (
              <button onClick={handleBulkUpdate} className="button" style={{ background: '#059669', color: 'white', padding: '4px 12px', fontSize: '11px' }}>Apply</button>
            )
          )}
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--slate)' }}>Loading products...</div>
        ) : error ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#DC2626' }}>{error}</div>
        ) : paginatedProducts.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--slate)' }}>
            <Package size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 6px', color: 'var(--navy)' }}>No products found</h4>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '10px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px', width: '40px' }}>
                    <input type="checkbox" checked={selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <th style={{ padding: '12px 16px', width: '60px' }}>Image</th>
                  <th style={{ padding: '12px 16px' }}>Title</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>SKU</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Stock</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(p => {
                  const isLowStock = p.inventory <= (p.lowStockThreshold || 5)
                  const thumb = p.images?.[0]
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }} className="hover:bg-muted">
                      <td style={{ padding: '12px 16px' }}>
                        <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {thumb ? <img src={thumb} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={16} color="#94a3b8" /></div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ display: 'block', color: 'var(--navy)' }}>{p.title}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--slate)' }}>{p.category || 'General'}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600, background: p.status === 'draft' ? '#F1F5F9' : '#DCFCE7', color: p.status === 'draft' ? '#475569' : '#166534' }}>
                          {p.status === 'draft' ? 'Draft' : 'Published'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{p.sku}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>${p.price.toFixed(2)} {p.compareAtPrice && <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '10px' }}>${p.compareAtPrice.toFixed(2)}</span>}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: isLowStock ? '#FEF2F2' : '#F0FDF4', color: isLowStock ? '#991B1B' : '#166534' }}>
                          {isLowStock && <AlertTriangle size={11} />} {p.inventory}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button onClick={() => openEdit(p)} style={{ background: '#F8FAFC', border: '1px solid var(--line)', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer' }}><Edit3 size={13} /></button>
                          <button onClick={() => setDeletingId(p.id)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px', padding: '5px 8px', color: '#DC2626', cursor: 'pointer' }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--slate)' }}>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '4px 8px', border: '1px solid var(--line)', borderRadius: '4px', background: currentPage === 1 ? '#F1F5F9' : '#fff' }}><ChevronLeft size={14} /></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '4px 8px', border: '1px solid var(--line)', borderRadius: '4px', background: currentPage === totalPages ? '#F1F5F9' : '#fff' }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Confirm Deletion</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--slate)' }}>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeletingId(null)} className="button button-light">Cancel</button>
              <button onClick={() => handleDelete(deletingId)} className="button" style={{ background: '#DC2626', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle(!!formErrors.name)} />
                  {formErrors.name && <span style={{ color: '#EF4444', fontSize: '10px' }}>{formErrors.name}</span>}
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>SKU *</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} style={inputStyle(!!formErrors.sku)} />
                  {formErrors.sku && <span style={{ color: '#EF4444', fontSize: '10px' }}>{formErrors.sku}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Price *</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={inputStyle(!!formErrors.price)} />
                  {formErrors.price && <span style={{ color: '#EF4444', fontSize: '10px' }}>{formErrors.price}</span>}
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Compare-at Price</label>
                  <input type="number" step="0.01" value={formData.compareAtPrice} onChange={e => setFormData({...formData, compareAtPrice: e.target.value})} style={inputStyle(!!formErrors.compareAtPrice)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Stock *</label>
                  <input type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={inputStyle(!!formErrors.stock)} />
                  {formErrors.stock && <span style={{ color: '#EF4444', fontSize: '10px' }}>{formErrors.stock}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Category</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle(false)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'draft'|'published'})} style={inputStyle(false)}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Variants (comma separated)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <input type="text" placeholder="Sizes (S, M, L)" value={formData.variantSizes} onChange={e => setFormData({...formData, variantSizes: e.target.value})} style={inputStyle(false)} />
                  <input type="text" placeholder="Colors (Red, Blue)" value={formData.variantColors} onChange={e => setFormData({...formData, variantColors: e.target.value})} style={inputStyle(false)} />
                  <input type="text" placeholder="Finishes (Matte)" value={formData.variantFinishes} onChange={e => setFormData({...formData, variantFinishes: e.target.value})} style={inputStyle(false)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Image URL</label>
                <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={inputStyle(false)} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{...inputStyle(false), resize: 'vertical'}} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="button button-light">Cancel</button>
                <button type="submit" className="button button-green">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
