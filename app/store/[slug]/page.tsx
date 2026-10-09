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
  const store = getStoreBySlug(slug)

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
  const store = getStoreBySlug(slug)

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm font-semibold uppercase tracking-wider">Loading Store...</div>}>
      <StorefrontView initialStore={publishedStore} />
    </Suspense>
  )
}
