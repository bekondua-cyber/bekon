import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const articles = [
  {
    title: "Desain Rumah Industrial Modern: Konsep, Ciri Khas, dan Cara Mewujudkannya",
    slug: "desain-rumah-industrial-modern-konsep-ciri-khas-dan-cara-mewujudkannya",
    category: "eksterior",
    excerpt: "Tampil berani dan berkarakter! Pelajari konsep, ciri khas, dan cara mewujudkan desain rumah industrial modern yang estetik, maskulin, namun tetap nyaman ditinggali.",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
  {
    title: "Desain Eksterior Rumah Minimalis Modern yang Sedang Tren di 2025",
    slug: "desain-eksterior-rumah-minimalis-modern-yang-sedang-tren-di-2025",
    category: "eksterior",
    excerpt: "Tampilan luar rumah adalah kesan pertama. Temukan tren desain eksterior rumah minimalis modern 2025 yang memukau, mulai dari material, warna, hingga detail finishing.",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
  {
    title: "Desain Interior Rumah Type 36: Ide Kreatif Agar Terasa Luas dan Nyaman",
    slug: "desain-interior-rumah-type-36-ide-kreatif-agar-terasa-luas-dan-nyaman",
    category: "interior",
    excerpt: "Rumah type 36 terasa sempit? Dengan trik desain interior yang tepat, rumah kecil bisa terasa luas, fungsional, dan tetap estetik. Simak idenya di sini!",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
  {
    title: "Perbedaan Kontraktor dan Developer Properti: Mana yang Tepat untuk Anda?",
    slug: "perbedaan-kontraktor-dan-developer-properti-mana-yang-tepat-untuk-anda",
    category: "umum",
    excerpt: "Masih bingung bedanya kontraktor dan developer? Pahami perbedaan mendasar keduanya agar Anda bisa memilih mitra yang tepat untuk proyek properti Anda.",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
  {
    title: "RAB Rumah: Cara Membuat Rencana Anggaran Biaya yang Akurat",
    slug: "rab-rumah-cara-membuat-rencana-anggaran-biaya-yang-akurat",
    category: "umum",
    excerpt: "RAB yang akurat adalah fondasi proyek yang sukses. Pelajari cara membuat Rencana Anggaran Biaya rumah yang benar sebelum Anda memulai pembangunan.",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
  {
    title: "Keuntungan Membangun Kost-kostan: Investasi Properti yang Menggiurkan",
    slug: "keuntungan-membangun-kost-kostan-investasi-properti-yang-menggiurkan",
    category: "umum",
    excerpt: "Kost-kostan adalah investasi properti paling stabil dengan passive income bulanan. Simak keuntungan, estimasi ROI, dan tips membangun kost yang menguntungkan.",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
  {
    title: "Renovasi Rumah Lama Jadi Modern: Panduan Lengkap dan Estimasi Biaya",
    slug: "renovasi-rumah-lama-jadi-modern-panduan-lengkap-dan-estimasi-biaya",
    category: "umum",
    excerpt: "Renovasi rumah lama jadi modern bisa jadi pilihan lebih hemat dari bangun baru. Simak panduan lengkap, estimasi biaya, dan tips agar renovasi berjalan lancar.",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
  {
    title: "Tips Memilih Kontraktor Rumah Terpercaya: Jangan Sampai Salah Pilih!",
    slug: "tips-memilih-kontraktor-rumah-terpercaya-jangan-sampai-salah-pilih",
    category: "umum",
    excerpt: "Memilih kontraktor yang salah bisa berujung proyek mangkrak dan kerugian besar. Simak panduan lengkap memilih kontraktor rumah terpercaya di Banten.",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
  {
    title: "Berapa Biaya Bangun Rumah 2 Lantai di Serang Banten? Ini Rincian Lengkapnya",
    slug: "berapa-biaya-bangun-rumah-2-lantai-di-serang-banten-ini-rincian-lengkapnya",
    category: "umum",
    excerpt: "Ingin tahu estimasi biaya bangun rumah 2 lantai Serang? Simak rincian lengkap, faktor penentu, dan tips hematnya di artikel ini sebelum Anda mulai membangun.",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
  {
    title: "7 Kesalahan Fatal Saat Membangun Rumah Pertama dan Cara Menghindarinya",
    slug: "7-kesalahan-fatal-saat-membangun-rumah-pertama-dan-cara-menghindarinya",
    category: "umum",
    excerpt: "Membangun hunian impian butuh perencanaan matang. Simak 7 kesalahan fatal saat membangun rumah pertama dan tips praktis untuk menghindarinya agar proyek berjalan lancar.",
    isPublished: true,
    publishedAt: new Date("2026-06-18"),
  },
];

async function main() {
  console.log("🌱 Memulai import artikel blog...");
  let inserted = 0;
  let skipped = 0;

  for (const article of articles) {
    const existing = await prisma.article.findUnique({
      where: { slug: article.slug },
    });

    if (existing) {
      await prisma.article.update({
        where: { slug: article.slug },
        data: { category: article.category },
      });
      skipped++;
      console.log(`↺ Updated category: ${article.slug}`);
    } else {
      await prisma.article.create({ data: article });
      inserted++;
      console.log(`✅ Inserted: ${article.slug}`);
    }
  }

  console.log(`\n✅ Selesai! ${inserted} artikel baru, ${skipped} artikel diupdate.`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
