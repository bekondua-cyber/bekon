import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/data/site-config";
import { teamMembers } from "@/data/team";
import { whyBekon } from "@/data/why-bekon";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: `Tentang ${siteConfig.fullName} (BEKON) — kontraktor dan arsitek profesional sejak ${siteConfig.since} di Serang, Cilegon, Banten.`,
};

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-bekon-off-white">
      <div className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        {/* Hero */}
        <div className="text-center mb-16" id="perusahaan">
          <span className="section-label">Tentang Kami</span>
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black mt-3">
            Mitra Terpercaya Untuk
            <br />
            Hunian & Bangunan Berkualitas
          </h1>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl font-bold text-bekon-near-black mb-4">
              {siteConfig.fullName}
            </h2>
            <p className="text-bekon-text-muted leading-relaxed mb-4">
              BEKON berdiri sejak 2009 dan telah melayani ratusan klien di
              Serang, Cilegon, Banten, dan sekitarnya. Kami adalah mitra jangka
              panjang yang mewujudkan investasi hunian berkualitas dengan
              transparansi, estetika, dan ketepatan.
            </p>
            <p className="text-bekon-text-muted leading-relaxed mb-6">
              Dengan tim profesional yang berpengalaman, kami melayani jasa
              desain eksterior, interior, bangun rumah, renovasi, hingga
              pembangunan kost dan ruko. Layanan online kami menjangkau seluruh
              Indonesia dan luar negeri.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-bekon-border text-center">
                <div className="font-display text-3xl font-semibold text-bekon-gold">
                  {new Date().getFullYear() - siteConfig.since}+
                </div>
                <div className="text-bekon-text-muted text-xs uppercase tracking-wider font-medium mt-1">
                  Tahun Pengalaman
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-bekon-border text-center">
                <div className="font-display text-3xl font-semibold text-bekon-gold">
                  200+
                </div>
                <div className="text-bekon-text-muted text-xs uppercase tracking-wider font-medium mt-1">
                  Proyek Selesai
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1608387371413-f2566ac510e0?w=800&q=80"
                alt="Tim BEKON"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Why BEKON */}
        <div className="mb-20" id="keunggulan">
          <h2 className="text-2xl font-bold text-bekon-near-black mb-8">
            Mengapa Memilih BEKON?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyBekon.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 border border-bekon-border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-bekon-gold shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <h3 className="font-semibold text-bekon-near-black">
                    {item.title}
                  </h3>
                </div>
                <p className="text-bekon-text-muted text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div id="tim">
          <h2 className="text-2xl font-bold text-bekon-near-black mb-8">
            Tim Kami
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl p-6 border border-bekon-border text-center"
              >
                <div className="w-20 h-20 rounded-full bg-bekon-gold/10 flex items-center justify-center text-bekon-gold font-display text-2xl font-semibold mx-auto mb-4">
                  {member.initials}
                </div>
                <h3 className="font-semibold text-bekon-near-black">
                  {member.name}
                </h3>
                <p className="text-bekon-gold text-sm font-medium mt-0.5 mb-2">
                  {member.role}
                </p>
                <p className="text-bekon-text-muted text-xs leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
