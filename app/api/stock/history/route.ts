import { NextResponse } from "next/server"

const RANGES: Record<string, { range: string; interval: string }> = {
  "1d": { range: "1d", interval: "1m" },
  "5d": { range: "5d", interval: "5m" },
  "1mo": { range: "1mo", interval: "1d" },
  "3mo": { range: "3mo", interval: "1d" },
  "1y": { range: "1y", interval: "1wk" },
  "5y": { range: "5y", interval: "1mo" },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")
  const range = searchParams.get("range") || "1mo"
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 })

  const config = RANGES[range] || RANGES["1mo"]

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${config.range}&interval=${config.interval}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 502 })
    }
    const json = await res.json()
    const result = json.chart?.result?.[0]
    if (!result) {
      return NextResponse.json({ error: "No data" }, { status: 404 })
    }

    const timestamps: number[] = result.timestamp || []
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || []

    const points = timestamps
      .map((t, i) => ({
        date: new Date(t * 1000).toISOString(),
        close: closes[i],
      }))
      .filter(p => p.close !== null)

    return NextResponse.json({ symbol, range, points })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
