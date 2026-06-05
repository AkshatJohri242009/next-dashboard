import { aiLogger } from "./logger"
import { AI_CONFIG } from "./config"

export interface ExecutorMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  tool_call_id?: string
}

export interface ToolCallAccumulator {
  id: string
  name: string
  arguments: string
}

export interface ExecutorResult {
  content: string
  toolCalls: { id: string; name: string; arguments: Record<string, unknown> }[]
  finishReason: string | null
}

/**
 * Makes an LLM API call with streaming, handling SSE parsing,
 * content accumulation, and tool call detection.
 */
export async function executeWithStreaming(
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
  onDelta: (text: string) => void
): Promise<ExecutorResult> {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API error (${response.status}): ${errText.substring(0, 200)}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error("No response body from LLM")

  const decoder = new TextDecoder()
  let fullContent = ""
  const toolCallAcc: Record<number, ToolCallAccumulator> = {}
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
          fullContent += choice.delta.content
          onDelta(choice.delta.content)
        }

        if (choice?.delta?.tool_calls) {
          gotToolCall = true
          for (const tc of choice.delta.tool_calls) {
            const idx = tc.index ?? 0
            if (tc.id) {
              toolCallAcc[idx] = {
                id: tc.id,
                name: tc.function?.name || "",
                arguments: tc.function?.arguments || "",
              }
            } else if (toolCallAcc[idx] && tc.function?.arguments) {
              toolCallAcc[idx].arguments += tc.function.arguments
            }
          }
        }

        if (choice?.finish_reason) {
          finishReason = choice.finish_reason
        }
      } catch {
        // Skip malformed SSE lines
      }
    }
  }

  const toolCalls = gotToolCall
    ? Object.keys(toolCallAcc)
        .map(Number)
        .sort()
        .map(idx => {
          const tc = toolCallAcc[idx]
          let parsedArgs: Record<string, unknown> = {}
          try {
            parsedArgs = JSON.parse(tc.arguments)
          } catch {
            // Parse error — return empty args
          }
          return { id: tc.id, name: tc.name, arguments: parsedArgs }
        })
    : []

  return { content: fullContent, toolCalls, finishReason }
}

/**
 * Build the LLM request body from messages, tools, and options.
 */
export function buildExecutorBody(
  messages: ExecutorMessage[],
  options: {
    model: string
    temperature?: number
    maxTokens?: number
    includeTools?: boolean
    tools?: unknown[]
    stream?: boolean
  }
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: options.model,
    messages,
    stream: options.stream ?? true,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  }

  if (options.includeTools && options.tools && options.tools.length > 0) {
    body.tools = options.tools
    body.tool_choice = "auto"
  }

  return body
}
