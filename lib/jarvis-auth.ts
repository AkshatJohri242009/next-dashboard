import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jarvisDb } from "./jarvis-db"

// In-memory fallback for auth sessions
const localAuthSessions = new Map<string, { token: string; userId: string; expiresAt: Date }>()

export async function createSessionToken(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  if (jarvisDb) {
    try {
      await jarvisDb.from("jarvis_auth_sessions").insert({ token, user_id: userId, expires_at: expiresAt.toISOString() })
    } catch {}
  }
  localAuthSessions.set(token, { token, userId, expiresAt })
  return token
}

export async function removeSessionToken(token: string): Promise<void> {
  if (jarvisDb) {
    try {
      await jarvisDb.from("jarvis_auth_sessions").delete().eq("token", token)
    } catch {}
  }
  localAuthSessions.delete(token)
}

export async function getJarvisUserFromToken(token: string): Promise<{ userId: string; username: string; isAdmin: boolean } | null> {
  // Check local store first
  const local = localAuthSessions.get(token)
  if (local && local.expiresAt > new Date()) {
    const { getUserById } = await import("./jarvis-db")
    const user = await getUserById(local.userId)
    if (user) return { userId: user.id, username: user.username, isAdmin: user.is_admin }
  }
  if (local) localAuthSessions.delete(token)

  if (!jarvisDb || !token) return null
  try {
    const { data: session } = await jarvisDb.from("jarvis_auth_sessions")
      .select("*, user:jarvis_users!inner(id, username, is_admin)")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle()
    if (!session) return null
    const u = (session as any).user
    return { userId: u.id, username: u.username, isAdmin: u.is_admin }
  } catch {
    return null
  }
}

export async function getJarvisUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("jarvis_token")?.value
  if (!token) return null
  return getJarvisUserFromToken(token)
}

export async function requireJarvisUser() {
  const user = await getJarvisUser()
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null }
  }
  return { error: null, user }
}
