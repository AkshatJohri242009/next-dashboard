"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { ROUTES } from "@/lib/routes"
import { LayoutDashboard, PenSquare, Flame, Bot, Zap, Target, Heart, GripHorizontal, GripVertical, ArrowLeftRight } from "lucide-react"

const navItems = [
  { href: ROUTES.HOME, label: "Home", icon: LayoutDashboard },
  { href: ROUTES.JOURNAL, label: "Journal", icon: PenSquare },
  { href: ROUTES.HABITS, label: "Habits", icon: Flame },
  { href: ROUTES.MISSIONS, label: "Missions", icon: Target },
  { href: ROUTES.HEALTH, label: "Health", icon: Heart },
  { href: ROUTES.ODYSSEY, label: "JARVIS", icon: Bot },
  { href: ROUTES.VOICE, label: "Voice", icon: Zap },
]

export function MobileNav() {
  const pathname = usePathname()
  const { mode, navOrientation, setNavOrientation, navPosition, setNavPosition } = useStore()
  const navRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 })

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    navRef.current?.setPointerCapture(e.pointerId)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: navPosition.x,
      posY: navPosition.y,
    }
    setDragging(true)
  }, [navPosition])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setNavPosition({
      x: dragStart.current.posX + dx,
      y: dragStart.current.posY + dy,
    })
  }, [dragging, setNavPosition])

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  if (mode === "study") return null

  const isVertical = navOrientation === "vertical"

  if (isVertical) {
    return (
      <div
        ref={navRef}
        className="lg:hidden fixed z-50 flex flex-col"
        style={{
          right: `${Math.max(8, navPosition.x)}px`,
          bottom: `${navPosition.y === 0 ? 80 : Math.max(80, navPosition.y)}px`,
          transform: dragging ? "scale(1.02)" : "scale(1)",
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        {/* Top bar with drag handle + orientation toggle */}
        <div
          className="flex items-center justify-end gap-1 px-2 py-1 rounded-t-xl cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <button
            onClick={() => setNavOrientation("horizontal")}
            className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-text-secondary transition-colors"
            title="Switch to horizontal"
          >
            <ArrowLeftRight size={14} />
          </button>
          <GripVertical size={14} className="text-text-muted" />
        </div>

        <nav className="glass-strong rounded-2xl border border-white/[0.08] flex flex-col items-center gap-1 px-2 py-3">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-colors",
                  active
                    ? "text-brand-400 bg-brand/10"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    )
  }

  return (
    <div
      ref={navRef}
      className="lg:hidden fixed z-50"
      style={{
        left: `${Math.max(0, navPosition.x)}px`,
        right: `${Math.max(0, -navPosition.x)}px`,
        bottom: `${Math.max(0, navPosition.y)}px`,
        transform: dragging ? "scale(1.02)" : "scale(1)",
        transition: dragging ? "none" : "transform 0.2s ease",
      }}
    >
      {/* Drag handle bar */}
      <div
        className="flex items-center justify-end gap-1 px-3 py-0.5 cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <button
          onClick={() => setNavOrientation("vertical")}
          className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-text-secondary transition-colors"
          title="Switch to vertical"
        >
          <ArrowLeftRight size={14} />
        </button>
        <GripHorizontal size={16} className="text-text-muted" />
      </div>

      <nav className="glass-strong rounded-2xl border border-white/[0.08] flex items-center justify-around px-2 h-20 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 h-14 rounded-xl transition-colors",
                active
                  ? "text-brand-400 bg-brand/10"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}