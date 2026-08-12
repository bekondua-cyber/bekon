"use client";

/**
 * Settings publik untuk komponen klien, di-fetch sekali per pemuatan halaman.
 *
 * Sebelumnya tiap komponen mem-fetch `/api/settings` sendiri-sendiri
 * (CTASection dan FloatingWhatsApp masing-masing punya useEffect terpisah),
 * dan komponen lain yang butuh nomor WhatsApp memilih jalan pintas: hardcode
 * `siteConfig.whatsapp1`. Akibatnya enam CTA — termasuk tombol hero — tidak
 * ikut berubah saat admin mengganti nomor di halaman Settings.
 *
 * Promise-nya disimpan di level modul, bukan hasilnya, supaya beberapa
 * komponen yang mount bersamaan berbagi satu request alih-alih memicu
 * beberapa request paralel yang isinya sama.
 */

let cache: Promise<Record<string, string>> | null = null;

export function getPublicSettings(): Promise<Record<string, string>> {
  if (!cache) {
    cache = fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => (json?.data as Record<string, string>) ?? {})
      // Settings tidak terjangkau bukan alasan merusak halaman — pemanggil
      // punya nilai bawaan dari siteConfig.
      .catch(() => ({}));
  }
  return cache;
}
