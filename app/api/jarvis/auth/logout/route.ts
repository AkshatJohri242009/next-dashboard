import { NextResponse } from "next/server"
import { removeSessionToken } from "@/lib/jarvis-auth"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = cookies()
  const token = cookieStore.get("jarvis_token")?.value
  if (token) {
    await removeSessionToken(token)
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set("jarvis_token", "", { maxAge: 0, path: "/" })
  return res
}
