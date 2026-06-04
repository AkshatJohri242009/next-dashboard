import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"

const OPENJARVIS_URL = process.env.OPENJARVIS_URL || "http://127.0.0.1:8000"

const SYSTEM_PROMPT = `You are J.A.R.V.I.S., the AI intelligence layer for LifeOS. You understand natural language and execute operations on the user's LifeOS.

You have access to the user's real-time life context below. Use it to answer questions and execute actions.

AVAILABLE ACTIONS — respond ONLY with an action when the user explicitly asks to DO something. For questions just answer naturally.

Action format (include at the END of your response if an action is needed):
⟪action:{"type":"actionName","params":{...}}⟫

Valid actions:
- addGoal: { "text": "goal description" }
- completeGoal: { "text": "partial goal text to match" }
- logHabit: { "name": "habit name" }
- addHabit: { "name": "habit name" }
- logWater: { "ml": 250 }
- logWorkout: { "duration": 45 }
- startSleepTimer: {}
- stopSleepTimer: {}
- logJournal: { "content": "entry text", "mood": "great|good|neutral|bad|awful" }
- logStudy: { "topic": "chapter or topic name" }
- navigate: { "page": "gym|sleep|journal|habits|stocks|health|study|learning|missions|decisions|timeline|brain|reviews|projects|weight|voice|briefings|memory|correlations|future|report|jarvis|home" }
- addReminder: { "text": "reminder text" }
- setSleep: { "hours": 8 }
- toggleSupp: { "key": "vitamin_d|magnesium|omega3|zinc|b12|iron|creatine" }
- addCustomExercise: { "name": "exercise name" }
- deleteCustomExercise: { "name": "exercise name" }

RULES:
1. For questions ("how did I sleep?", "what are my goals?") — just answer conversationally using the context. NO action needed.
2. For commands ("add a goal to study physics", "log gym", "complete my math homework") — answer conversationally AND include the action tag at the end.
3. For greetings or chit-chat — respond naturally, no action.
4. NEVER make up data. If data is missing, say so.
5. Be concise but warm. Max 2-3 sentences.

CURRENT USER CONTEXT:
{lifeContext}`

async function ojIsAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OPENJARVIS_URL}/v1/models`, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, { maxRequests: 30, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { text, lifeContext } = await req.json()
    if (!text) {
      return NextResponse.json({ error: "text required" }, { status: 400 })
    }

    const model = process.env.JARVIS_DEFAULT_MODEL || "llama-3.3-70b-versatile"
    const apiKey = process.env.JARVIS_GROQ_KEY || process.env.JARVIS_OPENAI_KEY || process.env.OPENAI_API_KEY || ""
    const systemPrompt = SYSTEM_PROMPT.replace("{lifeContext}", lifeContext || "No context available yet.")

    const ojAvailable = await ojIsAvailable()
    const targetUrl = ojAvailable
      ? `${OPENJARVIS_URL}/v1/chat/completions`
      : `${process.env.JARVIS_DEFAULT_ENDPOINT || "https://api.groq.com/openai/v1"}/chat/completions`

    const fetchHeaders: Record<string, string> = { "Content-Type": "application/json" }
    if (!ojAvailable) fetchHeaders["Authorization"] = `Bearer ${apiKey}`

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: `LLM API error (${response.status}): ${errText.substring(0, 200)}` }, { status: response.status })
    }

    const data = await response.json()
    const fullText = data.choices?.[0]?.message?.content || ""

    const actionMatch = fullText.match(/⟪action:(\{.*?\})⟫/)
    let action = null
    let message = fullText

    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1])
        message = fullText.replace(actionMatch[0], "").trim()
      } catch {}
    }

    return NextResponse.json({ message, action })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
