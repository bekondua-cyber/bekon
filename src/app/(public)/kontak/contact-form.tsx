"use client";

import { siteConfig } from "@/data/site-config";

export function ContactForm() {
  return (
    <div className="bg-white rounded-xl p-6 md:p-8 border border-bekon-border h-fit">
      <h2 className="text-lg font-semibold text-bekon-near-black mb-6">
        Kirim Pesan
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const data = new FormData(form);
          const text = `Halo BEKON, saya ${data.get("name") || "calon klien"}.\nLayanan: ${data.get("service") || "Belum ditentukan"}\nPesan: ${data.get("message") || "Saya ingin konsultasi"}`;
          window.open(
            `https://wa.me/${siteConfig.whatsapp1}?text=${encodeURIComponent(text)}`,
            "_blank"
          );
        }}
        className="space-y-5"
      >
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
            <option value="Desain Eksterior">Desain Eksterior</option>
            <option value="Desain Interior">Desain Interior</option>
            <option value="Bangun Rumah">Bangun Rumah</option>
            <option value="Renovasi Rumah">Renovasi Rumah</option>
            <option value="Interior Rumah">Interior Rumah</option>
            <option value="Bangun Kost & Ruko">Bangun Kost & Ruko</option>
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
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-bekon-whatsapp text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Kirim via WhatsApp
        </button>
      </form>
    </div>
  );
}
