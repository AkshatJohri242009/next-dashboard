import { buildIdentitySection } from "./sections/identity"
import { buildPersonalitySection } from "./sections/personality"
import { buildToolsSection } from "./sections/tools"
import { buildBoundariesSection } from "./sections/boundaries"
import { buildSecuritySection } from "./sections/security"

export interface SystemPromptInput {
  lifeContext?: string
  memoriesSection?: string
  customInstructions?: string
  page?: string
}

/**
 * Assembles the full system prompt from modular sections.
 * Each section is separated by blank lines for clarity.
 */
export function buildSystemPrompt(input: SystemPromptInput = {}): string {
  const sections: string[] = []

  sections.push(buildIdentitySection())
  sections.push(buildPersonalitySection())
  sections.push(buildToolsSection())
  sections.push(buildBoundariesSection())

  // LifeOS context
  if (input.lifeContext) {
    sections.push(`LIFEOS CONTEXT (real-time data):\n${input.lifeContext}`)
  }

  // Memories
  if (input.memoriesSection) {
    sections.push(input.memoriesSection)
  }

  // Custom instructions (from user settings)
  if (input.customInstructions) {
    sections.push(`ADDITIONAL INSTRUCTIONS:\n${input.customInstructions}`)
  }

  // Page context
  if (input.page) {
    sections.push(`Current page: /${input.page}`)
  }

  sections.push(buildSecuritySection())

  return sections.join("\n\n")
}
