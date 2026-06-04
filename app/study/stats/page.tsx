"use client"

import { motion } from "framer-motion"
import { StudyStats } from "@/components/study/StudyStats"

export default function StudyStatsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-primary">Study Stats</h1>
        <p className="text-sm text-text-tertiary mt-1">Test scores, mock results, and error tracking.</p>
      </div>
      <StudyStats />
    </motion.div>
  )
}
