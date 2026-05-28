"use client"

import { useEffect } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { AIPanel } from "@/components/layout/AIPanel"
import { SwipeHandler } from "@/components/layout/SwipeHandler"
import { useStore } from "@/lib/store"
import { useMediaQuery } from "@/lib/use-media-query"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, loadGoals, loadHealth, loadGym, loadSleepLog, loadReminders, syncWithSupabase } = useStore()
  const isMobile = useMediaQuery("(max-width: 1023px)")

  useEffect(() => {
    loadGoals()
    loadHealth()
    loadGym()
    loadSleepLog()
    loadReminders()
    syncWithSupabase()
    document.title = "My Dashboard"
    const syncInterval = setInterval(() => {
      syncWithSupabase()
      loadGoals()
      loadHealth()
      loadGym()
      loadSleepLog()
      loadReminders()
    }, 30000)
    return () => clearInterval(syncInterval)
  }, [loadGoals, loadHealth, loadGym, loadSleepLog, loadReminders, syncWithSupabase])

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/jpeg" href="/app-icon.jpg" />
        <link rel="apple-touch-icon" href="/app-icon.jpg" />
        <meta name="theme-color" content="#050506" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <Sidebar />
        <CommandPalette />
        <AIPanel />
        <SwipeHandler />

        <div
          style={{
            marginLeft: isMobile ? 0 : (sidebarOpen ? 240 : 72),
            transition: "margin-left 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          className="min-h-screen"
        >
          <TopNav />
          <main className="p-3 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
