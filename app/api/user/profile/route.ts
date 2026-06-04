import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name, image } = await req.json()

    const data: Record<string, string> = {}
    if (name !== undefined) data.name = name
    if (image !== undefined) data.image = image

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, image: true },
    })

    if (name !== undefined) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: { displayName: name },
        create: { userId: session.user.id, displayName: name },
      })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error("Profile update error:", err)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      profile: { select: { displayName: true, bio: true, timezone: true, onboardingDone: true } },
    },
  })

  return NextResponse.json(user)
}
