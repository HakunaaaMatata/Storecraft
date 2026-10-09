'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Sparkles, 
  Send, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  BarChart2, 
  Bot, 
  User, 
  RefreshCw, 
  Database, 
  PlusCircle, 
  CheckCircle2,
  Package,
  Layers,
  PieChart,
  XCircle,
  ShieldCheck,
  HelpCircle
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { AssistantQueryResult } from '@/lib/server-assistant'
import { EvidenceCard } from './evidence-card'

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: string
  text?: string
  response?: AssistantQueryResult
  error?: string
}

interface CopilotChatProps {
  embedded?: boolean
}

export function CopilotChat({ embedded = false }: CopilotChatProps) {
  const { activeStore, products, actions, isClient } = useStorecraft()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [providerBadge, setProviderBadge] = useState<{ name: string; isConfigured: boolean; note: string } | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial executive briefing on store load
  useEffect(() => {
    if (activeStore && messages.length === 0) {
      fetchExecutiveBriefing()
    }
  }, [activeStore])

  // Scroll chat window to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const fetchExecutiveBriefing = async () => {
    if (!activeStore) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Executive overview briefing for my store', storeId: activeStore.id })
      })
      const data = await res.json()
      if (res.ok && data.success && data.response) {
        setProviderBadge(data.response.providerStatus)
        setMessages([
          {
            id: 'welcome-msg',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            response: data.response
          }
        ])
      }
    } catch (e) {
      console.warn('Initial briefing fetch notice:', e)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient || !activeStore) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '13px', fontWeight: 600 }}>
        Connecting to StoreCraft Controlled Analytics Engine...
      </div>
    )
  }

  const promptChips = [
    {
      id: 'top_selling',
      label: 'Top-selling products',
      desc: 'Top merchandise by volume & revenue this month',
      icon: TrendingUp,
      color: '#0284C7',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      query: 'What were my top-selling products this month?'
    },
    {
      id: 'low_stock',
      label: 'Low stock items',
      desc: 'Products at or below safety threshold (≤ 5 units)',
      icon: AlertTriangle,
      color: '#EA580C',
      bg: '#FFF7ED',
      border: '#FDBA74',
      query: 'Which products are low on stock?'
    },
    {
      id: 'revenue_compare',
      label: 'Compare revenue WoW',
      desc: 'Revenue this week vs last week baseline',
      icon: DollarSign,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      query: 'Compare revenue this week with last week.'
    },
    {
      id: 'pending_shipments',
      label: 'Orders to be shipped',
      desc: 'Orders awaiting warehouse packing or dispatch',
      icon: Truck,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      query: 'How many orders are waiting to be shipped?'
    },
    {
      id: 'top_category',
      label: 'Top revenue category',
      desc: 'Sales and market share breakdown by category',
      icon: PieChart,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      query: 'Which category generated the most revenue?'
    },
    {
      id: 'cancelled_orders',
      label: 'Recent cancelled orders',
      desc: 'Lost revenue and order cancellation notes',
      icon: XCircle,
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      query: 'Show my recent cancelled orders.'
    }
  ]

  const sendQueryToServer = async (userText: string, chipId?: string) => {
    if (chipId) setActiveChip(chipId)
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: userText
    }

    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, storeId: activeStore.id })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `assist-err-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            error: data.error || 'Failed to query analytics engine. Please try again.'
          }
        ])
        return
      }

      if (data.response?.providerStatus) {
        setProviderBadge(data.response.providerStatus)
      }

      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        response: data.response
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `assist-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          error: 'Network connection error. Check server connectivity.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    const text = inputValue.trim()
    setInputValue('')
    setActiveChip(null)
    sendQueryToServer(text)
  }

  // Demo order injector to verify live data updates in analytics
  const handleInjectDemoOrder = () => {
    const randomProduct = products[0] || { id: 'prod-forma-lamp', name: 'Forma Desk Lamp', price: 148 }
    actions.createOrder({
      storeId: activeStore.id,
      customer: {
        name: 'Elena Rostova',
        email: 'elena.r@example.com',
        phone: '+1 (555) 321-9876',
        address: '500 Tech Plaza, Seattle, WA',
      },
      items: [
        {
          productId: randomProduct.id,
          name: randomProduct.name,
          price: randomProduct.price,
          quantity: 1,
        },
      ],
      subtotal: randomProduct.price,
      tax: Math.round(randomProduct.price * 0.08 * 100) / 100,
      shipping: 12,
      total: Math.round((randomProduct.price + randomProduct.price * 0.08 + 12) * 100) / 100,
      status: 'Placed',
      paymentStatus: 'Paid (Demo)',
    })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: embedded ? '600px' : 'calc(100vh - 140px)',
      minHeight: '520px',
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 20px -2px rgba(16, 24, 40, 0.08)',
      overflow: 'hidden',
    }}>
      {/* Copilot Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#101828',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1E293B',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#10B981',
            color: '#101828',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                StoreCraft Business Assistant
              </h2>
              <span style={{
                backgroundColor: providerBadge?.isConfigured ? '#064E3B' : '#1E293B',
                color: providerBadge?.isConfigured ? '#6EE7B7' : '#94A3B8',
                border: `1px solid ${providerBadge?.isConfigured ? '#047857' : '#334155'}`,
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: providerBadge?.isConfigured ? '#10B981' : '#94A3B8' }} />
                {providerBadge ? providerBadge.providerName : 'Controlled Analytics Engine'}
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#94A3B8' }}>
              Scoped to store: <strong>{activeStore.name}</strong> • Tenant Isolated Read-Only Engine
            </p>
          </div>
        </div>

        {/* Action Button for Live Injection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleInjectDemoOrder}
            title="Inject an order into live database to test real-time analytics"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1E293B',
              color: '#E2E8F0',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={13} color="#10B981" /> Simulate Order
          </button>
        </div>
      </div>

      {/* Provider Status Info Banner */}
      {providerBadge && !providerBadge.isConfigured && (
        <div style={{
          backgroundColor: '#FFFBEB',
          borderBottom: '1px solid #FDE68A',
          color: '#92400E',
          padding: '8px 16px',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={14} color="#D97706" />
            <span>{providerBadge.note}</span>
          </div>
          <span style={{ fontWeight: 700, color: '#B45309', fontSize: '10px' }}>100% Grounded Local Mode</span>
        </div>
      )}

      {/* Chat Conversation Scroll View */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#F8FAFC',
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Sender Label */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748B',
              marginBottom: '6px',
            }}>
              {msg.sender === 'user' ? (
                <>
                  <span>Store Owner</span>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#101828', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={12} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={12} />
                  </div>
                  <span>StoreCraft AI Assistant</span>
                </>
              )}
            </div>

            {/* Message Body */}
            {msg.sender === 'user' ? (
              <div style={{
                backgroundColor: '#101828',
                color: '#FFFFFF',
                padding: '12px 16px',
                borderRadius: '12px 12px 2px 12px',
                maxWidth: '80%',
                fontSize: '13px',
                lineHeight: 1.5,
              }}>
                {msg.text}
              </div>
            ) : msg.error ? (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                padding: '14px 18px',
                borderRadius: '8px',
                maxWidth: '90%',
                fontSize: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <AlertTriangle size={16} />
                  <strong>Query Error</strong>
                </div>
                <p style={{ margin: 0 }}>{msg.error}</p>
              </div>
            ) : msg.response ? (
              <div style={{
                backgroundColor: msg.response.isSecurityBlock ? '#FFF5F5' : '#FFFFFF',
                border: `1px solid ${msg.response.isSecurityBlock ? '#FECACA' : '#E2E8F0'}`,
                borderRadius: '8px',
                padding: '20px',
                maxWidth: '94%',
                width: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                {/* Response Headline */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: msg.response.isSecurityBlock ? '#DC2626' : '#0F172A', letterSpacing: '-0.02em' }}>
                    {msg.response.headline}
                  </h3>
                  <span style={{ fontSize: '10px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, flexShrink: 0 }}>
                    {msg.response.periodUsed}
                  </span>
                </div>

                {/* Summary */}
                <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  {msg.response.summary}
                </p>

                {/* Calculation Basis / Revenue Definition Note */}
                {msg.response.calculationBasis && (
                  <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '4px', borderLeft: '3px solid #10B981', fontSize: '11px', color: '#475569', marginBottom: '14px' }}>
                    <strong>Calculation Basis & Definition:</strong> {msg.response.calculationBasis}
                  </div>
                )}

                {/* Bullet Insights */}
                {msg.response.insights && msg.response.insights.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    {msg.response.insights.map((insight, idx) => (
                      <div key={idx} style={{ fontSize: '12px', color: '#1E293B', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Evidence Card */}
                {msg.response.evidence && (
                  <EvidenceCard evidence={msg.response.evidence} />
                )}
              </div>
            ) : null}
          </div>
        ))}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
              <Bot size={12} />
              <span>Analyzing Storecraft Controlled Analytics...</span>
            </div>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '16px 20px',
              width: '280px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid #10B981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Executing read-only query...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Query Chips */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Suggested Analytics Questions (Task 11):
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}>
          {promptChips.map((chip) => {
            const Icon = chip.icon
            const isActive = activeChip === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => sendQueryToServer(chip.query, chip.id)}
                disabled={isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: isActive ? chip.color : chip.bg,
                  color: isActive ? '#FFFFFF' : chip.color,
                  border: `1px solid ${chip.border}`,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <Icon size={12} />
                <span>{chip.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Text Input Box */}
      <form
        onSubmit={handleCustomSubmit}
        style={{
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask a question about ${activeStore.name}'s revenue, inventory, or orders...`}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            fontSize: '12px',
            outline: 'none',
            color: '#0F172A',
            backgroundColor: '#FFFFFF',
          }}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="button button-green"
          style={{
            padding: '10px 18px',
            fontSize: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            opacity: !inputValue.trim() || isLoading ? 0.5 : 1,
          }}
        >
          <span>Ask Copilot</span>
          <Send size={12} />
        </button>
      </form>
      
      {/* CSS Spinner Keyframes */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
