import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { listMessages, updateMessage, deleteMessagesAfter } from "@/lib/jarvis-db"

export async function GET(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 })

  const messages = await listMessages(sessionId, user.userId)
  return NextResponse.json({ messages })
}

export async function PUT(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  try {
    const { messageId, content, sessionId } = await req.json()
    if (!messageId || !content || !sessionId) {
      return NextResponse.json({ error: "messageId, content, and sessionId required" }, { status: 400 })
    }

    // Update the message content
    await updateMessage(messageId, user.userId, content)

    // Truncate all subsequent messages
    await deleteMessagesAfter(sessionId, messageId, user.userId)

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Failed to update message" }, { status: 500 })
  }
}
