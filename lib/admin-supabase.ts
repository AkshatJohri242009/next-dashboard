import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export const adminDb = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

export function requireAdmin() {
  if (!adminDb) throw new Error("Supabase admin client not configured")
  return adminDb
}

export function genId() {
  return crypto.randomUUID()
}

export function timestamp() {
  return new Date().toISOString()
}

export function withTimestamps<T extends Record<string, unknown>>(data: T): T & { id: string; createdAt: string; updatedAt: string } {
  const now = timestamp()
  return {
    ...data,
    id: (data.id as string) || genId(),
    createdAt: (data.createdAt as string) || now,
    updatedAt: (data.updatedAt as string) || now,
  } as T & { id: string; createdAt: string; updatedAt: string }
}
