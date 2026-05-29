"use client"

import { motion } from "framer-motion"
import { CommuteTimer } from "@/components/study/CommuteTimer"

export default function StudyCommutePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Commute Timer</h1>
        <p className="text-sm text-white/40 mt-1">Simulate flight times between airports</p>
      </div>

      <div className="max-w-lg">
        <CommuteTimer />
      </div>
    </motion.div>
  )
}
