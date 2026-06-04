"use client"

import { motion } from "framer-motion"
import { ExamDates } from "@/components/study/ExamDates"

export default function StudyExamsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-primary">Exam Dates</h1>
        <p className="text-sm text-text-tertiary mt-1">Keep track of upcoming exams and deadlines</p>
      </div>

      <div className="max-w-2xl">
        <ExamDates />
      </div>
    </motion.div>
  )
}
