/**
 * Batas upload, dipakai bersama browser dan server.
 *
 * Berkas ini sengaja BUKAN modul klien: route API harus bisa mengimpornya
 * tanpa menarik kode klien. Batas di browser hanya ramah-pengguna — yang
 * mengikat adalah pengecekan di server, karena POST langsung ke endpoint bisa
 * melewati browser sepenuhnya.
 */
export const MAX_UPLOAD_SIZE_MB = 4

export const MAX_UPLOAD_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
