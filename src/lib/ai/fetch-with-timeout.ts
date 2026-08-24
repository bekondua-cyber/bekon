/**
 * Anggaran waktu untuk SELURUH rantai fallback AI, bukan per provider.
 *
 * Dulu tiap provider diberi 60 detik sendiri-sendiri. Karena
 * `generateCompletion()` mencoba tiga provider berurutan, skenario terburuknya
 * 180 detik — sementara tidak ada satu pun rute yang mendeklarasikan
 * `maxDuration`, dan batas maksimum yang bahkan boleh diminta di paket Vercel
 * Hobby cuma 60 detik.
 *
 * Akibatnya bukan sekadar lambat. Vercel mematikan fungsinya di tengah jalan,
 * dan yang sampai ke layar admin adalah error 5xx tanpa penjelasan. Lebih buruk
 * lagi: provider pertama yang menggantung menghabiskan seluruh jatah, sehingga
 * provider cadangan TIDAK PERNAH kebagian waktu — seluruh mekanisme fallback
 * yang sudah dibangun itu sebenarnya tidak pernah bisa berjalan di produksi.
 *
 * 50 detik dipilih agar muat di `maxDuration = 60` sambil menyisakan ruang
 * untuk query knowledge base, perakitan prompt, parsing JSON, dan pengiriman
 * respons. Rute AI WAJIB memasang `maxDuration` yang lebih besar dari angka
 * ini — dikunci oleh src/__tests__/ai-deadline.test.ts.
 */
export const AI_CHAIN_DEADLINE_MS = 50_000

/**
 * Jatah minimum satu provider. Di bawah ini percobaannya cuma membuang waktu:
 * model bahasa jarang membalas di bawah beberapa detik, jadi memberi sisa 800 ms
 * ke provider terakhir sama saja dengan tidak mencobanya.
 */
export const AI_MIN_SLICE_MS = 6_000

/** Batas waktu satu panggilan provider kalau pemanggilnya tidak menentukan. */
export const AI_TIMEOUT_MS = 20_000

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
      throw new Error(`Provider tidak merespons dalam ${Math.round(timeoutMs / 1000)} detik`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
