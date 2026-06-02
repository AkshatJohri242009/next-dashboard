import { NextResponse } from "next/server"
import { requireJarvisUser } from "@/lib/jarvis-auth"
import { jarvisDb } from "@/lib/jarvis-db"

export async function POST(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  try {
    const { text, recordId, table } = await req.json()
    if (!text || !recordId || !table) {
      return NextResponse.json({ error: "text, recordId, table required" }, { status: 400 })
    }

    if (!["jarvis_memories", "jarvis_documents"].includes(table)) {
      return NextResponse.json({ error: "table must be jarvis_memories or jarvis_documents" }, { status: 400 })
    }

    const apiKey = process.env.JARVIS_OPENAI_KEY || process.env.OPENAI_API_KEY
    let embedding: number[] | null = null

    if (apiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: text.slice(0, 8000),
          }),
        })

        if (res.ok) {
          const data = await res.json()
          embedding = data?.data?.[0]?.embedding || null
        }
      } catch {}
    }

    if (!embedding) {
      const words = text.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2)
      const dim = 384
      embedding = new Array(dim).fill(0)
      for (const word of words) {
        let hash = 0
        for (let i = 0; i < word.length; i++) {
          hash = ((hash << 5) - hash) + word.charCodeAt(i)
          hash |= 0
        }
        const idx = Math.abs(hash) % dim
        embedding[idx] = (embedding[idx] || 0) + 1
      }
      const magnitude = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0))
      if (magnitude > 0) embedding = embedding.map(v => v / magnitude)
    }

    if (jarvisDb) {
      const { error: updateError } = await jarvisDb
        .from(table)
        .update({ embedding: `[${embedding.join(",")}]` })
        .eq("id", recordId)
        .eq("user_id", user.userId)

      if (updateError) {
        return NextResponse.json({ error: `Update failed: ${updateError.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, dimensions: embedding.length, source: apiKey ? "openai" : "hash" })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { user, error } = await requireJarvisUser()
  if (error) return error

  try {
    const url = new URL(req.url)
    const query = url.searchParams.get("q") || ""
    const table = url.searchParams.get("table") || "jarvis_memories"
    const limit = parseInt(url.searchParams.get("limit") || "10")

    if (!query) return NextResponse.json({ results: [] })

    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const dim = 384
    const queryEmbedding = new Array(dim).fill(0)
    for (const word of words) {
      let hash = 0
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i)
        hash |= 0
      }
      const idx = Math.abs(hash) % dim
      queryEmbedding[idx] = (queryEmbedding[idx] || 0) + 1
    }
    const magnitude = Math.sqrt(queryEmbedding.reduce((s, v) => s + v * v, 0))
    if (magnitude > 0) queryEmbedding.forEach((_, i) => { queryEmbedding[i] /= magnitude })

    if (jarvisDb && table === "jarvis_memories") {
      const { data } = await jarvisDb
        .from(table)
        .select("id, text, category, created_at")
        .eq("user_id", user.userId)
        .order("created_at", { ascending: false })
        .limit(100)

      if (data) {
        const scored = data.map((r: any) => {
          const memWords = (r.text || "").toLowerCase().split(/\s+/)
          const matchCount = words.filter(w => memWords.some((mw: string) => mw.includes(w))).length
          return { ...r, score: words.length > 0 ? matchCount / words.length : 0 }
        })
        scored.sort((a: any, b: any) => b.score - a.score)
        return NextResponse.json({ results: scored.slice(0, limit) })
      }
    }

    return NextResponse.json({ results: [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
