import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Rantai fallback dulu mencoba SEMUA provider untuk error apa pun. Untuk
 * kegagalan 4xx — prompt cacat, kunci salah — ketiganya pasti gagal dengan
 * alasan sama, jadi itu membakar 3x biaya dan waktu untuk hasil yang sudah
 * pasti gagal.
 */
const complete = {
  gemini: vi.fn(),
  groq: vi.fn(),
  openrouter: vi.fn(),
}

vi.mock("@/lib/ai/providers/gemini", () => ({
  geminiProvider: { name: "gemini", envKey: "GEMINI_API_KEY", complete: (o: unknown) => complete.gemini(o) },
}))
vi.mock("@/lib/ai/providers/groq", () => ({
  groqProvider: { name: "groq", envKey: "GROQ_API_KEY", complete: (o: unknown) => complete.groq(o) },
}))
vi.mock("@/lib/ai/providers/openrouter", () => ({
  openrouterProvider: { name: "openrouter", envKey: "OPENROUTER_API_KEY", complete: (o: unknown) => complete.openrouter(o) },
}))

const options = { messages: [{ role: "user" as const, content: "halo" }] }

function httpError(status: number) {
  return Object.assign(new Error(`error ${status}`), { status })
}

describe("rantai fallback AI provider", () => {
  beforeEach(() => {
    vi.resetModules()
    for (const fn of Object.values(complete)) fn.mockReset()
    process.env.GEMINI_API_KEY = "x"
    process.env.GROQ_API_KEY = "x"
    process.env.OPENROUTER_API_KEY = "x"
    delete process.env.AI_PROVIDER_ORDER
  })

  afterEach(() => {
    delete process.env.GEMINI_API_KEY
    delete process.env.GROQ_API_KEY
    delete process.env.OPENROUTER_API_KEY
  })

  it("BERHENTI di provider pertama untuk error 400 — provider lain tidak akan berbeda", async () => {
    const { generateCompletion } = await import("@/lib/ai")
    complete.gemini.mockRejectedValue(httpError(400))

    await expect(generateCompletion(options)).rejects.toThrow()
    expect(complete.gemini).toHaveBeenCalledTimes(1)
    expect(complete.groq).not.toHaveBeenCalled()
    expect(complete.openrouter).not.toHaveBeenCalled()
  })

  it("BERHENTI untuk 401 (kunci API salah)", async () => {
    const { generateCompletion } = await import("@/lib/ai")
    complete.gemini.mockRejectedValue(httpError(401))

    await expect(generateCompletion(options)).rejects.toThrow()
    expect(complete.groq).not.toHaveBeenCalled()
  })

  it("LANJUT ke provider berikutnya untuk 429 (kena batas, khas satu provider)", async () => {
    const { generateCompletion } = await import("@/lib/ai")
    complete.gemini.mockRejectedValue(httpError(429))
    complete.groq.mockResolvedValue("jawaban dari groq")

    await expect(generateCompletion(options)).resolves.toBe("jawaban dari groq")
    expect(complete.groq).toHaveBeenCalledTimes(1)
  })

  it("LANJUT untuk 500 (gangguan provider)", async () => {
    const { generateCompletion } = await import("@/lib/ai")
    complete.gemini.mockRejectedValue(httpError(503))
    complete.groq.mockResolvedValue("jawaban cadangan")

    await expect(generateCompletion(options)).resolves.toBe("jawaban cadangan")
  })

  it("LANJUT untuk error tanpa status (jaringan putus / timeout)", async () => {
    const { generateCompletion } = await import("@/lib/ai")
    complete.gemini.mockRejectedValue(new Error("Provider tidak merespons dalam 60 detik"))
    complete.groq.mockResolvedValue("jawaban cadangan")

    await expect(generateCompletion(options)).resolves.toBe("jawaban cadangan")
  })

  it("mengembalikan hasil provider pertama tanpa memanggil sisanya saat sukses", async () => {
    const { generateCompletion } = await import("@/lib/ai")
    complete.gemini.mockResolvedValue("jawaban utama")

    await expect(generateCompletion(options)).resolves.toBe("jawaban utama")
    expect(complete.groq).not.toHaveBeenCalled()
    expect(complete.openrouter).not.toHaveBeenCalled()
  })
})
