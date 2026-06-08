import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { listMemories, addMemory, deleteMemory, togglePinMemory } from "@/lib/jarvis-db"
import { checkMemoryPoisoning, sanitizeMemoryText } from "@/lib/ai/memory/poisoning"
import { aiLogger } from "@/lib/ai/logger"

export async function GET() {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const memories = await listMemories(user.userId)
  return NextResponse.json({ memories })
}

export async function POST(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { text, category, source, sessionId } = await req.json()
  if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 })

  // Sanitize and check for memory poisoning
  const clean = sanitizeMemoryText(text)
  const poison = checkMemoryPoisoning(clean)

  if (poison.flagged && !poison.safe) {
    aiLogger.security("Memory poisoning blocked", {
      userId: user.userId,
      reason: poison.reason,
    })
    return NextResponse.json({ error: "Memory content flagged as potentially unsafe" }, { status: 400 })
  }

  if (poison.flagged) {
    aiLogger.security("Memory flagged for review", {
      userId: user.userId,
      reason: poison.reason,
    })
  }

  const memory = await addMemory(user.userId, clean, category, source, sessionId)
  return NextResponse.json({ memory })
}

export async function PUT(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { id, pinned } = await req.json()
  if (!id) return NextResponse.json({ error: "Memory id required" }, { status: 400 })

  await togglePinMemory(id, user.userId, pinned)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Memory id required" }, { status: 400 })

  await deleteMemory(id, user.userId)
  return NextResponse.json({ success: true })
}
