"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { LearningOSModule } from "@/components/life/LearningOSModule"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Brain, BookOpen, Target, Upload, CheckCircle2, Loader2 } from "lucide-react"
import { markModified } from "@/lib/store"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const SEED_CHAPTERS = [
  // Physics (17)
  { subject: "Physics", name: "Physical World & Measurement" },
  { subject: "Physics", name: "Kinematics" },
  { subject: "Physics", name: "Laws of Motion" },
  { subject: "Physics", name: "Work, Energy & Power" },
  { subject: "Physics", name: "Motion of System of Particles" },
  { subject: "Physics", name: "Gravitation" },
  { subject: "Physics", name: "Properties of Bulk Matter" },
  { subject: "Physics", name: "Thermodynamics" },
  { subject: "Physics", name: "Kinetic Theory of Gases" },
  { subject: "Physics", name: "Oscillations & Waves" },
  { subject: "Physics", name: "Electrostatics" },
  { subject: "Physics", name: "Current Electricity" },
  { subject: "Physics", name: "Magnetic Effects of Current" },
  { subject: "Physics", name: "Electromagnetic Induction" },
  { subject: "Physics", name: "Electromagnetic Waves" },
  { subject: "Physics", name: "Optics" },
  { subject: "Physics", name: "Dual Nature of Radiation & Matter" },
  // Chemistry (22)
  { subject: "Chemistry", name: "Some Basic Concepts of Chemistry" },
  { subject: "Chemistry", name: "Structure of Atom" },
  { subject: "Chemistry", name: "Classification of Elements" },
  { subject: "Chemistry", name: "Chemical Bonding & Molecular Structure" },
  { subject: "Chemistry", name: "States of Matter" },
  { subject: "Chemistry", name: "Thermodynamics" },
  { subject: "Chemistry", name: "Equilibrium" },
  { subject: "Chemistry", name: "Redox Reactions" },
  { subject: "Chemistry", name: "Hydrogen" },
  { subject: "Chemistry", name: "s-Block Elements" },
  { subject: "Chemistry", name: "p-Block Elements" },
  { subject: "Chemistry", name: "Organic Chemistry — Basic Principles" },
  { subject: "Chemistry", name: "Hydrocarbons" },
  { subject: "Chemistry", name: "Environmental Chemistry" },
  { subject: "Chemistry", name: "Solid State" },
  { subject: "Chemistry", name: "Solutions" },
  { subject: "Chemistry", name: "Electrochemistry" },
  { subject: "Chemistry", name: "Chemical Kinetics" },
  { subject: "Chemistry", name: "Surface Chemistry" },
  { subject: "Chemistry", name: "d & f Block Elements" },
  { subject: "Chemistry", name: "Coordination Compounds" },
  { subject: "Chemistry", name: "Haloalkanes & Haloarenes" },
  // Mathematics (13)
  { subject: "Mathematics", name: "Sets, Relations & Functions" },
  { subject: "Mathematics", name: "Trigonometry" },
  { subject: "Mathematics", name: "Complex Numbers" },
  { subject: "Mathematics", name: "Sequences & Series" },
  { subject: "Mathematics", name: "Permutations & Combinations" },
  { subject: "Mathematics", name: "Binomial Theorem" },
  { subject: "Mathematics", name: "Limits & Continuity" },
  { subject: "Mathematics", name: "Differentiation" },
  { subject: "Mathematics", name: "Applications of Derivatives" },
  { subject: "Mathematics", name: "Integrals" },
  { subject: "Mathematics", name: "Differential Equations" },
  { subject: "Mathematics", name: "Vectors & 3D Geometry" },
  { subject: "Mathematics", name: "Probability" },
  // Computer Science (5)
  { subject: "Computer Science", name: "Programming in Python" },
  { subject: "Computer Science", name: "Data Structures" },
  { subject: "Computer Science", name: "Database Management Systems" },
  { subject: "Computer Science", name: "Networking" },
  { subject: "Computer Science", name: "Computational Thinking" },
]

export default function LearningPageClient() {
  const [chapters, setChapters] = useState<any[]>([])
  const [seeding, setSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)

  const loadChapters = useCallback(() => {
    try { setChapters(JSON.parse(localStorage.getItem("lifeos_chapters") || "[]")) }
    catch {}
  }, [])

  useEffect(() => { loadChapters() }, [loadChapters])

  const handleSeed = () => {
    setSeeding(true)
    const existing = JSON.parse(localStorage.getItem("lifeos_chapters") || "[]")
    const existingNames = new Set(existing.map((c: any) => `${c.subject}:${c.name}`))
    const newChapters = SEED_CHAPTERS
      .filter(sc => !existingNames.has(`${sc.subject}:${sc.name}`))
      .map(sc => ({
        id: `ch_seed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        subject: sc.subject,
        name: sc.name,
        completed: false,
        score: null,
        date: null,
      }))
    const all = [...existing, ...newChapters]
    localStorage.setItem("lifeos_chapters", JSON.stringify(all))
    markModified("lifeos_chapters")
    setChapters(all)
    setSeeded(true)
    setSeeding(false)
    setTimeout(() => setSeeded(false), 3000)
  }

  const total = chapters.length
  const completed = chapters.filter((c: any) => c.completed).length
  const scored = chapters.filter((c: any) => c.score !== null)
  const avgScore = scored.length > 0 ? Math.round(scored.reduce((a: number, c: any) => a + c.score, 0) / scored.length) : null

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Learning OS</h1>
          <p className="text-sm text-text-tertiary mt-1">Subject-based chapter tracking with score analytics.</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="h-8 px-3 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent text-[11px] font-medium transition-colors flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : seeded ? (
            <CheckCircle2 size={14} />
          ) : (
            <Upload size={14} />
          )}
          {seeded ? "Seeded!" : "Seed 57 Chapters"}
        </button>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 sm:flex-[2] card-elevated p-4 sm:p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-brand">
              {total > 0 ? Math.round((completed / total) * 100) : 0}<span className="text-sm">%</span>
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Completion Rate</p>
            <p className="text-xs text-text-tertiary mt-0.5">{completed} of {total} chapters done</p>
          </div>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className="metric-value text-text-primary">{total}</p>
          <p className="metric-label">Total</p>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className="metric-value text-semantic-success">{completed}</p>
          <p className="metric-label">Done</p>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className={`metric-value ${avgScore !== null ? (avgScore >= 80 ? "text-semantic-success" : avgScore >= 60 ? "text-semantic-warning" : "text-semantic-danger") : "text-text-muted"}`}>
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
