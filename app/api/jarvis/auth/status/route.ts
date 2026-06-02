import { NextResponse } from "next/server"
import { getJarvisUser } from "@/lib/jarvis-auth"

export async function GET() {
  const user = await getJarvisUser()
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
  return NextResponse.json({
    authenticated: true,
    userId: user.userId,
    username: user.username,
    isAdmin: user.isAdmin,
  })
}
