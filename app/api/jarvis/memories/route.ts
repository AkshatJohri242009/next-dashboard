import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { listMemories, addMemory, deleteMemory, togglePinMemory } from "@/lib/jarvis-db"

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

  const memory = await addMemory(user.userId, text, category, source, sessionId)
  return NextResponse.json({ memory })
}

export async function PUT(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { id, pinned } = await req.json()
  if (!id) return NextResponse.json({ error: "Memory id required" }, { status: 400 })

  await togglePinMemory(id, pinned)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Memory id required" }, { status: 400 })

  await deleteMemory(id)
  return NextResponse.json({ success: true })
}
