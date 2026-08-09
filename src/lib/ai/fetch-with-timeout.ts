/** Batas waktu satu panggilan provider AI. */
export const AI_TIMEOUT_MS = 60_000

/**
 * Panggil provider dengan batas waktu.
 *
 * Tanpa ini, provider yang menggantung memblokir seluruh rantai fallback
 * sampai fungsi Vercel mati — provider berikutnya tidak pernah dicoba.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = AI_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Provider tidak merespons dalam ${timeoutMs / 1000} detik`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
