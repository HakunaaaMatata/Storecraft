import React from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export const metadata = {
  title: 'Owner Dashboard | StoreCraft',
  description: 'Manage your storefront, inventory, orders, and business analytics in one place.'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}
