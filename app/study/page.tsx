"use client"

import { motion } from "framer-motion"
import { StudyTimer } from "@/components/study/StudyTimer"
import { FocusSounds } from "@/components/study/FocusSounds"
import { StudyCalendar } from "@/components/study/StudyCalendar"
import { StudyStats } from "@/components/study/StudyStats"

export default function StudyDashboard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Study Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">Your study session overview</p>
      </div>

      <StudyCalendar />

      <div className="grid gap-6 md:grid-cols-2">
        <StudyTimer />
        <FocusSounds />
      </div>

      <StudyStats />
    </motion.div>
  )
}
