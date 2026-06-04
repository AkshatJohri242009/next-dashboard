import { createClient } from "@supabase/supabase-js"
import type { JarvisSession, JarvisMessage, JarvisMemory, JarvisDocument, JarvisEndpoint, JarvisUser } from "./jarvis-types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const jarvisDb = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export const jarvisAnonDb = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// In-memory fallback store for when Supabase is unavailable
const localStore: {
  users: Map<string, { id: string; username: string; password_hash: string; is_admin: boolean; privileges: Record<string, unknown>; created_at: string; updated_at: string }>
  sessions: Map<string, { id: string; name: string; user_id: string; model: string; endpoint_url: string; system_prompt: string; mode: string; folder: string | null; is_archived: boolean; message_count: number; total_input_tokens: number; total_output_tokens: number; created_at: string; updated_at: string; last_accessed_at: string }>
  messages: Map<string, JarvisMessage[]>
  authSessions: Map<string, { token: string; user_id: string; created_at: string; expires_at: string }>
} = {
  users: new Map(),
  sessions: new Map(),
  messages: new Map(),
  authSessions: new Map(),
}

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// ============================
// Users
// ============================
export async function createUser(username: string, passwordHash: string): Promise<JarvisUser | null> {
  const id = generateId()
  const now = new Date().toISOString()
  const user = { id, username, password_hash: passwordHash, is_admin: false, privileges: {}, created_at: now, updated_at: now }
  
  if (jarvisDb) {
    try {
      const { data } = await jarvisDb.from("jarvis_users").insert({
        username, password_hash: passwordHash, is_admin: false, privileges: {},
      }).select().single()
      if (data) return data as JarvisUser | null
    } catch (e) {
      console.error("[jarvis-db] createUser supabase error:", e)
    }
  }
  
  localStore.users.set(username, user)
  localStore.users.set(id, user)
  return { id, username, is_admin: false, privileges: {}, created_at: now }
}

export async function getUserByUsername(username: string): Promise<(JarvisUser & { password_hash: string }) | null> {
  if (jarvisDb) {
    try {
      const { data } = await jarvisDb.from("jarvis_users").select("*").eq("username", username).maybeSingle()
      if (data) return data as unknown as JarvisUser & { password_hash: string }
    } catch (e) {
      console.error("[jarvis-db] getUserByUsername supabase error:", e)
    }
  }
  
  const user = localStore.users.get(username)
  if (user) return { id: user.id, username: user.username, is_admin: user.is_admin, privileges: user.privileges, created_at: user.created_at, password_hash: user.password_hash }
  return null
}

export async function getUserById(id: string): Promise<JarvisUser | null> {
  if (jarvisDb) {
    try {
      const { data } = await jarvisDb.from("jarvis_users").select("*").eq("id", id).maybeSingle()
      if (data) return data as JarvisUser | null
    } catch (e) {
      console.error("[jarvis-db] getUserById supabase error:", e)
    }
  }
  
  const user = localStore.users.get(id)
  if (user) return { id: user.id, username: user.username, is_admin: user.is_admin, privileges: user.privileges, created_at: user.created_at }
  return null
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  if (jarvisDb) {
    try {
      await jarvisDb.from("jarvis_users").update({ password_hash: passwordHash, updated_at: new Date().toISOString() }).eq("id", id)
    } catch (e) {
      console.error("[jarvis-db] updateUserPassword supabase error:", e)
    }
  }
}

export async function countUsers(): Promise<number> {
  if (jarvisDb) {
    try {
      const { count } = await jarvisDb.from("jarvis_users").select("*", { count: "exact", head: true })
      if (count !== null) return count
    } catch (e) {
      console.error("[jarvis-db] countUsers supabase error:", e)
    }
  }
  return localStore.users.size / 2 || 0
}

export async function getFirstUser(): Promise<JarvisUser | null> {
  if (jarvisDb) {
    try {
      const { data } = await jarvisDb.from("jarvis_users").select("*").order("created_at").limit(1).maybeSingle()
      if (data) return data as JarvisUser | null
    } catch (e) {
      console.error("[jarvis-db] getFirstUser supabase error:", e)
    }
  }
  const first = Array.from(localStore.users.values()).find(u => !u.password_hash)
  if (first) return { id: first.id, username: first.username, is_admin: first.is_admin, privileges: first.privileges, created_at: first.created_at }
  return null
}

// ============================
// Sessions
// ============================
export async function listSessions(userId: string): Promise<JarvisSession[]> {
  if (jarvisDb) {
    try {
      const { data } = await jarvisDb.from("jarvis_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_archived", false)
        .order("last_accessed_at", { ascending: false })
      if (data) return data as JarvisSession[]
    } catch (e) {
      console.error("[jarvis-db] listSessions supabase error:", e)
    }
  }
  return Array.from(localStore.sessions.values()).filter(s => s.user_id === userId && !s.is_archived) as JarvisSession[]
}

export async function getSession(id: string): Promise<JarvisSession | null> {
  if (jarvisDb) {
    try {
      const { data } = await jarvisDb.from("jarvis_sessions").select("*").eq("id", id).maybeSingle()
      if (data) return data as JarvisSession | null
    } catch (e) {
      console.error("[jarvis-db] getSession supabase error:", e)
    }
  }
  const session = localStore.sessions.get(id)
  return session ? ({ ...session } as JarvisSession) : null
}

export async function createSession(userId: string, opts?: Partial<JarvisSession>): Promise<JarvisSession> {
  const now = new Date().toISOString()
  const session = {
    id: opts?.id || generateId(),
    name: opts?.name || "New Chat",
    model: opts?.model || "gpt-4o",
    endpoint_url: opts?.endpoint_url || "https://api.openai.com/v1",
    system_prompt: opts?.system_prompt || "",
    mode: opts?.mode || "chat",
    folder: opts?.folder || null,
    is_archived: false,
    message_count: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    created_at: now,
    updated_at: now,
    last_accessed_at: now,
  }
  if (jarvisDb) {
    try {
      const { data } = await jarvisDb.from("jarvis_sessions").insert({ ...session, user_id: userId }).select().single()
      if (data) return data as unknown as JarvisSession
    } catch (e) {
      console.error("[jarvis-db] createSession supabase error:", e)
    }
  }
  const fullSession = { ...session, user_id: userId } as JarvisSession
  localStore.sessions.set(fullSession.id, fullSession as any)
  return fullSession
}

export async function updateSession(id: string, updates: Partial<JarvisSession>): Promise<void> {
  if (jarvisDb) {
    try {
      await jarvisDb.from("jarvis_sessions").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id)
      return
    } catch (e) {
      console.error("[jarvis-db] updateSession supabase error:", e)
    }
  }
  const existing = localStore.sessions.get(id)
  if (existing) {
    localStore.sessions.set(id, { ...existing, ...updates, updated_at: new Date().toISOString() })
  }
}

export async function deleteSession(id: string): Promise<void> {
  if (jarvisDb) {
    try {
      await jarvisDb.from("jarvis_sessions").delete().eq("id", id)
      return
    } catch (e) {
      console.error("[jarvis-db] deleteSession supabase error:", e)
    }
  }
  localStore.sessions.delete(id)
  localStore.messages.delete(id)
}

// ============================
// Messages
// ============================
export async function listMessages(sessionId: string): Promise<JarvisMessage[]> {
  if (jarvisDb) {
    try {
      const { data } = await jarvisDb.from("jarvis_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
      if (data) return data as JarvisMessage[]
    } catch (e) {
      console.error("[jarvis-db] listMessages supabase error:", e)
    }
  }
  return localStore.messages.get(sessionId) || []
}

export async function addMessage(msg: Partial<JarvisMessage>): Promise<JarvisMessage> {
  const now = new Date().toISOString()
  const message = {
    id: msg.id || generateId(),
    session_id: msg.session_id!,
    role: msg.role!,
    content: msg.content!,
    metadata: msg.metadata || {},
    created_at: now,
  } as JarvisMessage
  if (jarvisDb) {
    try {
      await jarvisDb.from("jarvis_messages").insert(message)
    } catch (e) {
      console.error("[jarvis-db] addMessage supabase error:", e)
    }
  }
  const existing = localStore.messages.get(message.session_id) || []
  existing.push(message)
  localStore.messages.set(message.session_id, existing)
  return message
}

export async function updateMessageSessionCount(sessionId: string): Promise<void> {
  let count = 0
  if (jarvisDb) {
    try {
      const result = await jarvisDb.from("jarvis_messages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
      if (result.count !== null) count = result.count
      await jarvisDb.from("jarvis_sessions")
        .update({ message_count: count || 0, updated_at: new Date().toISOString() })
        .eq("id", sessionId)
      return
    } catch (e) {
      console.error("[jarvis-db] updateMessageSessionCount supabase error:", e)
    }
  }
  const msgs = localStore.messages.get(sessionId)
  count = msgs?.length || 0
  const existing = localStore.sessions.get(sessionId)
  if (existing) {
    localStore.sessions.set(sessionId, { ...existing, message_count: count, updated_at: new Date().toISOString() })
  }
}

// ============================
// Memories
// ============================
export async function listMemories(userId: string): Promise<JarvisMemory[]> {
  if (!jarvisDb) return []
  const { data } = await jarvisDb.from("jarvis_memories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return (data as JarvisMemory[]) || []
}

export async function addMemory(userId: string, text: string, category = "fact", source = "user", sessionId?: string): Promise<JarvisMemory> {
  const now = new Date().toISOString()
  const memory = {
    id: generateId(),
    user_id: userId,
    text,
    category,
    source,
    session_id: sessionId || null,
    is_pinned: false,
    created_at: now,
    updated_at: now,
  }
  if (jarvisDb) {
    const { data } = await jarvisDb.from("jarvis_memories").insert(memory).select().single()
    return data as unknown as JarvisMemory
  }
  return memory as unknown as JarvisMemory
}

export async function deleteMemory(id: string): Promise<void> {
  if (!jarvisDb) return
  await jarvisDb.from("jarvis_memories").delete().eq("id", id)
}

export async function togglePinMemory(id: string, pinned: boolean): Promise<void> {
  if (!jarvisDb) return
  await jarvisDb.from("jarvis_memories").update({ is_pinned: pinned, updated_at: new Date().toISOString() }).eq("id", id)
}

// ============================
// Documents
// ============================
export async function listDocuments(userId: string): Promise<JarvisDocument[]> {
  if (!jarvisDb) return []
  const { data } = await jarvisDb.from("jarvis_documents")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false })
  return (data as JarvisDocument[]) || []
}

export async function getDocument(id: string): Promise<JarvisDocument | null> {
  if (!jarvisDb) return null
  const { data } = await jarvisDb.from("jarvis_documents").select("*").eq("id", id).maybeSingle()
  return data as JarvisDocument | null
}

export async function createDocument(userId: string, title: string, content = "", language?: string): Promise<JarvisDocument> {
  const now = new Date().toISOString()
  const doc = {
    id: generateId(),
    user_id: userId,
    title,
    content,
    language: language || null,
    version_count: 1,
    is_active: true,
    is_archived: false,
    source: "",
    created_at: now,
    updated_at: now,
  }
  if (jarvisDb) {
    const { data } = await jarvisDb.from("jarvis_documents").insert(doc).select().single()
    return data as unknown as JarvisDocument
  }
  return doc as unknown as JarvisDocument
}

export async function updateDocument(id: string, updates: Partial<JarvisDocument>): Promise<void> {
  if (!jarvisDb) return
  await jarvisDb.from("jarvis_documents").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id)
}

export async function deleteDocument(id: string): Promise<void> {
  if (!jarvisDb) return
  await jarvisDb.from("jarvis_documents").delete().eq("id", id)
}

// ============================
// Endpoints
// ============================
export async function listEndpoints(userId: string): Promise<JarvisEndpoint[]> {
  if (!jarvisDb) return []
  const { data } = await jarvisDb.from("jarvis_endpoints").select("*").eq("user_id", userId)
  return (data as JarvisEndpoint[]) || []
}

export async function createEndpoint(userId: string, endpoint: Partial<JarvisEndpoint>): Promise<JarvisEndpoint> {
  const ep = { ...endpoint, user_id: userId } as const
  if (jarvisDb) {
    const { data } = await jarvisDb.from("jarvis_endpoints").insert(ep as any).select().single()
    return data as unknown as JarvisEndpoint
  }
  return ep as unknown as JarvisEndpoint
}

export async function deleteEndpoint(id: string): Promise<void> {
  if (!jarvisDb) return
  await jarvisDb.from("jarvis_endpoints").delete().eq("id", id)
}
