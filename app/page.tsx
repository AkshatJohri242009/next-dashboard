"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AIBriefing } from "@/components/home/AIBriefing"
import { LifeScore } from "@/components/home/LifeScore"
import { TodaysMission } from "@/components/home/TodaysMission"
import { AIRecommendations } from "@/components/home/AIRecommendations"
import { HabitsModule } from "@/components/home/HabitsModule"
import { GoalTicker } from "@/components/dashboard/GoalTicker"
import { useStore } from "@/lib/store"
import { ROUTES } from "@/lib/routes"
import { PenSquare, Brain, GitBranch, Flag, TrendingUp as ForecastIcon, Zap, Clock, BookOpen, Mic, BarChart3, Search, GitFork, Eye, FileText } from "lucide-react"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const quickLinks = [
  { href: ROUTES.JOURNAL, label: "Journal", icon: PenSquare, desc: "Daily reflections & mood tracking" },
  { href: ROUTES.LEARNING, label: "Learning OS", icon: BookOpen, desc: "Subject chapters & scores" },
  { href: ROUTES.MISSIONS, label: "Missions", icon: Flag, desc: "Long-term goals & milestones" },
  { href: ROUTES.DECISIONS, label: "Decisions", icon: GitBranch, desc: "Track major life choices" },
  { href: ROUTES.REVIEWS, label: "Reviews", icon: ForecastIcon, desc: "Weekly forecasts & analytics" },
  { href: ROUTES.HABITS, label: "Habits", icon: Brain, desc: "Streak tracking & stats" },
  { href: ROUTES.TIMELINE, label: "Timeline", icon: Clock, desc: "Life events chronology" },
  { href: ROUTES.BRAIN, label: "Second Brain", icon: Zap, desc: "Connected ideas & knowledge" },
  { href: ROUTES.VOICE, label: "Voice", icon: Mic, desc: "Voice commands & briefings" },
  { href: ROUTES.BRIEFINGS, label: "Briefings", icon: BarChart3, desc: "Morning & evening reviews" },
  { href: ROUTES.MEMORY, label: "Memory", icon: Search, desc: "Life memory engine" },
  { href: ROUTES.CORRELATIONS, label: "Patterns", icon: GitFork, desc: "Discover hidden correlations" },
  { href: ROUTES.FUTURE, label: "Future Self", icon: Eye, desc: "3/6/12 month projections" },
  { href: ROUTES.REPORT, label: "Life Report", icon: FileText, desc: "Annual life analytics" },
]

export default function HomePage() {
  const { loadGoals, loadHealth, loadGym, loadSleepLog, loadStocks, fetchStockQuotes } = useStore()

  useEffect(() => {
    loadGoals()
    loadHealth()
    loadGym()
    loadSleepLog()
    loadStocks()
    fetchStockQuotes()
  }, [loadGoals, loadHealth, loadGym, loadSleepLog, loadStocks, fetchStockQuotes])

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Hero — 60% visual weight */}
      <motion.div variants={fadeUp}>
        <AIBriefing />
      </motion.div>

      {/* Insights & Metrics — 25% */}
      <motion.div variants={fadeUp}>
        <LifeScore />
      </motion.div>

      {/* Action — Today's primary focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp}>
          <TodaysMission />
        </motion.div>
        <motion.div variants={fadeUp}>
          <AIRecommendations />
        </motion.div>
      </div>

      {/* Secondary — Habits + Quick Access */}
      <motion.div variants={fadeUp}>
        <HabitsModule />
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-elevated p-4 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-4 rounded-full bg-brand-400" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Quick Access</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5 transition-all block">
                <link.icon className="w-4 h-4 text-brand mb-1.5" />
                <p className="text-xs font-medium text-white/70">{link.label}</p>
                <p className="text-[9px] text-white/30 mt-0.5">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="pb-8">
        <GoalTicker />
      </motion.div>
    </motion.div>
  )
}
