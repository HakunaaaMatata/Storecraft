'use client'

import React, { useState } from 'react'
import { CheckCircle2, ArrowLeft, Palette, Sparkles, Store, ShoppingBag, Layout } from 'lucide-react'
import { GeneratedStorePlan } from '@/lib/ai-generator'
import { THEME_PRESETS } from '@/lib/theme-presets'
import { ThemePresetId } from '@/lib/types'

interface PlanPreviewModalProps {
  plan: GeneratedStorePlan
  onConfirm: (plan: GeneratedStorePlan) => void
  onCancel: () => void
}

export function PlanPreviewModal({ plan, onConfirm, onCancel }: PlanPreviewModalProps) {
  const [editedPlan, setEditedPlan] = useState<GeneratedStorePlan>(plan)

  const themeConfig = THEME_PRESETS[editedPlan.recommendedTheme]

  const handleConfirm = () => {
    onConfirm(editedPlan)
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 20px -2px rgba(16, 24, 40, 0.05)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '24px 36px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button 
            type="button"
            onClick={onCancel}
            style={{ 
              background: 'none', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', marginBottom: '8px', padding: 0 
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h2 style={{ fontSize: '20px', margin: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#10B981" /> Generated Store Plan
          </h2>
        </div>
        <button 
          onClick={handleConfirm}
          style={{ 
            padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#10B981', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' 
          }}
        >
          Accept & Continue
        </button>
      </div>

      {editedPlan.meta.provider !== 'gemini' && (
        <div style={{ backgroundColor: '#FFFBEB', color: '#B45309', padding: '12px 36px', fontSize: '13px', fontWeight: 500, borderBottom: '1px solid #FEF3C7', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layout size={16} /> 
          AI API key is unconfigured. Generated using StoreCraft deterministic standard template.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1px', backgroundColor: '#E2E8F0' }}>
        {/* Main Content Area - Preview */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '36px' }}>
          <div style={{ marginBottom: '32px' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontSize: '15px', marginBottom: '16px' }}>
              <Store size={18} /> Store Identity
            </strong>
            <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <h1 style={{ fontSize: '24px', margin: '0 0 8px' }}>{editedPlan.storeName}</h1>
              <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 12px' }}>{editedPlan.description}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#E2E8F0', borderRadius: '4px', color: '#475569' }}>
                  {editedPlan.businessCategory}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontSize: '15px', marginBottom: '16px' }}>
              <Layout size={18} /> Theme Preview ({editedPlan.recommendedTheme})
            </strong>
            <div style={{
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              backgroundColor: themeConfig.bg,
              color: themeConfig.ink,
            }}>
              <div style={{
                padding: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
              }}>
                <div>
                  <h3 style={{
                    fontSize: '24px',
                    margin: '0 0 10px',
                    fontFamily: themeConfig.fontHeadline,
                    color: themeConfig.ink,
                  }}>
                    {editedPlan.themeSettings.heroHeadline}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: themeConfig.inkMuted,
                    margin: '0 0 16px',
                    maxWidth: '400px',
                    lineHeight: 1.6,
                  }}>
                    {editedPlan.themeSettings.heroSubtitle}
                  </p>
                  <button style={{
                    backgroundColor: editedPlan.themeSettings.accentColor,
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: themeConfig.buttonRadius,
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}>
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontSize: '15px', marginBottom: '16px' }}>
              <ShoppingBag size={18} /> Sample Catalog ({editedPlan.sampleProductBlueprints.length} items)
            </strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {editedPlan.sampleProductBlueprints.map((prod, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: editedPlan.meta.provider === 'gemini' ? '#10B981' : '#64748B', backgroundColor: editedPlan.meta.provider === 'gemini' ? '#ECFDF5' : '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                      {editedPlan.meta.provider === 'gemini' ? 'AI Generated' : 'Template Sample'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>${prod.suggestedPrice}</span>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>{prod.title}</strong>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{prod.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Editing */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 20px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palette size={16} /> Theme Settings
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Recommended Theme</label>
            <select 
              value={editedPlan.recommendedTheme} 
              onChange={e => setEditedPlan({...editedPlan, recommendedTheme: e.target.value as ThemePresetId})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
            >
              <option value="atelier">Atelier</option>
              <option value="market">Market</option>
              <option value="forma">Forma</option>
              <option value="circuit">Circuit</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Primary Accent Color</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={editedPlan.themeSettings.accentColor} 
                onChange={e => setEditedPlan({
                  ...editedPlan, 
                  themeSettings: { ...editedPlan.themeSettings, accentColor: e.target.value }
                })}
                style={{ width: '36px', height: '36px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>{editedPlan.themeSettings.accentColor}</span>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Hero Headline</label>
            <input 
              type="text" 
              value={editedPlan.themeSettings.heroHeadline} 
              onChange={e => setEditedPlan({
                ...editedPlan, 
                themeSettings: { ...editedPlan.themeSettings, heroHeadline: e.target.value }
              })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Hero Subtitle</label>
            <textarea 
              rows={3}
              value={editedPlan.themeSettings.heroSubtitle} 
              onChange={e => setEditedPlan({
                ...editedPlan, 
                themeSettings: { ...editedPlan.themeSettings, heroSubtitle: e.target.value }
              })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', resize: 'vertical' }}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
