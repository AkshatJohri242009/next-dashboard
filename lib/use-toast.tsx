"use client"

import { useState, useCallback } from "react"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

const TOAST_EVENT = "lifeos-toast"

export function showToast(message: string, type: Toast["type"] = "info") {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }))
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, dismiss }
}

export function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl backdrop-blur-md border animate-slide-up ${
            toast.type === "success" ? "bg-semantic-success/20 border-semantic-success/30 text-semantic-success" :
            toast.type === "error" ? "bg-semantic-danger/20 border-semantic-danger/30 text-semantic-danger" :
            "bg-white/10 border-white/20 text-text-secondary"
          }`}
          onClick={() => dismiss(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
