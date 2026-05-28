"use client"

import { useMemo } from "react"
import { useStore } from "@/lib/store"
import { Flame } from "lucide-react"

function toDateStr(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const DAYS = ["Mon", "", "Wed", "", "Fri", "", "Sun"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function GymCalendar() {
  const logs = useStore(s => s.gym.logs)

  const { dateMap, streak, total30, weekCounts } = useMemo(() => {
    const map = new Map<string, number>()
    for (const log of logs) {
      const key = toDateStr(log.at)
      map.set(key, (map.get(key) || 0) + 1)
    }

    const today = new Date()
    let streak = 0
    const cursor = new Date(today)
    while (true) {
      const key = formatDate(cursor)
      if (map.has(key)) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
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

    return { dateMap: map, streak, total30, weekCounts }
  }, [logs])

  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const start = new Date(today)
  start.setDate(start.getDate() - mondayOffset - 83)
  start.setHours(0, 0, 0, 0)

  const cells: { date: Date; level: number }[] = []
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1

  for (let w = 0; w < 12; w++) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start)
      dt.setDate(dt.getDate() + w * 7 + d)
      const key = formatDate(dt)
      const count = dateMap.get(key) || 0
      cells.push({ date: dt, level: count > 5 ? 4 : count > 3 ? 3 : count > 1 ? 2 : count > 0 ? 1 : 0 })
    }
    const monthStart = new Date(start)
    monthStart.setDate(monthStart.getDate() + w * 7)
    if (monthStart.getMonth() !== lastMonth) {
      monthLabels.push({ label: MONTHS[monthStart.getMonth()], col: w })
      lastMonth = monthStart.getMonth()
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-brand-400" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Streak</span>
          </div>
          <span className="text-[32px] font-bold tabular-nums text-white/90">{streak}</span>
          <span className="text-xs text-white/40 ml-1">days</span>
        </div>
        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase block mb-1">Past 30 Days</span>
          <span className="text-[32px] font-bold tabular-nums text-white/90">{total30}</span>
          <span className="text-xs text-white/40 ml-1">workouts</span>
        </div>
        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] sm:col-span-2">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase block mb-1">Consistency</span>
          <span className="text-[32px] font-bold tabular-nums">{logs.length > 0 ? "Active" : "No data"}</span>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] overflow-x-auto">
        <div className="flex items-end gap-[3px]" style={{ minWidth: 560 }}>
          <div className="flex flex-col gap-[3px] mr-1 pt-5">
            {DAYS.map((d, i) => (
              <div key={i} className="h-[14px] text-[10px] text-white/30 font-mono leading-[14px]">{d}</div>
            ))}
          </div>
          {Array.from({ length: 12 }).map((_, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              <div className="h-[14px] text-[10px] text-white/40 font-mono text-center leading-[14px]">
                {monthLabels.find(m => m.col === w)?.label || ""}
              </div>
              {Array.from({ length: 7 }).map((_, d) => {
                const cell = cells[w * 7 + d]
                const isToday = formatDate(cell.date) === formatDate(today)
                return (
                  <div
                    key={d}
                    title={`${formatDate(cell.date)}: ${cell.level > 0 ? `${dateMap.get(formatDate(cell.date))} sets` : "Rest"}`}
                    className={`w-[14px] h-[14px] rounded-[3px] ${
                      cell.level === 0 ? "bg-white/[0.04]" :
                      cell.level === 1 ? "bg-brand-900/40" :
                      cell.level === 2 ? "bg-brand-700/50" :
                      cell.level === 3 ? "bg-brand-500/60" :
                      "bg-brand-400/80"
                    } ${isToday ? "ring-1 ring-white/40" : ""}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-white/30">Less</span>
          <div className="w-[14px] h-[14px] rounded-[3px] bg-white/[0.04]" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-brand-900/40" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-brand-700/50" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-brand-500/60" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-brand-400/80" />
          <span className="text-[10px] text-white/30">More</span>
        </div>
      </div>
    </div>
  )
}
