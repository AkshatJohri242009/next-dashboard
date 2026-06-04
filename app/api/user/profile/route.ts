import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/admin-supabase"

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const { name, image } = await req.json()

    const updates: Record<string, string> = {}
    if (name !== undefined) updates.name = name
    if (image !== undefined) updates.image = image

    if (Object.keys(updates).length > 0) {
      await db.from("User").update(updates).eq("id", session.user.id)
    }

    if (name !== undefined) {
      await db.from("UserProfile").upsert(
        { userId: session.user.id, displayName: name },
        { onConflict: "userId", ignoreDuplicates: false }
      )
    }

    const { data: user } = await db
      .from("User")
      .select("id, name, email, image")
      .eq("id", session.user.id)
      .single()

    return NextResponse.json(user)
  } catch (err) {
    console.error("Profile update error:", err)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = adminDb
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const { data: user } = await db
      .from("User")
      .select("id, name, email, image, createdAt, profile:UserProfile(displayName, bio, timezone, onboardingDone)")
      .eq("id", session.user.id)
      .single()

    return NextResponse.json(user)
  } catch (err) {
    console.error("Profile fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
