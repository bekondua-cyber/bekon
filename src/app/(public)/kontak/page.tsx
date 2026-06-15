import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi BEKON untuk konsultasi gratis. Tersedia WhatsApp, telepon, email, dan form konsultasi online.",
};

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-bekon-off-white">
      <div className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        <div className="text-center mb-14">
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black">
            Hubungi Kami
          </h1>
          <p className="text-bekon-text-muted mt-2 max-w-lg mx-auto">
            Konsultasikan proyek Anda bersama tim BEKON. Gratis dan tanpa komitmen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-bekon-border">
              <h2 className="text-lg font-semibold text-bekon-near-black mb-4">
                Informasi Kontak
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bekon-gold mt-0.5 shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="font-medium text-sm text-bekon-near-black">Alamat</p>
                    <p className="text-bekon-text-muted text-sm">{siteConfig.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bekon-gold mt-0.5 shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div>
                    <p className="font-medium text-sm text-bekon-near-black">Telepon</p>
                    <p className="text-bekon-text-muted text-sm">
                      {siteConfig.phone1}<br />{siteConfig.phone2}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bekon-gold mt-0.5 shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <p className="font-medium text-sm text-bekon-near-black">Email</p>
                    <p className="text-bekon-text-muted text-sm">{siteConfig.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-bekon-border">
              <h2 className="text-lg font-semibold text-bekon-near-black mb-4">WhatsApp</h2>
              <div className="flex flex-wrap gap-3">
                <a href={`https://wa.me/${siteConfig.whatsapp1}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-bekon-whatsapp text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                  {siteConfig.whatsapp1_name}
                </a>
                <a href={`https://wa.me/${siteConfig.whatsapp2}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-bekon-whatsapp text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                  {siteConfig.whatsapp2_name}
                </a>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-bekon-border h-[250px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3968.0!2d106.15!3d-6.12!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e418c0b0b0b0b0b%3A0x0!2sSerang%2C%20Banten!5e0!3m2!1sid!2sid!4v1"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Lokasi BEKON di Serang, Banten"
              />
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
