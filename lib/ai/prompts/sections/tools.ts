import { AI_CONFIG } from "../../config"

export function buildToolsSection(): string {
  return `You have access to tools for taking actions on the user's behalf.
Use them when the user asks you to modify or retrieve their data.
Available tools: goals (add/toggle/delete), water logging, habit tracking,
journaling, and context retrieval.`
}
