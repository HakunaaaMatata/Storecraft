'use client'

import { THEME_PRESETS } from '@/lib/theme-presets'
import { ThemePresetId } from '@/lib/types'
import { Check, ChevronRight, ExternalLink, Palette, RotateCcw, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface ThemeBarProps {
  currentPreset: ThemePresetId
  currentSlug: string
  onPresetChange: (preset: ThemePresetId) => void
  onResetDb?: () => void
}

export function ThemeBar({
  currentPreset,
  currentSlug,
  onPresetChange,
  onResetDb
}: ThemeBarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const presets: ThemePresetId[] = ['atelier', 'market', 'forma', 'circuit']

  return (
    <aside
      aria-label="Theme Engine Controls"
      className="sticky top-0 z-50 border-b transition-all duration-200"
      style={{
        backgroundColor: '#0f172a',
        borderColor: '#1e293b',
        color: '#f8fafc'
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>THEME ENGINE</span>
          </div>

          <span className="hidden text-slate-500 sm:inline">|</span>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1">
            <span className="hidden text-slate-400 sm:inline">Preset:</span>
            {presets.map((preset) => {
              const cfg = THEME_PRESETS[preset]
              const isActive = currentPreset === preset
              return (
                <button
                  key={preset}
                  onClick={() => onPresetChange(preset)}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={`Switch to ${cfg.name} (${cfg.type})`}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: cfg.accent }}
                  />
                  <span>{cfg.name}</span>
                  {isActive && <Check className="h-3 w-3 text-emerald-600" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Quick slug links & Reset */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-slate-400">Stores:</span>
            <Link
              href="/store/forma"
              className={`rounded px-1.5 py-0.5 text-[11px] transition hover:underline ${
                currentSlug === 'forma' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              /forma
            </Link>
            <Link
              href="/store/atelier"
              className={`rounded px-1.5 py-0.5 text-[11px] transition hover:underline ${
                currentSlug === 'atelier' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              /atelier
            </Link>
            <Link
              href="/store/market"
              className={`rounded px-1.5 py-0.5 text-[11px] transition hover:underline ${
                currentSlug === 'market' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              /market
            </Link>
            <Link
              href="/store/circuit"
              className={`rounded px-1.5 py-0.5 text-[11px] transition hover:underline ${
                currentSlug === 'circuit' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              /circuit
            </Link>
          </div>

          {onResetDb && (
            <button
              onClick={onResetDb}
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Reset stock and demo orders"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset Stock</span>
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
            title="Return to Admin / Homepage"
          >
            <span>Exit</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
