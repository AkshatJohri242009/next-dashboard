"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { AIBriefing } from "@/components/home/AIBriefing"
import { LifeScore } from "@/components/home/LifeScore"
import { TodaysMission } from "@/components/home/TodaysMission"
import { AIRecommendations } from "@/components/home/AIRecommendations"
import { HabitsModule } from "@/components/home/HabitsModule"
import { LearningProgress } from "@/components/home/LearningProgress"
import { GoalTicker } from "@/components/dashboard/GoalTicker"
import { useStore } from "@/lib/store"
import { ROUTES } from "@/lib/routes"
import {
  PenSquare, Brain, GitBranch, Flag, TrendingUp as ForecastIcon,
  Zap, BookOpen, Mic, BarChart3, Search, Eye, FileText, ChevronDown
} from "lucide-react"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const quickLinks = [
  { href: ROUTES.JOURNAL, label: "Journal", icon: PenSquare },
  { href: ROUTES.LEARNING, label: "Learning", icon: BookOpen },
  { href: ROUTES.MISSIONS, label: "Missions", icon: Flag },
  { href: ROUTES.DECISIONS, label: "Decisions", icon: GitBranch },
  { href: ROUTES.REVIEWS, label: "Reviews", icon: ForecastIcon },
  { href: ROUTES.HABITS, label: "Habits", icon: Brain },
  { href: ROUTES.VOICE, label: "Voice", icon: Mic },
  { href: ROUTES.BRIEFINGS, label: "Briefings", icon: BarChart3 },
  { href: ROUTES.MEMORY, label: "Memory", icon: Search },
  { href: ROUTES.FUTURE, label: "Future", icon: Eye },
  { href: ROUTES.REPORT, label: "Report", icon: FileText },
  { href: ROUTES.TIMELINE, label: "Timeline", icon: Zap },
]

export default function HomePage() {
  const { loadGoals, loadHealth, loadGym, loadSleepLog, loadStocks, fetchStockQuotes } = useStore()
  const [quickOpen, setQuickOpen] = useState(false)

  useEffect(() => {
    loadGoals()
    loadHealth()
    loadGym()
    loadSleepLog()
    loadStocks()
    fetchStockQuotes()
  }, [loadGoals, loadHealth, loadGym, loadSleepLog, loadStocks, fetchStockQuotes])

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 pb-8">
      {/* Hero — 60% visual weight */}
      <motion.div variants={fadeUp}>
        <AIBriefing />
      </motion.div>

      {/* Primary — Today's focus */}
      <motion.div variants={fadeUp}>
        <TodaysMission />
      </motion.div>

      {/* Insights — compact grid, 25% */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div variants={fadeUp}>
            <LifeScore />
          </motion.div>
        </div>
        <div>
          <motion.div variants={fadeUp}>
            <AIRecommendations />
          </motion.div>
        </div>
      </div>

      {/* Secondary — Learning + Habits, side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp}>
          <LearningProgress />
        </motion.div>
        <motion.div variants={fadeUp}>
          <HabitsModule />
        </motion.div>
      </div>

      {/* Quick Access — collapsed by default */}
      <motion.div variants={fadeUp}>
        <div className="card-elevated p-4 sm:p-6">
          <button
            onClick={() => setQuickOpen(!quickOpen)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full bg-brand-400" />
              <span className="section-label">Quick Access</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${quickOpen ? "rotate-180" : ""}`} />
          </button>
          {quickOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
            >
              {quickLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                >
                  <link.icon className="w-4 h-4 text-brand shrink-0" />
                  <span className="text-xs font-medium text-white/60 group-hover:text-white/80">{link.label}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Footer ticker */}
      <motion.div variants={fadeUp}>
        <GoalTicker />
      </motion.div>
    </motion.div>
  )
}
