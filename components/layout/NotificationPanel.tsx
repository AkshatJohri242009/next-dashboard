"use client"

import { Bell, X, Droplets, Target, Clock, Timer, Dumbbell, ArrowRight, CheckCircle } from "lucide-react"
import { useStore } from "@/lib/store"
import { useMediaQuery } from "@/lib/use-media-query"
import { waterGoalMl } from "@/lib/utils"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export function NotificationPanel() {
  const {
    notificationPanelOpen, setNotificationPanel,
    goals, health, toggleGoal,
    reminders, setWaterTimerMin,
    waterTimerMin, lastWaterNotif, markWaterNotif,
  } = useStore()
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)

  const pendingGoals = goals.filter(g => !g.done)
  const goalMl = waterGoalMl(health)
  const waterLeft = Math.max(0, goalMl - (health.waterMl || 0))

  const activeReminders = reminders.filter(r => !r.completed && r.dueAt > Date.now())
  const overdueReminders = reminders.filter(r => !r.completed && r.dueAt <= Date.now())

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!notificationPanelOpen) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotificationPanel(false)
      }
    }
    const id = setTimeout(() => document.addEventListener("click", handler), 0)
    return () => { clearTimeout(id); document.removeEventListener("click", handler) }
  }, [notificationPanelOpen, setNotificationPanel])

  useEffect(() => {
    const interval = setInterval(() => {
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
    return () => clearInterval(interval)
  }, [reminders, waterTimerMin, lastWaterNotif, markWaterNotif, waterLeft])

  const totalPending = pendingGoals.length + overdueReminders.length + activeReminders.length
  const badgeCount = Math.min(totalPending, 99)

  const navigate = (path: string) => {
    router.push(path)
    setNotificationPanel(false)
  }

  const hydrateOverdue = waterTimerMin > 0 && Date.now() - lastWaterNotif >= waterTimerMin * 60000

  const items: { icon: JSX.Element; label: string; sub: string; onClick: () => void; color: string }[] = []

  if (hydrateOverdue) {
    items.push({
      icon: <Droplets className="w-4 h-4" />,
      label: "Time to hydrate",
      sub: `Drink ${Math.max(200, Math.round(waterLeft / (4)))}ml`,
      onClick: () => navigate("/health"),
      color: "text-brand-400",
    })
  }

  pendingGoals.slice(0, 5).forEach(g => {
    items.push({
      icon: <Target className="w-4 h-4" />,
      label: g.text,
      sub: "Pending task",
      onClick: () => navigate("/"),
      color: "text-amber-400",
    })
  })

  overdueReminders.slice(0, 3).forEach(r => {
    const icon = r.type === "gym" ? <Dumbbell className="w-4 h-4" /> : r.type === "water" ? <Droplets className="w-4 h-4" /> : <Target className="w-4 h-4" />
    items.push({
      icon,
      label: r.text,
      sub: r.type === "gym" ? "Gym reminder" : r.type === "water" ? "Hydration" : "Overdue",
      onClick: () => navigate(r.type === "gym" ? "/gym" : r.type === "water" ? "/health" : "/"),
      color: "text-red-400",
    })
  })

  activeReminders.slice(0, 3).forEach(r => {
    const icon = r.type === "gym" ? <Dumbbell className="w-4 h-4" /> : r.type === "water" ? <Droplets className="w-4 h-4" /> : <Target className="w-4 h-4" />
    items.push({
      icon,
      label: r.text,
      sub: `${Math.ceil((r.dueAt - Date.now()) / 60000)}m`,
      onClick: () => navigate(r.type === "gym" ? "/gym" : r.type === "water" ? "/health" : "/"),
      color: "text-accent-400",
    })
  })

  if (waterLeft > 0) {
    items.push({
      icon: <Droplets className="w-4 h-4" />,
      label: `${Math.round(waterLeft / 100) / 10}L water left`,
      sub: "Drink more",
      onClick: () => navigate("/health"),
      color: "text-accent-400",
    })
  }

  return (
    <div ref={panelRef} className="relative">
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

      {notificationPanelOpen && (
        <>
          {isMobile && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div className="fixed inset-0 bg-black/60" onClick={() => setNotificationPanel(false)} />
              <div className="relative z-10 w-3/4 max-w-sm h-full bg-[#0a0a0d] border-l border-white/[0.08] shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between h-12 px-4 border-b border-white/[0.08]">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  <button onClick={() => setNotificationPanel(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  {items.length === 0 && (
                    <div className="py-8 text-center text-sm text-white/30 italic">No notifications yet.</div>
                  )}
                  {items.map((item, i) => (
                    <div
                      key={i}
                      onClick={item.onClick}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 ${item.color}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/80 truncate">{item.label}</div>
                        <div className="text-[10px] text-white/30 font-mono">{item.sub}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="absolute right-0 top-full mt-2 z-50 w-[420px] bg-[#0a0a0d] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between h-12 px-4 border-b border-white/[0.08]">
                <span className="text-sm font-bold text-white">Notifications</span>
                <button onClick={() => setNotificationPanel(false)} className="h-7 w-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-3 space-y-2">
                {items.length === 0 && (
                  <div className="py-8 text-center text-sm text-white/30 italic">No notifications yet.</div>
                )}
                {items.map((item, i) => (
                  <div
                    key={i}
                    onClick={item.onClick}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white/80 truncate">{item.label}</div>
                      <div className="text-[10px] text-white/30 font-mono">{item.sub}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
