"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, Plus, Trash2, Flame } from "lucide-react"
import { markModified } from "@/lib/store"

interface Habit {
  id: string
  name: string
  category: "health" | "learning" | "productivity" | "mindfulness"
  streak: number
  logs: string[] // ISO date strings
  createdAt: number
}

const HABITS_KEY = "lifeos_habits"

function loadHabits(): Habit[] {
  try { return JSON.parse(localStorage.getItem(HABITS_KEY) || "[]") }
  catch { return [] }
}

function saveHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

const defaultHabits = [
  { name: "Read", category: "learning" as const },
  { name: "Code", category: "productivity" as const },
  { name: "Study", category: "learning" as const },
  { name: "Meditate", category: "mindfulness" as const },
  { name: "Drink Water", category: "health" as const },
  { name: "Sleep 8h", category: "health" as const },
]

const categoryColors: Record<string, string> = {
  health: "var(--success)",
  learning: "var(--accent)",
  productivity: "var(--brand)",
  mindfulness: "var(--warning)",
}

export function HabitsModule() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newName, setNewName] = useState("")
  const [newCategory, setNewCategory] = useState<Habit["category"]>("health")
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    const existing = loadHabits()
    if (existing.length === 0) {
      const created = defaultHabits.map(h => ({
        id: `hab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: h.name,
        category: h.category,
        streak: 0,
        logs: [],
        createdAt: Date.now(),
      }))
      saveHabits(created)
      setHabits(created)
    } else {
      setHabits(existing)
    }
  }, [])

  const today = new Date().toISOString().slice(0, 10)

  const toggleHabit = (id: string) => {
    const updated = habits.map(h => {
      if (h.id !== id) return h
      const logged = h.logs.includes(today)
      const logs = logged ? h.logs.filter(d => d !== today) : [...h.logs, today]
      const streak = calculateStreak(logs)
      return { ...h, logs, streak }
    })
    setHabits(updated)
    saveHabits(updated)
    markModified(HABITS_KEY)
  }

  const addHabit = () => {
    if (!newName.trim()) return
    const habit: Habit = {
      id: `hab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newName.trim(),
      category: newCategory,
      streak: 0,
      logs: [],
      createdAt: Date.now(),
    }
    const updated = [...habits, habit]
    setHabits(updated)
    saveHabits(updated)
    markModified(HABITS_KEY)
    setNewName("")
    setShowAdd(false)
  }

  const removeHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id)
    setHabits(updated)
    saveHabits(updated)
    markModified(HABITS_KEY)
  }

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-orange-400" />
          <h3 className="section-title text-sm">Habits</h3>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addHabit()}
                placeholder="New habit..."
                className="flex-1 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-white/30"
              />
              <div className="flex gap-2">
                <select value={newCategory} onChange={e => setNewCategory(e.target.value as Habit["category"])}
                  className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 outline-none"
                >
                  <option value="health">Health</option>
                  <option value="learning">Learning</option>
                  <option value="productivity">Productivity</option>
                  <option value="mindfulness">Mindfulness</option>
                </select>
                <button onClick={addHabit} className="h-8 px-3 rounded-lg bg-brand text-black text-xs font-bold hover:bg-brand/90 transition-colors">Add</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5">
        {habits.map((habit) => {
          const done = habit.logs.includes(today)
          return (
            <motion.div key={habit.id} layout
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <button onClick={() => toggleHabit(habit.id)} className="flex-shrink-0">
                {done
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: categoryColors[habit.category] }} />
                  : <Circle className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                }
              </button>
              <span className={`text-sm flex-1 ${done ? "line-through text-white/30" : "text-white/80"}`}>
                {habit.name}
              </span>
              <div className="flex items-center gap-1.5">
                {habit.streak > 0 && (
                  <span className="text-[11px] font-semibold text-orange-400">{habit.streak}d</span>
                )}
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[habit.category] }} />
              </div>
              <button onClick={() => removeHabit(habit.id)}
                className="h-8 w-8 rounded flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-white/10 transition-all"
                aria-label="Remove habit"
              >
                <Trash2 className="w-3.5 h-3.5 text-white/30 hover:text-red-400" />
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function calculateStreak(logs: string[]): number {
  if (logs.length === 0) return 0
  const sorted = [...new Set(logs)].sort().reverse()
  let streak = 0
  const today = new Date()
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today.getTime() - i * 86400000).toISOString().slice(0, 10)
    if (sorted[i] === expected) streak++
    else break
  }
  return streak
}
