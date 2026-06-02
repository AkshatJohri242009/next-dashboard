"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LearningOSModule } from "@/components/life/LearningOSModule"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { useStore } from "@/lib/store"
import { Brain, BookOpen, Target } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function LearningPage() {
  const [chapters, setChapters] = useState<any[]>([])
  useEffect(() => {
    try { setChapters(JSON.parse(localStorage.getItem("lifeos_chapters") || "[]")) }
    catch {}
  }, [])

  const total = chapters.length
  const completed = chapters.filter(c => c.completed).length
  const scored = chapters.filter(c => c.score !== null)
  const avgScore = scored.length > 0 ? Math.round(scored.reduce((a, c) => a + c.score, 0) / scored.length) : null

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Learning OS</h1>
        <p className="text-sm text-white/40 mt-1">Subject-based chapter tracking with score analytics.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated p-4 text-center">
          <p className="metric-value text-brand">{total}</p>
          <p className="metric-label">Total Chapters</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value text-success">{completed}</p>
          <p className="metric-label">Completed</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value" style={{ color: completed > 0 ? "var(--info)" : "var(--text-muted)" }}>
            {completed > 0 ? Math.round((completed / total) * 100) : 0}%
          </p>
          <p className="metric-label">Completion Rate</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value" style={{
            color: avgScore !== null ? (avgScore >= 80 ? "var(--success)" : avgScore >= 60 ? "var(--warning)" : "var(--danger)") : "var(--text-muted)"
          }}>
            {avgScore !== null ? `${avgScore}%` : "—"}
          </p>
          <p className="metric-label">Avg Score</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <LearningOSModule />
      </motion.div>
    </motion.div>
  )
}
