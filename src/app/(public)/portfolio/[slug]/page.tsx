import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/data/site-config";

const API_BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

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
  beforeImage?: string;
  afterImage?: string;
}

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

  const allImages = [
    ...(item.coverImage ? [item.coverImage] : []),
    ...item.images,
  ];

  const hasSpecs =
    item.category ||
    item.location ||
    item.year ||
    item.landSqm ||
    item.areaSqm ||
    item.floors ||
    item.bedrooms ||
    item.bathrooms;

  return (
    <div className="min-h-screen bg-bekon-off-white">

      {/* Hero Image */}
      <section className="relative h-[50vh] min-h-[400px]">
        {item.coverImage && (
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bekon-near-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-20 max-w-container mx-auto">
          <Link
            href="/portfolio"
            className="text-bekon-gold text-sm mb-3 inline-block hover:text-bekon-gold-light transition-colors"
          >
            ← Portfolio
          </Link>
          <h1 className="font-display text-[clamp(28px,4vw,48px)] text-white mt-1">
            {item.title}
          </h1>
        </div>
      </section>

      {/* Gallery Strip */}
      {allImages.length > 1 && (
        <section className="border-b border-bekon-border bg-white">
          <div className="max-w-container mx-auto px-6 lg:px-20 py-4">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                >
                  <Image
                    src={img}
                    alt={`${item.title} ${i + 1}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left: Description + Gallery */}
            <div className="lg:col-span-2 space-y-10">
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

              {item.images && item.images.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-bekon-near-black mb-4">
                    Galeri Foto
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt={`${item.title} - ${i + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Specs Sidebar */}
            {hasSpecs && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-bekon-border p-6 sticky top-24">
                  <h3 className="font-bold text-bekon-near-black mb-4 pb-3 border-b border-bekon-border">
                    Detail Proyek
                  </h3>
                  <div className="divide-y divide-bekon-border">
                    {item.category && (
                      <div className="flex justify-between py-3 text-sm">
                        <span className="text-bekon-text-muted">Kategori</span>
                        <span className="text-bekon-near-black font-medium capitalize text-right">
                          {item.category.replace("-", " & ")}
                        </span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex justify-between py-3 text-sm">
                        <span className="text-bekon-text-muted">Lokasi</span>
                        <span className="text-bekon-near-black font-medium text-right">
                          {item.location}
                        </span>
                      </div>
                    )}
                    {item.year && (
                      <div className="flex justify-between py-3 text-sm">
                        <span className="text-bekon-text-muted">Tahun</span>
                        <span className="text-bekon-near-black font-medium">
                          {item.year}
                        </span>
                      </div>
                    )}
                    {item.landSqm && (
                      <div className="flex justify-between py-3 text-sm">
                        <span className="text-bekon-text-muted">Luas Tanah</span>
                        <span className="text-bekon-near-black font-medium">
                          {item.landSqm} m²
                        </span>
                      </div>
                    )}
                    {item.areaSqm && (
                      <div className="flex justify-between py-3 text-sm">
                        <span className="text-bekon-text-muted">Luas Bangunan</span>
                        <span className="text-bekon-near-black font-medium">
                          {item.areaSqm} m²
                        </span>
                      </div>
                    )}
                    {item.floors && (
                      <div className="flex justify-between py-3 text-sm">
                        <span className="text-bekon-text-muted">Jumlah Lantai</span>
                        <span className="text-bekon-near-black font-medium">
                          {item.floors} Lantai
                        </span>
                      </div>
                    )}
                    {item.bedrooms && (
                      <div className="flex justify-between py-3 text-sm">
                        <span className="text-bekon-text-muted">Kamar Tidur</span>
                        <span className="text-bekon-near-black font-medium">
                          {item.bedrooms} Kamar
                        </span>
                      </div>
                    )}
                    {item.bathrooms && (
                      <div className="flex justify-between py-3 text-sm">
                        <span className="text-bekon-text-muted">Kamar Mandi</span>
                        <span className="text-bekon-near-black font-medium">
                          {item.bathrooms} Kamar
                        </span>
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20tertarik%20dengan%20proyek%20${encodeURIComponent(item.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 bg-bekon-gold text-white rounded-lg text-sm font-semibold hover:bg-bekon-gold/90 transition-colors"
                  >
                    Konsultasi Gratis
                  </a>
                </div>
              </div>
            )}
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
            href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20tertarik%20dengan%20proyek%20${encodeURIComponent(item.title)}`}
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
