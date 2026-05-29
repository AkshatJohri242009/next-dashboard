"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { markModified } from "@/lib/store"
import type { ExamDate, StudyTask } from "@/lib/study-types"

const EXAMS_KEY = "exam_dates_v1"
const TASKS_KEY = "study_tasks_v1"

function storeGet<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}

export function StudyCalendar() {
  const [exams, setExams] = useState<ExamDate[]>([])
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  useEffect(() => {
    setExams(storeGet<ExamDate[]>(EXAMS_KEY) || [])
    setTasks(storeGet<StudyTask[]>(TASKS_KEY) || [])
  }, [])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]

  function prev() { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  function next() { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  function dateStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  }

  const days: { day: number; exam?: ExamDate; tasks: StudyTask[] }[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = dateStr(year, month, d)
    const exam = exams.find(e => e.date === ds)
    const dayTasks = tasks.filter(t => {
      const td = new Date(t.createdAt)
      return td.getFullYear() === year && td.getMonth() === month && td.getDate() === d
    })
    days.push({ day: d, exam, tasks: dayTasks })
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Schedule</span>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-bold text-white/80 min-w-[100px] sm:min-w-[140px] text-center">{monthNames[month]} {year}</span>
          <button onClick={next} className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-[10px] font-mono font-bold text-white/20 text-center py-1">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(d => {
          const ds = dateStr(year, month, d.day)
          const dDate = new Date(year, month, d.day)
          const isToday = dDate.getTime() === today.getTime()
          return (
            <div
              key={d.day}
              className={`relative min-h-[44px] sm:min-h-[52px] rounded-lg p-1 text-center transition-colors ${
                isToday ? "bg-brand-500/15 ring-1 ring-brand-500/30" : "hover:bg-white/[0.04]"
              }`}
            >
              <span className={`text-[11px] font-mono ${isToday ? "text-brand-300 font-bold" : "text-white/40"}`}>
                {d.day}
              </span>
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                {d.exam && <div className="w-1.5 h-1.5 rounded-full bg-red-400" title={d.exam.title} />}
                {d.tasks.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-brand-400" title={`${d.tasks.length} task${d.tasks.length > 1 ? "s" : ""}`} />}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-white/20">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Exam</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-400" /> Task</span>
      </div>
    </div>
  )
}
