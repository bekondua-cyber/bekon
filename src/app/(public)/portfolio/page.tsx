import type { Metadata } from "next";
import { PortfolioGrid } from "./PortfolioGrid";
import { getPublishedPortfolio } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Portfolio Proyek | BEKON - Jasa Bangun Rumah Serang",
  description:
    "Lihat karya terbaik BEKON dalam desain dan konstruksi rumah, interior, renovasi, dan bangunan komersial.",
  alternates: { canonical: "/portfolio" },
};

/**
 * Tetap dinamis, dan memang TIDAK BISA lain.
 *
 * Halaman ini membaca `searchParams.category`, dan Next menjadikan halaman
 * yang menyentuh searchParams dinamis secara otomatis — `revalidate` di sini
 * tidak akan berpengaruh apa pun. Dinyatakan eksplisit supaya alasannya jelas
 * dan tidak ada yang mencoba "memperbaikinya" jadi ISR.
 */
export const dynamic = "force-dynamic";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const items = await getPublishedPortfolio({ all: true });

  return (
    <div className="min-h-screen bg-bekon-cream">
      <div className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        <div className="text-center mb-14">
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black">
            Portfolio
          </h1>
          <p className="text-bekon-text-muted mt-2">
            {items.length} proyek terselesaikan
          </p>
        </div>

        <PortfolioGrid items={items} initialCategory={searchParams.category} />
      </div>
    </div>
  );
}
