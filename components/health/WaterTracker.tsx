"use client"

import { motion } from "framer-motion"
import { Droplets, Plus, RotateCcw } from "lucide-react"
import { useStore } from "@/lib/store"
import { waterGoalMl } from "@/lib/utils"

export function WaterTracker() {
  const { health, updateHealth, addWater, resetWater } = useStore()
  const goalMl = waterGoalMl(health)
  const done = health.waterMl || 0
  const pct = goalMl > 0 ? Math.min(100, (done / goalMl) * 100) : 0

  const fields = [
    { id: "weight" as const, label: "Weight kg", min: 20, max: 250, step: 0.1 },
    { id: "age" as const, label: "Age", min: 8, max: 100, step: 1 },
    { id: "activity" as const, label: "Workout hrs", min: 0, max: 12, step: 0.25 },
    { id: "caffeine" as const, label: "Caffeine mg", min: 0, max: 1200, step: 25 },
    { id: "stimulants" as const, label: "Stimulants", min: 0, max: 10, step: 0.5 },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
        {fields.map(f => (
          <label key={f.id} className="flex flex-col gap-1">
            <span className="text-xs font-mono font-extrabold tracking-wider text-white/30 uppercase">{f.label}</span>
            <input
              type="number"
              min={f.min} max={f.max} step={f.step}
              value={health[f.id]}
              onChange={e => updateHealth({ [f.id]: Number(e.target.value) })}
              className="h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white outline-none focus:border-white/20 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </label>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-xl p-4"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[42px] font-bold leading-none tracking-tight tabular-nums">
                {(done / 1000).toFixed(1)}
              </span>
              <span className="text-lg text-white/30">L</span>
              <span className="text-lg text-white/20 mx-1">/</span>
              <span className="text-lg font-bold tabular-nums">{(goalMl / 1000).toFixed(1)}</span>
              <span className="text-lg text-white/30">L</span>
            </div>
            <span className="text-xs text-white/40">
              {done >= goalMl
                ? "Target reached. Keep sipping lightly."
                : `${Math.max(0, Math.ceil((goalMl - done) / 300))} cups to reach the healthy zone.`}
            </span>
          </div>
          <button
            onClick={() => addWater(300)}
            className="h-11 px-5 rounded-xl bg-brand-500 text-black text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:bg-brand-400 hover:scale-[1.03] active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" />
            300ml
          </button>
        </div>

        <div className="mt-3 h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-400"
          />
        </div>

        <div className="flex gap-2 mt-3">
          {[250, 500].map(ml => (
            <button
              key={ml}
              onClick={() => addWater(ml)}
              className="h-10 sm:h-8 flex-1 sm:flex-none px-4 sm:px-3 rounded-xl text-xs font-bold text-white/50 bg-white/[0.04] border border-white/[0.06] hover:text-white/80 hover:bg-white/[0.08] transition-colors"
            >
              +{ml}ml
            </button>
          ))}
          <button
            onClick={resetWater}
            className="h-10 sm:h-8 flex-1 sm:flex-none px-4 sm:px-3 rounded-xl text-xs font-bold text-white/30 bg-white/[0.04] border border-white/[0.06] hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            Reset
          </button>
        </div>
      </motion.div>
    </div>
  )
}
