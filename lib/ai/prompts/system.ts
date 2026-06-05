import { GENERAL_PURPOSE_PROMPT } from "../systemPrompt"

export interface SystemPromptInput {
  memoryBlock?: string
  customInstructions?: string
}

export function buildSystemPrompt(input: SystemPromptInput = {}): string {
  let prompt = GENERAL_PURPOSE_PROMPT.replace("{MEMORY_BLOCK}", input.memoryBlock || "No memories yet.")

  if (input.customInstructions) {
    prompt += `\n\n## custom instructions\n${input.customInstructions}`
  }

  return prompt
}
