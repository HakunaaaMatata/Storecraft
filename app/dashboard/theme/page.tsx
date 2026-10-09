'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, LayoutTemplate, Palette, Type, Image as ImageIcon, Check, Loader2, Undo2 } from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { useAuth } from '@/lib/use-auth'
import { useRouter } from 'next/navigation'
import { THEME_PRESETS } from '@/lib/theme-presets'
import { CustomThemeSettings, Store, ThemePresetId, ThemeConfig, StoreSection, StoreSectionId } from '@/lib/types'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'

export default function ThemeCustomizerPage() {
  const { activeStore, isClient } = useStorecraft()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [storeData, setStoreData] = useState<Store | null>(null)
  const [draft, setDraft] = useState<CustomThemeSettings | null>(null)
  
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [activeTab, setActiveTab] = useState<'preset' | 'colors' | 'typography' | 'hero' | 'layout'>('preset')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/theme')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (activeStore?.slug && isClient) {
      fetch(`/api/store/${activeStore.slug}`)
        .then(res => res.json())
        .then(data => {
          setStoreData(data.store)
          setDraft(data.store.draftThemeSettings || data.store.themeSettings || { preset: data.store.preset })
        })
        .catch(console.error)
    }
  }, [activeStore?.slug, isClient])

  if (!isClient || authLoading || !draft || !storeData) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>


  const resolvedTheme: ThemeConfig = {
    ...(THEME_PRESETS[draft.preset] || THEME_PRESETS.atelier),
    fontHeadline: draft.fontHeadline || THEME_PRESETS[draft.preset]?.fontHeadline,
    fontBody: draft.fontBody || THEME_PRESETS[draft.preset]?.fontBody,
    bg: draft.bgColor || THEME_PRESETS[draft.preset]?.bg,
    surface: draft.surfaceColor || THEME_PRESETS[draft.preset]?.surface,
    accent: draft.accentColor || THEME_PRESETS[draft.preset]?.accent,
    ink: draft.primaryColor || THEME_PRESETS[draft.preset]?.ink,
    heroImage: draft.heroImage || THEME_PRESETS[draft.preset]?.heroImage,
    heroHeadline: draft.heroHeadline || THEME_PRESETS[draft.preset]?.heroHeadline,
    heroSubtitle: draft.heroSubtitle || THEME_PRESETS[draft.preset]?.heroSubtitle,
    heroCta: draft.heroCta || THEME_PRESETS[draft.preset]?.heroCta,
    announcementBg: THEME_PRESETS[draft.preset]?.announcementBg,
  }

  const handleAction = async (action: 'save_draft' | 'publish' | 'reset_theme') => {
    if (action === 'save_draft') setIsSavingDraft(true)
    if (action === 'publish') setIsPublishing(true)
    if (action === 'reset_theme') {
      if (!confirm('Are you sure you want to reset to default theme settings? This will discard all customizations.')) return
      setIsResetting(true)
    }

    try {
      const res = await fetch(`/api/store/${storeData.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, settings: draft })
      })
      const data = await res.json()
      if (res.ok) {
        setStoreData(data.store)
        if (action === 'reset_theme') {
          setDraft({ preset: data.store.preset })
        }
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save settings')
    } finally {
      setIsSavingDraft(false)
      setIsPublishing(false)
      setIsResetting(false)
    }
  }

  const tabs = [
    { id: 'preset', label: 'Starting Preset', icon: LayoutTemplate, eyebrow: 'Foundation', title: 'Make it unmistakably yours.', desc: 'Choose a point of view, then tune every detail.' },
    { id: 'colors', label: 'Colors', icon: Palette, eyebrow: 'Color Palette', title: 'Paint your digital space.', desc: 'Select the exact primary and accent colors that represent your brand.' },
    { id: 'typography', label: 'Typography', icon: Type, eyebrow: 'Typography', title: 'Speak in your own voice.', desc: 'Choose editorial, modern, or classic fonts that fit your story.' },
    { id: 'hero', label: 'Hero Section', icon: ImageIcon, eyebrow: 'Hero Section', title: 'A striking first impression.', desc: 'Set the announcement bar, hero headline, and banner imagery.' },
    { id: 'layout', label: 'Layout & Sections', icon: LayoutTemplate, eyebrow: 'Store Layout', title: 'Structure your storefront.', desc: 'Enable, disable, and reorder homepage sections.' },
  ] as const

  const currentTabInfo = tabs.find(t => t.id === activeTab)!
  
  const defaultSections: StoreSection[] = [
    { id: 'announcement', name: 'Announcement Bar', enabled: true },
    { id: 'hero', name: 'Hero Banner', enabled: true },
    { id: 'categories', name: 'Categories', enabled: true },
    { id: 'catalog', name: 'Product Catalog', enabled: true },
    { id: 'footer', name: 'Footer', enabled: true }
  ];
  
  const activeSections = draft.sections || defaultSections;

  const toggleSection = (id: StoreSectionId) => {
    const updated = activeSections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    setDraft({ ...draft, sections: updated })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: '14px 20px',
        borderRadius: '6px',
        border: '1px solid var(--line)'
      }}>
        <div>
          <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>Storefront Theme Studio</strong>
          <span style={{ fontSize: '11px', color: 'var(--slate)', display: 'block' }}>Customize color palette, typography, hero banners, and presets.</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            onClick={() => handleAction('reset_theme')} 
            disabled={isResetting || isPublishing || isSavingDraft}
          >
            {isResetting ? <Loader2 size={13} className="animate-spin" /> : <Undo2 size={13} />} Reset
          </button>
          <button 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            onClick={() => handleAction('save_draft')} 
            disabled={isSavingDraft || isPublishing || isResetting}
          >
            {isSavingDraft ? <Loader2 size={13} className="animate-spin" /> : 'Save Draft'}
          </button>
          <button 
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-teal-600 rounded hover:bg-teal-700 disabled:opacity-50" 
            onClick={() => handleAction('publish')} 
            disabled={isPublishing || isSavingDraft || isResetting}
          >
            {isPublishing ? <Loader2 size={13} className="animate-spin" /> : 'Publish to Live Store'} <Check size={13} />
          </button>
        </div>
      </div>

      <section className="workspace-section bg-gray-50 p-8 rounded-lg" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <div className="workspace-head mb-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Theme Customizer</p>
            <h2 className="text-3xl font-serif text-gray-900 mb-6">Run your store with <em className="italic text-gray-500">style.</em></h2>
          </motion.div>
          <div className="workspace-tabs flex gap-6 border-b border-gray-200">
            {tabs.map((item) => (
              <button 
                key={item.id} 
                className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === item.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`} 
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="builder-panel grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="builder-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{currentTabInfo.eyebrow}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{currentTabInfo.title}</h3>
                <p className="text-sm text-gray-500 mb-8">{currentTabInfo.desc}</p>

                <div className="builder-fields space-y-6">
                  {activeTab === 'preset' && (
                    <div className="grid grid-cols-2 gap-4">
                      {(Object.keys(THEME_PRESETS) as ThemePresetId[]).map((presetId) => {
                        const theme = THEME_PRESETS[presetId]
                        const isActive = draft.preset === presetId
                        return (
                          <button 
                            key={presetId}
                            className={`relative text-left p-4 rounded-lg border-2 transition-all overflow-hidden ${isActive ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                            onClick={() => setDraft({ preset: presetId })}
                          >
                            <div className="h-24 rounded bg-cover bg-center mb-4" style={{ backgroundImage: `url(${theme.heroImage})` }} />
                            <div className="flex justify-between items-center">
                              <div>
                                <strong className="block text-sm capitalize text-gray-900">{presetId}</strong>
                                <span className="text-xs text-gray-500 truncate block w-32">{theme.type}</span>
                              </div>
                              {isActive && <Check size={16} className="text-teal-600" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {activeTab === 'colors' && (
                    <div className="space-y-6">
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Primary Ink Color</span>
                        <div className="flex gap-3">
                          <input type="color" value={resolvedTheme.ink} onChange={e => setDraft({...draft, primaryColor: e.target.value})} className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer" />
                          <input type="text" value={resolvedTheme.ink} onChange={e => setDraft({...draft, primaryColor: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm uppercase" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Accent Color</span>
                        <div className="flex gap-3">
                          <input type="color" value={resolvedTheme.accent} onChange={e => setDraft({...draft, accentColor: e.target.value})} className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer" />
                          <input type="text" value={resolvedTheme.accent} onChange={e => setDraft({...draft, accentColor: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm uppercase" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Background Color</span>
                        <div className="flex gap-3">
                          <input type="color" value={resolvedTheme.bg} onChange={e => setDraft({...draft, bgColor: e.target.value})} className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer" />
                          <input type="text" value={resolvedTheme.bg} onChange={e => setDraft({...draft, bgColor: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm uppercase" />
                        </div>
                      </label>
                    </div>
                  )}

                  {activeTab === 'typography' && (
                    <div className="space-y-6">
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Heading Font</span>
                        <select 
                          value={resolvedTheme.fontHeadline} 
                          onChange={e => setDraft({...draft, fontHeadline: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="'DM Serif Display', Georgia, serif">DM Serif Display (Editorial)</option>
                          <option value="'Manrope', sans-serif">Manrope (Clean & Modern)</option>
                          <option value="Georgia, serif">Georgia (Classic)</option>
                          <option value="system-ui, sans-serif">System UI</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Body Font</span>
                        <select 
                          value={resolvedTheme.fontBody} 
                          onChange={e => setDraft({...draft, fontBody: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="'Manrope', sans-serif">Manrope</option>
                          <option value="'Inter', sans-serif">Inter</option>
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="system-ui, sans-serif">System UI</option>
                        </select>
                      </label>
                    </div>
                  )}

                  {activeTab === 'hero' && (
                    <div className="space-y-6">
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Announcement Text</span>
                        <input type="text" value={draft.announcement || ''} onChange={e => setDraft({...draft, announcement: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="Free shipping on all orders over $50" />
                      </label>
                      <label className="block flex items-center gap-3">
                        <input type="checkbox" checked={draft.announcementEnabled !== false} onChange={e => setDraft({...draft, announcementEnabled: e.target.checked})} className="h-4 w-4 text-teal-600 rounded border-gray-300" />
                        <span className="text-sm font-medium text-gray-700">Enable Announcement Bar</span>
                      </label>
                      <div className="border-t border-gray-200 my-6"></div>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Headline</span>
                        <input type="text" value={resolvedTheme.heroHeadline} onChange={e => setDraft({...draft, heroHeadline: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Sub-headline</span>
                        <textarea value={resolvedTheme.heroSubtitle} onChange={e => setDraft({...draft, heroSubtitle: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[80px]" />
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Button Text</span>
                        <input type="text" value={resolvedTheme.heroCta} onChange={e => setDraft({...draft, heroCta: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-2">Hero Image URL</span>
                        <input type="url" value={resolvedTheme.heroImage} onChange={e => setDraft({...draft, heroImage: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </label>
                    </div>
                  )}

                  {activeTab === 'layout' && (
                    <div className="space-y-4">
                      {activeSections.map((section, idx) => (
                        <div key={section.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400 font-mono text-xs">{idx + 1}</span>
                            <span className="font-medium text-sm text-gray-900">{section.name}</span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={section.enabled} 
                              onChange={() => toggleSection(section.id)}
                              className="h-4 w-4 text-teal-600 rounded border-gray-300"
                            />
                            <span className="text-xs text-gray-500">{section.enabled ? 'Enabled' : 'Hidden'}</span>
                          </label>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 mt-4 italic">Drag and drop to reorder coming soon.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Live Preview */}
          <div className="builder-preview sticky top-8 h-[calc(100vh-160px)] flex flex-col">
            <div className="builder-preview-top flex justify-between items-center bg-gray-900 text-white px-4 py-2 rounded-t-xl text-xs font-medium">
              <span>Preview Mode</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Draft Layout
              </span>
            </div>
            
            <div className="storefront-preview flex-1 overflow-hidden rounded-b-xl border border-gray-200 border-t-0 bg-white" style={{ 
              backgroundColor: resolvedTheme.bg,
              color: resolvedTheme.ink,
              fontFamily: resolvedTheme.fontBody,
            }}>
              {/* Fake Storefront UI */}
              <div className="h-full overflow-y-auto flex flex-col">
                {draft.announcementEnabled !== false && (
                  <div style={{ backgroundColor: resolvedTheme.announcementBg || resolvedTheme.ink, color: resolvedTheme.bg, padding: '8px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {draft.announcement || 'Announce something here'}
                  </div>
                )}
                
                <header className="px-6 py-5 flex justify-between items-center border-b" style={{ borderColor: resolvedTheme.border }}>
                  <div className="font-bold text-lg">{storeData.name}</div>
                  <div className="flex gap-6 text-sm" style={{ opacity: 0.8 }}>
                    <span>Catalog</span>
                    <span>About</span>
                    <span>Cart (0)</span>
                  </div>
                </header>

                <div className="relative flex-1 min-h-[400px] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${resolvedTheme.heroImage})` }} />
                  <div className="absolute inset-0 bg-black/40" />
                  
                  <div className="relative z-10 text-center p-8 max-w-2xl text-white">
                    <span className="block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: resolvedTheme.accent }}>
                      {storeData.name} Store
                    </span>
                    <h1 style={{ fontFamily: resolvedTheme.fontHeadline, fontSize: '3rem', lineHeight: 1.1, marginBottom: '1rem' }}>
                      {resolvedTheme.heroHeadline}
                    </h1>
                    <p className="text-sm md:text-base mb-8 max-w-xl mx-auto" style={{ opacity: 0.9 }}>
                      {resolvedTheme.heroSubtitle}
                    </p>
                    <button className="px-6 py-3 font-semibold text-sm transition-opacity hover:opacity-90 rounded" style={{ backgroundColor: resolvedTheme.accent, color: '#fff' }}>
                      {resolvedTheme.heroCta}
                    </button>
                  </div>
                </div>

                <div className="p-8" style={{ backgroundColor: resolvedTheme.surface }}>
                  <h3 className="text-xl mb-6" style={{ fontFamily: resolvedTheme.fontHeadline }}>Featured Products</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                      <div key={i} className="group">
                        <div className="aspect-[4/5] bg-gray-100 mb-4 rounded-md overflow-hidden">
                           <div className="w-full h-full bg-gray-200" style={{ backgroundColor: resolvedTheme.border, opacity: 0.5 }}></div>
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Product Sample {i}</h4>
                            <p className="text-xs" style={{ opacity: 0.7 }}>Category</p>
                          </div>
                          <span className="text-sm font-medium" style={{ color: resolvedTheme.accent }}>$99</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
