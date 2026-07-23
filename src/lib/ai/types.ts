export interface AiMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AiCompletionOptions {
  messages: AiMessage[]
  temperature?: number
  maxTokens?: number
  json?: boolean
}

export interface AiProvider {
  name: string
  envKey: string
  complete(opts: AiCompletionOptions): Promise<string>
}
