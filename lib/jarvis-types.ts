export interface JarvisUser {
  id: string
  username: string
  is_admin: boolean
  privileges: Record<string, unknown>
  created_at: string
}

export interface JarvisSession {
  id: string
  name: string
  model: string
  endpoint_url: string
  system_prompt: string
  mode: "chat" | "agent" | "research"
  folder: string | null
  is_archived: boolean
  message_count: number
  total_input_tokens: number
  total_output_tokens: number
  created_at: string
  updated_at: string
  last_accessed_at: string
}

export interface JarvisMessage {
  id: string
  session_id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface JarvisMemory {
  id: string
  text: string
  category: string
  source: string
  session_id: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface JarvisDocument {
  id: string
  session_id: string | null
  title: string
  language: string | null
  content: string
  version_count: number
  is_active: boolean
  is_archived: boolean
  source: string
  created_at: string
  updated_at: string
}

export interface JarvisEndpoint {
  id: string
  name: string
  base_url: string
  api_key: string | null
  model_type: "llm" | "image"
  is_enabled: boolean
}

export interface LLMProvider {
  name: string
  base_url: string
  api_key?: string
  models: string[]
}

export const DEFAULT_PROVIDERS: LLMProvider[] = [
  {
    name: "OpenAI",
    base_url: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    name: "Ollama (Local)",
    base_url: "http://localhost:11434/v1",
    models: [],
    api_key: "ollama",
  },
  {
    name: "Anthropic",
    base_url: "https://api.anthropic.com/v1",
    models: ["claude-sonnet-4-20250514", "claude-haiku-3-5", "claude-opus-4"],
  },
  {
    name: "Google Gemini",
    base_url: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: ["gemini-2.5-pro", "gemini-2.0-flash"],
  },
  {
    name: "Groq",
    base_url: "https://api.groq.com/openai/v1",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
  },
]

export const CHAT_MODES = ["chat", "agent", "research"] as const
