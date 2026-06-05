export type LogLevel = "debug" | "info" | "warn" | "error" | "security"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: Record<string, unknown>
}

const LOG_LEVEL_PREFIXES: Record<LogLevel, string> = {
  debug: "  [DEBUG]",
  info: "   [INFO]",
  warn: "   [WARN]",
  error: "  [ERROR]",
  security: "[SECURITY]",
}

function formatLog(entry: LogEntry): string {
  const prefix = LOG_LEVEL_PREFIXES[entry.level]
  const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : ""
  return `${prefix} ${entry.message}${dataStr}`
}

export function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = { level, message, timestamp: new Date().toISOString(), data }
  const formatted = formatLog(entry)

  switch (level) {
    case "error":
      console.error(formatted)
      break
    case "warn":
      console.warn(formatted)
      break
    case "security":
      console.warn(formatted)
      break
    default:
      console.log(formatted)
  }
}

export const aiLogger = {
  debug: (msg: string, data?: Record<string, unknown>) => log("debug", msg, data),
  info: (msg: string, data?: Record<string, unknown>) => log("info", msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => log("warn", msg, data),
  error: (msg: string, data?: Record<string, unknown>) => log("error", msg, data),
  security: (msg: string, data?: Record<string, unknown>) => log("security", msg, data),
}
