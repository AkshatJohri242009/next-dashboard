import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { listMessages } from "@/lib/jarvis-db"

export async function GET(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 })

  const messages = await listMessages(sessionId)
  return NextResponse.json({ messages })
}
