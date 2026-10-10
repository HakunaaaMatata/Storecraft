'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Check, Package, Sparkles, ArrowRight, ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS_BY_CATEGORY, DummyCategory, DummySampleProduct } from '@/lib/dummy-sample-products'

interface SampleProductImportModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmImport: (products: DummySampleProduct[], category: string) => void
  initialCategory?: string
}

export function SampleProductImportModal({
  isOpen,
  onClose,
  onConfirmImport,
  initialCategory,
}: SampleProductImportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<DummyCategory>(() => {
    if (initialCategory) {
      const match = DUMMY_CATEGORIES.find(c => c.toLowerCase() === initialCategory.toLowerCase())
      if (match) return match
    }
    return 'Clothing'
  })

  const [step, setStep] = useState<'select' | 'preview'>('select')
  const [generatedProducts, setGeneratedProducts] = useState<DummySampleProduct[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({})

  if (!isOpen) return null

  const handleGeneratePreview = () => {
    const products = DUMMY_PRODUCTS_BY_CATEGORY[selectedCategory] || DUMMY_PRODUCTS_BY_CATEGORY['Clothing']
    setGeneratedProducts(products)
    setStep('preview')
  }

  const handleConfirm = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    onConfirmImport(generatedProducts, selectedCategory)
    setIsSubmitting(false)
    onClose()
  }

  const handleImageError = (id: string) => {
    setImageErrorMap(prev => ({ ...prev, [id]: true }))
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Add Sample Products
                </h3>
                <p className="text-xs text-slate-500">
                  {step === 'select' ? 'Select a category to generate 5 realistic sample products' : 'Preview 5 generated sample products'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {step === 'select' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Select Product Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DUMMY_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/20 text-slate-900 font-bold'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="text-sm font-semibold">{cat}</span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    Selecting <strong>{selectedCategory}</strong> will generate exactly 5 curated products complete with images, pricing, SKUs, and realistic descriptions.
                  </p>
                </div>
              </div>
            ) : (
              /* Step 2: Preview */
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold">5 sample products ready to import</span>
                  </div>
                  <span className="text-[11px] font-semibold bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-800">
                    {selectedCategory}
                  </span>
                </div>

                {/* Product List Preview */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {generatedProducts.map((p) => {
                    const hasError = imageErrorMap[p.id]
                    return (
                      <div
                        key={p.id}
                        className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-3.5"
                      >
                        {/* Image / Fallback */}
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                          {!hasError && p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              onError={() => handleImageError(p.id)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                            <span className="text-xs font-bold text-slate-900 shrink-0">${p.price}.00</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span>SKU: {p.sku}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Stock: {p.stock} units</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            {step === 'preview' ? (
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to category
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              {step === 'select' ? (
                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
                >
                  Generate 5 Sample Products <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? 'Importing...' : 'Confirm Import'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
