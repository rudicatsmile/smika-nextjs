"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
