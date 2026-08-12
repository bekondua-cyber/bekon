/**
 * Alamat IP pengunjung dari header proxy.
 *
 * `x-forwarded-for` bisa berisi DAFTAR — "client, proxy1, proxy2" — dan elemen
 * pertama adalah klien aslinya. Seluruh route dulu memakai string itu mentah:
 * untuk rate limit dampaknya kecil, tapi untuk Meta CAPI dan TikTok Events API
 * nilai itu dikirim sebagai `client_ip_address`/`ip`. Keduanya mengharapkan
 * satu IP dan akan MENGABAIKAN field-nya kalau formatnya salah — kualitas
 * pencocokan audiens turun tanpa satu pun pesan error.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip") || "unknown"
}
