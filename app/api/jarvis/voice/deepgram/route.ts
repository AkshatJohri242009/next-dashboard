import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, { maxRequests: 20, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const formData = await req.formData()
    const audio = formData.get("audio") as Blob | null
    if (!audio) return NextResponse.json({ error: "Audio file required" }, { status: 400 })

    const apiKey = formData.get("apiKey") as string || process.env.DEEPGRAM_API_KEY
    if (!apiKey) return NextResponse.json({ error: "Deepgram API key not configured" }, { status: 400 })

    const buffer = Buffer.from(await audio.arrayBuffer())
    const res = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&language=en&punctuate=true", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": audio.type || "audio/webm",
      },
      body: buffer,
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Deepgram API error: ${err}` }, { status: res.status })
    }

    const data = await res.json()
    const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""
    return NextResponse.json({ text: transcript })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
