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
  /**
   * Jatah waktu untuk SATU panggilan provider ini, diisi oleh
   * `generateCompletion()` dari sisa anggaran rantai. Provider meneruskannya
   * apa adanya ke `fetchWithTimeout`.
   */
  timeoutMs?: number
  /**
   * Anggaran waktu untuk seluruh rantai fallback. Default
   * `AI_CHAIN_DEADLINE_MS`. Turunkan kalau rute pemanggilnya memasang
   * `maxDuration` yang lebih pendek.
   */
  deadlineMs?: number
}

export interface AiProvider {
  name: string
  envKey: string
  complete(opts: AiCompletionOptions): Promise<string>
}
