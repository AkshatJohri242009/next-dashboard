"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Target } from "lucide-react"
import { useStore } from "@/lib/store"
import { parseReps, targetHit } from "@/lib/utils"

const exercises = ["Bench Press", "Squat", "Deadlift", "Overhead Press", "Lat Pulldown", "Row"]
const splits = ["Push Day", "Pull Day", "Leg Day", "Gym Home", "School Gym"]

export function WorkoutLog() {
  const { gym, setSplit, addLog, deleteLog } = useStore()
  const [exercise, setExercise] = useState("Bench Press")
  const [sets, setSets] = useState(3)
  const [weight, setWeight] = useState(40)
  const [reps, setReps] = useState("8,8,8")

  const handleAdd = () => {
    addLog({
      exercise,
      split: gym.split,
      sets: Number(sets) || 1,
      weight: Number(weight) || 0,
      reps: parseReps(reps),
      at: Date.now(),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {splits.map(s => (
          <button
            key={s}
            onClick={() => setSplit(s)}
            className={`h-8 px-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold font-mono tracking-wider uppercase transition-colors ${
              gym.split === s
                ? "bg-brand-500 text-black"
                : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/70"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
        <select
          value={exercise}
          onChange={e => setExercise(e.target.value)}
          className="col-span-2 sm:col-auto h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white outline-none"
        >
          {exercises.map(e => <option key={e}>{e}</option>)}
        </select>
        <input type="number" min={1} max={10} value={sets} onChange={e => setSets(Number(e.target.value))}
          className="h-10 w-full sm:w-16 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white outline-none text-center" />
        <input type="number" min={0} step={0.5} value={weight} onChange={e => setWeight(Number(e.target.value))}
          className="h-10 w-full sm:w-20 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white outline-none text-center" />
        <input value={reps} onChange={e => setReps(e.target.value)}
          className="h-10 w-full sm:w-24 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white outline-none text-center" />
        <button
          onClick={handleAdd}
          className="col-span-2 sm:col-auto h-10 px-4 rounded-xl bg-brand-500 text-black text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Set
        </button>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {gym.logs.slice().reverse().map((log, ri) => {
            const idx = gym.logs.length - 1 - ri
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="min-w-0">
                  <span className="text-sm font-bold text-white/80">{log.exercise}</span>
                  <span className="text-xs text-white/40 ml-2 font-mono whitespace-nowrap">
                    {log.split} · {log.sets} sets · {log.weight}kg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {targetHit(log) && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400/10 text-amber-400 text-[10px] font-bold">
                      <Target className="w-3 h-3" />
                      +2kg
                    </span>
                  )}
                  <button onClick={() => deleteLog(idx)} className="h-9 w-9 sm:h-7 sm:w-7 rounded-xl sm:rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {gym.logs.length === 0 && (
          <div className="py-6 text-center text-sm text-white/30 italic">No workout entries yet.</div>
        )}
      </div>
    </div>
  )
}
