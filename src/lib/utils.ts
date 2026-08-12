import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeWA(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

/**
 * Nomor Indonesia yang sah SETELAH dinormalisasi: 62 + 8 + operator + nomor.
 *
 * Tinggal di sini, bukan di route atau di komponen, karena server dan kedua
 * form WAJIB memakai aturan yang sama persis. Sebelumnya server menguji string
 * mentah dengan pola yang menolak spasi dan strip — termasuk `+62 812-3456-7890`,
 * format yang dicontohkan placeholder form itu sendiri — sementara form kontak
 * tidak memvalidasi apa pun. Selisih itulah yang membuang lead diam-diam.
 */
const WA_PATTERN = /^628[1-9][0-9]{6,11}$/;

export function isValidWA(raw: string): boolean {
  return WA_PATTERN.test(normalizeWA(raw));
}
