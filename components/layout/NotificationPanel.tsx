"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, X, Droplets, Target, Clock, Zap, Trash2, CheckCircle,
  Timer, Dumbbell,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { useMediaQuery } from "@/lib/use-media-query"
import { waterGoalMl } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

export function NotificationPanel() {
  const {
    notificationPanelOpen, setNotificationPanel,
    goals, health,
    reminders, addReminder, completeReminder, deleteReminder,
    waterTimerMin, lastWaterNotif, markWaterNotif,
  } = useStore()
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const [reminderInput, setReminderInput] = useState("")
  const [reminderMin, setReminderMin] = useState(30)
  const [reminderType, setReminderType] = useState<"task" | "gym" | "water">("task")
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const pendingGoals = goals.filter(g => !g.done)
  const goalMl = waterGoalMl(health)
  const waterLeft = Math.max(0, goalMl - (health.waterMl || 0))

  const activeReminders = reminders.filter(r => !r.completed && r.dueAt > Date.now())
  const overdueReminders = reminders.filter(r => !r.completed && r.dueAt <= Date.now())
  const doneReminders = reminders.filter(r => r.completed)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      reminders.forEach(r => {
        if (!r.completed && r.dueAt <= now && "Notification" in window && Notification.permission === "granted") {
          new Notification("Reminder", { body: r.text })
        }
      })
      if (waterTimerMin > 0) {
        const elapsed = (now - lastWaterNotif) / 60000
        if (elapsed >= waterTimerMin) {
          markWaterNotif()
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Hydration time", { body: `Drink ${Math.max(200, Math.round(waterLeft / (4)))}ml` })
          }
        }
      }
    }, 15000)
    return () => clearInterval(intervalRef.current)
  }, [reminders, waterTimerMin, lastWaterNotif, markWaterNotif, waterLeft])

  const overdueNotifs = overdueReminders.length + (waterTimerMin > 0 && Date.now() - lastWaterNotif >= waterTimerMin * 60000 ? 1 : 0)
  const totalPending = pendingGoals.length + overdueNotifs + activeReminders.length
  const badgeCount = Math.min(totalPending, 99)

  return (
    <>
      <button
        onClick={() => setNotificationPanel(!notificationPanelOpen)}
        className="relative h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
      >
        <Bell className="w-4 h-4 text-white/50" />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-brand-400 text-[9px] font-bold text-black flex items-center justify-center shadow-[0_0_6px_rgba(107,227,164,0.6)]">
            {badgeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {notificationPanelOpen && (
          <>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNotificationPanel(false)}
                className="fixed inset-0 z-40 bg-black/60"
              />
            )}
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? "100%" : 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 h-screen z-50 flex flex-col glass-strong border-l border-white/[0.06] overflow-hidden"
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-400" />
                  <span className="text-sm font-bold text-gradient">Notifications</span>
                </div>
                <button onClick={() => setNotificationPanel(false)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">

                {overdueReminders.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[10px] font-mono font-extrabold tracking-widest text-red-400/70 uppercase">Overdue</span>
                    </div>
                    <div className="space-y-1.5">
                      {overdueReminders.map(r => (
                        <div key={r.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                          {r.type === "gym" ? <Dumbbell className="w-3.5 h-3.5 text-red-400 shrink-0" /> :
                           r.type === "water" ? <Droplets className="w-3.5 h-3.5 text-red-400 shrink-0" /> :
                           <Target className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                          <span className="flex-1 text-xs text-white/70">{r.text}</span>
                          <button onClick={() => completeReminder(r.id)} className="text-white/30 hover:text-brand-400 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteReminder(r.id)} className="text-white/30 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {waterTimerMin > 0 && Date.now() - lastWaterNotif >= waterTimerMin * 60000 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-[10px] font-mono font-extrabold tracking-widest text-brand-400/70 uppercase">Hydrate now</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
                      <Droplets className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="flex-1 text-xs text-white/70">Time to drink {Math.max(200, Math.round(waterLeft / (4)))}ml</span>
                      <button onClick={() => markWaterNotif()} className="text-white/30 hover:text-brand-400 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </section>
                )}

                {pendingGoals.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-mono font-extrabold tracking-widest text-amber-400/70 uppercase">Pending tasks</span>
                    </div>
                    <div className="space-y-1.5">
                      {pendingGoals.map((g, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <span className="text-xs text-white/60 flex-1">{g.text}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {waterLeft > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-3.5 h-3.5 text-accent-400" />
                      <span className="text-[10px] font-mono font-extrabold tracking-widest text-accent-400/70 uppercase">Water remaining</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-xs text-white/60">{Math.round(waterLeft / 100) / 10}L left today</span>
                    </div>
                  </section>
                )}

                {activeReminders.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-[10px] font-mono font-extrabold tracking-widest text-brand-400/70 uppercase">Upcoming</span>
                    </div>
                    <div className="space-y-1.5">
                      {activeReminders.map(r => (
                        <div key={r.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          {r.type === "gym" ? <Dumbbell className="w-3.5 h-3.5 text-brand-400 shrink-0" /> :
                           r.type === "water" ? <Droplets className="w-3.5 h-3.5 text-accent-400 shrink-0" /> :
                           <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <span className="flex-1 text-xs text-white/60">{r.text}</span>
                          <span className="text-[10px] text-white/30 font-mono">
                            {Math.ceil((r.dueAt - Date.now()) / 60000)}m
                          </span>
                          <button onClick={() => deleteReminder(r.id)} className="text-white/30 hover:text-red-400 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Set reminder</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {(["task", "gym", "water"] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setReminderType(t)}
                          className={`flex-1 h-7 rounded-lg text-[10px] font-bold font-mono uppercase transition-colors ${
                            reminderType === t
                              ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                              : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/60"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={reminderInput}
                        onChange={e => setReminderInput(e.target.value)}
                        placeholder="Remind me to..."
                        className="flex-1 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white outline-none placeholder:text-white/30"
                      />
                      <input
                        type="number"
                        min={1}
                        max={1440}
                        value={reminderMin}
                        onChange={e => setReminderMin(Number(e.target.value))}
                        className="w-16 h-9 px-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white outline-none text-center"
                      />
                      <span className="flex items-center text-[10px] text-white/30 font-mono">min</span>
                    </div>
                    <button
                      onClick={() => {
                        if (!reminderInput.trim()) return
                        addReminder(reminderInput.trim(), reminderType, reminderMin)
                        setReminderInput("")
                        if ("Notification" in window && Notification.permission === "granted") {
                          setTimeout(() => {
                            new Notification("Reminder set", { body: `${reminderInput.trim()} in ${reminderMin} min` })
                          }, 100)
                        }
                        if ("Notification" in window && Notification.permission === "default") {
                          Notification.requestPermission()
                        }
                      }}
                      className="w-full h-9 rounded-xl bg-brand-500 text-black text-xs font-bold hover:bg-brand-400 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Set Reminder
                    </button>
                  </div>
                </section>

                {doneReminders.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-white/20" />
                      <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/20 uppercase">Completed</span>
                    </div>
                    <div className="space-y-1">
                      {doneReminders.slice(-5).reverse().map(r => (
                        <div key={r.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl opacity-40">
                          <span className="text-[11px] text-white/40 line-through">{r.text}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
