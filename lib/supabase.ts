"use client"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface SyncEntry {
  value: unknown
  updatedAt: string
}

export async function pullFromSupabase(): Promise<Record<string, SyncEntry> | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from("dashboard_state")
    .select("key, value, updated_at")
  if (error || !data) return null
  const state: Record<string, SyncEntry> = {}
  for (const row of data) {
    state[row.key] = { value: row.value, updatedAt: row.updated_at }
  }
  return state
}

export async function pushToSupabase(state: Record<string, unknown>): Promise<void> {
  if (!supabase) return
  const rows = Object.entries(state).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }))
  for (const row of rows) {
    await supabase.from("dashboard_state").upsert(row, { onConflict: "key" })
  }
}
