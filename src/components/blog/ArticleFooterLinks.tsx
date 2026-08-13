import Image from "next/image";
import Link from "next/link";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { servicesForArticle, waMessageForArticle } from "@/lib/article-links";

/**
 * Penutup artikel: jalan keluar menuju penawaran.
 *
 * Halaman detail artikel sebelumnya jalan buntu — nol tautan ke /layanan/*,
 * /portfolio, /kontak, maupun WhatsApp. Pembaca dari pencarian selesai membaca
 * lalu satu-satunya tautan yang tersedia adalah "kembali ke blog".
 *
 * Urutannya disengaja, dari niat paling tinggi ke paling rendah: konsultasi
 * WhatsApp lebih dulu (dan terlacak sebagai konversi lewat WhatsAppLink),
 * disusul layanan terkait, bukti kerja di portfolio, baru bacaan lain.
 */

export interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string | null;
}

interface Props {
  title: string;
  category?: string | null;
  related: RelatedArticle[];
}

export function ArticleFooterLinks({ title, category, related }: Props) {
  const layanan = servicesForArticle(category, title);

  return (
    <section aria-label="Langkah selanjutnya" className="mt-14 space-y-10">
      {/* Ajakan konsultasi — niat tertinggi, jadi ditaruh paling atas. */}
      <div className="bg-bekon-near-black rounded-xl p-8 text-center">
        <h2 className="font-display text-[clamp(22px,2.6vw,30px)] text-white font-light mb-3">
          Tertarik mewujudkannya di rumah Anda?
        </h2>
        <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
          Konsultasikan kebutuhan dan anggaran Anda bersama tim BEKON. Gratis,
          tanpa komitmen.
        </p>
        <WhatsAppLink
          waKey="wa_admin_1"
          message={waMessageForArticle(title)}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-bekon-whatsapp text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Konsultasi Gratis via WhatsApp
        </WhatsAppLink>
      </div>

      {/* Layanan terkait */}
      <div>
        <h2 className="text-lg font-semibold text-bekon-near-black mb-4">
          Layanan BEKON yang terkait
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {layanan.map((s) => (
            <Link
              key={s.slug}
              href={`/layanan/${s.slug}`}
              className="group block bg-white rounded-xl border border-bekon-border p-5 hover:border-bekon-gold hover:shadow-md transition-all"
            >
              <p className="text-bekon-near-black font-semibold text-sm mb-1.5 group-hover:text-bekon-gold transition-colors">
                {s.title}
              </p>
              <p className="text-bekon-text-muted text-xs leading-relaxed">
                {s.short_desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bukti kerja */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/portfolio"
          className="flex-1 text-center px-5 py-3 rounded-lg border border-bekon-border bg-white text-sm font-medium text-bekon-near-black hover:border-bekon-gold hover:text-bekon-gold transition-colors"
        >
          Lihat Portfolio Proyek
        </Link>
        <Link
          href="/kontak"
          className="flex-1 text-center px-5 py-3 rounded-lg border border-bekon-border bg-white text-sm font-medium text-bekon-near-black hover:border-bekon-gold hover:text-bekon-gold transition-colors"
        >
          Minta Penawaran
        </Link>
      </div>

      {/* Bacaan lain — niat paling rendah, jadi paling bawah. */}
      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-bekon-near-black mb-4">
            Artikel lainnya
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((a) => (
              <Link
                key={a.id}
                href={`/informasi/blog/${a.slug}`}
                className="group block bg-white rounded-xl border border-bekon-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/10] bg-bekon-cream">
                  {a.thumbnail && (
                    <Image
                      src={a.thumbnail}
                      alt={a.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="p-4 text-sm font-medium text-bekon-near-black line-clamp-2 group-hover:text-bekon-gold transition-colors">
                  {a.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
