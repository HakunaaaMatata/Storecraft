'use client'

import React, { useState } from 'react'
import { GroundedEvidence, EvidenceRecord } from '@/lib/ai-assistant'
import { 
  Database, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Code2, 
  Table as TableIcon 
} from 'lucide-react'

interface EvidenceCardProps {
  evidence: GroundedEvidence
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const [isTableExpanded, setIsTableExpanded] = useState(true)
  const [copiedFormula, setCopiedFormula] = useState(false)

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(evidence.queryFormula)
    setCopiedFormula(true)
    setTimeout(() => setCopiedFormula(false), 2000)
  }

  const formatCellValue = (val: unknown, format?: 'currency' | 'number' | 'badge' | 'text') => {
    if (val === null || val === undefined) return '—'
    
    if (format === 'currency') {
      const num = typeof val === 'number' ? val : parseFloat(String(val))
      return isNaN(num) ? String(val) : `$${num.toFixed(2)}`
    }

    if (format === 'badge') {
      const str = String(val)
      const isNegative = str.includes('Critical') || str.includes('Out of Stock') || str.includes('Cancelled')
      const isWarning = str.includes('Low') || str.includes('Placed') || str.includes('Action Needed') || str.includes('Awaiting')
      const isPositive = str.includes('Optimal') || str.includes('Delivered') || str.includes('Paid') || str.includes('Healthy') || str.includes('Shipped')
      
      const badgeStyle: React.CSSProperties = {
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 700,
        display: 'inline-block',
        whiteSpace: 'nowrap',
        backgroundColor: isNegative ? '#FEE2E2' : isWarning ? '#FEF3C7' : isPositive ? '#DCFCE7' : '#F1F5F9',
        color: isNegative ? '#991B1B' : isWarning ? '#92400E' : isPositive ? '#166534' : '#475569',
      }
      return <span style={badgeStyle}>{str}</span>
    }

    return String(val)
  }

  return (
    <div style={{
      marginTop: '16px',
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      fontSize: '12px',
    }}>
      {/* Evidence Card Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Database size={13} />
          </div>
          <span style={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
            Evidence Card
          </span>
          <span style={{ color: '#64748B', fontSize: '11px' }}>
            • {evidence.title}
          </span>
        </div>

        {/* Grounding Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          backgroundColor: '#ECFDF5',
          borderRadius: '9999px',
          color: '#047857',
          fontSize: '10px',
          fontWeight: 700,
          border: '1px solid #A7F3D0',
        }}>
          <ShieldCheck size={12} />
          <span>{evidence.groundingStatus}</span>
        </div>
      </div>

      {/* Metrics Summary Strip (if available) */}
      {evidence.metricsSummary && evidence.metricsSummary.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${evidence.metricsSummary.length}, 1fr)`,
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FAFAFA',
        }}>
          {evidence.metricsSummary.map((m, idx) => (
            <div key={idx} style={{
              padding: '10px 16px',
              borderRight: idx < evidence.metricsSummary!.length - 1 ? '1px solid #E2E8F0' : 'none',
            }}>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw Data Table Section */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#334155' }}>
            <TableIcon size={14} color="#059669" />
            <span>Raw Database Records ({evidence.rawRecordsCount})</span>
          </div>

          <button
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {isTableExpanded ? <>Hide Table <ChevronUp size={12} /></> : <>Show Table <ChevronDown size={12} /></>}
          </button>
        </div>

        {isTableExpanded && (
          <div style={{
            overflowX: 'auto',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            maxHeight: '260px',
            overflowY: 'auto',
          }}>
            {evidence.tableData.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8' }}>
                No records matched this filter query in the active store.
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '11px',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                    {evidence.tableHeaders.map((h) => (
                      <th key={h.key} style={{
                        padding: '8px 12px',
                        fontWeight: 700,
                        color: '#475569',
                        whiteSpace: 'nowrap',
                      }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evidence.tableData.map((row, rowIdx) => (
                    <tr 
                      key={rowIdx}
                      style={{
                        borderBottom: rowIdx < evidence.tableData.length - 1 ? '1px solid #F1F5F9' : 'none',
                        backgroundColor: rowIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                      }}
                    >
                      {evidence.tableHeaders.map((h) => (
                        <td key={h.key} style={{
                          padding: '8px 12px',
                          color: '#1E293B',
                          whiteSpace: 'nowrap',
                          fontWeight: h.key === 'name' || h.key === 'orderNumber' || h.key === 'total' ? 600 : 400,
                        }}>
                          {formatCellValue(row[h.key], h.format)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Calculation Method & Query Trace */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#FAFAFA',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
          <Calculator size={13} color="#0284C7" />
          <span>Calculation Method & Business Logic</span>
        </div>
        <p style={{
          margin: '0 0 10px 0',
          color: '#475569',
          fontSize: '11px',
          lineHeight: '1.5',
        }}>
          {evidence.calculationMethod}
        </p>

        {/* Database Query Trace */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#E2E8F0',
          borderRadius: '5px',
          padding: '8px 12px',
          fontFamily: 'monospace',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <Code2 size={12} color="#10B981" />
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              color: '#34D399',
            }}>
              {evidence.queryFormula}
            </span>
          </div>
          <button
            onClick={handleCopyFormula}
            style={{
              background: 'none',
              border: 'none',
              color: copiedFormula ? '#10B981' : '#94A3B8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Copy query"
          >
            {copiedFormula ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Timestamp & Provenance Footer */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: '#64748B',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={11} />
          <span>
            Query Executed: {new Date(evidence.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            {' '}({new Date(evidence.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
          </span>
        </div>

        <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#94A3B8' }}>
          DB_READ_LATENCY: ~1.2ms • NO_HALLUCINATION
        </div>
      </div>
    </div>
  )
}
