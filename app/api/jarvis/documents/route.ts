import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { listDocuments, createDocument, getDocument, updateDocument, deleteDocument } from "@/lib/jarvis-db"

export async function GET() {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const documents = await listDocuments(user.userId)
  return NextResponse.json({ documents })
}

export async function POST(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { title, content, language } = await req.json()
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 })

  const doc = await createDocument(user.userId, title, content || "", language)
  return NextResponse.json({ document: doc })
}

export async function PUT(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: "Document id required" }, { status: 400 })

  await updateDocument(id, updates as any)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Document id required" }, { status: 400 })

  await deleteDocument(id)
  return NextResponse.json({ success: true })
}
