import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "BEKON menyediakan layanan desain eksterior, interior, bangun rumah, renovasi, dan bangun kost & ruko di Serang, Cilegon, Banten.",
  alternates: { canonical: "/layanan" },
};

export default function LayananPage() {
  return (
    <div className="min-h-screen bg-bekon-off-white">
      <div className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        <div className="text-center mb-14">
          <span className="section-label">Layanan Kami</span>
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black mt-3">
            Solusi Lengkap Untuk
            <br />
            Hunian & Bangunan Anda
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/layanan/${service.slug}`}
              className="group bg-white border border-bekon-border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-bekon-gold"
            >
              <h2 className="text-lg font-semibold text-bekon-near-black mb-2">
                {service.title}
              </h2>
              <p className="text-bekon-text-muted text-sm leading-relaxed">
                {service.description}
              </p>
              <span className="mt-4 inline-flex text-bekon-gold text-sm font-medium group-hover:text-bekon-gold-dark transition-colors">
                Selengkapnya &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
