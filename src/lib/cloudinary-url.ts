/**
 * Helper URL Cloudinary yang aman dipakai di client (tanpa SDK server).
 */

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60)
}

/**
 * Ubah URL Cloudinary jadi URL yang memaksa browser mengunduh berkas.
 *
 * Atribut `download` pada <a> diabaikan browser untuk URL lintas-origin,
 * jadi pengunduhan dilakukan lewat flag `fl_attachment` milik Cloudinary.
 * URL non-Cloudinary dikembalikan apa adanya (akan terbuka di tab baru).
 */
export function toDownloadUrl(url: string, filename?: string): string {
  if (!url.includes("/upload/")) return url

  const flag = filename ? `fl_attachment:${slugifyFilename(filename)}` : "fl_attachment"
  return url.replace("/upload/", `/upload/${flag}/`)
}
