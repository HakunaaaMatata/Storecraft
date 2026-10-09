'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react'
import { ArrowRight, BarChart3, Check, ChevronDown, ChevronRight, CircleHelp, Globe2, LayoutDashboard, Menu, MessageSquare, Package, Palette, Play, Plus, Search, ShoppingBag, Sparkles, Upload, X, Zap } from 'lucide-react'

const steps = [
  { label: 'Business setup', eyebrow: '01', title: 'Start with your story.', copy: 'Tell us what makes your business different. StoreCraft shapes the foundation around your ambition.', icon: LayoutDashboard },
  { label: 'Product import', eyebrow: '02', title: 'Bring your products along.', copy: 'Move your catalog from a spreadsheet in a few clicks. We’ll catch the details that need your attention.', icon: Upload },
  { label: 'Theme customization', eyebrow: '03', title: 'Make it unmistakably yours.', copy: 'Choose a point of view, then tune every detail with a live preview that keeps up.', icon: Palette },
  { label: 'Store preview', eyebrow: '04', title: 'See the whole picture.', copy: 'Your storefront, checkout, and inventory working together before you publish.', icon: Globe2 },
  { label: 'Publishing', eyebrow: '05', title: 'Open your doors.', copy: 'Publish a beautiful store with a link you own and a checkout your customers trust.', icon: Zap },
  { label: 'Store management', eyebrow: '06', title: 'Grow from one clear view.', copy: 'Understand what is selling, what needs restocking, and where to go next.', icon: BarChart3 },
]

const themes = [
  { 
    name: 'Atelier', 
    type: 'Editorial fashion', 
    desc: 'Elegant, luxurious typography with breathable spacing and muted warm tones. Designed to put high-end apparel and lookbooks center stage.',
    bg: '#FAF8F5', 
    surface: '#FFFFFF',
    ink: '#1A1817', 
    accent: '#8C6C5D', 
    fontBody: 'var(--font-sans)',
    fontHeading: 'var(--font-serif)',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
    radius: '0px',
    layout: 'grid-cols-2'
  },
  { 
    name: 'Market', 
    type: 'Local & grocery', 
    desc: 'Lively, friendly, and densely packed. Market uses organic greens and sturdy typography to showcase fresh goods and daily staples.',
    bg: '#F3F5EF', 
    surface: '#FFFFFF',
    ink: '#1E2C22', 
    accent: '#648A4F', 
    fontBody: 'var(--font-sans)',
    fontHeading: 'var(--font-sans)',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85',
    radius: '12px',
    layout: 'grid-cols-3'
  },
  { 
    name: 'Forma', 
    type: 'Home & lifestyle', 
    desc: 'Clean, architectural, and restrained. Forma balances stark monochrome layouts with emerald accents for design-forward homewares.',
    bg: '#F9F9F9', 
    surface: '#FFFFFF',
    ink: '#111210', 
    accent: '#10B981', 
    fontBody: 'var(--font-sans)',
    fontHeading: 'var(--font-serif)',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=85',
    radius: '4px',
    layout: 'grid-cols-2'
  },
  { 
    name: 'Circuit', 
    type: 'Technology', 
    desc: 'Bold, dark, and high-contrast. Circuit utilizes neon accents and dense, technical layouts built for contemporary streetwear and hardware.',
    bg: '#0F1115', 
    surface: '#1A1D24',
    ink: '#FFFFFF', 
    accent: '#00F0FF', 
    fontBody: 'var(--font-sans)',
    fontHeading: 'var(--font-sans)',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85',
    radius: '2px',
    layout: 'grid-cols-3'
  },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand"><div className="brand-mark"><span /></div>{!compact && <span className="brand-name">StoreCraft</span>}</div>
}

function ProductPreview() {
  return <div className="product-preview" aria-label="StoreCraft product preview">
    <div className="preview-toolbar"><div className="window-dots"><i /><i /><i /></div><span>storecraft.com / studio</span><div className="preview-actions"><span>Preview</span><b>Publish</b></div></div>
    <div className="preview-body">
      <aside className="preview-sidebar"><Brand compact /><div className="side-nav"><span className="active"><LayoutDashboard /> Overview</span><span><Package /> Products</span><span><Palette /> Design</span><span><BarChart3 /> Analytics</span></div><div className="side-user"><div className="avatar">JD</div><span>Jamie Davis<small>Owner</small></span><ChevronDown /></div></aside>
      <div className="preview-main"><div className="preview-heading"><div><p className="tiny-label">Tuesday, October 8</p><h3>Good morning, Jamie</h3></div><button className="icon-button"><CircleHelp /></button></div><div className="preview-stats"><div><small>Revenue</small><strong>$24,892</strong><em>+18.2%</em></div><div><small>Orders</small><strong>328</strong><em>+12.4%</em></div><div><small>Customers</small><strong>1,204</strong><em>+8.1%</em></div></div><div className="preview-grid"><div className="chart-card"><div className="card-top"><span>Revenue overview</span><button>Last 30 days <ChevronDown /></button></div><div className="chart"><div className="chart-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 500 160" preserveAspectRatio="none"><path d="M0 135 C55 126 70 98 112 111 S170 80 214 94 S263 39 310 70 S376 82 405 38 S458 59 500 15" fill="none" stroke="#10b981" strokeWidth="4" /></svg><div className="chart-labels"><span>Sep 10</span><span>Sep 17</span><span>Sep 24</span><span>Oct 1</span><span>Oct 8</span></div></div></div><div className="ai-card"><div className="ai-icon"><Sparkles /></div><small>StoreCraft AI</small><h4>Your best week yet.</h4><p>Revenue is up 18.2% this month, led by the Forma collection.</p><button>Ask a question <ArrowRight /></button></div></div></div>
    </div>
  </div>
}

function DynamicStorefrontPreview({ theme }: { theme: typeof themes[number] }) {
  return (
    <div 
      className="w-full max-w-[800px] aspect-[4/3] flex flex-col overflow-hidden transition-all duration-1000 motion-reduce:transition-none ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none shadow-2xl relative mx-auto"
      style={{
        backgroundColor: theme.bg,
        color: theme.ink,
        fontFamily: theme.fontBody,
        borderRadius: '16px',
        border: '1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)',
      }}
    >
      <div className="h-10 w-full flex items-center px-4 gap-2 border-b transition-colors duration-1000 z-10 relative shrink-0" style={{ backgroundColor: theme.surface, borderColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}>
         <div className="flex gap-1.5">
           <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20" />
           <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20" />
           <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20" />
         </div>
         <div className="mx-auto text-[10px] font-medium opacity-50">storecraft.com/{theme.name.toLowerCase()}</div>
      </div>
      
      <div className="px-8 py-5 flex justify-between items-center z-10 relative shrink-0">
         <h1 className="text-2xl transition-all duration-1000 motion-reduce:transition-none" style={{ fontFamily: theme.fontHeading, fontWeight: theme.name === 'Circuit' || theme.name === 'Market' ? 800 : 400 }}>{theme.name}</h1>
         <nav className="flex gap-4 text-[11px] font-bold uppercase tracking-wider opacity-80">
            <span className="hidden sm:inline">Shop</span>
            <span className="hidden sm:inline">About</span>
            <ShoppingBag className="w-4 h-4" />
         </nav>
      </div>

      <div className="w-full relative shrink-0 transition-all duration-1000 motion-reduce:transition-none" style={{ height: theme.name === 'Atelier' ? '50%' : '35%' }}>
         <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 motion-reduce:transition-none" style={{ backgroundImage: `url(${theme.image})` }} />
         <div className="absolute inset-0 transition-all duration-1000 motion-reduce:transition-none" style={{ background: `linear-gradient(to top, ${theme.bg}, transparent)` }} />
      </div>

      <div className="p-4 sm:p-8 flex-1 overflow-hidden z-10 relative flex flex-col">
         <div className="flex justify-between items-end mb-4 shrink-0">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-1000" style={{ color: theme.accent }}>New Arrivals</h2>
         </div>
         <div className={`grid ${theme.layout} gap-4 sm:gap-6 transition-all duration-1000 motion-reduce:transition-none h-full`}>
            {[1,2,3].map(i => (
              <div key={i} className="flex flex-col gap-3 transition-all duration-1000 motion-reduce:transition-none overflow-hidden"
                   style={{ 
                     backgroundColor: theme.surface,
                     borderRadius: theme.radius,
                     border: theme.name === 'Market' || theme.name === 'Circuit' ? `1px solid color-mix(in srgb, currentColor 10%, transparent)` : 'none',
                     boxShadow: theme.name === 'Forma' ? '0 10px 30px rgba(0,0,0,0.03)' : 'none',
                     padding: theme.name === 'Market' || theme.name === 'Circuit' ? '12px' : '0'
                   }}>
                <div className="w-full flex-1 min-h-[80px] transition-all duration-1000 motion-reduce:transition-none bg-current opacity-5" style={{ borderRadius: theme.name === 'Circuit' ? '0' : theme.radius }} />
                <div className="px-1 flex justify-between items-start shrink-0">
                  <div className="space-y-1.5 w-full">
                    <div className="h-2 w-2/3 bg-current opacity-20 rounded" />
                    <div className="h-2 w-1/3 bg-current opacity-20 rounded" />
                  </div>
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full transition-all duration-1000 motion-reduce:transition-none hidden sm:flex" style={{ backgroundColor: theme.accent, color: theme.surface }}>
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  )
}

function DashboardView() {
  const [active, setActive] = useState('Overview')
  const nav = [['Overview', LayoutDashboard], ['Store setup', Sparkles], ['Products', Package], ['Orders', ShoppingBag], ['Analytics', BarChart3], ['AI assistant', MessageSquare]] as const
  return <section id="dashboard" className="dashboard-section"><div className="dashboard-shell"><aside className="dashboard-nav"><Brand /><div className="store-switch"><div className="store-avatar">N</div><div><strong>Northstar Goods</strong><small>Pro plan</small></div><ChevronDown /></div><nav>{nav.map(([label, Icon]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => setActive(label)}><Icon />{label}</button>)}</nav><div className="nav-bottom"><button><CircleHelp /> Help center</button><button><div className="avatar small">JD</div> Jamie Davis <ChevronDown /></button></div></aside><main className="dashboard-main"><div className="dash-mobile-head"><Brand compact /><Menu /></div><header className="dashboard-header"><div><p className="eyebrow">Overview</p><h2>Good morning, Jamie</h2></div><div className="dash-actions"><button className="search-button"><Search /> Search</button><button className="notification"><span /></button><div className="avatar">JD</div></div></header><div className="demo-banner"><Sparkles /><span><strong>Demo workspace</strong> — explore StoreCraft with sample business data.</span><button>Reset demo</button></div><div className="metric-grid"><div><small>Total revenue</small><strong>$24,892.40</strong><span className="positive">+18.2% <small>vs. last month</small></span></div><div><small>Orders</small><strong>328</strong><span className="positive">+12.4% <small>vs. last month</small></span></div><div><small>Products</small><strong>84</strong><span><Package /> 6 low in stock</span></div><div><small>Avg. order value</small><strong>$75.89</strong><span className="positive">+4.6% <small>vs. last month</small></span></div></div><div className="dash-grid"><div className="dash-card revenue-card"><div className="card-top"><div><h3>Revenue overview</h3><p>Keep an eye on how your store is doing.</p></div><button>Last 30 days <ChevronDown /></button></div><div className="big-chart"><div className="chart-y"><span>$3k</span><span>$2k</span><span>$1k</span><span>$0</span></div><div className="chart-area"><div className="chart-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 700 230" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#10b981" stopOpacity=".23"/><stop offset="1" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs><path d="M0 205 C60 180 75 170 120 183 S190 150 230 164 S285 75 340 119 S390 148 430 98 S485 110 530 75 S590 92 630 47 S674 70 700 20 V230 H0Z" fill="url(#area)"/><path d="M0 205 C60 180 75 170 120 183 S190 150 230 164 S285 75 340 119 S390 148 430 98 S485 110 530 75 S590 92 630 47 S674 70 700 20" fill="none" stroke="#10b981" strokeWidth="3"/></svg><div className="chart-labels"><span>Sep 10</span><span>Sep 17</span><span>Sep 24</span><span>Oct 1</span><span>Oct 8</span></div></div></div></div><div className="dash-card ai-insight"><div className="ai-icon"><Sparkles /></div><p className="eyebrow">StoreCraft AI</p><h3>One clear next move.</h3><p>Your Forma Desk Lamp is trending 42% above its usual weekly pace. Consider featuring it in your next campaign.</p><button>Ask about your store <ArrowRight /></button></div></div><div className="dash-card orders-card"><div className="card-top"><div><h3>Recent orders</h3><p>Stay close to every customer.</p></div><button className="text-button">View all <ArrowRight /></button></div><div className="orders"><div><span className="order-id">#1048</span><span>Olivia Martin</span><span className="order-product">Forma Desk Lamp × 1</span><strong>$148.00</strong><b>Paid</b></div><div><span className="order-id">#1047</span><span>Theo Walker</span><span className="order-product">Canvas Tote × 2</span><strong>$64.00</strong><b>Paid</b></div><div><span className="order-id">#1046</span><span>Maya Chen</span><span className="order-product">Ceramic Set × 1</span><strong>$82.00</strong><b>Processing</b></div></div></div></main></div></section>
}

function WorkspaceView() {
  const [view, setView] = useState('Store setup')
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<string[]>([])
  const products = ['Forma Desk Lamp', 'Hand-thrown Mug', 'Linen Throw', 'Oak Side Table']
  const visibleProducts = products.filter((product) => product.toLowerCase().includes(query.toLowerCase()))
  const views = ['Store setup', 'Storefront', 'Products', 'Orders', 'Analytics', 'AI assistant']
  return <section id="workspace" className="workspace-section"><div className="workspace-head"><div><p className="eyebrow">Interactive workspace</p><h2>Run your store with <em>clarity.</em></h2></div><div className="workspace-tabs">{views.map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}</button>)}</div></div>{view === 'Store setup' && <div className="builder-panel"><div className="builder-progress"><span className="progress-line"><i style={{ width: `${step * 25}%` }} /></span><small>Step {step} of 4</small></div><div className="builder-content"><div><p className="eyebrow">{step === 1 ? 'Business setup' : step === 2 ? 'Catalog import' : step === 3 ? 'Theme customization' : 'Store preview'}</p><h3>{step === 1 ? 'Tell us about your business.' : step === 2 ? 'Bring your products along.' : step === 3 ? 'Make it unmistakably yours.' : 'See the whole picture.'}</h3><p>{step === 1 ? 'We’ll tailor your workspace around your ambition.' : step === 2 ? 'Upload a CSV or Excel file and we’ll validate every row.' : step === 3 ? 'Choose a starting point, then tune the details.' : 'Your storefront, checkout, and inventory working together.'}</p><div className="builder-fields"><label>Store name<input defaultValue="Northstar Goods" /></label><label>Business type<select defaultValue="Home & lifestyle"><option>Home & lifestyle</option><option>Fashion</option><option>Food & grocery</option></select></label></div><button className="button button-green" onClick={() => setStep(step === 4 ? 1 : step + 1)}>{step === 4 ? 'Start another setup' : 'Continue'} <ArrowRight /></button></div><div className="builder-preview"><div className="builder-preview-top"><span>Live preview</span><span className="live-dot">Live</span></div><div className="storefront-preview"><small>NORTHSTAR GOODS</small><h4>Objects with<br /><em>a point of view.</em></h4><button>Shop collection <ArrowRight /></button></div></div></div></div>}{view === 'Products' && <div className="workspace-card"><div className="workspace-card-top"><div><h3>Products</h3><p>Manage your catalog and inventory.</p></div><button className="button button-green"><Plus /> Add product</button></div><label className="workspace-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" /></label><div className="product-list">{visibleProducts.map((product, index) => <div className="product-row" key={product}><div className="product-thumb" /><div><strong>{product}</strong><small>SKU-NG-{102 + index} · Home collection</small></div><span>${[128, 34, 86, 240][index]}.00</span><b className={index === 1 ? 'stock low' : 'stock'}>{index === 1 ? 'Low stock' : 'In stock'}</b></div>)}</div></div>}{view === 'Orders' && <div className="workspace-card"><div className="workspace-card-top"><div><h3>Orders</h3><p>Track fulfillment from payment to delivery.</p></div><span className="order-count">328 orders</span></div><div className="order-list">{['#1048 · Jamie Davis', '#1047 · Morgan Lee', '#1046 · Taylor Kim'].map((order, index) => <div className="product-row" key={order}><div><strong>{order}</strong><small>{index === 0 ? 'Today, 10:42 AM' : 'Yesterday'} · ${[128, 86, 240][index]}.00</small></div><b className="stock">{index === 2 ? 'Shipped' : 'Processing'}</b><ChevronRight /></div>)}</div></div>}{view === 'Analytics' && <div className="workspace-card analytics-panel"><div className="workspace-card-top"><div><h3>Analytics</h3><p>Understand what is moving your business forward.</p></div><span className="positive">+18.2% this month</span></div><div className="analytics-bars">{[42, 58, 48, 74, 63, 86, 78, 96].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><small>{['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][index]}</small></div>)}</div></div>}{view === 'AI assistant' && <div className="workspace-card assistant-panel"><div className="ai-icon"><Sparkles /></div><p className="eyebrow">StoreCraft AI</p><h3>Ask anything about your store.</h3><p>Try questions like “Which products should I restock?” or “How did revenue change this month?”</p><div className="assistant-answer"><strong>Based on your store data</strong><span>Forma Desk Lamp is your top performer, up 42% above pace. Six ceramic items are low in stock and should be restocked next.</span></div><label className="workspace-search"><MessageSquare /><input placeholder="Ask your store assistant" /></label></div>}{view === 'Storefront' && <div className="storefront-card"><div className="storefront-nav"><Brand /><span>New collection</span><ShoppingBag /></div><div className="storefront-hero"><p className="eyebrow">Northstar Goods · Autumn 2026</p><h3>Objects with<br /><em>a point of view.</em></h3><button className="button button-light">Shop collection <ArrowRight /></button></div><div className="storefront-products"><div className="workspace-card-top"><div><h3>Featured products</h3><p>Thoughtful goods for everyday living.</p></div><button className="text-link" onClick={() => setView('Products')}>Manage catalog <ArrowRight /></button></div><div className="storefront-product-grid">{products.slice(0, 3).map((product, index) => <button className="storefront-product" key={product} onClick={() => setCart([...cart, product])}><div className="storefront-product-image" /><strong>{product}</strong><span>${[128, 34, 86][index]}.00</span></button>)}</div>{cart.length > 0 && <div className="cart-note"><ShoppingBag /> {cart.length} item{cart.length > 1 ? 's' : ''} in cart · <button onClick={() => setCart([])}>Checkout</button></div>}</div></div>}</section>
}

export default function Page() {
  const [themeIndex, setThemeIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, .25], [0, -80])

  const themesRef = useRef<HTMLElement>(null)
  const { scrollYProgress: themesScroll } = useScroll({ target: themesRef, offset: ["start start", "end end"] })

  useEffect(() => {
    return themesScroll.on('change', (latest) => {
      const index = Math.min(Math.floor(latest * 4), 3)
      setThemeIndex(index)
    })
  }, [themesScroll])

  return <main>
    <header className="site-header"><a href="/"><Brand /></a><nav className={menuOpen ? 'open' : ''}><a href="#product">Product</a><a href="#themes">Templates</a><a href={`/store/${themes[themeIndex].name.toLowerCase()}`} style={{ color: '#07875d', fontWeight: 800 }}>Storefront (/store/{themes[themeIndex].name.toLowerCase()})</a><a href="#features">Features</a><a href="/dashboard">Dashboard</a></nav><div className="header-actions"><a className="login" href="/dashboard">Log in</a><a className="button button-dark" href="/onboard">Build your store <ArrowRight /></a></div><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button></header>
    <section id="top" className="hero"><motion.div className="hero-copy" style={{ y: heroY }}><div className="announcement"><span />A better way to sell online</div><h1>Your next big business <em>starts with a store.</em></h1><p>Create a beautiful online store, manage your products, and understand your sales — all from one simple platform.</p><div className="hero-actions"><a className="button button-green" href="/onboard">Build your store <ArrowRight /></a><a className="play-link" href="#product"><span><Play /></span> Explore the experience</a></div><div className="hero-note"><span className="avatar-stack"><i /><i /><i /></span><span>Built for the businesses<br />ready for what’s next.</span></div></motion.div><motion.div className="hero-visual" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .8 }}><ProductPreview /></motion.div></section>
    <section className="logo-strip"><span>One platform for every part of your business</span><div><strong>northstar</strong><strong>FIELDNOTE</strong><strong>MADEWELL</strong><strong>LANDMARK</strong><strong>ORIGIN</strong></div></section>
    <section id="product" className="story-section"><div className="section-intro"><p className="eyebrow">From first idea to first order</p><h2>Everything you need to <em>move forward.</em></h2><p>StoreCraft brings your products, storefront, and business intelligence into one beautifully simple workspace.</p></div><div className="story-layout"><div className="story-steps">{steps.map((step, i) => <div className={`story-step ${i === 0 ? 'active' : ''}`} key={step.label}><span>{step.eyebrow}</span><div><step.icon /><h3>{step.label}</h3><p>{step.copy}</p></div></div>)}</div><div className="story-device"><div className="device-bar"><span>StoreCraft studio</span><span>Live preview <i /></span></div><div className="device-content"><div className="device-top"><div><small>01 / BUSINESS SETUP</small><h3>Tell us about<br /><em>your business.</em></h3><p>We’ll tailor your StoreCraft experience to help your unique point of view shine through.</p><a href="/onboard" className="button button-green">Get started <ArrowRight /></a></div><div className="setup-card"><div className="mini-logo"><div className="brand-mark"><span /></div></div><small>YOUR STORE NAME</small><strong>Northstar Goods</strong><div className="fake-input" /><div className="fake-input short" /></div></div></div></div></div></section>
    <section id="themes" ref={themesRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col md:flex-row items-center py-20 px-6 md:px-16 gap-12 bg-white">
        
        {/* Text Content */}
        <div className="flex-1 max-w-lg relative z-10 flex flex-col h-full justify-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#10B981] mb-6">A point of view, built in</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-ink mb-6">Make it <em>yours.</em></h2>
          <p className="text-[15px] md:text-[17px] text-muted-foreground leading-relaxed mb-12">
            Every business has a soul. StoreCraft gives you four meticulously crafted starting points designed to put your products in their best light.
          </p>

          <div className="space-y-8">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
              <motion.div 
                className="absolute left-0 top-0 w-0.5 bg-[#10B981]" 
                style={{ height: `${(themeIndex + 1) * 25}%`, transition: 'height 0.3s ease' }} 
              />
              
              <div className="pl-6 relative">
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={themeIndex}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.3 }}
                   >
                     <h3 className="text-xl font-bold text-ink">{themes[themeIndex].name} — {themes[themeIndex].type}</h3>
                     <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                       {themes[themeIndex].desc}
                     </p>
                   </motion.div>
                 </AnimatePresence>
              </div>
            </div>

            <div className="pl-6 flex flex-wrap gap-3">
              <a href={`/store/${themes[themeIndex].name.toLowerCase()}`} className="button button-green inline-flex px-5 py-3 text-xs">
                Preview {themes[themeIndex].name} <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a href="/dashboard/theme" className="button button-dark inline-flex px-5 py-3 text-xs bg-ink text-white">
                Customize Theme <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Preview Window */}
        <div className="flex-1 w-full h-full min-h-[400px] md:min-h-0 flex items-center justify-center relative">
          <DynamicStorefrontPreview theme={themes[themeIndex]} />
        </div>

      </div>
    </section>
    <section id="features" className="import-section"><div className="import-copy"><p className="eyebrow">Ready when your catalog is</p><h2>From spreadsheet<br />to <em>storefront.</em></h2><p>Bring your products with you. Our thoughtful import flow does the busywork and leaves you in control.</p><a className="text-link" href="/onboard">See how importing works <ArrowRight /></a></div><div className="import-window"><div className="import-top"><div><span className="file-icon">.CSV</span><div><strong>products_october.csv</strong><small>84 products · Updated just now</small></div></div><span className="import-status"><Check /> Ready to import</span></div><div className="mapping"><p>Map your columns</p><span>We found a match for every required field.</span><div className="mapping-row"><b>Product name</b><ChevronRight /><span>product_title</span><Check /></div><div className="mapping-row"><b>Price</b><ChevronRight /><span>retail_price</span><Check /></div><div className="mapping-row"><b>Inventory</b><ChevronRight /><span>stock_count</span><Check /></div><a href="/onboard" className="button button-green full" style={{ marginTop: '17px', textAlign: 'center' }}>Import 84 products <ArrowRight /></a></div></div></section>
    <section className="dark-section"><div><p className="eyebrow green">Your business, in focus</p><h2>Good decisions<br />start with <em>clarity.</em></h2><p>See what’s selling, what’s next, and where your attention matters most. StoreCraft makes the numbers feel human.</p><a className="button button-light" href="/dashboard">Explore your workspace <ArrowRight /></a></div><div className="dark-metrics"><div><small>Revenue this month</small><strong>$24,892</strong><span>+18.2%</span></div><div><small>Top performer</small><strong>Forma Desk Lamp</strong><span>42% above pace</span></div><div><small>Next best action</small><strong>Restock ceramics</strong><span>6 items running low</span></div></div></section>
    <DashboardView />
    <WorkspaceView />
    <section id="builder" className="cta-section"><p className="eyebrow">The next chapter is yours</p><h2>Your store.<br /><em>Your rules.</em></h2><p>Build something you’re proud to put your name on.</p><a className="button button-green" href="/onboard">Start building with StoreCraft <ArrowRight /></a></section>
    <footer><div><Brand /><p>Your business. Your brand. Your store.</p></div><div className="footer-links"><div><strong>Product</strong><a href="#product">How it works</a><a href="#themes">Templates</a><a href="/dashboard">Dashboard</a></div><div><strong>Resources</strong><a href="#features">Help center</a><a href="/onboard">Documentation</a><a href="/onboard">Support</a></div><div><strong>Company</strong><a href="/">About</a><a href="/">Privacy</a><a href="/">Terms</a></div></div><div className="footer-bottom"><span>© 2026 StoreCraft, Inc.</span><span>Made for what’s next.</span></div></footer>
  </main>
}
