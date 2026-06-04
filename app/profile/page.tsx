"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { User, Mail, Calendar, Shield, Key, Trash2, LogOut, Sparkles } from "lucide-react"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [createdAt, setCreatedAt] = useState("")
  const [saving, setSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const [showReset, setShowReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
    fetch("/api/user/profile").then(r => r.json()).then(d => {
      if (d.createdAt) setCreatedAt(new Date(d.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))
    })
  }, [session])

  const handleUpdateProfile = async () => {
    setSaving(true)
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      await update({ name })
    }
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setPasswordMsg("")

    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await res.json()
    if (res.ok) {
      setPasswordMsg("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
    } else {
      setPasswordMsg(data.error || "Failed to change password")
    }
    setChangingPassword(false)
  }

  const handleResetAccount = async () => {
    setResetting(true)
    const res = await fetch("/api/onboarding/reset", { method: "POST" })
    if (res.ok) {
      setShowReset(false)
      router.refresh()
    }
    setResetting(false)
  }

  const handleMigrate = async () => {
    const data: Record<string, unknown> = {}

    try {
      const goals: Record<string, unknown>[] = []
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = `goals:${d.toISOString().split("T")[0]}`
        const g = JSON.parse(localStorage.getItem(key) || "[]")
        if (Array.isArray(g) && g.length > 0) goals.push(...g)
      }
      if (goals.length > 0) data.goals = goals

      const health = JSON.parse(localStorage.getItem("health_dashboard_v1") || "null")
      if (health) data.health = health

      const habits = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
      if (Array.isArray(habits) && habits.length > 0) data.habits = habits

      const journal: Record<string, unknown>[] = []
      const raw = JSON.parse(localStorage.getItem("lifeos_journal") || "[]")
      if (Array.isArray(raw)) journal.push(...raw)
      if (journal.length > 0) data.journal = journal

      if (Object.keys(data).length === 0) {
        alert("No local data found to migrate")
        return
      }

      const res = await fetch("/api/data/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        alert("Data migrated successfully!")
      } else {
        const err = await res.json()
        alert(`Migration failed: ${err.error}`)
      }
    } catch (err) {
      alert("Migration error: " + (err as Error).message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your account settings</p>
      </div>

      <div className="glass-panel rounded-[18px] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <User className="w-4 h-4 text-brand" /> Personal Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-brand/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-text-secondary text-sm">
              <Mail className="w-3.5 h-3.5" />
              {session?.user?.email}
            </div>
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={saving}
            className="px-4 h-9 rounded-xl bg-brand text-black text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-[18px] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Key className="w-4 h-4 text-brand" /> Change Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-brand/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-brand/50"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="px-4 h-9 rounded-xl bg-white/10 text-text-primary text-sm font-semibold hover:bg-white/15 disabled:opacity-50 transition-all"
          >
            {changingPassword ? "Updating..." : "Update password"}
          </button>
          {passwordMsg && (
            <p className={`text-xs ${passwordMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>
              {passwordMsg}
            </p>
          )}
        </form>
      </div>

      <div className="glass-panel rounded-[18px] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand" /> Account Info
        </h2>
        <div className="text-sm text-text-secondary space-y-2">
          <p>Created: {createdAt || "Loading..."}</p>
        </div>
      </div>

      <div className="glass-panel rounded-[18px] p-6 space-y-5 border border-red-500/20">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-400" /> Data Management
        </h2>

        <button
          onClick={handleMigrate}
          className="px-4 h-9 rounded-xl bg-white/10 text-text-primary text-sm font-semibold hover:bg-white/15 transition-all"
        >
          Import data from browser
        </button>

        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="px-4 h-9 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all"
          >
            Start Fresh
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
            <p className="text-sm text-red-300">
              Are you sure? This will permanently remove all dashboard data and restore default starter content.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReset(false)}
                className="px-4 h-9 rounded-xl bg-white/10 text-text-primary text-sm font-semibold hover:bg-white/15 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAccount}
                disabled={resetting}
                className="px-4 h-9 rounded-xl bg-red-500 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {resetting ? "Resetting..." : "Confirm Reset"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-[18px] p-6">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  )
}
