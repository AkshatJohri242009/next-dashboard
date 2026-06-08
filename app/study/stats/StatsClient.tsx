"use client"

import { motion } from "framer-motion"
import { StudyStats } from "@/components/study/StudyStats"

export default function StudyStatsPageClient() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-bold text-gradient">Study Stats</h1>
      <p className="text-sm text-text-tertiary">Test scores, mock results, and error tracking.</p>
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <StudyStats />
      </div>
    </motion.div>
  )
}
