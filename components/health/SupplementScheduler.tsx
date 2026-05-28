"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const windows = [
  { id: "morning", title: "Morning", time: "07:00-10:00", hourStart: 7, hourEnd: 10, items: ["Electrolytes", "Vitamin D", "Creatine"] },
  { id: "lunch", title: "Lunch", time: "12:00-15:00", hourStart: 12, hourEnd: 15, items: ["Omega-3", "Magnesium", "Protein"] },
  { id: "evening", title: "Evening", time: "19:00-22:00", hourStart: 19, hourEnd: 22, items: ["Zinc", "Sleep stack", "Stretch reset"] },
]

export function SupplementScheduler() {
  const { health, toggleSupp, toggleLow } = useStore()
  const [today, setToday] = useState("")
  const [hour, setHour] = useState(-1)

  useEffect(() => {
    const now = new Date()
    setToday(now.toISOString().slice(0, 10))
    setHour(now.getHours())
    const timer = setInterval(() => {
      const n = new Date()
      setToday(n.toISOString().slice(0, 10))
      setHour(n.getHours())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {windows.map((win, wi) => {
        const active = hour >= win.hourStart && hour < win.hourEnd
        const hasMissed = active && win.items.some(it => !health.done[`${today}:${win.id}:${it}`])
        return (
          <motion.div
            key={win.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: wi * 0.08 }}
            className={cn(
              "rounded-xl p-4 border transition-all duration-300",
              hasMissed
                ? "border-red-400/30 bg-red-500/5 animate-pulse"
                : active
                ? "border-brand-400/20 bg-brand-500/5"
                : "border-white/[0.06] bg-white/[0.02]",
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white/80">{win.title}</span>
              <span className="text-[10px] font-mono text-white/30">{win.time}</span>
            </div>
            <div className="space-y-2">
              {win.items.map(item => {
                const key = `${today}:${win.id}:${item}`
                return (
                  <div key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!health.done[key]}
                      onChange={() => toggleSupp(key)}
                      className="w-4 h-4 rounded accent-brand-400 cursor-pointer"
                    />
                    <span className="flex-1 text-sm text-white/60">{item}</span>
                    <button
                      onClick={() => toggleLow(item)}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors",
                        health.low[item] ? "bg-amber-400/20 text-amber-400" : "bg-white/[0.05] text-white/30",
                      )}
                    >
                      {health.low[item] ? "LOW" : "OK"}
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
