/**
 * Satu sumber kebenaran untuk identitas BEKON di semua prompt AI.
 * Sebelumnya string ini ditulis ulang di 4 route berbeda dan rawan melenceng.
 */
export const BEKON_BRAND_CONTEXT = `BEKON (Bangun Eka Konstruksi) adalah kontraktor dan arsitek profesional asal Serang, Banten sejak 2009. Layanan: desain eksterior, desain interior, bangun rumah, renovasi, interior rumah, serta bangun kost & ruko.`

/**
 * Wilayah layanan — dipakai untuk konteks lokal di artikel & video, dan
 * WAJIB ikut ke prompt chatbot.
 *
 * Sebelumnya chatbot hanya menerima BEKON_BRAND_CONTEXT yang berbunyi "di
 * Serang, Cilegon, Banten". Dari situ model menyimpulkan sendiri bahwa BEKON
 * MENOLAK proyek di luar dua kota itu — pertanyaan soal Jakarta dijawab "mohon
 * maaf saat ini kami belum dapat melayani". Itu keputusan bisnis yang tidak
 * pernah diberikan siapa pun, dan tiap kali terjadi satu lead hangus.
 *
 * Cirebon sengaja disebut terpisah: ia satu-satunya di luar Banten, jadi
 * daftar ini tidak boleh diringkas jadi "seluruh Banten dan sekitarnya".
 */
export const BEKON_SERVICE_AREA =
  "seluruh Banten (Kota & Kabupaten Serang, Cilegon, Pandeglang, Lebak, Tangerang, Tangerang Selatan) serta Kota Cirebon"
