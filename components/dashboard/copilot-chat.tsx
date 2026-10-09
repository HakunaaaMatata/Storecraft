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
  Layers
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { 
  processUserQuery, 
  queryRestockAlerts, 
  queryBestSellers, 
  queryNetRevenue, 
  queryFulfillmentStatus, 
  queryExecutiveBriefing,
  AssistantResponse 
} from '@/lib/ai-assistant'
import { EvidenceCard } from './evidence-card'

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: string
  text?: string
  response?: AssistantResponse
}

interface CopilotChatProps {
  embedded?: boolean
}

export function CopilotChat({ embedded = false }: CopilotChatProps) {
  const { activeStore, products, orders, actions, isClient } = useStorecraft()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize with initial assistant briefing
  useEffect(() => {
    if (activeStore && messages.length === 0) {
      const initialBriefing = queryExecutiveBriefing(activeStore.id)
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          response: initialBriefing,
        },
      ])
    }
  }, [activeStore, messages.length])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (!isClient || !activeStore) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
        Connecting to store database...
      </div>
    )
  }

  const promptChips = [
    {
      id: 'restock',
      label: 'Restock Alerts',
      desc: 'Products with stock ≤ 5',
      icon: AlertTriangle,
      color: '#EA580C',
      bg: '#FFF7ED',
      border: '#FDBA74',
      action: () => runQuery('restock', 'Which products are low in stock and need restocking?'),
    },
    {
      id: 'bestsellers',
      label: 'Best Sellers',
      desc: 'Volume & revenue from completed orders',
      icon: TrendingUp,
      color: '#0284C7',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      action: () => runQuery('bestsellers', 'What are our best selling products by volume and revenue?'),
    },
    {
      id: 'revenue',
      label: 'Net Revenue',
      desc: 'Sum confirmed order totals',
      icon: DollarSign,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      action: () => runQuery('revenue', 'What is our net revenue from confirmed orders?'),
    },
    {
      id: 'fulfillment',
      label: 'Fulfillment Status',
      desc: 'Orders awaiting packing or shipping',
      icon: Truck,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      action: () => runQuery('fulfillment', 'Which orders are awaiting packing or shipping?'),
    },
    {
      id: 'briefing',
      label: 'Full Executive Summary',
      desc: 'Complete business & health audit',
      icon: BarChart2,
      color: '#0F172A',
      bg: '#F8FAFC',
      border: '#CBD5E1',
      action: () => runQuery('briefing', 'Give me an executive overview of store performance.'),
    },
  ]

  const runQuery = (chipId: string, userText: string) => {
    setActiveChip(chipId)
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: userText,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      let resp: AssistantResponse
      if (chipId === 'restock') resp = queryRestockAlerts(activeStore.id)
      else if (chipId === 'bestsellers') resp = queryBestSellers(activeStore.id)
      else if (chipId === 'revenue') resp = queryNetRevenue(activeStore.id)
      else if (chipId === 'fulfillment') resp = queryFulfillmentStatus(activeStore.id)
      else if (chipId === 'briefing') resp = queryExecutiveBriefing(activeStore.id)
      else resp = processUserQuery(activeStore.id, userText)

      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        response: resp,
      }

      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, 450)
  }

  const handleSendCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim()) return

    const text = inputValue.trim()
    setInputValue('')
    setActiveChip(null)

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      const resp = processUserQuery(activeStore.id, text)
      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        response: resp,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, 500)
  }

  // Live Test Simulation Action: create a demo order to verify real-time grounding
  const handleSimulateNewOrder = () => {
    const randomProduct = products[0] || {
      id: 'prod-forma-lamp',
      name: 'Forma Desk Lamp',
      price: 148,
    }

    actions.createOrder({
      storeId: activeStore.id,
      customer: {
        name: 'Sarah Connor',
        email: 'sarah.c@techcorp.io',
        phone: '+1 (555) 910-3849',
        address: '100 Cyberdyne Way, Los Angeles, CA',
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
      shipping: 10,
      total: Math.round((randomProduct.price + randomProduct.price * 0.08 + 10) * 100) / 100,
      status: 'Placed',
      paymentStatus: 'Paid (Demo)',
    })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: embedded ? '600px' : 'calc(100vh - 120px)',
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
                StoreCraft Business Copilot
              </h2>
              <span style={{
                backgroundColor: '#064E3B',
                color: '#6EE7B7',
                border: '1px solid #047857',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                Grounded RAG Live
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#94A3B8' }}>
              Connected to database for <strong>{activeStore.name}</strong> • Zero hallucination
            </p>
          </div>
        </div>

        {/* Live Simulation & Reset Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleSimulateNewOrder}
            title="Inject an order into live DB to test live data updates"
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
            <PlusCircle size={13} color="#10B981" />
            <span>+ Test Order (Live DB)</span>
          </button>
          
          <button
            onClick={() => {
              actions.resetDemo()
              setMessages([])
            }}
            title="Reset DB state"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#1E293B',
              color: '#94A3B8',
              border: '1px solid #334155',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Suggestion Prompt Chips Ribbon */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', marginRight: '4px' }}>
          Prompt Chips:
        </span>
        {promptChips.map((chip) => {
          const Icon = chip.icon
          const isSelected = activeChip === chip.id
          return (
            <button
              key={chip.id}
              onClick={chip.action}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: isSelected ? chip.color : chip.bg,
                color: isSelected ? '#FFFFFF' : chip.color,
                border: `1px solid ${isSelected ? chip.color : chip.border}`,
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Icon size={13} />
              <span>{chip.label}</span>
            </button>
          )
        })}
      </div>

      {/* Chat Messages Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: '75%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <div style={{
                  backgroundColor: '#101828',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  borderRadius: '12px 12px 2px 12px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 8px rgba(16, 24, 40, 0.1)',
                }}>
                  {msg.text}
                </div>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#E2E8F0',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <User size={15} />
                </div>
              </div>
            )
          }

          // Assistant message with Grounded Evidence Card
          const resp = msg.response!
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: 'flex-start',
                width: '100%',
                maxWidth: '920px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                color: '#101828',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '4px',
              }}>
                <Bot size={18} />
              </div>

              <div style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '18px 20px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              }}>
                {/* Assistant Answer Headline & Summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#059669',
                  }}>
                    Grounded Answer
                  </span>
                  <span style={{ color: '#CBD5E1' }}>•</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                }}>
                  {resp.headline}
                </h3>

                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: '1.6',
                }}>
                  {resp.summary}
                </p>

                {/* Key Insights Bullet Cards */}
                {resp.insights.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '16px',
                  }}>
                    {resp.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          color: '#1E293B',
                          fontWeight: 500,
                        }}
                      >
                        {insight}
                      </div>
                    ))}
                  </div>
                )}

                {/* Evidence Card beneath answer */}
                <EvidenceCard evidence={resp.evidence} />
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748B',
            fontSize: '12px',
            paddingLeft: '44px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              animation: 'pulse 1s infinite',
            }} />
            <span>Scanning live database & compiling evidence table...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={handleSendCustom}
        style={{
          padding: '14px 20px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#F8FAFC',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
          padding: '8px 14px',
        }}>
          <Database size={16} color="#64748B" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about inventory, orders, revenue, or fulfillment..."
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#0F172A',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim()}
          style={{
            backgroundColor: inputValue.trim() ? '#10B981' : '#E2E8F0',
            color: inputValue.trim() ? '#101828' : '#94A3B8',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 18px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: inputValue.trim() ? 'pointer' : 'default',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Ask</span>
          <Send size={13} />
        </button>
      </form>
    </div>
  )
}
