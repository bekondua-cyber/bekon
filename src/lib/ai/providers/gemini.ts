import type { AiCompletionOptions, AiProvider } from "../types"

export const geminiProvider: AiProvider = {
  name: "gemini",
  envKey: "GEMINI_API_KEY",
  async complete({ messages, temperature = 0.7, maxTokens = 2048, json }: AiCompletionOptions): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY tidak diset")

    const systemMessages = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n")
    const conversation = messages.filter((m) => m.role !== "system")

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      throw Object.assign(new Error(`Gemini error: ${res.status} ${text}`), { status: res.status })
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || ""
    if (!text) throw new Error("Gemini mengembalikan respons kosong")
    return text
  },
}
