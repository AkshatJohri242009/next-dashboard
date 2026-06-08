"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { ROUTES } from "@/lib/routes"
import { LayoutDashboard, PenSquare, Flame, Bot, Zap, Target, Heart, GripHorizontal } from "lucide-react"

const navItems = [
  { href: ROUTES.HOME, label: "Home", icon: LayoutDashboard },
  { href: ROUTES.JOURNAL, label: "Journal", icon: PenSquare },
  { href: ROUTES.HABITS, label: "Habits", icon: Flame },
  { href: ROUTES.MISSIONS, label: "Missions", icon: Target },
  { href: ROUTES.HEALTH, label: "Health", icon: Heart },
  { href: ROUTES.ODYSSEY, label: "JARVIS", icon: Bot },
  { href: ROUTES.VOICE, label: "Voice", icon: Zap },
]

const HANDLE_H = 20
const NAV_H = 88

export function MobileNav() {
  const pathname = usePathname()
  const { mode, navPosition, setNavPosition } = useStore()
  const [isMobile, setIsMobile] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0, moved: false })
  const handleRef = useRef<HTMLDivElement>(null)
  const lastTapRef = useRef(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const clamp = useCallback((x: number, y: number) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const navW = navItems.length * 60 + 40
    return {
      x: Math.max(-navW / 2 + 60, Math.min(vw - navW / 2 - 60, x)),
      y: Math.max(8, Math.min(vh - NAV_H - 16, y)),
    }
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Double-tap/double-click to reset position
    const now = Date.now()
    if (now - lastTapRef.current < 400) {
      // Reset to default (right edge, ~40% from top)
      setNavPosition({ x: window.innerWidth - navItems.length * 60 - 80, y: Math.max(8, window.innerHeight * 0.4 - NAV_H / 2) })
      lastTapRef.current = 0
      return
    }
    lastTapRef.current = now

    e.preventDefault()
    handleRef.current?.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: navPosition.x,
      posY: navPosition.y,
      moved: false,
    }
    setDragging(true)
  }, [navPosition, setNavPosition])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true
    const clamped = clamp(dragRef.current.posX + dx, dragRef.current.posY + dy)
    setNavPosition(clamped)
  }, [dragging, setNavPosition, clamp])

  const onPointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  if (mode === "study") return null

  // Mobile: fixed bottom-center, no drag
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-3 py-2 h-[88px] glass-strong border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-0 px-2 py-1 rounded-xl transition-colors",
                active ? "text-brand-400" : "text-text-tertiary hover:text-text-secondary",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-50 select-none"
      style={{
        left: navPosition.x,
        top: navPosition.y,
        transition: dragging ? "none" : "left 0.35s cubic-bezier(0.22, 1, 0.36, 1), top 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        className={cn(
          "glass-strong rounded-2xl border border-white/[0.08] transition-[transform,opacity] duration-150",
          dragging && "scale-[1.03] opacity-80",
        )}
        style={{ willChange: dragging ? "transform" : "auto" }}
      >
        {/* Drag handle — top-right, only this initiates drag */}
        <div
          ref={handleRef}
          className="absolute -top-2.5 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <GripHorizontal size={13} className="text-text-muted" />
          <span className="text-[9px] font-medium text-text-muted tracking-wider uppercase">Move</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1 px-4 py-3 h-[88px]">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  // If user was just dragging, don't navigate
                  if (dragRef.current.moved) {
                    e.preventDefault()
                    dragRef.current.moved = false
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-14 h-16 rounded-xl transition-colors",
                  active
                    ? "text-brand-400 bg-brand/10"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[12px] font-medium leading-tight text-center">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}