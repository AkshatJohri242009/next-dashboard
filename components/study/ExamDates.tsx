"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { markModified } from "@/lib/store"
import type { ExamDate } from "@/lib/study-types"

const STORAGE_KEY = "exam_dates_v1"

function storeGet<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}
function storeSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
  localStorage.setItem("_ts:" + key, new Date().toISOString())
  markModified(key)
}

export function ExamDates() {
  const [exams, setExams] = useState<ExamDate[]>([])
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = storeGet<ExamDate[]>(STORAGE_KEY) || []
    setExams(saved)
  }, [])

  useEffect(() => {
    storeSet(STORAGE_KEY, exams)
  }, [exams])

  function add() {
    if (!title.trim() || !date) return
    const exam: ExamDate = {
      id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      date,
      createdAt: Date.now(),
    }
    setExams(prev => [...prev, exam])
    setTitle("")
    setDate("")
    titleRef.current?.focus()
  }

  function remove(id: string) {
    setExams(prev => prev.filter(e => e.id !== id))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const withDays = exams.map(e => {
    const d = new Date(e.date + "T00:00:00")
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
    return { ...e, daysUntil: diff }
  })

  const upcoming = withDays.filter(e => e.daysUntil >= 0).sort((a, b) => a.daysUntil - b.daysUntil)
  const past = withDays.filter(e => e.daysUntil < 0).sort((a, b) => b.daysUntil - a.daysUntil)

  const total = exams.length
  const soon = upcoming.filter(e => e.daysUntil <= 7).length
  const nearest = upcoming[0]

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">
          Exam Dates
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <Calendar className="w-4 h-4 text-brand-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{total}</span>
          <span className="text-[10px] font-mono text-white/30">Exams</span>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <Clock className="w-4 h-4 text-amber-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{soon}</span>
          <span className="text-[10px] font-mono text-white/30">Within 7d</span>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <AlertTriangle className="w-4 h-4 text-red-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">
            {nearest ? `${nearest.daysUntil}d` : "--"}
          </span>
          <span className="text-[10px] font-mono text-white/30">Nearest</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Exam title..."
          className="flex-1 h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-colors"
          onKeyDown={e => { if (e.key === "Enter") add() }}
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="h-11 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-colors [color-scheme:dark] sm:w-[140px] min-w-0"
        />
        <button
          onClick={add}
          className="h-11 w-11 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center hover:bg-brand-500/30 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-brand-300" />
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
        {exams.length === 0 && (
          <p className="text-sm text-white/20 text-center py-6">No exams yet — add one above</p>
        )}
        {upcoming.map((exam) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
          >
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-white/70 block truncate">{exam.title}</span>
              <span className="text-[11px] font-mono text-white/30">
                {exam.date} · {exam.daysUntil === 0 ? "Today!" : `${exam.daysUntil}d away`}
              </span>
            </div>
            <button
              onClick={() => remove(exam.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 h-8 w-8 flex items-center justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
        {past.map((exam) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group opacity-50"
          >
            <CheckCircle className="w-4 h-4 text-white/20 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-white/40 block truncate line-through">{exam.title}</span>
              <span className="text-[11px] font-mono text-white/20">
                {exam.date} · {Math.abs(exam.daysUntil)}d ago
              </span>
            </div>
            <button
              onClick={() => remove(exam.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 h-8 w-8 flex items-center justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
