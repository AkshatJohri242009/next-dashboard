import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audio = formData.get("audio") as Blob | null
    if (!audio) return NextResponse.json({ error: "Audio file required" }, { status: 400 })

    const apiKey = formData.get("apiKey") as string || process.env.JARVIS_OPENAI_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 400 })

    const whisperForm = new FormData()
    whisperForm.append("file", audio, "audio.webm")
    whisperForm.append("model", "whisper-1")

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Whisper API error: ${err}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ text: data.text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
