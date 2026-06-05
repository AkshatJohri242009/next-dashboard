"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MissionsModule } from "@/components/life/MissionsModule"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { TodaysMission } from "@/components/home/TodaysMission"
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
  const doneMilestones = missions.reduce((a, m) => a + (m.milestones?.filter((ms: { done: boolean }) => ms.done).length || 0), 0)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Missions</h1>
        <p className="text-sm text-text-tertiary mt-1">Long-term missions with milestones and progress tracking.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 sm:flex-[2] card-elevated p-4 sm:p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-brand">{active}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Active Missions</p>
            <p className="text-xs text-text-tertiary mt-0.5">{completedMission} completed · {missions.length} total</p>
          </div>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className="metric-value text-text-primary">{missions.length}</p>
          <p className="metric-label">Total</p>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className="metric-value text-semantic-success">{completedMission}</p>
          <p className="metric-label">Done</p>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className={`metric-value ${totalMilestones > 0 ? "text-semantic-info" : "text-text-muted"}`}>
            {totalMilestones > 0 ? `${Math.round((doneMilestones / totalMilestones) * 100)}%` : "—"}
          </p>
          <p className="metric-label">Milestones</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <TodaysMission />
      </motion.div>

      <motion.div variants={item} className="card-elevated p-4 sm:p-6">
        <MissionsModule />
      </motion.div>
    </motion.div>
  )
}
