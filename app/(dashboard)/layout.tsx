"use client"

import { useState } from "react"
import { Sidebar } from "@/components/app-shell/sidebar"
import { Topbar } from "@/components/app-shell/topbar"
import { MobileBottomNav } from "@/components/app-shell/mobile-bottom-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background print:h-auto print:overflow-visible print:bg-white">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0 print:hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        <div className="print:hidden">
          <Topbar onMenuClick={() => setBottomSheetOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation & Role-Specific Bottom Sheet */}
      <div className="print:hidden">
        <MobileBottomNav open={bottomSheetOpen} onOpenChange={setBottomSheetOpen} />
      </div>
    </div>
  )
}

