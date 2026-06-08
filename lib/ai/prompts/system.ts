import { GENERAL_PURPOSE_PROMPT } from "../systemPrompt"
import { buildIdentitySection } from "./sections/identity"
import { buildPersonalitySection } from "./sections/personality"
import { buildToolsSection } from "./sections/tools"
import { buildBoundariesSection } from "./sections/boundaries"
import { buildSecuritySection } from "./sections/security"

export interface SystemPromptInput {
  memoryBlock?: string
  customInstructions?: string
}

export function buildSystemPrompt(input: SystemPromptInput = {}): string {
  let prompt = GENERAL_PURPOSE_PROMPT.replace("{MEMORY_BLOCK}", input.memoryBlock || "No memories yet.")

  // Append modular sections
  prompt += `\n\n${buildIdentitySection()}`
  prompt += `\n\n${buildPersonalitySection()}`
  prompt += `\n\n${buildToolsSection()}`
  prompt += `\n\n${buildBoundariesSection()}`
  prompt += `\n\n${buildSecuritySection()}`

  if (input.customInstructions) {
    prompt += `\n\n## custom instructions\n${input.customInstructions}`
  }

  return prompt
}
