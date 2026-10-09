'use client'

import { useState, useEffect } from 'react'
import { LayoutTemplate, Palette, Type, Image as ImageIcon, Save, ArrowLeft, Eye, ShoppingBag } from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { THEME_PRESETS, StoreThemePreset, ThemeConfig } from '@/lib/store-data'
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

  const navItems = [
    { id: 'preset', label: 'Starting Preset', icon: LayoutTemplate },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'hero', label: 'Hero Section', icon: ImageIcon },
  ] as const

  return (
    <div className="dashboard-section" style={{ padding: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header className="site-header" style={{ position: 'relative', height: '65px' }}>
        <div className="brand">
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate)' }}>
            <ArrowLeft size={16} /> <span style={{ fontSize: '13px' }}>Back to Dashboard</span>
          </Link>
        </div>
        <div className="header-actions">
          <button className="button button-green" onClick={handleSave} disabled={isSaving}>
            <Save size={15} /> {isSaving ? 'Publishing...' : 'Publish to Live Store'}
          </button>
        </div>
      </header>

      <div className="dashboard-shell" style={{ flex: 1, minHeight: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
        
        {/* Editor Sidebar */}
        <aside className="dashboard-nav" style={{ width: '320px', borderRight: '1px solid var(--line)', background: '#fff' }}>
          <div style={{ marginBottom: '30px' }}>
            <strong style={{ fontSize: '16px', color: 'var(--navy)', letterSpacing: '-0.04em' }}>Theme Editor</strong>
            <small style={{ display: 'block', fontSize: '11px', color: 'var(--slate)', marginTop: '4px' }}>
              Customize your storefront branding.
            </small>
          </div>

          <nav style={{ gap: '8px' }}>
            {navItems.map(item => (
              <button 
                key={item.id} 
                className={activeTab === item.id ? 'active' : ''} 
                onClick={() => setActiveTab(item.id)}
                style={{ fontSize: '12px' }}
              >
                <item.icon size={15} /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor Controls & Preview */}
        <main className="dashboard-main" style={{ display: 'flex', padding: 0 }}>
          
          {/* Controls Panel */}
          <div style={{ width: '360px', borderRight: '1px solid var(--line)', background: '#fbfcfc', overflowY: 'auto', padding: '35px' }}>
            
            {activeTab === 'preset' && (
              <div>
                <p className="eyebrow" style={{ marginBottom: '20px' }}>Select a foundation</p>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {(Object.keys(THEME_PRESETS) as StoreThemePreset[]).map(presetId => {
                    const p = THEME_PRESETS[presetId]
                    const isActive = draft.preset === presetId
                    return (
                      <button
                        key={presetId}
                        onClick={() => applyPreset(presetId)}
                        style={{ 
                          textAlign: 'left', background: '#fff', border: `2px solid ${isActive ? 'var(--green)' : 'var(--line)'}`, 
                          borderRadius: '6px', overflow: 'hidden', transition: '0.2s', padding: 0 
                        }}
                      >
                        <div style={{ height: '110px', background: `url(${p.heroImage}) center/cover` }} />
                        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '13px', textTransform: 'capitalize', color: 'var(--navy)' }}>{presetId}</strong>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: p.primaryColor, border: '1px solid var(--line)' }} />
                            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: p.accentColor, border: '1px solid var(--line)' }} />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div>
                <p className="eyebrow" style={{ marginBottom: '20px' }}>Brand Palette</p>
                <div className="builder-fields">
                  <label>
                    Primary Color (Text, Backgrounds)
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="color" value={draft.primaryColor} onChange={e => setDraft({...draft, primaryColor: e.target.value})} style={{ width: '45px', padding: '2px', cursor: 'pointer' }} />
                      <input type="text" value={draft.primaryColor} onChange={e => setDraft({...draft, primaryColor: e.target.value})} style={{ flex: 1 }} />
                    </div>
                  </label>
                  <label style={{ marginTop: '15px' }}>
                    Accent Color (Buttons, Highlights)
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="color" value={draft.accentColor} onChange={e => setDraft({...draft, accentColor: e.target.value})} style={{ width: '45px', padding: '2px', cursor: 'pointer' }} />
                      <input type="text" value={draft.accentColor} onChange={e => setDraft({...draft, accentColor: e.target.value})} style={{ flex: 1 }} />
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div>
                <p className="eyebrow" style={{ marginBottom: '20px' }}>Typography</p>
                <div className="builder-fields">
                  <label>
                    Heading Font
                    <select value={draft.fontHeading} onChange={e => setDraft({...draft, fontHeading: e.target.value})}>
                      <option value="DM Serif Display">DM Serif Display (Editorial)</option>
                      <option value="Manrope">Manrope (Modern)</option>
                      <option value="Georgia">Georgia (Classic)</option>
                    </select>
                  </label>
                  <label style={{ marginTop: '15px' }}>
                    Body Font
                    <select value={draft.fontBody} onChange={e => setDraft({...draft, fontBody: e.target.value})}>
                      <option value="Manrope">Manrope</option>
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'hero' && (
              <div>
                <p className="eyebrow" style={{ marginBottom: '20px' }}>Hero Section</p>
                <div className="builder-fields">
                  <label>
                    Announcement Bar Text
                    <input type="text" value={draft.announcement} onChange={e => setDraft({...draft, announcement: e.target.value})} />
                  </label>
                  <label style={{ marginTop: '15px' }}>
                    Headline
                    <textarea rows={2} value={draft.heroTitle} onChange={e => setDraft({...draft, heroTitle: e.target.value})} style={{ border: '1px solid var(--line)', borderRadius: '4px', padding: '11px', background: '#fff', color: 'var(--navy)', font: 'inherit', fontSize: '12px', resize: 'none' }} />
                  </label>
                  <label style={{ marginTop: '15px' }}>
                    Sub-headline
                    <textarea rows={3} value={draft.heroSubtitle} onChange={e => setDraft({...draft, heroSubtitle: e.target.value})} style={{ border: '1px solid var(--line)', borderRadius: '4px', padding: '11px', background: '#fff', color: 'var(--navy)', font: 'inherit', fontSize: '12px', resize: 'none' }} />
                  </label>
                  <label style={{ marginTop: '15px' }}>
                    Button Text
                    <input type="text" value={draft.heroCta} onChange={e => setDraft({...draft, heroCta: e.target.value})} />
                  </label>
                  <label style={{ marginTop: '15px' }}>
                    Hero Background Image URL
                    <input type="url" value={draft.heroImage} onChange={e => setDraft({...draft, heroImage: e.target.value})} />
                  </label>
                  <div style={{ marginTop: '10px', height: '80px', borderRadius: '4px', background: `url(${draft.heroImage}) center/cover`, border: '1px solid var(--line)' }} />
                </div>
              </div>
            )}

          </div>

          {/* Live Preview Pane */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef3f1', padding: '40px', overflowY: 'auto' }}>
            
            {/* Simulated Browser Frame */}
            <div className="device-content" style={{ padding: 0, width: '100%', maxWidth: '900px', height: '100%', maxHeight: '800px', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(16,24,40,.18)', border: '1px solid var(--line)', borderRadius: '8px' }}>
              
              {/* Fake Browser Top Bar */}
              <div style={{ height: '38px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '16px', background: '#f8fafb' }}>
                <div className="window-dots"><i /><i /><i /></div>
                <span style={{ fontSize: '10px', color: '#98a2b3', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={12} /> {activeStore.slug}.storecraft.com
                </span>
              </div>

              {/* LIVE STOREFRONT */}
              <div style={{ flex: 1, overflowY: 'auto', background: draft.preset === 'circuit' ? '#0A0F14' : '#fff', color: draft.primaryColor, fontFamily: draft.fontBody }}>
                
                {draft.announcement && (
                  <div style={{ background: draft.accentColor, color: draft.preset === 'circuit' ? '#000' : '#fff', padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {draft.announcement}
                  </div>
                )}

                <header className="storefront-nav" style={{ background: 'transparent', borderBottom: `1px solid ${draft.preset === 'circuit' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, color: draft.primaryColor }}>
                  <strong style={{ fontFamily: draft.fontHeading, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                    {activeStore.name}
                  </strong>
                  <div style={{ display: 'flex', gap: '24px', fontWeight: 600 }}>
                    <span>Shop</span>
                    <span>Collections</span>
                    <span>About</span>
                  </div>
                  <ShoppingBag size={18} />
                </header>

                <div className="storefront-hero" style={{ 
                    minHeight: '450px', 
                    background: `linear-gradient(90deg, ${draft.preset === 'circuit' ? 'rgba(10,15,20,0.9)' : 'rgba(0,0,0,0.6)'}, rgba(0,0,0,0.2)), url('${draft.heroImage}') center/cover`,
                    display: 'flex', flexDirection: 'column', alignItems: draft.preset === 'forma' ? 'center' : 'flex-start',
                    textAlign: draft.preset === 'forma' ? 'center' : 'left',
                    color: '#fff', padding: '60px 8%'
                  }}>
                  <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '20px', color: draft.accentColor }}>
                    Autumn Collection
                  </p>
                  <h3 style={{ fontFamily: draft.fontHeading, fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.04em', margin: '0 0 20px', maxWidth: '800px' }}>
                    {draft.heroTitle}
                  </h3>
                  <p style={{ fontSize: '16px', lineHeight: 1.6, maxWidth: '500px', marginBottom: '35px', opacity: 0.9 }}>
                    {draft.heroSubtitle}
                  </p>
                  <button className="button" style={{ background: draft.accentColor, color: draft.preset === 'circuit' ? '#000' : '#fff', border: 'none', borderRadius: '4px' }}>
                    {draft.heroCta} <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>

                <div className="storefront-products" style={{ padding: '60px 8%' }}>
                  <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h3 style={{ fontFamily: draft.fontHeading, fontSize: '32px', margin: 0 }}>Featured Catalog</h3>
                  </div>
                  
                  <div className="storefront-product-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                    {[1, 2, 3].map(i => (
                      <div className="storefront-product" key={i} style={{ background: 'transparent' }}>
                        <div className="storefront-product-image" style={{ height: '240px', background: `linear-gradient(135deg, ${draft.preset === 'circuit' ? '#172028' : '#e8e8e6'}, ${draft.preset === 'circuit' ? '#0A0F14' : '#d0d0ce'})` }} />
                        <strong style={{ fontSize: '13px', color: draft.primaryColor }}>Product Sample {i}</strong>
                        <span style={{ color: 'var(--slate)', marginTop: '4px' }}>${i * 45}.00</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
