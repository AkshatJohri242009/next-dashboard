"use client"

import { motion } from "framer-motion"
import { StudyTasks } from "@/components/study/StudyTasks"

export default function StudyTasksPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-bold text-gradient">Study Tasks</h1>
      <p className="text-sm text-text-tertiary">Track your study goals and maintain your streak</p>
      <div className="max-w-2xl glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <StudyTasks />
      </div>
    </motion.div>
  )
}
