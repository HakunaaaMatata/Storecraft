'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  FileSpreadsheet, 
  Palette, 
  Globe2, 
  Zap, 
  ShieldCheck, 
  PackageCheck 
} from 'lucide-react'

export interface StepData {
  id: string
  number: string
  title: string
  description: string
  eyebrow: string
  slideHeadingPrefix: string
  slideHeadingEm: string
  slideCopy: string
}

const TUTORIAL_STEPS: StepData[] = [
  {
    id: 'business-setup',
    number: '01',
    title: 'Business setup',
    description: 'Tell us what makes your business different. StoreCraft shapes the foundation around your ambition.',
    eyebrow: '01 / BUSINESS SETUP',
    slideHeadingPrefix: 'Tell us about ',
    slideHeadingEm: 'your business.',
    slideCopy: "We'll tailor your StoreCraft experience to help your unique point of view shine through.",
  },
  {
    id: 'product-import',
    number: '02',
    title: 'Product import',
    description: 'Move your catalog from a spreadsheet in a few clicks. We’ll catch the details that need your attention.',
    eyebrow: '02 / PRODUCT IMPORT',
    slideHeadingPrefix: 'Bring your products ',
    slideHeadingEm: 'along.',
    slideCopy: 'Move your catalog from a spreadsheet in a few clicks. We’ll catch the details that need your attention.',
  },
  {
    id: 'theme-customization',
    number: '03',
    title: 'Theme customization',
    description: 'Choose a point of view, then tune every detail with a live preview that keeps up.',
    eyebrow: '03 / THEME CUSTOMIZATION',
    slideHeadingPrefix: 'Make it unmistakably ',
    slideHeadingEm: 'yours.',
    slideCopy: 'Choose a point of view, then tune every detail with a live preview that keeps up.',
  },
  {
    id: 'store-preview',
    number: '04',
    title: 'Store preview',
    description: 'Your storefront, checkout, and inventory working together before you publish.',
    eyebrow: '04 / STORE PREVIEW',
    slideHeadingPrefix: 'See the whole ',
    slideHeadingEm: 'picture.',
    slideCopy: 'Your storefront, checkout, and inventory working together before you publish.',
  },
  {
    id: 'publishing',
    number: '05',
    title: 'Publishing',
    description: 'Publish a beautiful store with a link you own and a checkout your customers trust.',
    eyebrow: '05 / PUBLISHING',
    slideHeadingPrefix: 'Open your ',
    slideHeadingEm: 'doors.',
    slideCopy: 'Publish a beautiful store with a link you own and a checkout your customers trust.',
  },
  {
    id: 'store-management',
    number: '06',
    title: 'Store management',
    description: 'Understand what is selling, what needs restocking, and where to go next.',
    eyebrow: '06 / STORE MANAGEMENT',
    slideHeadingPrefix: 'Grow from one ',
    slideHeadingEm: 'clear view.',
    slideCopy: 'Understand what is selling, what needs restocking, and where to go next.',
  },
]

interface TutorialCarouselProps {
  isAuthenticated?: boolean
}

export function TutorialCarousel({ isAuthenticated = false }: TutorialCarouselProps) {
  const [activeStep, setActiveStep] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePrev = useCallback(() => {
    setActiveStep((prev) => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setActiveStep((prev) => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))
  }, [])

  // Keyboard navigation when section is focused or active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return
      const isFocused = containerRef.current.contains(document.activeElement) ||
        containerRef.current.matches(':hover')

      if (isFocused) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          handleNext()
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          handlePrev()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  const targetLink = isAuthenticated ? '/onboard' : '/login?redirect=/onboard'

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-7xl mx-auto focus:outline-none"
      tabIndex={0}
      aria-label="Interactive Product Tutorial"
    >
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        
        {/* LEFT SIDE — STEP NAVIGATION */}
        <div className="lg:col-span-5 flex flex-col justify-between py-2">
          <div className="space-y-6 md:space-y-7">
            {TUTORIAL_STEPS.map((step, index) => {
              const isActive = index === activeStep
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`group w-full text-left transition-all duration-300 flex items-start gap-4 sm:gap-6 p-2.5 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#71EAEE] ${
                    isActive ? 'bg-[#71EAEE]/5 sm:bg-transparent' : 'hover:bg-slate-50/50'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  {/* Left accent vertical indicator & step number */}
                  <div className="relative flex items-start shrink-0 pt-0.5 min-h-[50px]">
                    {/* Vertical indicator bar */}
                    <div 
                      className={`w-0.5 rounded-full transition-all duration-300 self-stretch mr-4 ${
                        isActive 
                          ? 'bg-[#71EAEE] h-full shadow-[0_0_12px_rgba(113,234,238,0.8)]' 
                          : 'bg-slate-200/60 h-full group-hover:bg-slate-300'
                      }`} 
                    />
                    <span 
                      className={`text-xs sm:text-sm font-semibold tracking-wider transition-colors duration-300 ${
                        isActive ? 'text-[#06B6D4] font-bold' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Step Title & Copy */}
                  <div className="flex-1 space-y-1.5">
                    <h3 
                      className={`text-base sm:text-lg font-bold tracking-tight transition-colors duration-300 ${
                        isActive ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p 
                      className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 max-w-md ${
                        isActive ? 'text-[#06B6D4] font-medium' : 'text-slate-400 opacity-85'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT SIDE — TUTORIAL PREVIEW PANEL */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Outer Dark Sleek Window Frame */}
          <div className="w-full h-full bg-[#0D1117] rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-800 flex flex-col justify-between overflow-hidden relative min-h-[460px] sm:min-h-[500px]">
            
            {/* Window Top Bar Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-3 text-slate-400 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 tracking-tight">StoreCraft studio</span>
              </div>

              {/* Prev / Next Controls & Live Indicator */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#71EAEE] animate-pulse" />
                  <span className="text-slate-300 font-sans font-medium">Live preview</span>
                </div>

                {/* Next/Prev Arrow Buttons */}
                <div className="flex items-center gap-1 bg-slate-800/50 p-0.5 rounded border border-slate-700/50">
                  <button
                    onClick={handlePrev}
                    disabled={activeStep === 0}
                    aria-label="Previous step"
                    className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono px-1">
                    {activeStep + 1}/6
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={activeStep === TUTORIAL_STEPS.length - 1}
                    aria-label="Next step"
                    className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Inner Interactive Canvas Container */}
            <div className="flex-1 bg-[#F6F8F7] rounded-xl p-5 sm:p-8 relative overflow-hidden flex flex-col justify-between border border-slate-200/50">
              
              {/* Background Decorative Graphic Ring */}
              <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full border border-teal-200/60 pointer-events-none" />
              <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full border border-teal-300/40 pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="w-full h-full flex flex-col justify-between relative z-10"
                >
                  {/* SLIDE 01 — BUSINESS SETUP */}
                  {activeStep === 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 h-full my-auto">
                      <div className="flex-1 space-y-4 max-w-sm">
                        <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                          {TUTORIAL_STEPS[0].eyebrow}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          Tell us about <br />
                          <em className="font-serif font-normal italic">your business.</em>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          We’ll tailor your StoreCraft experience to help your unique point of view shine through.
                        </p>
                        <div className="pt-2">
                          <a
                            href={targetLink}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#71EAEE] text-slate-950 font-bold text-xs sm:text-sm hover:bg-[#51D8DE] transition-all shadow-sm"
                          >
                            Get started <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      {/* Right Mock Card matching reference image */}
                      <div className="w-full sm:w-52 bg-white rounded-xl p-5 shadow-xl border border-slate-200/80 space-y-4 shrink-0 relative mt-2 sm:mt-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center text-white">
                          <ChevronLeft className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                            YOUR STORE NAME
                          </span>
                          <p className="font-bold text-slate-900 text-sm">Northstar Goods</p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-7 w-full rounded border border-slate-200 bg-slate-50/50" />
                          <div className="h-7 w-3/4 rounded border border-slate-200 bg-slate-50/50" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SLIDE 02 — PRODUCT IMPORT */}
                  {activeStep === 1 && (
                    <div className="space-y-5 my-auto">
                      <div>
                        <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                          {TUTORIAL_STEPS[1].eyebrow}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-1">
                          Bring your products <em className="font-serif font-normal italic">along.</em>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg">
                          Move your catalog from a spreadsheet in a few clicks. We’ll catch the details that need your attention.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {/* File Upload Box */}
                        <div className="sm:col-span-5 bg-white p-4 rounded-xl border border-dashed border-teal-300 flex flex-col items-center justify-center text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Drop CSV or Excel here</p>
                            <span className="text-[10px] text-slate-400">Supports .csv, .xlsx, .tsv</span>
                          </div>
                          <span className="px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold">
                            Select file
                          </span>
                        </div>

                        {/* Sample Table Preview */}
                        <div className="sm:col-span-7 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-b pb-1.5">
                            <span>PRODUCT NAME</span>
                            <span>PRICE</span>
                            <span>STATUS</span>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-slate-100">
                              <span className="font-semibold text-slate-800">Forma Desk Lamp</span>
                              <span className="text-slate-600">$148.00</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Ready
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-slate-100">
                              <span className="font-semibold text-slate-800">Hand-thrown Mug</span>
                              <span className="text-slate-600">$34.00</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Ready
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="font-semibold text-slate-800">Linen Throw</span>
                              <span className="text-slate-600">$86.00</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Ready
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SLIDE 03 — THEME CUSTOMIZATION */}
                  {activeStep === 2 && (
                    <div className="space-y-4 my-auto">
                      <div>
                        <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                          {TUTORIAL_STEPS[2].eyebrow}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-1">
                          Make it unmistakably <em className="font-serif font-normal italic">yours.</em>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          Choose a point of view, then tune every detail with a live preview that keeps up.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { name: 'Atelier', type: 'Editorial fashion', accent: '#8C6C5D', active: false },
                          { name: 'Forma', type: 'Home & lifestyle', accent: '#10B981', active: true },
                          { name: 'Market', type: 'Local & grocery', accent: '#648A4F', active: false },
                          { name: 'Circuit', type: 'Technology', accent: '#00F0FF', active: false },
                        ].map((item) => (
                          <div
                            key={item.name}
                            className={`p-3 rounded-xl border transition-all ${
                              item.active
                                ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-400/20'
                                : 'bg-white/60 border-slate-200 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.accent }}
                              />
                              {item.active && (
                                <span className="text-[9px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-xs text-slate-900">{item.name}</p>
                            <span className="text-[10px] text-slate-500">{item.type}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-teal-600" />
                          <span className="font-semibold text-slate-800">Forma Theme Selected</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">Real-time font & color mapping active</span>
                      </div>
                    </div>
                  )}

                  {/* SLIDE 04 — STORE PREVIEW */}
                  {activeStep === 3 && (
                    <div className="space-y-4 my-auto">
                      <div>
                        <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                          {TUTORIAL_STEPS[3].eyebrow}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-1">
                          See the whole <em className="font-serif font-normal italic">picture.</em>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          Your storefront, checkout, and inventory working together before you publish.
                        </p>
                      </div>

                      {/* Storefront Mock Card */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs font-bold bg-slate-50/50">
                          <span>NORTHSTAR GOODS</span>
                          <div className="flex gap-3 text-[10px] text-slate-500">
                            <span>Shop</span>
                            <span>About</span>
                            <span className="text-slate-800 font-bold">Cart (2)</span>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-teal-300 font-bold">
                              Autumn 2026 Collection
                            </span>
                            <p className="text-base font-serif font-normal italic">Objects with a point of view.</p>
                          </div>
                          <span className="px-3 py-1 rounded bg-[#71EAEE] text-slate-950 font-bold text-[10px]">
                            Shop Collection
                          </span>
                        </div>
                        <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50">
                          {[
                            { title: 'Forma Desk Lamp', price: '$148.00' },
                            { title: 'Hand-thrown Mug', price: '$34.00' },
                            { title: 'Linen Throw', price: '$86.00' },
                          ].map((p, i) => (
                            <div key={i} className="bg-white p-2 rounded border border-slate-200/80 space-y-1">
                              <div className="h-12 w-full bg-slate-100 rounded" />
                              <p className="text-[10px] font-bold truncate">{p.title}</p>
                              <span className="text-[10px] text-slate-500">{p.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SLIDE 05 — PUBLISHING */}
                  {activeStep === 4 && (
                    <div className="space-y-4 my-auto">
                      <div>
                        <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                          {TUTORIAL_STEPS[4].eyebrow}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-1">
                          Open your <em className="font-serif font-normal italic">doors.</em>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg">
                          Publish a beautiful store with a link you own and a checkout your customers trust.
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-700 truncate">
                            <Globe2 className="w-4 h-4 text-teal-600 shrink-0" />
                            <span className="truncate">https://northstar.storecraft.shop</span>
                          </div>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded shrink-0">
                            Custom Domain
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-2 p-2 rounded bg-slate-50 text-slate-700">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-[11px]">SSL Enabled</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-slate-50 text-slate-700">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-[11px]">Stripe Ready</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-slate-50 text-slate-700">
                            <PackageCheck className="w-4 h-4 text-teal-600" />
                            <span className="text-[11px]">84 Products</span>
                          </div>
                        </div>

                        <div className="pt-1">
                          <a
                            href={targetLink}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-colors"
                          >
                            Publish Store Now <ArrowRight className="w-4 h-4 text-[#71EAEE]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SLIDE 06 — STORE MANAGEMENT */}
                  {activeStep === 5 && (
                    <div className="space-y-4 my-auto">
                      <div>
                        <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                          {TUTORIAL_STEPS[5].eyebrow}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-1">
                          Grow from one <em className="font-serif font-normal italic">clear view.</em>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg">
                          Understand what is selling, what needs restocking, and where to go next.
                        </p>
                      </div>

                      {/* Mini Owner Dashboard Preview */}
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">REVENUE</span>
                            <p className="font-extrabold text-sm text-slate-900 mt-0.5">$24,892</p>
                            <span className="text-[9px] font-bold text-emerald-600">+18.2% vs last mo</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">ORDERS</span>
                            <p className="font-extrabold text-sm text-slate-900 mt-0.5">328</p>
                            <span className="text-[9px] font-bold text-emerald-600">+12.4% vs last mo</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">INVENTORY</span>
                            <p className="font-extrabold text-sm text-slate-900 mt-0.5">84 SKUs</p>
                            <span className="text-[9px] font-bold text-amber-600">6 low in stock</span>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pb-1 border-b">
                            <span>RECENT ORDER</span>
                            <span>AMOUNT</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-800">
                            <span>#1048 · Olivia Martin (Forma Desk Lamp)</span>
                            <span className="font-bold">$148.00</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-800">
                            <span>#1047 · Theo Walker (Canvas Tote × 2)</span>
                            <span className="font-bold">$64.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
