import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "./contact-form";
import { MapPin, Phone, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi BEKON untuk konsultasi gratis. Tersedia WhatsApp, telepon, email, dan form konsultasi online.",
  alternates: { canonical: "/kontak" },
};

export default async function KontakPage() {
  const dbSettings = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const s of dbSettings) {
    if (s.value !== null) settings[s.key] = s.value;
  }
  const s = (key: string, fallback: string) => settings[key] || fallback;

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <div className="max-w-3xl mx-auto w-full px-4 pt-28 pb-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black">
            Hubungi Kami
          </h1>
          <p className="text-bekon-text-muted mt-2 max-w-lg mx-auto">
            Konsultasikan proyek Anda bersama tim BEKON. Gratis dan tanpa komitmen.
          </p>
        </div>

        <div className="space-y-6">
          {/* WhatsApp Card */}
          <div className="bg-black rounded-xl p-8">
            <h2 className="text-lg font-semibold text-white mb-6">
              Konsultasi Gratis Sekarang
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={`https://wa.me/${s("wa_admin_1", siteConfig.whatsapp1)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.124 7.757L1.751 23.129l8.456-2.191c2.268 1.232 4.815 1.881 7.515 1.881 5.386 0 9.75-4.363 9.75-9.748 0-2.603-.999-5.051-2.823-6.905-1.823-1.854-4.271-2.876-6.902-2.876z" />
                </svg>
                {s("wa_admin_1_name", siteConfig.whatsapp1_name)}
              </a>
              <a
                href={`https://wa.me/${s("wa_admin_2", siteConfig.whatsapp2)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.124 7.757L1.751 23.129l8.456-2.191c2.268 1.232 4.815 1.881 7.515 1.881 5.386 0 9.75-4.363 9.75-9.748 0-2.603-.999-5.051-2.823-6.905-1.823-1.854-4.271-2.876-6.902-2.876z" />
                </svg>
                {s("wa_admin_2_name", siteConfig.whatsapp2_name)}
              </a>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-8">
            <h2 className="text-lg font-semibold text-bekon-near-black mb-6">
              Informasi Kontak
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-bekon-gold/10 flex items-center justify-center text-bekon-gold flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-semibold text-bekon-near-black text-sm">
                    Alamat
                  </p>
                  <p className="text-bekon-text-muted text-sm mt-0.5">
                    {s("alamat", siteConfig.address)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-bekon-gold/10 flex items-center justify-center text-bekon-gold flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-semibold text-bekon-near-black text-sm">
                    Telepon
                  </p>
                  <p className="text-bekon-text-muted text-sm mt-0.5">
                    {s("telepon", siteConfig.phone1)}
                    <br />
                    {s("telepon_2", siteConfig.phone2)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-bekon-gold/10 flex items-center justify-center text-bekon-gold flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-semibold text-bekon-near-black text-sm">
                    Email
                  </p>
                  <p className="text-bekon-text-muted text-sm mt-0.5">
                    {s("email", siteConfig.email)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="rounded-xl overflow-hidden border border-[#E0D9CE] h-80">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3968.0!2d106.15!3d-6.12!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e418c0b0b0b0b0b%3A0x0!2sSerang%2C%20Banten!5e0!3m2!1sid!2sid!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi BEKON di Serang, Banten"
            />
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
