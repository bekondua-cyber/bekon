import type { Metadata } from "next";
import Link from "next/link";
import { portfolioItems } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Lihat karya terbaik BEKON dalam desain dan konstruksi rumah, interior, renovasi, dan bangunan komersial.",
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-bekon-cream">
      <div className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        <div className="text-center mb-14">
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black">
            Portfolio
          </h1>
          <p className="text-bekon-text-muted mt-2">
            {portfolioItems.length} proyek terselesaikan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Link
              key={item.id}
              href={`/portfolio/${item.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/3]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.cover_image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bekon-near-black/80 via-bekon-near-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h2 className="text-white text-base font-bold">
                  {item.title}
                </h2>
                <p className="text-white/70 text-xs mt-1">
                  {item.category} &middot; {item.location} &middot; {item.year}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
