import { NextResponse } from "next/server"

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

RULES:
1. For questions ("how did I sleep?", "what are my goals?") — just answer conversationally using the context. NO action needed.
2. For commands ("add a goal to study physics", "log gym", "complete my math homework") — answer conversationally AND include the action tag at the end.
3. For greetings or chit-chat — respond naturally, no action.
4. NEVER make up data. If data is missing, say so.
5. Be concise but warm. Max 2-3 sentences.

CURRENT USER CONTEXT:
{lifeContext}`

export async function POST(req: Request) {
  try {
    const { text, lifeContext } = await req.json()
    if (!text) {
      return NextResponse.json({ error: "text required" }, { status: 400 })
    }

    const endpointUrl = process.env.JARVIS_DEFAULT_ENDPOINT || "https://api.groq.com/openai/v1"
    const model = process.env.JARVIS_DEFAULT_MODEL || "llama-3.3-70b-versatile"
    const apiKey = process.env.JARVIS_GROQ_KEY || process.env.JARVIS_OPENAI_KEY || process.env.OPENAI_API_KEY || ""

    const systemPrompt = SYSTEM_PROMPT.replace("{lifeContext}", lifeContext || "No context available yet.")

    const response = await fetch(`${endpointUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
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

    // Parse action tag from response
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
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
