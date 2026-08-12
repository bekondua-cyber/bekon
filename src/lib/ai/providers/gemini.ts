import type { AiCompletionOptions, AiProvider } from "../types"
import { fetchWithTimeout } from "../fetch-with-timeout"
import { DEFAULT_GEMINI_MODEL } from "../gemini-models"

export const geminiProvider: AiProvider = {
  name: "gemini",
  envKey: "GEMINI_API_KEY",
  async complete({ messages, temperature = 0.7, maxTokens = 2048, json, model }: AiCompletionOptions): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY tidak diset")

    // Model lama "gemini-2.0-flash" rutin membalas 429; default kini varian
    // lite terbaru yang jatah hariannya paling longgar.
    const modelId = model || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL

    const systemMessages = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n")
    const conversation = messages.filter((m) => m.role !== "system")

    const res = await fetchWithTimeout(
      // Kunci dikirim lewat header, bukan query string. Sebagai `?key=...` ia
      // ikut tercatat di log request, log proxy, dan pesan error — tempat yang
      // tidak seharusnya menyimpan kredensial.
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: systemMessages ? { parts: [{ text: systemMessages }] } : undefined,
          contents: conversation.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            ...(json ? { responseMimeType: "application/json" } : {}),
          },
        }),
      }
    )

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw Object.assign(new Error(`Gemini error (${modelId}): ${res.status} ${text}`), { status: res.status })
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || ""
    if (!text) throw new Error("Gemini mengembalikan respons kosong")
    return text
  },
}
