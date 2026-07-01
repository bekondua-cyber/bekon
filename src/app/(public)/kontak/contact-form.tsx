"use client";

import { useState } from "react";
import { siteConfig } from "@/data/site-config";

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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string) || "";
    const phone = (data.get("phone") as string) || "";
    const service = (data.get("service") as string) || "";
    const message = (data.get("message") as string) || "";

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Calon Klien",
          phone: phone || "-",
          service: service || "",
          message: message || "Tertarik dengan layanan BEKON",
        }),
      });
    } catch (err) { console.error("Contact form error:", err) }

    const text = `Halo BEKON, saya ${name || "calon klien"}.\nNo. HP: ${phone}\nLayanan: ${service || "Belum ditentukan"}\nPesan: ${message || "Saya ingin konsultasi"}`;
    window.open(
      `https://wa.me/${s("wa_admin_1", siteConfig.whatsapp1)}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setTimeout(() => setSubmitting(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E0D9CE] rounded-xl p-8">
      <h2 className="text-lg font-semibold text-bekon-near-black mb-6">
        Kirim Pesan
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-bekon-text-secondary mb-1.5">
            Nama
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold"
            placeholder="Nama Anda"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-bekon-text-secondary mb-1.5">
            No. WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full px-4 py-2.5 border border-bekon-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bekon-gold/30 focus:border-bekon-gold"
            placeholder="+62 812-xxxx-xxxx"
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
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Kirim via WhatsApp
        </button>
      </form>
    </div>
  );
}
