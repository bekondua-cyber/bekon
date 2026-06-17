import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { portfolioItems } from "@/data/portfolio";
import { siteConfig } from "@/data/site-config";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return portfolioItems.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const item = portfolioItems.find((p) => p.slug === params.slug);
  if (!item) return { title: "Proyek Tidak Ditemukan" };
  return {
    title: item.title,
    description: item.description,
  };
}

export default function PortfolioDetailPage({ params }: Props) {
  const item = portfolioItems.find((p) => p.slug === params.slug);
  if (!item) notFound();

  return (
    <div className="min-h-screen bg-bekon-off-white">
      {/* Hero Image */}
      <section className="relative h-[50vh] min-h-[400px]">
        <Image
          src={item.cover_image}
          alt={item.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bekon-near-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-20 max-w-container mx-auto">
          <Link
            href="/portfolio"
            className="text-bekon-gold text-sm mb-3 inline-block hover:text-bekon-gold-light transition-colors"
          >
            &larr; Portfolio
          </Link>
          <h1 className="font-display text-[clamp(28px,4vw,48px)] text-white mt-1">
            {item.title}
          </h1>
        </div>
      </section>

      {/* Info Bar */}
      <section className="border-b border-bekon-border bg-white">
        <div className="max-w-container mx-auto px-6 lg:px-20 py-6">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-bekon-text-muted text-xs uppercase tracking-wider font-medium">
                Kategori
              </p>
              <p className="text-bekon-near-black font-medium text-sm capitalize mt-1">
                {item.category.replace("-", " & ")}
              </p>
            </div>
            <div>
              <p className="text-bekon-text-muted text-xs uppercase tracking-wider font-medium">
                Lokasi
              </p>
              <p className="text-bekon-near-black font-medium text-sm mt-1">
                {item.location}
              </p>
            </div>
            {item.area_sqm && (
              <div>
                <p className="text-bekon-text-muted text-xs uppercase tracking-wider font-medium">
                  Luas
                </p>
                <p className="text-bekon-near-black font-medium text-sm mt-1">
                  {item.area_sqm} m&sup2;
                </p>
              </div>
            )}
            <div>
              <p className="text-bekon-text-muted text-xs uppercase tracking-wider font-medium">
                Tahun
              </p>
              <p className="text-bekon-near-black font-medium text-sm mt-1">
                {item.year}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-12 md:py-16">
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-bekon-near-black mb-4">
              Tentang Proyek
            </h2>
            <p className="text-bekon-text-muted leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {item.images.length > 1 && (
        <section className="pb-16">
          <div className="max-w-container mx-auto px-6 lg:px-20">
            <h2 className="text-xl font-bold text-bekon-near-black mb-6">
              Galeri
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
        </section>
      )}

      {/* CTA */}
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
