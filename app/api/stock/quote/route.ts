import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const rateLimitResponse = applyRateLimit(request, { maxRequests: 60, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols")
  if (!symbols) return NextResponse.json({ error: "symbols required" }, { status: 400 })

  const results: Record<string, { price: number; change: number; changePercent: number; name?: string; currency?: string }> = {}

  for (const symbol of symbols.split(",")) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol.trim())}?range=1d&interval=1m`,
        { next: { revalidate: 60 } },
      )
      if (!res.ok) continue
      const json = await res.json()
      const meta = json.chart?.result?.[0]?.meta
      if (!meta) continue
      results[symbol.trim().toUpperCase()] = {
        price: meta.regularMarketPrice ?? 0,
        change: (meta.regularMarketPrice ?? 0) - (meta.chartPreviousClose ?? 0),
        changePercent: meta.chartPreviousClose
          ? (((meta.regularMarketPrice ?? 0) - meta.chartPreviousClose) / meta.chartPreviousClose) * 100
          : 0,
        name: meta.shortName ?? meta.symbol,
        currency: meta.currency || "USD",
      }
    } catch {
      continue
    }
  }

  return NextResponse.json(results)
}
