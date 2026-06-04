"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Plus, Trash2, Target, Brain, CheckCircle2, Circle } from "lucide-react"
import { markModified } from "@/lib/store"

interface Chapter {
  id: string
  subject: string
  name: string
  completed: boolean
  score: number | null
  date: string | null
}

interface Subject {
  name: string
  color: string
}

const SUBJECTS: Subject[] = [
  { name: "Physics", color: "var(--accent)" },
  { name: "Chemistry", color: "var(--success)" },
  { name: "Mathematics", color: "var(--brand)" },
  { name: "Computer Science", color: "var(--info)" },
]

const STORAGE_KEY = "lifeos_chapters"

function loadChapters(): Chapter[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

export function LearningOSModule() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].name)
  const [newName, setNewName] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [scoreInput, setScoreInput] = useState<Record<string, string>>({})

  useEffect(() => {
    setChapters(loadChapters())
  }, [])

  const save = (updated: Chapter[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    markModified(STORAGE_KEY)
    setChapters(updated)
  }

  const addChapter = () => {
    if (!newName.trim()) return
    const chapter: Chapter = {
      id: `ch_${Date.now()}`,
      subject: selectedSubject,
      name: newName.trim(),
      completed: false,
      score: null,
      date: null,
    }
    save([chapter, ...chapters])
    setNewName("")
    setShowAdd(false)
  }

  const toggleChapter = (id: string) => {
    const updated = chapters.map(c =>
      c.id === id ? { ...c, completed: !c.completed, date: !c.completed ? new Date().toISOString().slice(0, 10) : null } : c
    )
    save(updated)
  }

  const setScore = (id: string) => {
    const val = parseInt(scoreInput[id])
    if (isNaN(val) || val < 0 || val > 100) return
    const updated = chapters.map(c => c.id === id ? { ...c, score: val, completed: true, date: new Date().toISOString().slice(0, 10) } : c)
    save(updated)
    setScoreInput({ ...scoreInput, [id]: "" })
  }

  const deleteChapter = (id: string) => {
    save(chapters.filter(c => c.id !== id))
  }

  const filteredChapters = chapters.filter(c => c.subject === selectedSubject)
  const completed = filteredChapters.filter(c => c.completed).length
  const total = filteredChapters.length
  const avgScore = filteredChapters.filter(c => c.score !== null).reduce((a, c) => a + (c.score || 0), 0)
  const avgScoreCount = filteredChapters.filter(c => c.score !== null).length
  const average = avgScoreCount > 0 ? Math.round(avgScore / avgScoreCount) : null

  return (
    <div className="card-elevated p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-brand" />
          <h3 className="section-heading">Learning OS</h3>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="h-8 px-3 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-[11px] font-medium transition-colors"
        >
          + Chapter
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {SUBJECTS.map(s => (
          <button key={s.name} onClick={() => setSelectedSubject(s.name)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            style={{
              backgroundColor: selectedSubject === s.name ? `${s.color}20` : "rgba(255,255,255,0.04)",
              color: selectedSubject === s.name ? s.color : "rgba(255,255,255,0.4)",
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-xs text-text-secondary">Progress</span>
          <span className="text-sm font-bold text-text-primary">{completed}/{total}</span>
        </div>
        {average !== null && (
          <>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-xs text-text-secondary">Avg Score</span>
              <span className="text-sm font-bold" style={{ color: average >= 80 ? "var(--success)" : average >= 60 ? "var(--warning)" : "var(--danger)" }}>
                {average}%
              </span>
            </div>
          </>
        )}

        {/* Revision Cycle */}
        {total > 0 && (() => {
          const thisWeek = chapters.filter(c => c.date && c.date >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
          const weeklyCount = thisWeek.filter(c => c.completed).length
          const cycle = weeklyCount >= 5 ? "Intensive" : weeklyCount >= 3 ? "Active" : weeklyCount >= 1 ? "Light" : "Rest"
          const cycleColor = weeklyCount >= 5 ? "var(--success)" : weeklyCount >= 3 ? "var(--brand)" : weeklyCount >= 1 ? "var(--warning)" : "var(--text-tertiary)"
          return (
            <>
              <div className="hidden sm:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="text-xs text-text-secondary">Revision</span>
                <span className="text-sm font-bold" style={{ color: cycleColor }}>{cycle}</span>
              </div>
            </>
          )
        })()}

        {/* Weak Topics */}
        {(() => {
          const weak = SUBJECTS.map(s => {
            const subj = chapters.filter(c => c.subject === s.name && c.score !== null)
            const avg = subj.reduce((a, c) => a + (c.score || 0), 0) / (subj.length || 1)
            return { name: s.name, avg, count: subj.length, color: s.color }
          }).filter(s => s.count > 0 && s.avg < 60)
          if (weak.length === 0) return null
          return (
            <>
              <div className="hidden sm:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="text-xs text-text-secondary">Weak</span>
                {weak.map(w => (
                  <span key={w.name} className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${w.color}20`, color: w.color }}
                  >
                    {w.name}
                  </span>
                ))}
              </div>
            </>
          )
        })()}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
            <div className="flex gap-2 pt-1">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addChapter()}
                placeholder="Chapter name..."
                className="flex-1 min-w-0 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-text-tertiary"
              />
              <button onClick={addChapter} disabled={!newName.trim()}
                className="h-8 px-4 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-xs font-medium disabled:opacity-30 transition-colors"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {filteredChapters.length === 0 && (
          <div className="text-center py-10">
            <BookOpen className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-text-tertiary">No chapters yet</p><p className="text-xs text-text-muted mt-1">Add your first {selectedSubject} chapter to start tracking progress.</p>
          </div>
        )}
        {filteredChapters.map((chapter) => {
          const subject = SUBJECTS.find(s => s.name === chapter.subject)
          const color = subject?.color || "var(--text)"
          return (
            <motion.div key={chapter.id} layout
              className="group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <button onClick={() => toggleChapter(chapter.id)} className="flex-shrink-0" aria-label="Toggle chapter">
                {chapter.completed
                  ? <CheckCircle2 className="w-4 h-4" style={{ color }} />
                  : <Circle className="w-4 h-4 text-text-muted group-hover:text-text-tertiary transition-colors" />
                }
              </button>
              <span className={`text-sm flex-1 min-w-0 truncate ${chapter.completed ? "line-through text-text-tertiary" : "text-text-primary"}`}>
                {chapter.name}
              </span>

              {chapter.score !== null && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded flex-shrink-0"
                  style={{
                    backgroundColor: `${chapter.score >= 80 ? "var(--success)" : chapter.score >= 60 ? "var(--warning)" : "var(--danger)"}20`,
                    color: chapter.score >= 80 ? "var(--success)" : chapter.score >= 60 ? "var(--warning)" : "var(--danger)"
                  }}
                >
                  {chapter.score}%
                </span>
              )}

              {!chapter.completed && (
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0">
                  <input value={scoreInput[chapter.id] || ""} onChange={e => setScoreInput({ ...scoreInput, [chapter.id]: e.target.value })}
                    onKeyDown={e => { if (e.key === "Enter") setScore(chapter.id) }}
                    placeholder="%"
                    className="w-12 sm:w-14 h-8 px-2 rounded bg-white/5 border border-white/10 text-[11px] text-white outline-none placeholder:text-text-muted"
                  />
                  <button onClick={() => setScore(chapter.id)}
                    className="h-8 px-2 rounded bg-white/5 hover:bg-white/10 text-xs text-text-tertiary transition-colors"
                  >
                    Set
                  </button>
                </div>
              )}

              <button onClick={() => deleteChapter(chapter.id)}
                className="h-8 w-8 rounded flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-500/20 text-text-tertiary hover:text-red-400 transition-all flex-shrink-0"
                aria-label="Delete chapter"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
