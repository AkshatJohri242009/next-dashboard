"use client"

import { motion } from "framer-motion"
import { CommuteTimer } from "@/components/study/CommuteTimer"

export default function StudyCommutePageClient() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-bold text-gradient">Commute Timer</h1>
      <p className="text-sm text-text-tertiary">Simulate flight times between airports</p>
      <div className="max-w-lg glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <CommuteTimer />
      </div>
    </motion.div>
  )
}
