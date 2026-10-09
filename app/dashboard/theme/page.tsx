'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, LayoutTemplate, Palette, Type, Image as ImageIcon, Sparkles, ArrowLeft, Save, Check } from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { useAuth } from '@/lib/use-auth'
import { useRouter } from 'next/navigation'
import { THEME_PRESETS, StoreThemePreset, ThemeConfig } from '@/lib/store-data'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'

export default function ThemeCustomizerPage() {
  const { activeStore, actions, isClient } = useStorecraft()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [draft, setDraft] = useState<ThemeConfig | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'preset' | 'colors' | 'typography' | 'hero'>('preset')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/theme')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (activeStore && !draft) {
      setDraft({ ...activeStore.theme })
    }
  }, [activeStore, draft])

  if (!isClient || authLoading || !draft || !activeStore) return null

  const handleSave = () => {
    setIsSaving(true)
    actions.updateTheme(draft)
    setTimeout(() => setIsSaving(false), 600)
  }

  const applyPreset = (presetId: StoreThemePreset) => {
    setDraft({ ...THEME_PRESETS[presetId] })
  }

  const tabs = [
    { id: 'preset', label: 'Starting Preset', icon: LayoutTemplate, eyebrow: 'Foundation', title: 'Make it unmistakably yours.', desc: 'Choose a point of view, then tune every detail with a live preview that keeps up.' },
    { id: 'colors', label: 'Colors', icon: Palette, eyebrow: 'Color Palette', title: 'Paint your digital space.', desc: 'Select the exact primary and accent colors that represent your brand.' },
    { id: 'typography', label: 'Typography', icon: Type, eyebrow: 'Typography', title: 'Speak in your own voice.', desc: 'Choose editorial, modern, or classic fonts that fit your story.' },
    { id: 'hero', label: 'Hero Section', icon: ImageIcon, eyebrow: 'Hero Section', title: 'A striking first impression.', desc: 'Set the announcement bar, hero headline, and banner imagery.' },
  ] as const

  const currentTabInfo = tabs.find(t => t.id === activeTab)!

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
        <button className="button button-green" onClick={handleSave} disabled={isSaving} style={{ padding: '8px 16px', fontSize: '11px' }}>
          {isSaving ? 'Publishing...' : 'Publish to Live Store'} <Check size={13} />
        </button>
      </div>

      <section className="workspace-section" style={{ minHeight: 'calc(100vh - 180px)', borderRadius: '6px' }}>
        <div className="workspace-head">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow">Theme Customizer</p>
            <h2>Run your store with <em>style.</em></h2>
          </motion.div>
          <div className="workspace-tabs">
            {tabs.map((item) => (
              <button 
                key={item.id} 
                className={activeTab === item.id ? 'active' : ''} 
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="builder-panel">
          <div className="builder-progress">
            <span className="progress-line">
              <i style={{ width: `${(tabs.findIndex(t => t.id === activeTab) + 1) * 25}%` }} />
            </span>
            <small>Step {tabs.findIndex(t => t.id === activeTab) + 1} of 4</small>
          </div>

          <div className="builder-content">
            
            {/* Left Controls */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="eyebrow">{currentTabInfo.eyebrow}</p>
                  <h3>{currentTabInfo.title}</h3>
                  <p>{currentTabInfo.desc}</p>

                  <div className="builder-fields">
                    {activeTab === 'preset' && (
                      <div className="theme-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '10px' }}>
                        {(Object.keys(THEME_PRESETS) as StoreThemePreset[]).map((presetId) => {
                          const theme = THEME_PRESETS[presetId]
                          const isActive = draft.preset === presetId
                          return (
                            <button 
                              key={presetId}
                              className={`theme-card ${isActive ? 'selected' : ''}`} 
                              onClick={() => applyPreset(presetId)} 
                              style={{ 
                                '--theme-bg': theme.primaryColor, 
                                '--theme-ink': theme.preset === 'circuit' ? '#000' : '#fff',
                                '--theme-accent': theme.accentColor, 
                                '--theme-image': `url(${theme.heroImage})` 
                              } as React.CSSProperties}
                            >
                              <div className="theme-image" style={{ backgroundImage: `url(${theme.heroImage})`, height: '140px' }}>
                                <div className="theme-window" style={{ background: theme.primaryColor, color: theme.preset === 'circuit' ? '#fff' : '#000' }}>
                                  <span style={{ textTransform: 'capitalize' }}>{presetId}</span>
                                  <div className="theme-nav"><i /><i /><i /></div>
                                  <div className="theme-product" style={{ backgroundImage: `linear-gradient(180deg, transparent 45%, rgba(0,0,0,.38)), url(${theme.heroImage})` }}></div>
                                </div>
                              </div>
                              <div className="theme-meta" style={{ padding: '10px' }}>
                                <div>
                                  <strong style={{ textTransform: 'capitalize' }}>{presetId}</strong>
                                  <span>{theme.fontHeading}</span>
                                </div>
                                {isActive ? <span className="check"><Check /></span> : <ArrowRight style={{ width: '14px', color: 'var(--slate)' }} />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {activeTab === 'colors' && (
                      <>
                        <label>
                          Primary Brand Color
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="color" value={draft.primaryColor} onChange={e => setDraft({...draft, primaryColor: e.target.value})} style={{ padding: '0', width: '40px', height: '40px', cursor: 'pointer' }} />
                            <input type="text" value={draft.primaryColor} onChange={e => setDraft({...draft, primaryColor: e.target.value})} style={{ flex: 1 }} />
                          </div>
                        </label>
                        <label>
                          Accent Color (Buttons, Highlights)
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="color" value={draft.accentColor} onChange={e => setDraft({...draft, accentColor: e.target.value})} style={{ padding: '0', width: '40px', height: '40px', cursor: 'pointer' }} />
                            <input type="text" value={draft.accentColor} onChange={e => setDraft({...draft, accentColor: e.target.value})} style={{ flex: 1 }} />
                          </div>
                        </label>
                      </>
                    )}

                    {activeTab === 'typography' && (
                      <>
                        <label>
                          Heading Font
                          <select value={draft.fontHeading} onChange={e => setDraft({...draft, fontHeading: e.target.value})}>
                            <option value="DM Serif Display">DM Serif Display (Editorial)</option>
                            <option value="Manrope">Manrope (Clean & Modern)</option>
                            <option value="Georgia">Georgia (Classic)</option>
                          </select>
                        </label>
                        <label>
                          Body Font
                          <select value={draft.fontBody} onChange={e => setDraft({...draft, fontBody: e.target.value})}>
                            <option value="Manrope">Manrope</option>
                            <option value="Inter">Inter</option>
                            <option value="Arial">Arial</option>
                          </select>
                        </label>
                      </>
                    )}

                    {activeTab === 'hero' && (
                      <>
                        <label>
                          Announcement Bar
                          <input type="text" value={draft.announcement} onChange={e => setDraft({...draft, announcement: e.target.value})} />
                        </label>
                        <label>
                          Headline
                          <input type="text" value={draft.heroTitle} onChange={e => setDraft({...draft, heroTitle: e.target.value})} />
                        </label>
                        <label>
                          Sub-headline
                          <input type="text" value={draft.heroSubtitle} onChange={e => setDraft({...draft, heroSubtitle: e.target.value})} />
                        </label>
                        <label>
                          Button Text
                          <input type="text" value={draft.heroCta} onChange={e => setDraft({...draft, heroCta: e.target.value})} />
                        </label>
                        <label>
                          Hero Image URL
                          <input type="url" value={draft.heroImage} onChange={e => setDraft({...draft, heroImage: e.target.value})} />
                        </label>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Live Preview */}
            <div className="builder-preview">
              <div className="builder-preview-top">
                <span>Live preview</span>
                <span className="live-dot" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  Live
                </span>
              </div>
              
              <div className="storefront-preview" style={{ 
                height: '380px',
                background: `linear-gradient(180deg, ${draft.preset === 'circuit' ? 'rgba(10,15,20,0.8)' : 'rgba(16,24,40,0.1)'}, ${draft.preset === 'circuit' ? 'rgba(10,15,20,0.95)' : 'rgba(16,24,40,0.7)'}), url('${draft.heroImage}') center/cover`,
                color: draft.preset === 'circuit' ? '#fff' : '#fff',
                fontFamily: draft.fontBody,
                transition: 'all 0.5s ease',
                position: 'relative'
              }}>
                {draft.announcement && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: draft.accentColor, color: draft.preset === 'circuit' ? '#000' : '#fff', padding: '6px', textAlign: 'center', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {draft.announcement}
                  </div>
                )}
                
                <small style={{ 
                  color: draft.accentColor, 
                  fontFamily: 'inherit',
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  fontWeight: 800 
                }}>
                  {activeStore.name}
                </small>
                
                <h4 style={{ 
                  fontFamily: draft.fontHeading, 
                  fontSize: '36px',
                  letterSpacing: '-0.04em',
                  margin: '10px 0 6px',
                  lineHeight: 1
                }}>
                  {draft.heroTitle}
                </h4>
                
                <p style={{
                  fontSize: '11px',
                  maxWidth: '80%',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                  opacity: 0.9
                }}>
                  {draft.heroSubtitle}
                </p>
                
                <button style={{ 
                  alignSelf: 'start',
                  background: draft.accentColor, 
                  color: draft.preset === 'circuit' ? '#000' : '#fff',
                  padding: '10px 16px',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '3px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {draft.heroCta} <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
