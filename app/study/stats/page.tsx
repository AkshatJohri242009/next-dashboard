"use client"

import { motion } from "framer-motion"
import { StudyStats } from "@/components/study/StudyStats"

export default function StudyStatsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Study Stats</h1>
        <p className="text-sm text-white/40 mt-1">Test scores, mock results, and error tracking.</p>
      </div>
      <StudyStats />
    </motion.div>
  )
}
