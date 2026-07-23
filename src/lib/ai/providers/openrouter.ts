import type { AiCompletionOptions, AiProvider } from "../types"

export const openrouterProvider: AiProvider = {
  name: "openrouter",
  envKey: "OPENROUTER_API_KEY",
  async complete({ messages, temperature = 0.7, maxTokens = 2048, json }: AiCompletionOptions): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error("OPENROUTER_API_KEY tidak diset")

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw Object.assign(new Error(`OpenRouter error: ${res.status} ${text}`), { status: res.status })
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content || ""
    if (!text) throw new Error("OpenRouter mengembalikan respons kosong")
    return text
  },
}
