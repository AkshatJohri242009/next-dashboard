"use client"

import { motion } from "framer-motion"
import { useStore } from "@/lib/store"
import { Briefcase, GraduationCap } from "lucide-react"

export function ModeToggle() {
  const { mode, setMode } = useStore()

  return (
    <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/[0.06] p-1">
      <button
        onClick={() => setMode("work")}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-colors ${
          mode === "work"
            ? "bg-white/[0.08] text-white shadow-sm"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        <Briefcase className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Work</span>
      </button>
      <button
        onClick={() => setMode("study")}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-colors ${
          mode === "study"
            ? "bg-white/[0.08] text-white shadow-sm"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        <GraduationCap className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Study</span>
      </button>
    </div>
  )
}
