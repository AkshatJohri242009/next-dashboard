"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Brain, AlertTriangle, Zap } from "lucide-react"
import type { Chapter } from "@/lib/types"

const subjects = ["Physics", "Chemistry", "Mathematics", "Computer Science"]
const subjectColors: Record<string, string> = {
  Physics: "var(--info)",
  Chemistry: "var(--accent)",
  Mathematics: "var(--brand)",
  "Computer Science": "var(--warning)",
}

export function LearningProgress() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [streak, setStreak] = useState(0)
  const [avgScore, setAvgScore] = useState<number | null>(null)

  useEffect(() => {
    try {
      const ch: Chapter[] = JSON.parse(localStorage.getItem("lifeos_chapters") || "[]")
      setChapters(ch)
    } catch {}
    try {
      const st = JSON.parse(localStorage.getItem("study_streak_v1") || '{"count":0}')
      setStreak(st.count || 0)
    } catch {}
    try {
      const scores: { score: number; total: number }[] = JSON.parse(localStorage.getItem("study_scores_v1") || "[]")
      if (scores.length > 0) {
        const pcts = scores.map(s => s.total > 0 ? (s.score / s.total) * 100 : 0)
        setAvgScore(Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length))
      }
    } catch {}
  }, [])

  const perSubject = subjects.map(subject => {
    const subChapters = chapters.filter(c => c.subject === subject)
    const completed = subChapters.filter(c => c.completed).length
    const subScores = subChapters.filter(c => c.score != null).map(c => c.score!)
    const avgSubScore = subScores.length > 0 ? Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length) : null
    const weak = avgSubScore != null && avgSubScore < 60
    return { subject, total: subChapters.length, completed, avgSubScore, weak }
  })

  const totalChapters = chapters.length
  const completedChapters = chapters.filter(c => c.completed).length
  const weakSubjects = perSubject.filter(s => s.weak).map(s => s.subject)
  const hasData = totalChapters > 0

  const revisionCycle = (() => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const tasks: { done: boolean; date?: string; createdAt?: number }[] = JSON.parse(localStorage.getItem("study_tasks_v1") || "[]")
      const doneToday = tasks.filter(t => t.done).length
      if (doneToday >= 3) return { label: "Active", color: "var(--success)" }
      if (doneToday > 0) return { label: "Light", color: "var(--warning)" }
      return { label: "Rest", color: "var(--info)" }
    } catch { return { label: "Rest", color: "var(--info)" } }
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card-elevated p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="section-heading">Learning Progress</h3>
        </div>

        {!hasData && (
          <p className="text-sm text-white/30 text-center py-6">No learning data yet. Start tracking on the <a href="/learning" className="text-accent underline">Learning OS</a> page.</p>
        )}

        {hasData && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {perSubject.map(({ subject, total, completed, avgSubScore, weak }) => (
                <div key={subject} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold tracking-wide" style={{ color: subjectColors[subject] }}>{subject}</span>
                    {weak && <AlertTriangle className="w-3.5 h-3.5 text-semantic-danger" />}
                  </div>
                  <div className="text-xl font-bold text-text-primary">{completed}/{total}</div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%`, background: `linear-gradient(to right, ${subjectColors[subject]}, color-mix(in srgb, ${subjectColors[subject]} 50%, transparent))` }}
                    />
                  </div>
                  {avgSubScore != null && (
                    <span className="text-[11px] font-medium mt-1.5 block" style={{ color: avgSubScore >= 70 ? "var(--success)" : avgSubScore >= 40 ? "var(--warning)" : "var(--danger)" }}>
                      Avg: {avgSubScore}%
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                <Zap className="w-3.5 h-3.5" />
                <span className="font-medium text-text-secondary">{completedChapters}/{totalChapters}</span> chapters done
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                <Brain className="w-3.5 h-3.5" />
                <span className="font-medium" style={{ color: revisionCycle.color }}>{revisionCycle.label}</span> revision cycle
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <span className="text-brand font-medium">{streak}d</span> streak
                </div>
              )}
              {avgScore != null && (
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <span className="font-medium" style={{ color: avgScore >= 70 ? "var(--success)" : avgScore >= 40 ? "var(--warning)" : "var(--danger)" }}>{avgScore}%</span> avg test score
                </div>
              )}
              {weakSubjects.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <AlertTriangle className="w-3.5 h-3.5 text-semantic-danger" />
                  <span className="text-semantic-danger font-medium">{weakSubjects.join(", ")}</span> needs review
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}