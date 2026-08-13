"use client";

/**
 * ID pengunjung anonim yang stabil, dipakai sebagai `external_id`.
 *
 * Event `Contact` tidak membawa satu pun penanda orang: klik tombol WhatsApp
 * itu anonim (lihat WhatsAppLink dan LinkedText — keduanya memanggil
 * `trackConversion("Contact")` tanpa argumen). Akibatnya skor Event Match
 * Quality-nya tertahan di 3,7, dan Meta maupun TikTok tidak punya cara
 * menghubungkan klik itu ke orang yang sama saat ia kembali dan mengisi form.
 *
 * `external_id` menutup celah itu. Isinya angka acak — bukan data pribadi,
 * tidak berasal dari email, telepon, maupun perangkat. Nilainya cuma berguna
 * kalau SAMA di seluruh kunjungan orang tersebut, karena itu disimpan.
 *
 * Nilai yang sama dikirim ke pixel (mentah, di-hash sendiri oleh skrip mereka)
 * dan ke Conversions API (di-hash di server). Kalau keduanya berbeda, Meta
 * membacanya sebagai dua orang berbeda — lebih buruk daripada tidak mengirim
 * sama sekali.
 */

const STORAGE_KEY = "bekon_vid";

/** Cadangan kalau localStorage diblokir (mode privat, pengaturan browser). */
let memoryId: string | undefined;

function randomId(): string {
  // crypto.randomUUID tidak tersedia di semua browser yang didukung
  // (lihat browserslist di package.json), jadi ada jalur cadangan.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function readStored(): string | undefined {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeStored(value: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Penyimpanan diblokir. Nilai di memori tetap membuat satu sesi konsisten,
    // yang sudah cukup untuk mencocokkan pixel dengan CAPI pada event yang sama.
  }
}

export function getVisitorId(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const stored = readStored();
  if (stored) {
    memoryId = stored;
    return stored;
  }

  if (!memoryId) memoryId = randomId();
  writeStored(memoryId);
  return memoryId;
}

/** Hanya untuk pengujian. */
export function __resetVisitorId(): void {
  memoryId = undefined;
}
