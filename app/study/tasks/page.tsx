"use client"

import { motion } from "framer-motion"
import { StudyTasks } from "@/components/study/StudyTasks"

export default function StudyTasksPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Study Tasks</h1>
        <p className="text-sm text-white/40 mt-1">Track your study goals and maintain your streak</p>
      </div>

      <div className="max-w-2xl">
        <StudyTasks />
      </div>
    </motion.div>
  )
}
