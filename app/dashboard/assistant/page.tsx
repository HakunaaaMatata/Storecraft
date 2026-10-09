'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { CopilotChat } from '@/components/dashboard/copilot-chat'

export default function AssistantDashboardPage() {
  const { activeStore, analytics, isClient } = useStorecraft()

  if (!isClient || !activeStore) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--slate)' }}>
        Loading StoreCraft Business Copilot...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Bar for Assistant */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={13} />
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>
              Grounded AI Business Assistant
            </h3>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--slate)' }}>
            Ask questions directly against your real inventory, order history, and store analytics.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#065F46',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
          Live Storefront Grounding Active
        </div>
      </div>

      {/* Main Copilot Chat Component */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '6px',
        border: '1px solid var(--line)',
        padding: '20px'
      }}>
        <CopilotChat />
      </div>

    </div>
  )
}
