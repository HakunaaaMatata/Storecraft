'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Check, ArrowRight, ArrowLeft, Store, Package, Palette, Rocket, Upload, Sparkles, Plus, X } from 'lucide-react'
import { db, THEME_PRESETS, StoreThemePreset, Product, Store as StoreType } from '@/lib/store-data'
import { Button } from '@/components/ui/button'

const STEPS = [
  { id: 1, name: 'Business Details', icon: Store },
  { id: 2, name: 'Categories', icon: Package },
  { id: 3, name: 'Products', icon: Upload },
  { id: 4, name: 'Theme', icon: Palette },
  { id: 5, name: 'Launch', icon: Rocket },
]

const PREDEFINED_CATEGORIES = [
  'Fashion', 'Electronics', 'Beauty & Skincare', 'Home & Living', 
  'Food & Beverages', 'Sports & Fitness', 'Books & Stationery', 
  'Toys & Games', 'Jewelry & Accessories'
]

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isClient, setIsClient] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'Home & Living',
    description: '',
    categories: [] as string[],
    themePreset: 'forma' as StoreThemePreset,
    productsOption: 'none' as 'none' | 'sample' | 'csv'
  })

  const [customCategory, setCustomCategory] = useState('')

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('storecraft_onboarding_state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.step) setStep(parsed.step)
        if (parsed.formData) setFormData(parsed.formData)
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('storecraft_onboarding_state', JSON.stringify({ step, formData }))
    }
  }, [step, formData, isClient])

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleCategory = (cat: string) => {
    if (formData.categories.includes(cat)) {
      updateForm({ categories: formData.categories.filter(c => c !== cat) })
    } else {
      updateForm({ categories: [...formData.categories, cat] })
    }
  }

  const addCustomCategory = () => {
    if (customCategory.trim() && !formData.categories.includes(customCategory.trim())) {
      updateForm({ categories: [...formData.categories, customCategory.trim()] })
      setCustomCategory('')
    }
  }

  const handleNext = () => setStep(s => Math.min(s + 1, 5))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const [uploadedProducts, setUploadedProducts] = useState<Omit<Product, 'id' | 'storeId'>[]>([])
  const [csvFileName, setCsvFileName] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdStoreData, setCreatedStoreData] = useState<StoreType | null>(null)

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      if (!text) return
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('title'))
        const priceIdx = headers.findIndex(h => h.includes('price'))
        const stockIdx = headers.findIndex(h => h.includes('stock') || h.includes('qty') || h.includes('quantity'))
        const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('code'))
        const catIdx = headers.findIndex(h => h.includes('category'))

        const parsedProds: Omit<Product, 'id' | 'storeId'>[] = []
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim())
          const name = nameIdx >= 0 ? parts[nameIdx] : parts[0]
          if (!name) continue
          const price = priceIdx >= 0 ? parseFloat(parts[priceIdx]) || 25 : 25
          const stock = stockIdx >= 0 ? parseInt(parts[stockIdx], 10) || 10 : 10
          const sku = skuIdx >= 0 ? parts[skuIdx] : `SKU-${100 + i}`
          const category = catIdx >= 0 && parts[catIdx] ? parts[catIdx] : (formData.categories[0] || 'General')

          parsedProds.push({
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: `Imported during store setup.`,
            category,
            price,
            stock,
            sku,
            images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
            createdAt: new Date().toISOString()
          })
        }
        setUploadedProducts(parsedProds)
        updateForm({ productsOption: 'csv' })
      }
    }
    reader.readAsText(file)
  }

  const handleLaunch = () => {
    setIsLaunching(true)
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'my-store'
    const newStoreId = `store-${Date.now()}`

    const newStore: StoreType = {
      id: newStoreId,
      slug,
      name: formData.name || 'My Store',
      ownerName: formData.ownerName || 'Store Owner',
      email: formData.email,
      phone: formData.phone,
      businessType: formData.businessType,
      address: formData.address,
      description: formData.description,
      categories: formData.categories.length > 0 ? formData.categories : ['General'],
      theme: THEME_PRESETS[formData.themePreset],
      createdAt: new Date().toISOString()
    }

    db.saveStore(newStore)
    db.setActiveStore(newStoreId)

    if (formData.productsOption === 'sample') {
      const dummyProducts: Product[] = (formData.categories.length > 0 ? formData.categories : ['Home & Living', 'Accessories']).map((cat, i) => ({
        id: `prod-gen-${Date.now()}-${i}`,
        storeId: newStoreId,
        name: `Sample ${cat} Item`,
        slug: `sample-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-item`,
        description: `This is an automatically generated sample product for the ${cat} category. Customize it in your dashboard.`,
        category: cat,
        price: Math.floor(Math.random() * 80) + 24,
        stock: Math.floor(Math.random() * 30) + 4,
        sku: `${cat.substring(0,3).toUpperCase()}-00${i + 1}`,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        createdAt: new Date().toISOString(),
        featured: i < 3
      }))
      dummyProducts.forEach(p => db.saveProduct(p))
    } else if (formData.productsOption === 'csv' && uploadedProducts.length > 0) {
      uploadedProducts.forEach((p, i) => {
        db.saveProduct({
          ...p,
          id: `prod-csv-${Date.now()}-${i}`,
          storeId: newStoreId
        })
      })
    }

    localStorage.removeItem('storecraft_onboarding_state')

    setTimeout(() => {
      setIsLaunching(false)
      setCreatedStoreData(newStore)
      setIsSuccess(true)
    }, 600)
  }

  if (!isClient) return null

  const isStep1Valid = formData.name.trim() !== '' && formData.email.trim() !== ''

  // Input styling to match the original theme tokens (emerald green primary, navy foreground)
  const inputClassName = "w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-card text-foreground"

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground font-sans">
      <header className="h-16 flex items-center px-6 md:px-12 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 font-black tracking-tight text-lg text-foreground">
          <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          Storecraft
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <aside className="md:w-64 border-r border-border bg-muted p-6 md:p-8 shrink-0 md:overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Setup Progress</p>
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {STEPS.map((s) => (
              <div key={s.id} className={`flex items-center gap-3 shrink-0 ${step === s.id ? 'text-primary font-bold' : step > s.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === s.id ? 'border-primary bg-primary/10' : 
                  step > s.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                }`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className="text-sm hidden md:block">{s.name}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
          <div className="max-w-2xl mx-auto">
            {isSuccess && createdStoreData ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8" />
                </div>
                <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Store Creation Success</p>
                <h1 className="text-4xl font-serif tracking-tight text-foreground mb-3">
                  Your store is ready.
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  <strong>{createdStoreData.name}</strong> has been created with all your settings, themes, and products loaded.
                </p>

                <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto mb-8 text-left space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Store Name:</span>
                    <strong className="text-foreground">{createdStoreData.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <strong className="text-foreground">{createdStoreData.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storefront Link:</span>
                    <strong className="text-primary">{createdStoreData.slug}.storecraft.app</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Theme Direction:</span>
                    <strong className="capitalize text-foreground">{createdStoreData.theme.preset}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catalog Status:</span>
                    <strong className="text-foreground">
                      {formData.productsOption === 'sample' 
                        ? `${formData.categories.length || 2} sample products loaded`
                        : formData.productsOption === 'csv'
                        ? `${uploadedProducts.length} CSV products loaded`
                        : 'Ready for manual addition'}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    onClick={() => router.push('/dashboard')} 
                    className="w-full sm:w-auto px-8 py-3 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`/store/${createdStoreData.slug}`, '_blank')}
                    className="w-full sm:w-auto"
                  >
                    Preview Live Storefront
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-8">
                      <p className="text-primary text-sm font-bold tracking-widest uppercase mb-2">Step 1</p>
                      <h1 className="text-4xl font-serif tracking-tight text-foreground mb-3">Tell us about your business.</h1>
                      <p className="text-muted-foreground">We’ll tailor your workspace and storefront around your ambition.</p>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <label className="block">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Store Name *</span>
                          <input type="text" value={formData.name} onChange={e => updateForm({ name: e.target.value })} placeholder="e.g. Northstar Goods" className={inputClassName} />
                        </label>
                        <label className="block">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Owner Name</span>
                          <input type="text" value={formData.ownerName} onChange={e => updateForm({ ownerName: e.target.value })} placeholder="Your full name" className={inputClassName} />
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <label className="block">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Contact Email *</span>
                          <input type="email" value={formData.email} onChange={e => updateForm({ email: e.target.value })} placeholder="hello@yourstore.com" className={inputClassName} />
                        </label>
                        <label className="block">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone Number</span>
                          <input type="tel" value={formData.phone} onChange={e => updateForm({ phone: e.target.value })} placeholder="+1 (555) 000-0000" className={inputClassName} />
                        </label>
                      </div>

                      <label className="block">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Business Address</span>
                        <input type="text" value={formData.address} onChange={e => updateForm({ address: e.target.value })} placeholder="123 Main St, City, Country" className={inputClassName} />
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Primary Business Type</span>
                        <select value={formData.businessType} onChange={e => updateForm({ businessType: e.target.value })} className={inputClassName}>
                          <option>Home & Living</option>
                          <option>Fashion & Apparel</option>
                          <option>Electronics</option>
                          <option>Beauty & Skincare</option>
                          <option>Food & Grocery</option>
                          <option>Other</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Brief Description</span>
                        <textarea value={formData.description} onChange={e => updateForm({ description: e.target.value })} placeholder="What does your store sell?" rows={3} className={`${inputClassName} resize-none`} />
                      </label>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-8">
                      <p className="text-primary text-sm font-bold tracking-widest uppercase mb-2">Step 2</p>
                      <h1 className="text-4xl font-serif tracking-tight text-foreground mb-3">What are you selling?</h1>
                      <p className="text-muted-foreground">Select or add categories to organize your catalog.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {PREDEFINED_CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => toggleCategory(cat)} className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${formData.categories.includes(cat) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'}`}>
                          {cat} {formData.categories.includes(cat) && <Check className="inline w-3 h-3 ml-1" />}
                        </button>
                      ))}
                      {formData.categories.filter(c => !PREDEFINED_CATEGORIES.includes(c)).map(cat => (
                        <button key={cat} onClick={() => toggleCategory(cat)} className="px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary text-sm font-medium transition-colors flex items-center gap-1">
                          {cat} <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 max-w-sm">
                      <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomCategory()} placeholder="Add custom category..." className={inputClassName} />
                      <Button variant="secondary" onClick={addCustomCategory} type="button"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-8">
                      <p className="text-primary text-sm font-bold tracking-widest uppercase mb-2">Step 3</p>
                      <h1 className="text-4xl font-serif tracking-tight text-foreground mb-3">Bring your products along.</h1>
                      <p className="text-muted-foreground">Start with realistic sample products to explore the platform, or upload your own inventory.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <button onClick={() => updateForm({ productsOption: 'sample' })} className={`text-left p-6 rounded-lg border-2 transition-all ${formData.productsOption === 'sample' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-card hover:border-primary/50'}`}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4"><Sparkles className="w-5 h-5" /></div>
                        <h3 className="font-bold text-base mb-1 text-foreground">Generate Sample Products</h3>
                        <p className="text-sm text-muted-foreground">We'll automatically generate realistic dummy products based on your selected categories.</p>
                      </button>

                      <div className={`text-left p-6 rounded-lg border-2 transition-all ${formData.productsOption === 'csv' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-card hover:border-primary/50'}`}>
                        <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center mb-4"><Upload className="w-5 h-5" /></div>
                        <h3 className="font-bold text-base mb-1 text-foreground">Upload CSV or Excel</h3>
                        <p className="text-sm text-muted-foreground mb-3">Select a .csv spreadsheet with product names, prices, and stock.</p>
                        <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
                        {csvFileName && (
                          <p className="text-xs font-bold text-primary mt-2 flex items-center gap-1">
                            <Check className="w-3 h-3" /> {csvFileName} ({uploadedProducts.length} items parsed)
                          </p>
                        )}
                      </div>
                      
                      <button onClick={() => updateForm({ productsOption: 'none' })} className={`text-left p-6 rounded-lg border-2 md:col-span-2 transition-all ${formData.productsOption === 'none' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-card hover:border-primary/50'}`}>
                        <h3 className="font-bold text-base mb-1 text-foreground">Skip for now</h3>
                        <p className="text-sm text-muted-foreground">I'll add my products manually from the dashboard later.</p>
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-8">
                      <p className="text-primary text-sm font-bold tracking-widest uppercase mb-2">Step 4</p>
                      <h1 className="text-4xl font-serif tracking-tight text-foreground mb-3">Make it unmistakably yours.</h1>
                      <p className="text-muted-foreground">Choose a visual direction for your storefront. You can change everything later.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {(Object.keys(THEME_PRESETS) as StoreThemePreset[]).map((themeId) => {
                        const theme = THEME_PRESETS[themeId]
                        const isActive = formData.themePreset === themeId
                        return (
                          <button key={themeId} onClick={() => updateForm({ themePreset: themeId })} className={`text-left rounded-lg border-2 overflow-hidden transition-all ${isActive ? 'border-primary ring-4 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
                            <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${theme.heroImage})` }} />
                            <div className="p-4 bg-card flex justify-between items-center text-foreground">
                              <div>
                                <strong className="block capitalize font-bold">{themeId}</strong>
                                <small className="text-muted-foreground" style={{ fontFamily: theme.fontHeading }}>{theme.fontHeading}</small>
                              </div>
                              <div className="flex gap-1">
                                <span className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: theme.primaryColor }}></span>
                                <span className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: theme.accentColor }}></span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-8">
                      <p className="text-primary text-sm font-bold tracking-widest uppercase mb-2">Step 5</p>
                      <h1 className="text-4xl font-serif tracking-tight text-foreground mb-3">Review & Launch.</h1>
                      <p className="text-muted-foreground">Ready to open your doors? Review your store details before launching.</p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 space-y-6 text-foreground">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Store Name</p>
                          <p className="font-bold">{formData.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Owner</p>
                          <p className="font-bold">{formData.ownerName || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Business Type</p>
                          <p className="font-bold">{formData.businessType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Theme</p>
                          <p className="font-bold capitalize">{formData.themePreset}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Categories</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.categories.length > 0 ? (
                             formData.categories.map(c => <span key={c} className="px-2.5 py-1 rounded bg-muted text-xs font-medium">{c}</span>)
                          ) : (
                            <span className="text-sm">None selected</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-sm mb-1">Products</p>
                        <p className="font-bold text-sm">
                          {formData.productsOption === 'sample' ? 'Will generate sample products' : 
                           formData.productsOption === 'csv' ? `Will import ${uploadedProducts.length} CSV products` : 'Starting fresh (no products)'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="mt-12 flex justify-between pt-6 border-t border-border">
                  {step > 1 ? (
                    <Button variant="outline" onClick={handlePrev} disabled={isLaunching}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  ) : <div />}
                  
                  {step < 5 ? (
                    <Button onClick={handleNext} disabled={step === 1 && !isStep1Valid}>
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleLaunch} disabled={isLaunching || (step === 1 && !isStep1Valid)}>
                      {isLaunching ? (
                        <>Launching Storecraft... <Sparkles className="w-4 h-4 ml-2 animate-pulse" /></>
                      ) : (
                        <>Launch Store <Rocket className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
