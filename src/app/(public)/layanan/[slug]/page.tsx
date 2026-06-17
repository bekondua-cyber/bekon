import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/data/services";
import { siteConfig } from "@/data/site-config";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) return { title: "Layanan Tidak Ditemukan" };
  return {
    title: service.title,
    description: service.description,
  };
}

const processSteps = [
  {
    title: "Konsultasi & Survey",
    desc: "Diskusi kebutuhan, anggaran, dan survei lokasi. Gratis.",
  },
  {
    title: "Perencanaan & Desain",
    desc: "Gambar kerja, RAB transparan, dan visualisasi 3D.",
  },
  {
    title: "Pelaksanaan Konstruksi",
    desc: "Pengerjaan dengan material pilihan dan pengawasan ketat.",
  },
  {
    title: "Serah Terima & Garansi",
    desc: "Proyek selesai tepat waktu dan bergaransi.",
  },
];

const advantages = [
  "Berpengalaman Sejak 2009",
  "Transparansi Biaya & Anggaran",
  "Desain Online Seluruh Indonesia",
  "Material Berkualitas & Bergaransi",
  "Tim Profesional Bersertifikat",
  "Tepat Waktu & Sesuai Desain",
];

export default function LayananDetailPage({ params }: Props) {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) notFound();

  return (
    <div className="min-h-screen bg-bekon-off-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-bekon-near-black">
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <Link
            href="/layanan"
            className="text-bekon-gold text-sm mb-4 inline-block hover:text-bekon-gold-light transition-colors"
          >
            &larr; Semua Layanan
          </Link>
          <h1 className="font-display text-[clamp(32px,4vw,56px)] text-white mt-2">
            {service.title}
          </h1>
          <p className="text-white/60 text-lg mt-3 max-w-xl">
            {service.short_desc}
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 md:py-20">
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-bekon-near-black mb-4">
                {service.title} oleh BEKON
              </h2>
              <p className="text-bekon-text-muted leading-relaxed mb-6">
                {service.description}
              </p>
              <a
                href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20tertarik%20dengan%20${encodeURIComponent(service.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3 bg-bekon-gold text-white rounded-full text-sm font-medium transition-all hover:bg-bekon-gold-dark"
              >
                Konsultasi Gratis
              </a>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-bekon-near-black">
              Proses Pengerjaan
            </h2>
            <p className="text-bekon-text-muted mt-2">
              Tahapan profesional dari konsultasi hingga serah terima
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full bg-bekon-gold/10 flex items-center justify-center text-bekon-gold font-display text-xl font-semibold mx-auto mb-4">
                  {(i + 1).toString().padStart(2, "0")}
                </div>
                <h3 className="font-semibold text-bekon-near-black mb-2">
                  {step.title}
                </h3>
                <p className="text-bekon-text-muted text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 md:py-20">
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-bekon-near-black">
              Keunggulan BEKON
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((adv, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-bekon-gold shrink-0 mt-0.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-bekon-near-black font-medium">
                  {adv}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bekon-gold py-16">
        <div className="max-w-container mx-auto px-6 lg:px-20 text-center">
          <h2 className="font-display text-[clamp(28px,3vw,36px)] text-white font-light mb-4">
            Tertarik dengan {service.title}?
          </h2>
          <p className="text-white/80 mb-8">
            Konsultasi gratis tanpa komitmen bersama tim BEKON.
          </p>
          <a
            href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20tertarik%20dengan%20${encodeURIComponent(service.title)}`}
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
