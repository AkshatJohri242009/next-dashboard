import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { getSession, createSession, updateSession, listMessages, addMessage, updateMessageSessionCount } from "@/lib/jarvis-db"
import { TOOLS } from "@/lib/jarvis-tool-defs"
import { applyRateLimit } from "@/lib/rate-limit"
import { sanitizeInput } from "@/lib/ai/sanitize"
import { wrapUserContent } from "@/lib/ai/prompts/injection-fence"
import { buildSystemPrompt } from "@/lib/ai/prompts/system"
import { buildContextWithBudget } from "@/lib/ai/context-manager"
import { executeWithStreaming, buildExecutorBody, type ExecutorMessage } from "@/lib/ai/executor"
import { getMemories, saveMemory, parseMemorySave, stripMemorySave } from "@/lib/ai/memory"
import { aiLogger } from "@/lib/ai/logger"
import { AI_CONFIG } from "@/lib/ai/config"

const OPENJARVIS_URL = process.env.OPENJARVIS_URL || "http://127.0.0.1:8000"

const injectionTracker = new Map<string, { count: number; hourStart: number }>()

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

  const rateLimitResult = applyRateLimit(req, {
    maxRequests: AI_CONFIG.RATE_LIMIT_CHAT_PER_MIN,
    windowMs: 60_000,
  })
  if (rateLimitResult) return rateLimitResult

  try {
    const { sessionId, message, model, endpointUrl, apiKey, systemPrompt, toolResult } = await req.json()
    if (!sessionId || !message) {
      return NextResponse.json({ error: "sessionId and message required" }, { status: 400 })
    }

    // Sanitize user input
    const sanitized = sanitizeInput(message)
    if (sanitized.blocked) {
      aiLogger.security("Injection attempt blocked", {
        userId: user.userId,
        reason: sanitized.reason,
      })
      const now = Date.now()
      const tracker = injectionTracker.get(user.userId) || { count: 0, hourStart: now }
      if (now - tracker.hourStart > 3_600_000) { tracker.count = 0; tracker.hourStart = now }
      tracker.count++
      injectionTracker.set(user.userId, tracker)
      if (tracker.count >= AI_CONFIG.MAX_INJECTION_ATTEMPTS_PER_HOUR) {
        aiLogger.security("User blocked for repeated injection attempts", { userId: user.userId })
        return NextResponse.json({ error: "Account temporarily restricted" }, { status: 429 })
      }
      return NextResponse.json({ error: sanitized.reason }, { status: 400 })
    }

    const fencedMessage = wrapUserContent(sanitized.clean)

    let session = await getSession(sessionId)
    if (!session) {
      session = await createSession(user.userId, { id: sessionId, name: "New Chat" })
    }

    const history = await listMessages(sessionId)

    // Truncate very long conversations: keep last 30 turns
    let trimmedHistory = history
    if (history.length > 40) {
      trimmedHistory = history.slice(-30)
      aiLogger.debug("Conversation history truncated", {
        originalCount: history.length,
        trimmedCount: history.length - 30,
      })
    }

    // Fetch persistent memories and inject into system prompt
    const memoryBlock = await getMemories(user.userId)
    const fullSystemPrompt = buildSystemPrompt({
      memoryBlock,
      customInstructions: systemPrompt || session.system_prompt || undefined,
    })

    // Apply token budgeting
    const budgeted = buildContextWithBudget(fullSystemPrompt, trimmedHistory)

    if (budgeted.trimmedHistoryCount > 0) {
      aiLogger.debug("Context window trimmed", {
        trimmedCount: budgeted.trimmedHistoryCount,
        totalTokens: budgeted.totalTokens,
      })
    }

    // Build messages for LLM
    const llmMessages: ExecutorMessage[] = [
      { role: "system", content: budgeted.systemPrompt },
      ...budgeted.history.map(m => ({ role: m.role as ExecutorMessage["role"], content: m.content })),
    ]

    if (toolResult) {
      llmMessages.push({ role: "tool", content: toolResult.result, tool_call_id: toolResult.toolCallId })
    } else {
      llmMessages.push({ role: "user", content: fencedMessage })
      await addMessage({ session_id: sessionId, role: "user", content: sanitized.clean })
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

          const body = buildExecutorBody(llmMessages, {
            model: mod,
            includeTools: !toolResult,
            tools: TOOLS,
            stream: true,
          })

          const result = await executeWithStreaming(
            targetUrl,
            fetchHeaders,
            body,
            (delta) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`))
            }
          )

          // Parse and persist memory_save blocks from the response
          let cleanContent = result.content
          if (cleanContent) {
            const parsed = parseMemorySave(cleanContent)
            if (parsed) {
              await saveMemory(user.userId, parsed.key, parsed.value, parsed.importance)
              aiLogger.info("Memory saved", { key: parsed.key, importance: parsed.importance })
            }
            cleanContent = stripMemorySave(cleanContent)
          }

          // Forward tool calls to client
          if (result.toolCalls.length > 0) {
            for (const tc of result.toolCalls) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "tool_call", ...tc })}\n\n`))
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()

          // Persist assistant message (with memory block stripped)
          if (cleanContent) {
            await addMessage({ session_id: sessionId, role: "assistant", content: cleanContent })
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
