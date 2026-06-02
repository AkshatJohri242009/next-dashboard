import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const rateLimitResponse = applyRateLimit(request, { maxRequests: 60, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")
  if (!q || q.length < 1) return NextResponse.json({ results: [] })

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`,
      { next: { revalidate: 30 } },
    )
    if (!res.ok) return NextResponse.json({ results: [] })
    const json = await res.json()
    const results = (json.quotes || [])
      .filter((q: any) => q.quoteType && q.symbol)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || "",
        type: q.quoteType || "",
      }))
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
