import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/data/site-config";
import PortfolioHeroCarousel from "@/components/PortfolioHeroCarousel";

const API_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

interface Props {
  params: { slug: string };
}

interface PortfolioDetail {
  id: string;
  title: string;
  slug: string;
  category?: string;
  location?: string;
  landSqm?: number;
  areaSqm?: number;
  floors?: number;
  bedrooms?: number;
  bathrooms?: number;
  year?: number;
  description?: string;
  coverImage?: string;
  images: string[];
}

interface RelatedItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  location?: string;
  coverImage?: string;
  year?: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  eksterior: "Eksterior",
  interior: "Interior",
  bangun: "Bangun Rumah",
  renovasi: "Renovasi",
  "kost-ruko": "Kost & Ruko",
};

async function fetchPortfolio(slug: string): Promise<PortfolioDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/portfolio/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && typeof json.data === "object" && !Array.isArray(json.data)) {
      return json.data as PortfolioDetail;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchRelated(category: string, excludeSlug: string): Promise<RelatedItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/portfolio?category=${category}&exclude=${excludeSlug}&take=3`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await fetchPortfolio(params.slug);
  if (!item) return { title: "Proyek Tidak Ditemukan" };
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/portfolio/${params.slug}` },
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const item = await fetchPortfolio(params.slug);
  if (!item) notFound();

  const related = item.category
    ? await fetchRelated(item.category, item.slug)
    : [];

  const allImages = [
    ...(item.coverImage ? [item.coverImage] : []),
    ...item.images,
  ];

  const specs = [
    item.category && {
      label: "Kategori",
      value: CATEGORY_LABELS[item.category] ?? item.category,
    },
    item.location && { label: "Lokasi", value: item.location },
    item.year && { label: "Tahun", value: item.year.toString() },
    item.landSqm && { label: "Luas Tanah", value: `${item.landSqm} m²` },
    item.areaSqm && { label: "Luas Bangunan", value: `${item.areaSqm} m²` },
    item.floors && { label: "Jumlah Lantai", value: `${item.floors} Lantai` },
    item.bedrooms && { label: "Kamar Tidur", value: `${item.bedrooms} Kamar` },
    item.bathrooms && { label: "Kamar Mandi", value: `${item.bathrooms} Kamar` },
  ].filter(Boolean) as { label: string; value: string }[];

  const waUrl = `https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20tertarik%20dengan%20proyek%20${encodeURIComponent(item.title)}`;

  return (
    <div className="min-h-screen bg-bekon-off-white">

      {/* Hero Carousel + Thumbnail Strip */}
      <PortfolioHeroCarousel images={allImages} title={item.title} />

      {/* Main Content */}
      <section className="pb-16">
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left: Specs Table + Description */}
            <div className="lg:col-span-2 space-y-10">

              {specs.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-bekon-near-black mb-4">
                    Detail Proyek
                  </h2>
                  <div className="border border-bekon-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {specs.map((spec, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-bekon-cream"}>
                            <td className="px-5 py-3.5 font-medium text-bekon-near-black w-2/5 border-r border-bekon-border">
                              {spec.label}
                            </td>
                            <td className="px-5 py-3.5 text-bekon-text-muted">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {item.description && (
                <div>
                  <h2 className="text-xl font-bold text-bekon-near-black mb-4">
                    Tentang Proyek
                  </h2>
                  <p className="text-bekon-text-muted leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right: CTA + Related Projects */}
            <div className="lg:col-span-1 space-y-6">

              {/* CTA Card */}
              <div className="bg-white rounded-xl border border-bekon-border p-6 sticky top-24">
                <p className="text-bekon-near-black font-semibold mb-2">
                  Tertarik dengan proyek ini?
                </p>
                <p className="text-bekon-text-muted text-sm mb-4">
                  Konsultasikan kebutuhan bangunan Anda bersama tim BEKON secara gratis.
                </p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bekon-gold text-white rounded-lg text-sm font-semibold hover:bg-bekon-gold/90 transition-colors"
                >
                  Konsultasi Gratis
                </a>
              </div>

              {/* Related Projects */}
              {related.length > 0 && (
                <div className="bg-white rounded-xl border border-bekon-border p-6">
                  <h3 className="font-bold text-bekon-near-black mb-4 pb-3 border-b border-bekon-border">
                    Proyek Lainnya
                  </h3>
                  <div className="space-y-4">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/portfolio/${rel.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {rel.coverImage && (
                            <Image
                              src={rel.coverImage}
                              alt={rel.title}
                              fill
                              sizes="80px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-bekon-near-black text-sm font-medium line-clamp-2 group-hover:text-bekon-gold transition-colors">
                            {rel.title}
                          </p>
                          {rel.location && (
                            <p className="text-bekon-text-muted text-xs mt-1">
                              {rel.location}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-bekon-gold py-16">
        <div className="max-w-container mx-auto px-6 lg:px-20 text-center">
          <h2 className="font-display text-[clamp(28px,3vw,36px)] text-white font-light mb-4">
            Tertarik dengan Proyek Serupa?
          </h2>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-bekon-gold rounded-full text-sm font-semibold hover:bg-bekon-near-black hover:text-white transition-all"
          >
            Konsultasi Gratis
          </a>
        </div>
      </section>
    </div>
  );
}
