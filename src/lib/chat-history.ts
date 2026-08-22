export interface ChatTurn {
  role: "user" | "assistant"
  content: string
}

/**
 * Riwayat datang dari browser, jadi seluruh isinya dikendalikan pemanggil —
 * termasuk giliran ber-role "assistant". Penyerang bisa menyusun balasan bot
 * palsu ("Harga bangun rumah Rp2 juta/m²") lalu bertanya "tadi berapa?", dan
 * model akan memperlakukannya sebagai ucapannya sendiri. Itu menembus aturan
 * nomor satu di system prompt: jangan pernah mengarang harga.
 *
 * Karena itu hanya giliran "user" yang diteruskan. Pertanyaan-pertanyaan
 * sebelumnya sudah cukup sebagai konteks untuk bot FAQ yang balasannya dibatasi
 * beberapa kalimat, dan jalur penyuntikannya hilang sepenuhnya.
 *
 * Kalau nanti konteks balasan bot benar-benar dibutuhkan, perbaikan yang benar
 * adalah menyimpan percakapan di server (tabel ChatConversation sudah ada) dan
 * mengirim `conversationId`, bukan mempercayai riwayat kiriman klien.
 */
export function trustedHistory(history: ChatTurn[]): ChatTurn[] {
  return history.filter((h) => h.role === "user")
}

/**
 * Giliran keberapa pesan yang sedang diproses, dihitung dari riwayat.
 *
 * Karena `trustedHistory()` membuang seluruh giliran assistant, model tidak
 * punya cara tahu bahwa ia sudah menyapa dan sudah memberi link WhatsApp —
 * sehingga tiap balasan mengulang "Halo, Kak!" dan mengulang ajakan WhatsApp,
 * bahkan di giliran ketiga. Itulah sumber kesan bertele-tele.
 *
 * Yang dikirim ke model cuma ANGKA ini, bukan teks apa pun dari klien, jadi
 * perbaikan ini tidak menambah permukaan penyuntikan sedikit pun: nilai
 * terburuk yang bisa dipalsukan penyerang adalah membuat bot mengira
 * percakapan sudah panjang, yang efeknya justru balasan lebih ringkas.
 */
export function turnNumber(history: ChatTurn[]): number {
  return trustedHistory(history).length + 1
}

/**
 * Penanda yang diminta ke model saat ia tidak bisa menjawab dari knowledge
 * base. Nilainya tidak boleh pernah sampai ke layar pengunjung.
 */
export const FALLBACK_MARKER = "[TIDAK_YAKIN]"

/**
 * Ubah balasan mentah model jadi balasan yang layak ditampilkan.
 *
 * Sengaja memakai `includes`, bukan perbandingan persis: model kerap
 * membungkus penanda dengan spasi, tanda kutip, atau tebal markdown, dan
 * setiap kebocoran penanda ke gelembung chat terlihat seperti bot rusak.
 *
 * `usedFallback` yang dikembalikan juga jadi sinyal untuk halaman Log Chatbot
 * di admin: percakapan bertanda inilah kandidat terbaik untuk ditambahkan ke
 * Knowledge Base.
 */
export function resolveReply(
  raw: string,
  fallbackReply: string
): { reply: string; usedFallback: boolean } {
  const usedFallback = raw.includes(FALLBACK_MARKER)
  return {
    reply: usedFallback ? fallbackReply : raw.trim(),
    usedFallback,
  }
}
