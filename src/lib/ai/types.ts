export interface AiMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AiCompletionOptions {
  messages: AiMessage[]
  temperature?: number
  maxTokens?: number
  json?: boolean
  /**
   * Id model yang dipilih admin. Hanya dipakai provider yang mengenalinya
   * (saat ini Gemini); provider lain memakai model bawaannya sendiri.
   */
  model?: string
}

export interface AiProvider {
  name: string
  envKey: string
  complete(opts: AiCompletionOptions): Promise<string>
}
