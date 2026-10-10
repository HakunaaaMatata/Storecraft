import { Suspense } from 'react'
import { StorefrontView } from '@/components/storefront/storefront-view'
import { getStoreBySlug } from '@/lib/db'
import { Metadata } from 'next'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const store = await getStoreBySlug(slug)

  if (!store) {
    return {
      title: 'Store Not Found — StoreCraft'
    }
  }

  return {
    title: `${store.name} — ${store.tagline}`,
    description: store.heroSubtitle || store.announcement
  }
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params
  const store = await getStoreBySlug(slug)

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-xl">
            404
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Store Not Found</h1>
          <p className="mt-2 text-sm text-slate-500">
            We couldn’t find a store with the slug <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">/store/{slug}</code>.
          </p>

          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Explore Demo Stores:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/store/forma"
                className="rounded-lg bg-slate-100 p-2.5 text-slate-800 hover:bg-slate-200"
              >
                Forma Living
              </Link>
              <Link
                href="/store/atelier"
                className="rounded-lg bg-slate-100 p-2.5 text-slate-800 hover:bg-slate-200"
              >
                Atelier
              </Link>
              <Link
                href="/store/market"
                className="rounded-lg bg-slate-100 p-2.5 text-slate-800 hover:bg-slate-200"
              >
                Market Provisions
              </Link>
              <Link
                href="/store/circuit"
                className="rounded-lg bg-slate-100 p-2.5 text-slate-800 hover:bg-slate-200"
              >
                Circuit Lab
              </Link>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <Link
              href="/"
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              ← Back to StoreCraft Platform
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const publishedStore = {
    ...store,
    products: store.products.filter(p => p.status !== 'draft')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 md:px-12">
          <div className="w-32 h-6 bg-slate-100 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="w-16 h-4 bg-slate-100 rounded animate-pulse" />
            <div className="w-16 h-4 bg-slate-100 rounded animate-pulse" />
            <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </header>
        <div className="h-64 md:h-96 bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-48 h-8 bg-slate-200 rounded mx-auto animate-pulse" />
            <div className="w-72 h-4 bg-slate-200 rounded mx-auto animate-pulse" />
          </div>
        </div>
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12">
          <div className="flex justify-between items-center mb-8">
            <div className="w-32 h-6 bg-slate-100 rounded animate-pulse" />
            <div className="w-24 h-4 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <div className="w-full aspect-[4/5] bg-slate-100 rounded-lg animate-pulse" />
                <div className="w-2/3 h-5 bg-slate-100 rounded animate-pulse" />
                <div className="w-1/3 h-4 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    }>
      <StorefrontView initialStore={publishedStore} />
    </Suspense>
  )
}
