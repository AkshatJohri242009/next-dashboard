"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import { usePathname, useRouter } from "next/navigation"
import { Briefcase, GraduationCap } from "lucide-react"

export function ModeToggle() {
  const { mode, setMode, lastWorkPath, lastStudyPath, setLastWorkPath, setLastStudyPath } = useStore()
  const pathname = usePathname()
  const router = useRouter()
  const switching = useRef(false)

  useEffect(() => {
    if (switching.current) { switching.current = false; return }
    if (mode === "work" && pathname !== lastWorkPath) {
      setLastWorkPath(pathname)
    } else if (mode === "study" && pathname !== lastStudyPath) {
      setLastStudyPath(pathname)
    }
  }, [pathname, mode, lastWorkPath, lastStudyPath, setLastWorkPath, setLastStudyPath])

  function switchMode(m: "work" | "study") {
    if (m === mode) return
    switching.current = true
    setMode(m)
    if (m === "work") {
      router.push(lastWorkPath)
    } else {
      router.push(lastStudyPath)
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/[0.06] p-1">
      <button
        onClick={() => switchMode("work")}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-colors ${
          mode === "work"
            ? "bg-white/[0.08] text-white shadow-sm"
            : "text-text-tertiary hover:text-text-secondary"
        }`}
      >
        <Briefcase className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Work</span>
      </button>
      <button
        onClick={() => switchMode("study")}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-colors ${
          mode === "study"
            ? "bg-white/[0.08] text-white shadow-sm"
            : "text-text-tertiary hover:text-text-secondary"
        }`}
      >
        <GraduationCap className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Study</span>
      </button>
    </div>
  )
}
