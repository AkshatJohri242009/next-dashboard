"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { GoalTicker } from "@/components/dashboard/GoalTicker"
import { PeakRing } from "@/components/dashboard/PeakRing"
import { TodoList } from "@/components/dashboard/TodoList"
import { useStore } from "@/lib/store"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function DashboardPage() {
  const loadGoals = useStore(s => s.loadGoals)

  useEffect(() => {
    loadGoals()
    const interval = setInterval(loadGoals, 30000)
    return () => clearInterval(interval)
  }, [loadGoals])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Dashboard</h1>
      </div>

      <motion.div variants={item}>
        <GoalTicker />
      </motion.div>

      <motion.div variants={item}>
        <PeakRing />
      </motion.div>

      <motion.div variants={item}>
        <TodoList />
      </motion.div>
    </motion.div>
  )
}
