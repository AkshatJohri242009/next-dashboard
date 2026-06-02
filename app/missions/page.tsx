"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MissionsModule } from "@/components/life/MissionsModule"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Flag, Target, CheckCircle2, Clock } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([])
  useEffect(() => {
    try { setMissions(JSON.parse(localStorage.getItem("lifeos_missions") || "[]")) }
    catch {}
  }, [])

  const active = missions.filter(m => m.status === "active").length
  const completedMission = missions.filter(m => m.status === "completed").length
  const totalMilestones = missions.reduce((a, m) => a + (m.milestones?.length || 0), 0)
  const doneMilestones = missions.reduce((a, m) => a + (m.milestones?.filter((ms: any) => ms.done).length || 0), 0)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Missions</h1>
        <p className="text-sm text-white/40 mt-1">Long-term missions with milestones and progress tracking.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated p-4 text-center">
          <p className="metric-value text-brand">{missions.length}</p>
          <p className="metric-label">Total Missions</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value text-success">{active}</p>
          <p className="metric-label">Active</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value text-info">{completedMission}</p>
          <p className="metric-label">Completed</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value" style={{ color: totalMilestones > 0 ? "var(--accent)" : "var(--text-muted)" }}>
            {totalMilestones > 0 ? `${Math.round((doneMilestones / totalMilestones) * 100)}%` : "—"}
          </p>
          <p className="metric-label">Milestone Progress</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="card-elevated p-6">
        <MissionsModule />
      </motion.div>
    </motion.div>
  )
}
