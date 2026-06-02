"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Brain, Target, AlertTriangle } from "lucide-react"
import { markModified, autoSync } from "@/lib/store"
import type { StudyScore, StudyError } from "@/lib/study-types"

const SCORES_KEY = "study_scores_v1"
const ERRORS_KEY = "study_errors_v1"

function storeGet<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}
function storeSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
  localStorage.setItem("_ts:" + key, new Date().toISOString())
  markModified(key); autoSync()
}

export function StudyStats() {
  const [scores, setScores] = useState<StudyScore[]>([])
  const [errors, setErrors] = useState<StudyError[]>([])
  const [scoreType, setScoreType] = useState<"test" | "mock">("test")
  const [subject, setSubject] = useState("")
  const [score, setScore] = useState("")
  const [total, setTotal] = useState("")
  const [errorSubject, setErrorSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    setScores(storeGet<StudyScore[]>(SCORES_KEY) || [])
    setErrors(storeGet<StudyError[]>(ERRORS_KEY) || [])
  }, [])

  useEffect(() => { storeSet(SCORES_KEY, scores) }, [scores])
  useEffect(() => { storeSet(ERRORS_KEY, errors) }, [errors])

  function addScore() {
    if (!subject.trim() || !score || !total) return
    const s: StudyScore = {
      id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: scoreType, subject: subject.trim(),
      score: parseFloat(score), total: parseFloat(total),
      date: new Date().toISOString().slice(0, 10), createdAt: Date.now(),
    }
    setScores(prev => [s, ...prev])
    setSubject(""); setScore(""); setTotal("")
  }

  function deleteScore(id: string) {
    setScores(prev => prev.filter(s => s.id !== id))
  }

  function addError() {
    if (!errorSubject.trim() || !topic.trim()) return
    const e: StudyError = {
      id: `er_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      subject: errorSubject.trim(), topic: topic.trim(),
      description: description.trim(),
      date: new Date().toISOString().slice(0, 10), createdAt: Date.now(),
    }
    setErrors(prev => [e, ...prev])
    setErrorSubject(""); setTopic(""); setDescription("")
  }

  function deleteError(id: string) {
    setErrors(prev => prev.filter(e => e.id !== id))
  }

  const avgPct = scores.length > 0
    ? (scores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0) / scores.length).toFixed(1)
    : "—"

  const recentErrors = errors.slice(0, 5)

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-brand-400" />
        <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Test & Mock Scores</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <Target className="w-4 h-4 text-brand-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{scores.length}</span>
          <span className="text-[10px] font-mono text-white/30">Entries</span>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <Brain className="w-4 h-4 text-accent-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{avgPct}%</span>
          <span className="text-[10px] font-mono text-white/30">Avg Score</span>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <AlertTriangle className="w-4 h-4 text-red-400 mx-auto" />
          <span className="block text-lg font-extrabold tabular-nums text-white/80">{errors.length}</span>
          <span className="text-[10px] font-mono text-white/30">Errors</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex bg-white/[0.04] rounded-xl p-0.5">
            <button onClick={() => setScoreType("test")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${scoreType === "test" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"}`}>Test</button>
            <button onClick={() => setScoreType("mock")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${scoreType === "mock" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"}`}>Mock</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full sm:flex-1 sm:min-w-[100px] h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 transition-colors" />
          <div className="flex gap-2 w-full sm:w-auto">
            <input value={score} onChange={e => setScore(e.target.value)} placeholder="Score" type="number" className="flex-1 sm:w-20 h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 transition-colors [appearance:textfield]" />
            <span className="flex items-center text-white/30 text-sm shrink-0">/</span>
            <input value={total} onChange={e => setTotal(e.target.value)} placeholder="Total" type="number" className="flex-1 sm:w-20 h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 transition-colors [appearance:textfield]" />
            <button onClick={addScore} className="h-10 px-3 rounded-xl bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30 hover:bg-brand-500/30 transition-colors flex items-center gap-1 shrink-0"><Plus className="w-3.5 h-3.5" /> Add</button>
          </div>
        </div>
      </div>

      <div className="max-h-[200px] overflow-y-auto space-y-1">
        {scores.length === 0 && <p className="text-sm text-white/20 text-center py-4">No scores logged yet</p>}
        {scores.map(s => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] group">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.type === "test" ? "bg-brand-400" : "bg-accent-400"}`} />
            <span className="text-[11px] font-mono text-white/30 w-16">{s.date}</span>
            <span className="text-sm text-white/70 flex-1 truncate">{s.subject}</span>
            <span className="text-sm font-bold text-white/80">{s.score}/{s.total}</span>
            <span className={`text-xs font-mono ${(s.score / s.total) >= 0.7 ? "text-brand-400" : (s.score / s.total) >= 0.4 ? "text-amber-400" : "text-red-400"}`}>
              {((s.score / s.total) * 100).toFixed(0)}%
            </span>
            <button onClick={() => deleteScore(s.id)} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center text-white/20 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" /></button>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Error Log</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <input value={errorSubject} onChange={e => setErrorSubject(e.target.value)} placeholder="Subject" className="w-full sm:flex-1 sm:min-w-[80px] h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 transition-colors" />
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic" className="flex-1 min-w-[80px] h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 transition-colors" />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Notes (opt)" className="flex-1 min-w-[80px] h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-brand-500/40 transition-colors max-sm:w-full" />
          <button onClick={addError} className="h-10 px-3 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-1 shrink-0"><Plus className="w-3.5 h-3.5" /> Log</button>
        </div>
        <div className="max-h-[200px] overflow-y-auto space-y-1">
          {errors.length === 0 && <p className="text-sm text-white/20 text-center py-4">No errors logged yet</p>}
          {recentErrors.map(e => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 px-3 py-2 rounded-xl bg-white/[0.02] group">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white/70 block truncate">{e.subject} — {e.topic}</span>
                {e.description && <span className="text-[11px] text-white/30 block truncate">{e.description}</span>}
              </div>
              <span className="text-[10px] font-mono text-white/20">{e.date}</span>
              <button onClick={() => deleteError(e.id)} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center text-white/20 hover:text-red-400 transition-all shrink-0"><Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" /></button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
