"use client"

export interface SyncEntry {
  value: unknown
  updatedAt: string
}

interface SyncRow {
  key: string
  value: unknown
  updated_at: string
}

export async function pullFromSupabase(): Promise<Record<string, SyncEntry> | null> {
  try {
    const res = await fetch("/api/sync")
    if (!res.ok) return null
    const data: SyncRow[] = await res.json()
    const state: Record<string, SyncEntry> = {}
    for (const row of data) {
      state[row.key] = { value: row.value, updatedAt: row.updated_at }
    }
    return state
  } catch {
    return null
  }
}

export async function pushToSupabase(state: Record<string, unknown>): Promise<void> {
  try {
    const entries = Object.entries(state).map(([key, value]) => ({ key, value }))
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    })
  } catch {}
}
