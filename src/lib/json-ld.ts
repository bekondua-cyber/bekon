/**
 * Serialisasi objek JSON-LD supaya aman ditaruh di dalam <script>.
 *
 * `JSON.stringify` TIDAK meng-escape `<`. Judul artikel yang memuat
 * `</script>` akan menutup tag lebih awal dan apa pun sesudahnya dieksekusi
 * sebagai skrip — XSS tersimpan. Isi artikel sudah disanitasi lewat
 * sanitizeArticleHtml, tapi judul dan excerpt tidak, dan keduanya bisa datang
 * dari generator AI.
 *
 * Escape ke bentuk unicode dipilih karena tetap JSON yang sah: parser JSON-LD
 * Google membacanya persis sama, tapi parser HTML tidak lagi melihat tag.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    // U+2028/U+2029 sah di dalam JSON tapi mematahkan parser JavaScript.
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}
