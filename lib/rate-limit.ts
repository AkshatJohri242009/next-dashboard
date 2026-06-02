import { NextResponse } from "next/server"

const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  ip: string,
  options: { maxRequests?: number; windowMs?: number } = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { maxRequests = 30, windowMs = 60000 } = options
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt }
}

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
}

export function applyRateLimit(
  request: Request,
  options?: { maxRequests?: number; windowMs?: number }
): NextResponse | null {
  const ip = getClientIp(request)
  const result = rateLimit(ip, options)
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    )
  }
  return null
}
