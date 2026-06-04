"use client"

import { motion } from "framer-motion"
import { StudyTimer } from "@/components/study/StudyTimer"
import { FocusSounds } from "@/components/study/FocusSounds"
import { StudyCalendar } from "@/components/study/StudyCalendar"
import { StudyStats } from "@/components/study/StudyStats"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"

export default function StudyDashboard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="page-title">Learning OS</h1>
        <p className="text-sm text-text-tertiary mt-1">Your study session overview</p>
      </div>

      <JarvisInsightBar />

      <StudyCalendar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StudyTimer />
        <FocusSounds />
      </div>

      <StudyStats />
    </motion.div>
  )
}
