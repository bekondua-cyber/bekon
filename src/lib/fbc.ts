"use client";

/**
 * Click ID Meta (`fbc`) — ditangkap sendiri, tidak menunggu pixel.
 *
 * Sebelumnya `track-client.ts` hanya membaca cookie `_fbc`. Cookie itu cuma
 * dibuat pixel Meta kalau pengunjung mendarat membawa `?fbclid=...` DAN skrip
 * pixel sempat termuat. Pixel dimuat `afterInteractive`, jadi pengunjung yang
 * langsung menekan CTA — atau yang pixel-nya diblokir — mengirim event tanpa
 * fbc sama sekali.
 *
 * Akibatnya terukur di Events Manager: cakupan fbc 0% pada event Lead maupun
 * Contact, dan Meta sendiri menandainya ("Server Anda mengirimkan cakupan
 * rendah fbc melalui Conversions API"). Tanpa fbc, konversi tidak bisa
 * dihubungkan ke klik iklan yang menghasilkannya.
 *
 * Formatnya baku dari Meta: `fb.{subdomainIndex}.{creationTime}.{fbclid}`.
 * `creationTime` WAJIB saat klik iklan mendarat, bukan saat konversi terjadi —
 * karena itu nilainya ditangkap di awal lalu disimpan sampai dipakai.
 */

const FBC_COOKIE = "_fbc";

/** Jendela atribusi klik terpanjang Meta. */
const FBC_MAX_AGE_DAYS = 90;

/** Cadangan kalau cookie tidak bisa ditulis (mis. penyimpanan diblokir). */
let memoryFbc: string | undefined;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string, maxAgeDays: number): void {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * `subdomainIndex` menghitung dari puncak: com = 0, contoh.com = 1,
 * www.contoh.com = 2. Diturunkan dari hostname supaya nilainya tetap benar
 * baik situs disajikan di domain utama maupun di www.
 */
export function buildFbc(fbclid: string, hostname: string, now: number): string {
  const labels = hostname.split(".").filter(Boolean).length;
  const subdomainIndex = Math.max(labels - 1, 0);
  return `fb.${subdomainIndex}.${now}.${fbclid}`;
}

/**
 * Dipanggil sedini mungkin di setiap pemuatan halaman.
 *
 * Tidak menimpa cookie yang sudah ada: kalau pixel sudah menuliskannya, nilai
 * itulah yang dipakai supaya event browser dan server merujuk fbc yang sama
 * persis — dedup lewat eventID mengandalkan keduanya konsisten.
 */
export function captureFbclid(): void {
  if (typeof window === "undefined") return;

  const existing = readCookie(FBC_COOKIE);
  if (existing) {
    memoryFbc = existing;
    return;
  }

  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid) return;

  const value = buildFbc(fbclid, window.location.hostname, Date.now());
  memoryFbc = value;
  writeCookie(FBC_COOKIE, value, FBC_MAX_AGE_DAYS);
}

/** Nilai fbc terbaik yang kita punya, untuk pixel maupun Conversions API. */
export function getFbc(): string | undefined {
  return readCookie(FBC_COOKIE) ?? memoryFbc;
}

/** Hanya untuk pengujian — mengosongkan cadangan di memori. */
export function __resetFbcMemory(): void {
  memoryFbc = undefined;
}
