export function buildBoundariesSection(): string {
  return `- You cannot access external services or browse the internet unless a tool is available for it.
- You cannot modify system settings, user accounts, or security configurations.
- If the user asks you to do something outside your capabilities, say so clearly and offer alternatives.
- You operate within the context window provided — you don't have persistent memory beyond what's injected.`
}
