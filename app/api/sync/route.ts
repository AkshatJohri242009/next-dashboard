import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

function getDb(): SupabaseClient<any, "public", any> | null {
  if (!supabaseUrl || !serviceKey) return null
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function ensureTable(db: SupabaseClient<any, "public", any>): Promise<boolean> {
  const { error } = await db.from("dashboard_state").select("key").limit(1).maybeSingle()
  if (!error) return true
  const sql = JSON.stringify({
    query: `create table if not exists dashboard_state (
      user_id uuid not null,
      key text not null,
      value jsonb default 'null'::jsonb,
      updated_at timestamptz default now(),
      primary key (user_id, key)
    );
    alter table dashboard_state enable row level security;
    create policy if not exists "Users can manage their own sync data" on dashboard_state
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`,
  })
  await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    body: sql,
  }).catch(() => {})
  const { error: retry } = await db.from("dashboard_state").select("key").limit(1).maybeSingle()
  return !retry
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = getDb()
  if (!db) return NextResponse.json({ error: "Sync not configured" }, { status: 500 })

  await ensureTable(db)

  const { data } = await db.from("dashboard_state").select("key, value, updated_at").eq("user_id", session.user.id)
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = getDb()
  if (!db) return NextResponse.json({ error: "Sync not configured" }, { status: 500 })

  await ensureTable(db)

  const body = await req.json()
  const entries: { key: string; value: unknown }[] = body.entries || []

  for (const entry of entries) {
    await db.from("dashboard_state").upsert(
      {
        user_id: session.user.id,
        key: entry.key,
        value: JSON.parse(JSON.stringify(entry.value)),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key", ignoreDuplicates: false },
    )
  }

  return NextResponse.json({ synced: entries.length })
}
