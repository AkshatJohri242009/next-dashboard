import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const DASHBOARD_TOKEN = process.env.DASHBOARD_API_TOKEN || "dashboard-local-dev-token"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

function getGoalsKey(date?: Date): string {
  const d = date || new Date()
  return "goals:" + d.toISOString().slice(0, 10)
}

async function readState(key: string): Promise<any[]> {
  if (!supabase) return []
  const { data } = await supabase.from("dashboard_state").select("value").eq("key", key).single()
  return data?.value || []
}

async function writeState(key: string, value: any) {
  if (!supabase) return
  await supabase.from("dashboard_state").upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  )
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${DASHBOARD_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { action, text } = await request.json()

    if (action === "addGoal") {
      if (!text) return NextResponse.json({ error: "text required" }, { status: 400 })
      const key = getGoalsKey()
      const goals = await readState(key)
      goals.push({ text, done: false, createdAt: Date.now(), queued: false, pushedCount: 0 })
      await writeState(key, goals)
      return NextResponse.json({ ok: true })
    }

    if (action === "addTask") {
      if (!text) return NextResponse.json({ error: "text required" }, { status: 400 })
      const key = "study_tasks_v1"
      const tasks = await readState(key)
      tasks.push({ id: `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, text, done: false, createdAt: Date.now() })
      await writeState(key, tasks)
      return NextResponse.json({ ok: true })
    }

    if (action === "pushTomorrow") {
      const todayKey = getGoalsKey()
      const tomorrowKey = getGoalsKey(new Date(Date.now() + 86400000))
      const goals = await readState(todayKey)
      const undone = goals.filter((g: any) => !g.done).map((g: any) => ({
        ...g, pushedCount: (g.pushedCount || 0) + 1,
      }))
      if (undone.length > 0) {
        const tomorrowGoals = await readState(tomorrowKey)
        await writeState(tomorrowKey, [...tomorrowGoals, ...undone])
        await writeState(todayKey, goals.filter((g: any) => g.done))
      }
      return NextResponse.json({ ok: true, pushed: undone.length })
    }

    if (action === "listGoals") {
      const todayKey = getGoalsKey()
      const goals = await readState(todayKey)
      return NextResponse.json({ goals })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
