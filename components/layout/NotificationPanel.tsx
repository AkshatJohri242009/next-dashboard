"use client"

import { Bell, X, Droplets, Moon, Square } from "lucide-react"
import { useStore } from "@/lib/store"
import { useEffect, useRef } from "react"

const WATER_INTERVAL = 45 * 60 * 1000
const SLEEP_INTERVAL = 45 * 60 * 1000

export function NotificationPanel() {
  const {
    notificationPanelOpen, setNotificationPanel,
    sleepTimerStart, stopSleepTimer,
    waterTimerMin, lastWaterNotif, markWaterNotif,
    lastSleepNotif, markSleepNotif,
  } = useStore()
  const panelRef = useRef<HTMLDivElement>(null)

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
      if (waterTimerMin > 0 && (now - lastWaterNotif) >= waterTimerMin * 60 * 1000) {
        markWaterNotif()
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Hydration time", { body: "Time to drink water." })
        }
      }
      if (sleepTimerStart && (now - lastSleepNotif) >= SLEEP_INTERVAL) {
        markSleepNotif()
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Sleep timer", { body: "Still sleeping? Turn off the sleep timer." })
        }
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [waterTimerMin, lastWaterNotif, markWaterNotif, sleepTimerStart, lastSleepNotif, markSleepNotif])

  const now = Date.now()
  const waterDue = waterTimerMin > 0 && (now - lastWaterNotif) >= waterTimerMin * 60 * 1000
  const sleepDue = sleepTimerStart && (now - lastSleepNotif) >= SLEEP_INTERVAL
  const badgeCount = Math.min((waterDue ? 1 : 0) + (sleepDue ? 1 : 0), 99)

  const dismiss = () => setNotificationPanel(false)

  return (
    <div className="relative">
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
          <div className="fixed inset-0 bg-black/60 z-50" onClick={dismiss} />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div
              ref={panelRef}
              className="pointer-events-auto w-[360px] max-w-[90vw] bg-[#0a0a0d] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between h-12 px-4 border-b border-white/[0.08]">
                <span className="text-sm font-bold text-white">Notifications</span>
                <button onClick={dismiss} className="h-8 w-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                {waterDue && (
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                      <Droplets className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white/90">Time to hydrate</div>
                      <div className="text-xs text-white/40 mt-0.5">Drink a glass of water</div>
                    </div>
                    <button onClick={markWaterNotif} className="h-9 px-3 rounded-xl bg-brand-500 text-black text-xs font-bold hover:bg-brand-400 transition-colors shrink-0">
                      Done
                    </button>
                  </div>
                )}

                {sleepDue && sleepTimerStart && (
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center shrink-0">
                      <Moon className="w-5 h-5 text-accent-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white/90">Sleep timer running</div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {Math.floor((now - sleepTimerStart) / 60000)} min elapsed
                      </div>
                    </div>
                    <button onClick={() => { stopSleepTimer(); dismiss() }} className="h-9 px-3 rounded-xl bg-accent-500/20 text-accent-300 text-xs font-bold border border-accent-500/30 hover:bg-accent-500/30 transition-colors shrink-0 flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5" />
                      Stop
                    </button>
                  </div>
                )}

                {!waterDue && !sleepDue && (
                  <div className="py-8 text-center text-sm text-white/30 italic">No notifications right now.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
