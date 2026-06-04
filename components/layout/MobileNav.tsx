"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { ROUTES } from "@/lib/routes"
import { LayoutDashboard, PenSquare, Flame, Bot, Zap } from "lucide-react"

const navItems = [
  { href: ROUTES.HOME, label: "Home", icon: LayoutDashboard },
  { href: ROUTES.JOURNAL, label: "Journal", icon: PenSquare },
  { href: ROUTES.HABITS, label: "Habits", icon: Flame },
  { href: ROUTES.ODYSSEY, label: "JARVIS", icon: Bot },
  { href: ROUTES.VOICE, label: "Voice", icon: Zap },
]

export function MobileNav() {
  const pathname = usePathname()
  const { mode } = useStore()

  if (mode === "study") return null

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 glass-strong border-t-0 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 h-11 rounded-xl transition-colors",
              active
                ? "text-brand-400"
                : "text-white/40 hover:text-white/70",
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-none">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
