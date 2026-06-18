"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { siteConfig } from "@/data/site-config";

export function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    message: "",
  });

  const services = [
    "Desain Eksterior",
    "Desain Interior",
    "Bangun Rumah",
    "Renovasi Rumah",
    "Interior Rumah",
    "Bangun Kost & Ruko",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Halo BEKON, saya ${form.name || "calon klien"}.\nLayanan: ${form.service || "Belum ditentukan"}\nPesan: ${form.message || "Saya ingin konsultasi"}`;
    window.open(
      `https://wa.me/${siteConfig.whatsapp1}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <section
      id="kontak"
      aria-label="Kontak BEKON"
      className="bg-bekon-off-white py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">Kontak</span>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-3 mb-8">
              Hubungi Kami
            </h2>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-bekon-gold/10 flex items-center justify-center text-bekon-gold shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-semibold text-bekon-near-black text-sm">
                    Alamat
                  </p>
                  <p className="text-bekon-text-muted text-sm mt-0.5">
                    {siteConfig.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-bekon-gold/10 flex items-center justify-center text-bekon-gold shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-semibold text-bekon-near-black text-sm">
                    Telepon
                  </p>
                  <p className="text-bekon-text-muted text-sm mt-0.5">
                    {siteConfig.phone1}
                    <br />
                    {siteConfig.phone2}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-bekon-gold/10 flex items-center justify-center text-bekon-gold shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-semibold text-bekon-near-black text-sm">
                    Email
                  </p>
                  <p className="text-bekon-text-muted text-sm mt-0.5">
                    {siteConfig.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${siteConfig.whatsapp1}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-bekon-whatsapp text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {siteConfig.whatsapp1_name}
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsapp2}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-bekon-whatsapp text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {siteConfig.whatsapp2_name}
              </a>
            </div>

            <div className="flex gap-4 mt-6">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bekon-text-muted hover:text-bekon-gold transition-colors"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bekon-text-muted hover:text-bekon-gold transition-colors"
                aria-label="YouTube"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bekon-text-muted hover:text-bekon-gold transition-colors"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>

            <div className="mt-6">
              <a
                href={siteConfig.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-bekon-gold text-sm font-medium hover:text-bekon-gold-dark transition-colors"
              >
                <MapPin size={16} />
                Lihat di Google Maps &rarr;
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl p-6 md:p-8 border border-bekon-border">
              <h3 className="text-lg font-semibold text-bekon-near-black mb-6">
                Form Konsultasi
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-bekon-text-secondary mb-1.5"
                  >
                    Nama
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold bg-white"
                    placeholder="Nama Anda"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-bekon-text-secondary mb-1.5"
                  >
                    No. WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold bg-white"
                    placeholder="+62 812-xxxx-xxxx"
                  />
                </div>

                <div>
                  <label
                    htmlFor="service"
                    className="block text-sm font-medium text-bekon-text-secondary mb-1.5"
                  >
                    Layanan
                  </label>
                  <select
                    id="service"
                    value={form.service}
                    onChange={(e) =>
                      setForm({ ...form, service: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold bg-white"
                  >
                    <option value="">Pilih layanan</option>
                    {services.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-bekon-text-secondary mb-1.5"
                  >
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold bg-white resize-none"
                    placeholder="Deskripsikan proyek Anda..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-bekon-whatsapp text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Kirim via WhatsApp
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
