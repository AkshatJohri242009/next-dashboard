import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { getSession, createSession, updateSession, listMessages, addMessage, updateMessageSessionCount } from "@/lib/jarvis-db"

const OPENJARVIS_URL = process.env.OPENJARVIS_URL || "http://127.0.0.1:8000"

async function ojIsAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OPENJARVIS_URL}/v1/models`, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  try {
    const { sessionId, message, mode, model, endpointUrl, apiKey, systemPrompt, lifeContext } = await req.json()
    if (!sessionId || !message) {
      return NextResponse.json({ error: "sessionId and message required" }, { status: 400 })
    }

    let session = await getSession(sessionId)
    if (!session) {
      session = await createSession(user.userId, { id: sessionId, name: "New Chat" })
    }

    await addMessage({ session_id: sessionId, role: "user", content: message })
    const history = await listMessages(sessionId)

    const baseSystemPrompt = systemPrompt || session.system_prompt || "You are J.A.R.V.I.S., an AI strategist and personal assistant for LifeOS. Be concise, insightful, and personalized."
    const enhancedPrompt = lifeContext
      ? `${baseSystemPrompt}\n\nLIFEOS CONTEXT (real-time data):\n${lifeContext}\n\nUse this context to provide personalized, data-driven responses. If something needs attention, suggest actionable steps.`
      : baseSystemPrompt

    const llmMessages: { role: string; content: string }[] = []
    llmMessages.push({ role: "system", content: enhancedPrompt })
    for (const m of history) {
      llmMessages.push({ role: m.role, content: m.content })
    }

    const mod = model || process.env.JARVIS_DEFAULT_MODEL || "llama-3.3-70b-versatile"
    const resolvedApiKey = apiKey ||
      process.env.JARVIS_GROQ_KEY ||
      process.env.JARVIS_OPENAI_KEY ||
      process.env.OPENAI_API_KEY ||
      ""

    // Route through OpenJarvis if available, otherwise direct to Groq
    const ojAvailable = await ojIsAvailable()
    const targetUrl = ojAvailable
      ? `${OPENJARVIS_URL}/v1/chat/completions`
      : `${endpointUrl || process.env.JARVIS_DEFAULT_ENDPOINT || "https://api.groq.com/openai/v1"}/chat/completions`

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const fetchHeaders: Record<string, string> = {
            "Content-Type": "application/json",
          }
          if (!ojAvailable) {
            fetchHeaders["Authorization"] = `Bearer ${resolvedApiKey}`
          }

          const response = await fetch(targetUrl, {
            method: "POST",
            headers: fetchHeaders,
            body: JSON.stringify({
              model: mod,
              messages: llmMessages,
              stream: true,
              temperature: 0.7,
              max_tokens: 4096,
            }),
          })

          if (!response.ok) {
            const errText = await response.text()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `API error (${response.status}): ${errText.substring(0, 200)}` })}\n\n`))
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
            return
          }

          const reader = response.body?.getReader()
          if (!reader) throw new Error("No response body")

          let fullResponse = ""
          const decoder = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n").filter(l => l.startsWith("data: "))
            for (const line of lines) {
              const data = line.replace("data: ", "").trim()
              if (data === "[DONE]") continue
              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content || ""
                if (delta) {
                  fullResponse += delta
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`))
                }
              } catch {}
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()

          await addMessage({ session_id: sessionId, role: "assistant", content: fullResponse })
          await updateSession(sessionId, {
            last_accessed_at: new Date().toISOString(),
          } as any)
          await updateMessageSessionCount(sessionId)
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`))
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Chat failed" }, { status: 500 })
  }
}
