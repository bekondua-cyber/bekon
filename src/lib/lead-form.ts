"use client";

import { isValidWA, normalizeWA } from "@/lib/utils";
import { trackConversion } from "@/lib/track-client";

/**
 * Logika bersama kedua form konsultasi (beranda dan /kontak).
 *
 * Dulu keduanya menyalin alur yang sama dengan tangan, dan salinannya menyimpang:
 * form beranda memvalidasi telepon, form /kontak tidak sama sekali. Keduanya
 * juga memanggil `await fetch("/api/leads")` lalu MENGABAIKAN hasilnya —
 * `trackConversion("Lead")` dan `window.open` tetap jalan meski server membalas
 * 400. Akibatnya lead hilang dari CMS sementara Meta/TikTok/Google tetap
 * menerima konversi yang tidak punya pasangan data.
 *
 * Karena itu pelacakan sekarang tinggal DI DALAM cabang sukses submitLead():
 * tidak ada lagi cara memanggilnya tanpa penyimpanan yang benar-benar berhasil.
 */

export interface LeadFormValues {
  name: string;
  phone: string;
  email: string;
  service: string;
  budget: string;
  message: string;
  company_website: string;
}

export type LeadFieldErrors = Partial<Record<"name" | "phone", string>>;

/**
 * Validasi klien memakai isValidWA() yang sama dengan route server, sehingga
 * keduanya tidak mungkin berbeda pendapat soal nomor mana yang diterima.
 */
export function validateLead(values: LeadFormValues): LeadFieldErrors {
  const errors: LeadFieldErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Nama wajib diisi, minimal 2 karakter";
  }

  const phone = values.phone.trim();
  if (!phone) {
    errors.phone = "Nomor WhatsApp wajib diisi";
  } else if (!isValidWA(phone)) {
    errors.phone = "Format nomor tidak valid. Contoh: 081234567890";
  }

  return errors;
}

export type LeadSubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Simpan lead ke server. Hasilnya WAJIB diperiksa pemanggil — itulah seluruh
 * inti perbaikan ini.
 */
export async function submitLead(values: LeadFormValues): Promise<LeadSubmitResult> {
  let res: Response;
  try {
    res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || undefined,
        service: values.service,
        budget: values.budget,
        message: values.message.trim(),
        company_website: values.company_website,
      }),
    });
  } catch {
    return { ok: false, error: "Koneksi bermasalah. Periksa jaringan Anda lalu coba lagi." };
  }

  const json = await res.json().catch(() => ({} as { error?: string }));

  if (!res.ok) {
    return {
      ok: false,
      error: json.error || "Pesan gagal terkirim. Silakan coba lagi atau hubungi kami via WhatsApp.",
    };
  }

  // Hanya di sini, dan hanya setelah server mengonfirmasi tersimpan.
  trackConversion("Lead", {
    phone: values.phone.trim() || undefined,
    email: values.email.trim() || undefined,
  });

  return { ok: true };
}

/** Pesan WhatsApp yang sudah terisi, dipakai kedua form dengan format sama. */
export function buildWaUrl(waNumber: string, values: LeadFormValues): string {
  const text = [
    `Halo BEKON, saya ${values.name.trim() || "calon klien"}.`,
    `No. HP: ${values.phone.trim()}`,
    `Layanan: ${values.service || "Belum ditentukan"}`,
    `Pesan: ${values.message.trim() || "Saya ingin konsultasi"}`,
  ].join("\n");

  return `https://wa.me/${normalizeWA(waNumber)}?text=${encodeURIComponent(text)}`;
}

/**
 * Buka WhatsApp tanpa kena pemblokir popup.
 *
 * `window.open` yang dipanggil SETELAH `await` sudah keluar dari call stack
 * gestur pengguna, dan Safari iOS serta banyak browser Android memblokirnya —
 * pengunjung menekan tombol lalu tidak terjadi apa-apa. Jendela karena itu
 * dipesan lebih dulu secara sinkron, masih di dalam gestur, lalu alamatnya
 * diisi setelah server menjawab.
 *
 * Mengembalikan false kalau jendelanya tetap diblokir, supaya pemanggil bisa
 * menampilkan tautan yang bisa ditekan alih-alih membiarkan layar diam.
 */
export function reserveWindow(): Window | null {
  if (typeof window === "undefined") return null;
  return window.open("", "_blank");
}

export function sendWindowTo(win: Window | null, url: string): boolean {
  if (!win || win.closed) return false;
  win.location.href = url;
  return true;
}
