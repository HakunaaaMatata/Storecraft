'use client'

import React, { useState } from 'react'
import { Store, MapPin, Truck, Palette, Sparkles, Loader2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import { THEME_PRESETS } from '@/lib/theme-presets'
import { ThemePresetId } from '@/lib/types'
import { GenerateStoreInput, GeneratedStorePlan } from '@/lib/ai-generator'

interface AIGeneratorWizardProps {
  onPlanGenerated: (plan: GeneratedStorePlan) => void
  onCancel: () => void
}

export function AIGeneratorWizard({ onPlanGenerated, onCancel }: AIGeneratorWizardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<GenerateStoreInput>({
    businessName: '',
    businessCategory: '',
    description: '',
    preferredTheme: 'atelier',
    location: {
      isOnlineOnly: true,
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      pickupAvailable: false
    },
    delivery: {
      serviceArea: '',
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/ai/generate-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate store plan')
      }
      
      onPlanGenerated(data.plan)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 20px -2px rgba(16, 24, 40, 0.05)',
      padding: '36px',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <button 
          type="button"
          onClick={onCancel}
          style={{ 
            background: 'none', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', padding: 0 
          }}
        >
          <ArrowLeft size={14} /> Back to options
        </button>
        <span style={{ color: '#059669', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>StoreCraft AI</span>
        <h2 style={{ fontSize: '26px', margin: '4px 0 8px', letterSpacing: '-0.03em' }}>
          Generate your store
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
          Tell us a little about your business, and our AI will build a complete, ready-to-publish storefront for you.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#991B1B',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Business Name *</label>
            <input 
              required
              type="text" 
              value={formData.businessName} 
              onChange={e => setFormData({...formData, businessName: e.target.value})}
              placeholder="e.g. Northstar Goods"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Category *</label>
            <input 
              required
              type="text" 
              value={formData.businessCategory} 
              onChange={e => setFormData({...formData, businessCategory: e.target.value})}
              placeholder="e.g. Handmade Ceramics"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Preferred Theme</label>
            <select 
              value={formData.preferredTheme} 
              onChange={e => setFormData({...formData, preferredTheme: e.target.value as ThemePresetId})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
            >
              <option value="atelier">Atelier (Minimal)</option>
              <option value="market">Market (Bold)</option>
              <option value="forma">Forma (Modern)</option>
              <option value="circuit">Circuit (Tech)</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Business Description (Optional)</label>
            <textarea 
              rows={3}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your brand, what you sell, and your target audience..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #E2E8F0', paddingTop: '20px', marginTop: '8px' }}>
            <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><MapPin size={16} color="#64748B" /> Location & Operation</strong>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '16px' }}>
              <input 
                type="checkbox" 
                checked={formData.location?.isOnlineOnly} 
                onChange={e => setFormData({...formData, location: { ...formData.location, isOnlineOnly: e.target.checked }})}
                style={{ width: '16px', height: '16px', accentColor: '#10B981' }}
              />
              This is an online-only business (No physical store)
            </label>

            {!formData.location?.isOnlineOnly && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Physical Address</label>
                  <input 
                    type="text" 
                    value={formData.location?.address} 
                    onChange={e => setFormData({...formData, location: { ...formData.location, address: e.target.value }})}
                    placeholder="123 Main St"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>City</label>
                  <input 
                    type="text" 
                    value={formData.location?.city} 
                    onChange={e => setFormData({...formData, location: { ...formData.location, city: e.target.value }})}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>State / Region</label>
                  <input 
                    type="text" 
                    value={formData.location?.state} 
                    onChange={e => setFormData({...formData, location: { ...formData.location, state: e.target.value }})}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #E2E8F0', paddingTop: '20px', marginTop: '8px' }}>
            <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Truck size={16} color="#64748B" /> Delivery Preferences</strong>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Service Area</label>
            <input 
              type="text" 
              value={formData.delivery?.serviceArea} 
              onChange={e => setFormData({...formData, delivery: { ...formData.delivery, serviceArea: e.target.value }})}
              placeholder="e.g. Worldwide, US Only, Local Delivery"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', marginBottom: '16px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
            style={{ 
              padding: '10px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: loading ? 'default' : 'pointer' 
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#10B981', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
            }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Store</>}
          </button>
        </div>
      </form>
    </div>
  )
}
