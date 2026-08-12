"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { normalizeWA } from "@/lib/utils";
import { SocialLinksRenderer, parseSocialLinks } from "@/components/SocialLinksRenderer";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import {
  buildWaUrl,
  reserveWindow,
  sendWindowTo,
  submitLead,
  validateLead,
  type LeadFieldErrors,
} from "@/lib/lead-form";

interface ContactSectionProps {
  settings?: Record<string, string>;
}

export function ContactSection({ settings = {} }: ContactSectionProps) {
  const s = (key: string, fallback: string) => settings[key] || fallback;
  const socialLinks = parseSocialLinks(settings["social_links"], {
    instagram: settings["instagram"] || siteConfig.social.instagram,
    youtube: settings["youtube"] || siteConfig.social.youtube,
    tiktok: settings["tiktok"] || siteConfig.social.tiktok,
  });

  const servicesRaw = s("form_services", "");
  const services = servicesRaw
    ? servicesRaw.split("|").map((svc) => svc.trim()).filter(Boolean)
    : [
        "Desain Eksterior",
        "Desain Interior",
        "Bangun Rumah",
        "Renovasi Rumah",
        "Interior Rumah",
        "Bangun Kost & Ruko",
      ];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    budget: "",
    message: "",
    company_website: "",
  });
  const [errors, setErrors] = useState<LeadFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState("");
  const [sentWaUrl, setSentWaUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setFailure("");
    setSentWaUrl("");

    const fieldErrors = validateLead(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    // Jendela dipesan SEKARANG, masih di dalam gestur klik. Kalau menunggu
    // sampai setelah await, pemblokir popup di iOS/Android membuangnya dan
    // pengunjung menekan tombol tanpa terjadi apa pun.
    const win = reserveWindow();
    setSubmitting(true);

    const result = await submitLead(form);
    setSubmitting(false);

    if (!result.ok) {
      win?.close();
      setFailure(result.error);
      return;
    }

    const waUrl = buildWaUrl(s("wa_admin_1", siteConfig.whatsapp1), form);
    // Kalau jendelanya tetap diblokir, tampilkan tautan yang bisa ditekan —
    // jangan biarkan pengunjung menatap layar yang diam.
    if (!sendWindowTo(win, waUrl)) setSentWaUrl(waUrl);
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
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-5 mb-8">
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
                    {s("alamat", siteConfig.address)}
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
                    {s("telepon", siteConfig.phone1)}
                    <br />
                    {s("telepon_2", siteConfig.phone2)}
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
                    {s("email", siteConfig.email)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <WhatsAppLink
                href={`https://wa.me/${normalizeWA(s("wa_admin_1", siteConfig.whatsapp1))}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-bekon-whatsapp text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {s("wa_admin_1_name", siteConfig.whatsapp1_name)}
              </WhatsAppLink>
              <WhatsAppLink
                href={`https://wa.me/${normalizeWA(s("wa_admin_2", siteConfig.whatsapp2))}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-bekon-whatsapp text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {s("wa_admin_2_name", siteConfig.whatsapp2_name)}
              </WhatsAppLink>
            </div>

            <SocialLinksRenderer
              links={socialLinks}
              className="flex gap-4 mt-6"
              iconClassName="text-bekon-text-muted"
            />

            <div className="mt-6">
              <a
                href={s("maps_url", siteConfig.maps_url)}
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
                <input
                  type="text"
                  name="company_website"
                  value={form.company_website}
                  onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                  style={{ position: "absolute", left: "-9999px" }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-bekon-text-secondary mb-1.5"
                  >
                    Nama <span className="text-bekon-error">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold bg-white"
                    placeholder="Nama Anda"
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-bekon-error text-xs mt-1.5">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-bekon-text-secondary mb-1.5"
                  >
                    No. WhatsApp <span className="text-bekon-error">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold bg-white"
                    placeholder="081234567890"
                    aria-required="true"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-bekon-error text-xs mt-1.5">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-bekon-text-secondary mb-1.5"
                  >
                    Email (opsional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold bg-white"
                    placeholder="nama@email.com"
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
                    htmlFor="budget"
                    className="block text-sm font-medium text-bekon-text-secondary mb-1.5"
                  >
                    Perkiraan Budget
                  </label>
                  <select
                    id="budget"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold bg-white"
                  >
                    <option value="">Pilih perkiraan budget</option>
                    <option value="< Rp100 juta">&lt; Rp100 juta</option>
                    <option value="Rp100 - 300 juta">Rp100 - 300 juta</option>
                    <option value="Rp300 - 500 juta">Rp300 - 500 juta</option>
                    <option value="> Rp500 juta">&gt; Rp500 juta</option>
                    <option value="Belum tahu">Belum tahu</option>
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

                {failure && (
                  <p
                    role="alert"
                    className="text-sm text-bekon-error bg-bekon-error/10 border border-bekon-error/30 rounded-lg px-4 py-3"
                  >
                    {failure}
                  </p>
                )}

                {sentWaUrl && (
                  <div
                    role="status"
                    className="text-sm bg-bekon-whatsapp/10 border border-bekon-whatsapp/30 rounded-lg px-4 py-3"
                  >
                    <p className="font-semibold text-bekon-near-black mb-1">
                      Pesan Anda sudah kami terima.
                    </p>
                    <p className="text-bekon-text-muted mb-3">
                      Browser Anda memblokir tab baru. Ketuk tombol di bawah untuk
                      melanjutkan ke WhatsApp.
                    </p>
                    <WhatsAppLink
                      href={sentWaUrl}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-bekon-whatsapp text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Lanjut ke WhatsApp
                    </WhatsAppLink>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-bekon-whatsapp text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {submitting ? "Mengirim..." : "Kirim via WhatsApp"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
