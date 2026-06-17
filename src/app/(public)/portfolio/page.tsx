import type { Metadata } from "next";
import { PortfolioGrid } from "./PortfolioGrid";

export const metadata: Metadata = {
  title: "Portfolio Proyek | BEKON - Jasa Bangun Rumah Serang",
  description:
    "Lihat karya terbaik BEKON dalam desain dan konstruksi rumah, interior, renovasi, dan bangunan komersial.",
};

const API_BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

async function fetchPortfolio() {
  try {
    const res = await fetch(`${API_BASE}/api/portfolio?all=true`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  } catch {
    return [];
  }
}

export default async function PortfolioPage() {
  const items = await fetchPortfolio();

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

        <PortfolioGrid items={items} />
      </div>
    </div>
  );
}
