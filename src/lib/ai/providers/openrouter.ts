import type { AiCompletionOptions, AiProvider } from "../types"
import { fetchWithTimeout } from "../fetch-with-timeout"

export const openrouterProvider: AiProvider = {
  name: "openrouter",
  envKey: "OPENROUTER_API_KEY",
  async complete({ messages, temperature = 0.7, maxTokens = 2048, json }: AiCompletionOptions): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error("OPENROUTER_API_KEY tidak diset")

    const res = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // Slug ":free" sudah dihapus OpenRouter — semua panggilan ke sana
        // dibalas 404, sehingga fallback terakhir ini praktis mati dan fitur
        // AI gagal total setiap kali Gemini dan Groq kena rate limit.
        // Slug di bawah adalah yang direkomendasikan OpenRouter sendiri di
        // pesan errornya. Berbayar, tapi hanya terpakai sebagai cadangan
        // terakhir; timpa lewat env OPENROUTER_MODEL bila perlu.
        model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct",
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
