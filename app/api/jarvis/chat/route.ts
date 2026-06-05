import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { getSession, createSession, updateSession, listMessages, addMessage, updateMessageSessionCount } from "@/lib/jarvis-db"
import { TOOLS } from "@/lib/jarvis-tool-defs"

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
    const { sessionId, message, model, endpointUrl, apiKey, systemPrompt, lifeContext, toolResult } = await req.json()
    if (!sessionId || !message) {
      return NextResponse.json({ error: "sessionId and message required" }, { status: 400 })
    }

    let session = await getSession(sessionId)
    if (!session) {
      session = await createSession(user.userId, { id: sessionId, name: "New Chat" })
    }

    const history = await listMessages(sessionId)

    const baseSystemPrompt = systemPrompt || session.system_prompt || "You are J.A.R.V.I.S., an AI strategist and personal assistant for LifeOS. Be concise, insightful, and personalized."
    const enhancedPrompt = lifeContext
      ? `${baseSystemPrompt}\n\nLIFEOS CONTEXT (real-time data):\n${lifeContext}\n\nUse this context to provide personalized, data-driven responses. If something needs attention, suggest actionable steps. You also have access to tools — use them to take action on the user's behalf when appropriate.`
      : baseSystemPrompt

    const llmMessages: { role: string; content: string; tool_call_id?: string }[] = []
    llmMessages.push({ role: "system", content: enhancedPrompt })

    if (toolResult) {
      for (const m of history) {
        llmMessages.push({ role: m.role, content: m.content })
      }
      llmMessages.push({ role: "tool", content: toolResult.result, tool_call_id: toolResult.toolCallId })
    } else {
      for (const m of history) {
        llmMessages.push({ role: m.role, content: m.content })
      }
      llmMessages.push({ role: "user", content: message })
      await addMessage({ session_id: sessionId, role: "user", content: message })
    }

    const mod = model || process.env.JARVIS_DEFAULT_MODEL || "llama-3.3-70b-versatile"
    const resolvedApiKey = apiKey ||
      process.env.JARVIS_GROQ_KEY ||
      process.env.JARVIS_OPENAI_KEY ||
      process.env.OPENAI_API_KEY ||
      ""

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

          const body: Record<string, unknown> = {
            model: mod,
            messages: llmMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 4096,
          }

          if (!toolResult) {
            body.tools = TOOLS
            body.tool_choice = "auto"
          }

          const response = await fetch(targetUrl, {
            method: "POST",
            headers: fetchHeaders,
            body: JSON.stringify(body),
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

          let fullAssistantContent = ""
          const decoder = new TextDecoder()
          const toolCallAcc: Record<number, { id: string; name: string; arguments: string }> = {}
          let finishReason: string | null = null
          let gotToolCall = false

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
                const choice = parsed.choices?.[0]

                if (choice?.delta?.content) {
                  fullAssistantContent += choice.delta.content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: choice.delta.content })}\n\n`))
                }

                if (choice?.delta?.tool_calls) {
                  gotToolCall = true
                  for (const tc of choice.delta.tool_calls) {
                    const idx = tc.index
                    if (tc.id) {
                      toolCallAcc[idx] = { id: tc.id, name: tc.function?.name || "", arguments: tc.function?.arguments || "" }
                    } else if (toolCallAcc[idx] && tc.function?.arguments) {
                      toolCallAcc[idx].arguments += tc.function.arguments
                    }
                  }
                }

                if (choice?.finish_reason) {
                  finishReason = choice.finish_reason
                }
              } catch {}
            }
          }

          if (gotToolCall) {
            for (const idx of Object.keys(toolCallAcc).map(Number).sort()) {
              const tc = toolCallAcc[idx]
              let parsedArgs: Record<string, unknown> = {}
              try { parsedArgs = JSON.parse(tc.arguments) } catch {}
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "tool_call", id: tc.id, name: tc.name, arguments: parsedArgs })}\n\n`))
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
            return
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()

          if (fullAssistantContent) {
            await addMessage({ session_id: sessionId, role: "assistant", content: fullAssistantContent })
          }
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
