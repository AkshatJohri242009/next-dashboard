import { jarvisDb } from "../jarvis-db"

interface MemoryRow {
  id: string
  user_id: string
  key: string
  value: string
  importance: number
  created_at: string
  updated_at: string
  last_accessed: string
}

/**
 * Fetches the top 20 memories for the user ordered by importance DESC.
 * Formats as "key: value" lines joined by newlines.
 * Returns "No memories yet." if empty.
 */
export async function getMemories(userId: string): Promise<string> {
  if (!jarvisDb) return "No memories yet."

  const { data, error } = await jarvisDb
    .from("memories")
    .select("key, value, importance")
    .eq("user_id", userId)
    .order("importance", { ascending: false })
    .order("last_accessed", { ascending: false })
    .limit(20)

  if (error || !data || data.length === 0) {
    return "No memories yet."
  }

  // Update last_accessed for retrieved memories
  for (const row of data) {
    await jarvisDb
      .from("memories")
      .update({ last_accessed: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("key", row.key)
  }

  return data.map((row: { key: string; value: string }) => `${row.key}: ${row.value}`).join("\n")
}

/**
 * Upserts a memory row. On conflict on (user_id, key),
 * updates value, importance, and updated_at.
 */
export async function saveMemory(
  userId: string,
  key: string,
  value: string,
  importance: number
): Promise<void> {
  if (!jarvisDb) return

  const now = new Date().toISOString()
  await jarvisDb
    .from("memories")
    .upsert(
      {
        user_id: userId,
        key,
        value,
        importance,
        updated_at: now,
        last_accessed: now,
      },
      {
        onConflict: "user_id, key",
        ignoreDuplicates: false,
      }
    )
}

/**
 * Parses the <memory_save> block from an AI response if present.
 * Returns null if not found.
 */
export function parseMemorySave(
  responseText: string
): { key: string; value: string; importance: number } | null {
  // Manual parse: find the block boundaries, then extract key/value/importance line by line
  const startTag = "<memory_save>"
  const endTag = "</memory_save>"
  const startIdx = responseText.indexOf(startTag)
  const endIdx = responseText.indexOf(endTag)
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null

  const block = responseText.slice(startIdx + startTag.length, endIdx).trim()
  const lines = block.split("\n").map(l => l.trim()).filter(Boolean)

  let key = ""
  let value = ""
  let importance = 0.5
  let inValue = false
  const valueParts: string[] = []

  for (const line of lines) {
    if (line.startsWith("key:")) {
      key = line.slice(4).trim()
    } else if (line.startsWith("value:")) {
      inValue = true
      valueParts.push(line.slice(6).trim())
    } else if (line.startsWith("importance:")) {
      inValue = false
      importance = parseFloat(line.slice(11).trim())
    } else if (inValue) {
      valueParts.push(line)
    }
  }

  value = valueParts.join(" ").trim()

  if (!key || !value || isNaN(importance)) return null

  return { key, value, importance: Math.max(0, Math.min(1, importance)) }
}

/**
 * Removes the <memory_save> block from the response text
 * so it is never shown to the user.
 */
export function stripMemorySave(responseText: string): string {
  const startTag = "<memory_save>"
  const endTag = "</memory_save>"
  let result = responseText
  let startIdx = result.indexOf(startTag)
  while (startIdx !== -1) {
    const endIdx = result.indexOf(endTag, startIdx)
    if (endIdx === -1) break
    result = result.slice(0, startIdx) + result.slice(endIdx + endTag.length)
    startIdx = result.indexOf(startTag)
  }
  return result.trim()
}

const INTERNAL_TAG_PATTERN = /<(memory_save|memory_update|memory_delete|tool_call|system)[\s\S]*?<\/\1>/gi

/**
 * Strips ALL internal operation tags from the response text
 * so they are never visible to the user. Handles:
 *   <memory_save>...</memory_save>
 *   <memory_update>...</memory_update>
 *   <memory_delete>...</memory_delete>
 *   <tool_call>...</tool_call>
 *   <system>...</system>
 */
export function stripInternalTags(responseText: string): string {
  return responseText.replace(INTERNAL_TAG_PATTERN, "").trim()
}
