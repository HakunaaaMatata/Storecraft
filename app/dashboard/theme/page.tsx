'use client'

import { useState, useEffect } from 'react'
import { Palette, Save, LayoutTemplate, Type, Image as ImageIcon, Eye, ArrowLeft } from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { THEME_PRESETS, StoreThemePreset, ThemeConfig } from '@/lib/store-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ThemeCustomizerPage() {
  const { activeStore, actions, isClient } = useStorecraft()
  const [draft, setDraft] = useState<ThemeConfig | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'preset' | 'colors' | 'typography' | 'hero'>('preset')

  useEffect(() => {
    if (activeStore && !draft) {
      setDraft({ ...activeStore.theme })
    }
  }, [activeStore, draft])

  if (!isClient || !draft || !activeStore) return null

  const handleSave = () => {
    setIsSaving(true)
    actions.updateTheme(draft)
    setTimeout(() => setIsSaving(false), 600)
  }

  const applyPreset = (presetId: StoreThemePreset) => {
    setDraft({ ...THEME_PRESETS[presetId] })
  }

  const inputClass = "w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-card text-foreground"
  const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block"

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground font-sans">
      
      {/* LEFT PANEL: Editor */}
      <aside className="w-96 border-r border-border bg-card flex flex-col shrink-0">
        <header className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold">Theme Editor</h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="h-8">
            {isSaving ? <span className="flex items-center"><Save className="w-4 h-4 mr-2 animate-spin" /> Saving...</span> : <span className="flex items-center"><Save className="w-4 h-4 mr-2" /> Publish</span>}
          </Button>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-border overflow-x-auto hide-scrollbar">
          {(['preset', 'colors', 'typography', 'hero'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {activeTab === 'preset' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-1 flex items-center gap-2"><LayoutTemplate className="w-4 h-4" /> Starting Presets</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose a foundation, then customize it perfectly to your brand.</p>
              </div>
              <div className="grid gap-4">
                {(Object.keys(THEME_PRESETS) as StoreThemePreset[]).map(presetId => {
                  const p = THEME_PRESETS[presetId]
                  const isActive = draft.preset === presetId
                  return (
                    <button
                      key={presetId}
                      onClick={() => applyPreset(presetId)}
                      className={`text-left rounded-lg border-2 overflow-hidden transition-all ${isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                    >
                      <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${p.heroImage})` }} />
                      <div className="p-3 bg-card flex justify-between items-center text-foreground">
                        <strong className="block capitalize font-bold text-sm">{presetId}</strong>
                        <div className="flex gap-1">
                          <span className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: p.primaryColor }} />
                          <span className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: p.accentColor }} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-1 flex items-center gap-2"><Palette className="w-4 h-4" /> Color Palette</h3>
                <p className="text-sm text-muted-foreground mb-4">Define your store's signature colors.</p>
              </div>
              
              <label className="block">
                <span className={labelClass}>Primary Brand Color</span>
                <div className="flex gap-3">
                  <input type="color" value={draft.primaryColor} onChange={e => setDraft({...draft, primaryColor: e.target.value})} className="h-10 w-14 rounded cursor-pointer bg-transparent border-0 p-0" />
                  <input type="text" value={draft.primaryColor} onChange={e => setDraft({...draft, primaryColor: e.target.value})} className={inputClass} />
                </div>
              </label>

              <label className="block">
                <span className={labelClass}>Accent Color (Buttons, Links)</span>
                <div className="flex gap-3">
                  <input type="color" value={draft.accentColor} onChange={e => setDraft({...draft, accentColor: e.target.value})} className="h-10 w-14 rounded cursor-pointer bg-transparent border-0 p-0" />
                  <input type="text" value={draft.accentColor} onChange={e => setDraft({...draft, accentColor: e.target.value})} className={inputClass} />
                </div>
              </label>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-1 flex items-center gap-2"><Type className="w-4 h-4" /> Typography</h3>
                <p className="text-sm text-muted-foreground mb-4">Select fonts for headings and body text.</p>
              </div>
              
              <label className="block">
                <span className={labelClass}>Heading Font</span>
                <select value={draft.fontHeading} onChange={e => setDraft({...draft, fontHeading: e.target.value})} className={inputClass}>
                  <option value="DM Serif Display">DM Serif Display (Editorial)</option>
                  <option value="Manrope">Manrope (Clean & Modern)</option>
                  <option value="Inter">Inter (Neutral)</option>
                  <option value="Playfair Display">Playfair Display (Classic)</option>
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Body Font</span>
                <select value={draft.fontBody} onChange={e => setDraft({...draft, fontBody: e.target.value})} className={inputClass}>
                  <option value="Manrope">Manrope</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="System">System Default</option>
                </select>
              </label>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-1 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Hero Section</h3>
                <p className="text-sm text-muted-foreground mb-4">The first thing customers see when they land.</p>
              </div>
              
              <label className="block">
                <span className={labelClass}>Announcement Bar</span>
                <input type="text" value={draft.announcement} onChange={e => setDraft({...draft, announcement: e.target.value})} className={inputClass} />
              </label>

              <label className="block">
                <span className={labelClass}>Hero Title</span>
                <textarea rows={2} value={draft.heroTitle} onChange={e => setDraft({...draft, heroTitle: e.target.value})} className={`${inputClass} resize-none font-bold`} />
              </label>

              <label className="block">
                <span className={labelClass}>Hero Subtitle</span>
                <textarea rows={3} value={draft.heroSubtitle} onChange={e => setDraft({...draft, heroSubtitle: e.target.value})} className={`${inputClass} resize-none`} />
              </label>

              <label className="block">
                <span className={labelClass}>Button Text</span>
                <input type="text" value={draft.heroCta} onChange={e => setDraft({...draft, heroCta: e.target.value})} className={inputClass} />
              </label>
              
              <label className="block">
                <span className={labelClass}>Hero Image URL</span>
                <input type="url" value={draft.heroImage} onChange={e => setDraft({...draft, heroImage: e.target.value})} className={inputClass} />
                <div className="mt-2 h-20 rounded border border-border bg-cover bg-center" style={{ backgroundImage: `url(${draft.heroImage})` }} />
              </label>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT PANEL: Live Preview */}
      <main className="flex-1 bg-muted p-8 overflow-y-auto flex justify-center items-start">
        
        {/* Simulated Browser Window */}
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden border border-border/50 flex flex-col transition-all duration-500"
             style={{ 
               fontFamily: draft.fontBody,
               color: draft.primaryColor 
             }}>
          
          {/* Browser Chrome */}
          <div className="h-10 bg-muted/80 border-b border-border flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="mx-auto text-xs text-muted-foreground bg-background px-24 py-1 rounded-md border border-border flex items-center gap-2">
              <Eye className="w-3 h-3" /> {activeStore.slug}.storecraft.com
            </div>
          </div>

          {/* Storefront Preview Body */}
          <div className="flex-1 overflow-y-auto relative bg-[#FCFCFC]">
            
            {/* Announcement Bar */}
            {draft.announcement && (
              <div className="py-2 px-4 text-center text-xs font-bold tracking-wide" style={{ backgroundColor: draft.accentColor, color: '#fff' }}>
                {draft.announcement}
              </div>
            )}

            {/* Header */}
            <header className="px-8 py-5 flex justify-between items-center border-b border-black/5">
              <div className="font-bold text-xl tracking-tight uppercase" style={{ fontFamily: draft.fontHeading }}>
                {activeStore.name}
              </div>
              <nav className="hidden md:flex gap-6 text-sm font-medium opacity-80">
                <span>Shop</span>
                <span>Collections</span>
                <span>About</span>
              </nav>
              <div className="flex gap-4">
                <span className="w-5 h-5 rounded-full border border-black/20" />
                <span className="w-5 h-5 rounded-full border border-black/20" />
              </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${draft.heroImage})` }} />
              <div className="absolute inset-0 bg-black/30" /> {/* overlay */}
              
              <div className="relative z-10 text-center text-white p-6 max-w-2xl mt-12">
                <h1 className="text-5xl md:text-6xl font-normal leading-tight mb-6" style={{ fontFamily: draft.fontHeading }}>
                  {draft.heroTitle}
                </h1>
                <p className="text-lg md:text-xl opacity-90 mb-8 max-w-lg mx-auto">
                  {draft.heroSubtitle}
                </p>
                <button 
                  className="px-8 py-4 text-sm font-bold uppercase tracking-wider rounded-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: draft.accentColor, color: '#fff' }}
                >
                  {draft.heroCta}
                </button>
              </div>
            </section>

            {/* Fake Product Grid */}
            <section className="py-20 px-8 max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-medium" style={{ fontFamily: draft.fontHeading }}>Featured Objects</h2>
                <p className="opacity-60 mt-2">Curated for your space.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-[3/4] bg-gray-200 mb-4 overflow-hidden rounded-sm">
                      <div className="w-full h-full bg-black/5 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="block text-sm mb-1">Product Sample {i}</strong>
                        <span className="opacity-60 text-sm">Category</span>
                      </div>
                      <span className="text-sm font-medium">${i * 45}.00</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>

    </div>
  )
}
