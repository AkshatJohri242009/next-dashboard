import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { listSessions, createSession, getSession, updateSession, deleteSession } from "@/lib/jarvis-db"

export async function GET() {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const sessions = await listSessions(user.userId)
  return NextResponse.json({ sessions })
}

export async function POST(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const opts = await req.json().catch(() => ({}))
  const session = await createSession(user.userId, opts)
  return NextResponse.json({ session })
}

export async function PUT(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: "Session id required" }, { status: 400 })

  await updateSession(id, user.userId, updates as any)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Session id required" }, { status: 400 })

  const session = await getSession(id, user.userId)
  if (!session || (session as any).user_id !== user.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await deleteSession(id, user.userId)
  return NextResponse.json({ success: true })
}
