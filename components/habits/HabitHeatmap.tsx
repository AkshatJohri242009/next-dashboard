"use client"

import { useState, useMemo, useEffect } from "react"
import { Flame, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { onDataChanged } from "@/lib/events"

interface Habit {
  id: string
  name: string
  category: "health" | "learning" | "productivity" | "mindfulness"
  streak: number
  logs: string[]
  createdAt: number
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Mon", "", "Wed", "", "Fri", "", "Sun"]

const CATEGORIES = [
  { key: "all", label: "All", color: "var(--brand)" },
  { key: "health", label: "Health", color: "var(--success)" },
  { key: "learning", label: "Learning", color: "var(--accent)" },
  { key: "productivity", label: "Productivity", color: "var(--brand)" },
  { key: "mindfulness", label: "Mindfulness", color: "var(--warning)" },
] as const

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function loadHabits(): Habit[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem("lifeos_habits") || "[]") }
  catch { return [] }
}

export function HabitHeatmap() {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [habits, setHabits] = useState<Habit[]>(loadHabits)

  useEffect(() => {
    const check = () => setHabits(loadHabits())
    check()
    window.addEventListener("focus", check)
    window.addEventListener("storage", check)
    const unsub = onDataChanged(({ keys }) => {
      if (keys.includes("lifeos_habits")) check()
    })
    return () => {
      window.removeEventListener("focus", check)
      window.removeEventListener("storage", check)
      unsub()
    }
  }, [])

  const { dateMap, streak, total30, weekCounts, consistency } = useMemo(() => {
    const filtered = activeCategory === "all" ? habits : habits.filter(h => h.category === activeCategory)
    const map = new Map<string, string[]>()
    for (const habit of filtered) {
      for (const date of habit.logs) {
        const existing = map.get(date)
        if (existing) existing.push(habit.name)
        else map.set(date, [habit.name])
      }
    }

    const today = new Date()
    let streak = 0
    const cursor = new Date(today)
    while (true) {
      const key = formatDate(cursor)
      if (map.has(key)) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else break
    }

    let total30 = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (map.has(formatDate(d))) total30++
    }

    const weekCounts: number[] = []
    const start = new Date(today)
    const dayOfWeek = start.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    start.setDate(start.getDate() - mondayOffset - 83)
    start.setHours(0, 0, 0, 0)
    for (let w = 0; w < 12; w++) {
      let count = 0
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start)
        dt.setDate(dt.getDate() + w * 7 + d)
        if (map.has(formatDate(dt))) count++
      }
      weekCounts.push(count)
    }

    return { dateMap: map, streak, total30, weekCounts, consistency: Math.round((total30 / 30) * 100) }
  }, [habits, activeCategory])

  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const start = new Date(today)
  start.setDate(start.getDate() - mondayOffset - 83)
  start.setHours(0, 0, 0, 0)

  const cells: { date: Date; count: number; names: string[] }[] = []
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1

  for (let w = 0; w < 12; w++) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start)
      dt.setDate(dt.getDate() + w * 7 + d)
      const key = formatDate(dt)
      const names = dateMap.get(key) || []
      cells.push({ date: dt, count: names.length, names })
    }
    const monthStart = new Date(start)
    monthStart.setDate(monthStart.getDate() + w * 7)
    if (monthStart.getMonth() !== lastMonth) {
      monthLabels.push({ label: MONTHS[monthStart.getMonth()], col: w })
      lastMonth = monthStart.getMonth()
    }
  }

  const maxCount = Math.max(1, ...cells.map(c => c.count))

  const getLevel = (count: number): number => {
    if (count === 0) return 0
    const ratio = count / maxCount
    if (ratio <= 0.25) return 1
    if (ratio <= 0.5) return 2
    if (ratio <= 0.75) return 3
    return 4
  }

  const levelColor = (level: number): string => {
    switch (level) {
      case 0: return "bg-white/[0.04]"
      case 1: return "bg-brand-900/40"
      case 2: return "bg-brand-700/50"
      case 3: return "bg-brand-500/60"
      case 4: return "bg-brand-400/80"
      default: return "bg-white/[0.04]"
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="section-label">Streak</span>
          </div>
          <span className="text-[32px] font-bold tabular-nums text-white/90">{streak}</span>
          <span className="text-xs text-text-tertiary ml-1">days</span>
        </div>
        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono font-extrabold tracking-widest text-text-tertiary uppercase block mb-1">Past 30 Days</span>
          <span className="text-[32px] font-bold tabular-nums text-white/90">{total30}</span>
          <span className="text-xs text-text-tertiary ml-1">days</span>
        </div>
        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono font-extrabold tracking-widest text-text-tertiary uppercase block mb-1">Consistency</span>
          <span className="text-[32px] font-bold tabular-nums">{consistency}%</span>
        </div>
        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-brand-400" />
            <span className="section-label">Today</span>
          </div>
          <span className="text-[32px] font-bold tabular-nums text-brand-400">{dateMap.get(formatDate(today))?.length || 0}</span>
          <span className="text-xs text-text-tertiary ml-1">habits</span>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeCategory === cat.key
                ? "bg-white/10 text-white"
                : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] overflow-x-auto">
        <div className="flex items-end gap-[3px]" style={{ minWidth: 248 }}>
          <div className="flex flex-col gap-[3px] mr-1 pt-5">
            {DAYS.map((d, i) => (
              <div key={i} className="h-[14px] text-xs text-text-tertiary font-mono leading-[14px]">{d}</div>
            ))}
          </div>
          {Array.from({ length: 12 }).map((_, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              <div className="h-[14px] text-xs text-text-tertiary font-mono text-center leading-[14px]">
                {monthLabels.find(m => m.col === w)?.label || ""}
              </div>
              {Array.from({ length: 7 }).map((_, d) => {
                const cell = cells[w * 7 + d]
                const isToday = formatDate(cell.date) === formatDate(today)
                return (
                  <div
                    key={d}
                    title={`${formatDate(cell.date)}: ${cell.count > 0 ? `${cell.count} habits (${cell.names.join(", ")})` : "No habits"}`}
                    className={cn(
                      "w-[14px] h-[14px] rounded-[3px] transition-colors",
                      levelColor(getLevel(cell.count)),
                      isToday && "ring-1 ring-white/40"
                    )}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-xs text-text-tertiary">Less</span>
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white/[0.04]" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-brand-900/40" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-brand-700/50" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-brand-500/60" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-brand-400/80" />
          <span className="text-xs text-text-tertiary">More</span>
        </div>
      </div>
    </div>
  )
}
