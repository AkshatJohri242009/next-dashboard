"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/lib/store"
import type { Goal, TickerItem } from "@/lib/types"

function buildItems(goals: Goal[]): { items: TickerItem[]; meta: string } {
  const total = goals.length
  const done = goals.filter(g => g.done).length
  if (total === 0) return { items: [{ status: "empty", text: "No goals set for today — add one to get rolling." }], meta: "0/0" }
  if (done === total) return { items: [{ status: "done", text: "All goals done — solid day." }], meta: `${done}/${total}` }
  return {
    items: goals.filter(g => !g.done).map(g => ({ status: "pending" as const, text: g.text })),
    meta: `${done}/${total}`,
  }
}

export function GoalTicker() {
  const goals = useStore(s => s.goals)
  const [idx, setIdx] = useState(0)
  const { items, meta } = buildItems(goals)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    setIdx(0)
  }, [goals.length])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIdx(i => (i + 1) % Math.max(1, items.length))
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [items.length])

  const current = items[idx] || items[0]

  return (
    <div className="flex items-center gap-3 px-4 h-11 rounded-2xl glass overflow-hidden relative">
      <div className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(107,227,164,0.6)] shrink-0" />
      <span className="text-[10px] font-bold font-mono text-white/30 tracking-widest shrink-0">GOALS</span>

      <div className="flex-1 relative h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.text ?? "empty"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center gap-2"
          >
            <span className={`text-sm ${current?.status === "empty" ? "text-white/30" : current?.status === "done" ? "text-brand-400" : "text-white/80"}`}>
              {current?.status === "done" ? "✓" : current?.status === "pending" ? "○" : "."}
            </span>
            <span className="text-sm text-white/70 truncate">{current?.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <span className="text-[11px] font-mono font-bold text-white/40 px-2 py-1 rounded-lg bg-white/[0.04] shrink-0">
        {meta}
      </span>
    </div>
  )
}
