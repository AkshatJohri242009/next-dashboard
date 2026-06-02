import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, { maxRequests: 20, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured. Add it to your .env.local file." },
        { status: 500 },
      )
    }

    const models = ["gemini-2.0-flash", "gemini-2.5-flash"]
    let lastError = ""
    let data: any = null

    for (const model of models) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are a helpful AI assistant integrated into a personal performance dashboard. Answer questions about productivity, health, fitness, and data insights. Be concise and practical.\n\nUser: ${message}`,
                  },
                ],
              },
            ],
            generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
          }),
        },
      )
      if (res.ok) { data = await res.json(); break }
      lastError = await res.text()
    }

    if (!data) {
      return NextResponse.json({ error: `Gemini error: ${lastError}` }, { status: 502 })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    return NextResponse.json({ reply: text })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
