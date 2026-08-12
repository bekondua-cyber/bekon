"use client";

import { useState } from "react";
import { siteConfig } from "@/data/site-config";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import {
  buildWaUrl,
  reserveWindow,
  sendWindowTo,
  submitLead,
  validateLead,
  type LeadFieldErrors,
  type LeadFormValues,
} from "@/lib/lead-form";

interface ContactFormProps {
  settings?: Record<string, string>;
}

export function ContactForm({ settings = {} }: ContactFormProps) {
  const s = (key: string, fallback: string) => settings[key] || fallback;

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

  const [errors, setErrors] = useState<LeadFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState("");
  const [sentWaUrl, setSentWaUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setFailure("");
    setSentWaUrl("");

    // Dibaca sinkron, sebelum await apa pun — setelah handler ini kembali,
    // currentTarget sudah tidak bisa diandalkan.
    const data = new FormData(e.currentTarget);
    const values: LeadFormValues = {
      name: (data.get("name") as string) || "",
      phone: (data.get("phone") as string) || "",
      email: (data.get("email") as string) || "",
      service: (data.get("service") as string) || "",
      budget: (data.get("budget") as string) || "",
      message: (data.get("message") as string) || "",
      company_website: (data.get("company_website") as string) || "",
    };

    const fieldErrors = validateLead(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    // Jendela dipesan selagi masih di dalam gestur klik — lihat lead-form.ts.
    const win = reserveWindow();
    setSubmitting(true);

    const result = await submitLead(values);
    setSubmitting(false);

    if (!result.ok) {
      win?.close();
      setFailure(result.error);
      return;
    }

    const waUrl = buildWaUrl(s("wa_admin_1", siteConfig.whatsapp1), values);
    if (!sendWindowTo(win, waUrl)) setSentWaUrl(waUrl);
  };

  return (
    <div className="bg-white border border-[#E0D9CE] rounded-xl p-8">
      <h2 className="text-lg font-semibold text-bekon-near-black mb-6">
        Kirim Pesan
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="company_website"
          style={{ position: "absolute", left: "-9999px" }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-bekon-text-secondary mb-1.5">
            Nama <span className="text-bekon-error">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold"
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
          <label htmlFor="phone" className="block text-sm font-medium text-bekon-text-secondary mb-1.5">
            No. WhatsApp <span className="text-bekon-error">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold"
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
          <label htmlFor="email" className="block text-sm font-medium text-bekon-text-secondary mb-1.5">
            Email (opsional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold"
            placeholder="nama@email.com"
          />
        </div>
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-bekon-text-secondary mb-1.5">
            Layanan
          </label>
          <select
            id="service"
            name="service"
            className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold"
          >
            <option value="">Pilih layanan</option>
            {services.map((svc) => (
              <option key={svc} value={svc}>{svc}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-bekon-text-secondary mb-1.5">
            Perkiraan Budget
          </label>
          <select
            id="budget"
            name="budget"
            className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold"
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
          <label htmlFor="message" className="block text-sm font-medium text-bekon-text-secondary mb-1.5">
            Pesan
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold resize-none"
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
            className="text-sm bg-[#25D366]/10 border border-[#25D366]/30 rounded-lg px-4 py-3"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Lanjut ke WhatsApp
            </WhatsAppLink>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Mengirim..." : "Kirim via WhatsApp"}
        </button>
      </form>
    </div>
  );
}
