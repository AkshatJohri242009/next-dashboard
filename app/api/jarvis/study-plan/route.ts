import { NextResponse } from "next/server"

const OPENJARVIS_URL = process.env.OPENJARVIS_URL || "http://127.0.0.1:8000"

async function ojIsAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OPENJARVIS_URL}/v1/models`, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch { return false }
}

export async function POST(req: Request) {
  try {
    const { chapters, context } = await req.json()
    if (!chapters || chapters.length === 0) {
      return NextResponse.json({ error: "No chapters provided" }, { status: 400 })
    }

    const model = process.env.JARVIS_DEFAULT_MODEL || "llama-3.3-70b-versatile"
    const apiKey = process.env.JARVIS_GROQ_KEY || process.env.JARVIS_OPENAI_KEY || process.env.OPENAI_API_KEY || ""

    const incompleteBySubject = chapters.filter((c: any) => !c.completed).reduce((acc: any, c: any) => {
      if (!acc[c.subject]) acc[c.subject] = []
      acc[c.subject].push(c.name)
      return acc
    }, {})

    const subjectSummary = Object.entries(incompleteBySubject)
      .map(([subject, chs]: any) => `${subject}: ${chs.length} chapters remaining (${chs.join(", ")})`)
      .join("\n")

    const allDone = Object.keys(incompleteBySubject).length === 0
    const completedCount = chapters.filter((c: any) => c.completed).length

    const systemPrompt = `You are J.A.R.V.I.S., an expert academic study planner. Your role is to create personalized, realistic daily study plans.

The user is preparing for competitive exams (JEE/NEET level) with Physics, Chemistry, Mathematics, and Computer Science.

For each study plan you generate:
1. Prioritize weak topics and subjects the user has struggled with
2. Create specific time blocks (e.g., "9:00-10:30 AM") with clear tasks
3. Suggest specific problems, derivations, or practice exercises for each block
4. Balance subjects to avoid fatigue — rotate between theory-heavy and practice-heavy
5. Include short breaks between blocks
6. Recommend a focus area for the day based on upcoming topics
7. Keep the plan actionable and specific — mention exact chapter names and concepts

Output format — respond with a JSON object ONLY, no markdown, no other text:
{
  "focus": "One-line summary of today's primary focus",
  "totalStudyTime": "X hours Y minutes",
  "schedule": [
    {
      "time": "9:00 AM - 10:30 AM",
      "topic": "Chapter name",
      "subject": "Physics",
      "task": "Specific task description with derivations/problems to attempt",
      "type": "theory" | "practice" | "revision"
    }
  ],
  "breaks": [
    { "time": "10:30 AM - 10:45 AM", "activity": "Short walk / stretch" }
  ],
  "weakAreas": ["topic 1", "topic 2"],
  "tips": ["Actionable tip 1", "Actionable tip 2"]
}`

    const userPrompt = allDone
      ? `All ${completedCount} chapters are completed! Congratulate the user and suggest next steps like revisiting weak areas or taking mock tests.`
      : `Create a detailed daily study plan based on these incomplete chapters:\n\n${subjectSummary}\n\n${context ? `Additional context: ${context}` : ""}\n\nInclude specific time blocks, chapter names, and practice recommendations.`

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: `LLM API error (${response.status}): ${errText.substring(0, 200)}` }, { status: response.status })
    }

    const data = await response.json()
    const fullText = data.choices?.[0]?.message?.content || ""

    let plan
    try {
      plan = JSON.parse(fullText)
    } catch {
      return NextResponse.json({ plan: null, raw: fullText, message: "Study plan generated (see raw output below)." })
    }

    return NextResponse.json({ plan, allDone })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}