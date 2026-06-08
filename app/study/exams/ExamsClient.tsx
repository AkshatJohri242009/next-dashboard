"use client"

import { motion } from "framer-motion"
import { ExamDates } from "@/components/study/ExamDates"

export default function StudyExamsPageClient() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-bold text-gradient">Exam Dates</h1>
      <p className="text-sm text-text-tertiary">Keep track of upcoming exams and deadlines</p>
      <div className="max-w-2xl glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <ExamDates />
      </div>
    </motion.div>
  )
}
