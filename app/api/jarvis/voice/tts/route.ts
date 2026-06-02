import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, { maxRequests: 30, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { text, provider, voice } = await req.json()
    if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 })

    if (provider === "elevenlabs") {
      const apiKey = process.env.ELEVENLABS_API_KEY
      if (!apiKey) return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 400 })

      const voiceId = voice || "21m00Tcm4TlvDq8ikWAM"
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: `ElevenLabs error: ${err}` }, { status: res.status })
      }

      const audioBuffer = await res.arrayBuffer()
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.byteLength.toString(),
        },
      })
    }

    if (provider === "openai") {
      const apiKey = process.env.JARVIS_OPENAI_KEY || process.env.OPENAI_API_KEY
      if (!apiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 400 })

      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: voice || "alloy",
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: `OpenAI TTS error: ${err}` }, { status: res.status })
      }

      const audioBuffer = await res.arrayBuffer()
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.byteLength.toString(),
        },
      })
    }

    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
