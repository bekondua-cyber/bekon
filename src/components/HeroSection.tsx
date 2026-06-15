"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1719887805632-de5be825f72b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
    alt: "Rumah modern tropical dengan palm trees - proyek BEKON Serang",
  },
  {
    image:
      "https://images.unsplash.com/photo-1745761320791-5ae142edee8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
    alt: "Hunian mewah modern dengan kolam renang - karya BEKON",
  },
  {
    image:
      "https://images.unsplash.com/photo-1762117360944-82ad090fffb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
    alt: "Rumah 2 lantai minimalis modern dengan carport - BEKON Banten",
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((p) => (p + 1) % slides.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="beranda"
      aria-label="Hero BEKON - Jasa Bangun Rumah Serang"
      className="relative min-h-screen"
    >
      <div className="hidden lg:flex min-h-screen">
        <div className="relative w-[55%] overflow-hidden">
          {slides.map((s, i) => (
            <motion.img
              key={i}
              src={s.image}
              alt={s.alt}
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 w-full h-full object-cover"
              animate={{
                opacity: i === current ? 1 : 0,
                scale: i === current ? 1 : 1.05,
              }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-bekon-off-white pointer-events-none" />

          <div className="absolute bottom-8 left-8 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-bekon-gold w-6 h-2"
                    : "bg-white/60 w-2 h-2"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="w-[45%] bg-bekon-off-white flex items-center">
          <div className="px-14 xl:px-20 py-20">
            <DesktopContent />
          </div>
        </div>
      </div>

      <div className="lg:hidden relative min-h-screen">
        {slides.map((s, i) => (
          <motion.img
            key={i}
            src={s.image}
            alt={s.alt}
            loading={i === 0 ? "eager" : "lazy"}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: i === current ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-bekon-near-black/90 via-bekon-near-black/40 to-bekon-near-black/20" />

        <div className="relative z-10 flex flex-col justify-end min-h-screen px-6 pb-16 pt-24">
          <MobileContent />

          <div className="flex gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-bekon-gold w-6 h-2"
                    : "bg-white/50 w-2 h-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <motion.a
        href="#stats"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 right-12 hidden lg:flex flex-col items-center gap-2 cursor-pointer"
        aria-label="Scroll ke bawah"
      >
        <span className="text-bekon-text-muted uppercase text-[11px] font-medium tracking-[0.1em]">
          Scroll
        </span>
        <ChevronDown className="text-bekon-gold" size={18} />
      </motion.a>
    </section>
  );
}

function DesktopContent() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0, 0, 0.2, 1], delay: 0.2 }}
    >
      <div className="mb-5">
        <span className="section-label">
          Jasa Konstruksi & Desain &mdash; Serang, Banten
        </span>
      </div>

      <h1 className="font-display text-[64px] xl:text-[72px] font-light leading-[1.05] text-bekon-near-black mb-6">
        Wujudkan
        <br />
        <em className="italic text-bekon-gold not-italic">Hunian</em>
        <br />
        Impian Anda
      </h1>

      <div className="w-16 h-px bg-bekon-gold mb-6" />

      <p className="text-bekon-text-secondary text-[17px] leading-relaxed mb-10 max-w-sm">
        BEKON adalah mitra jangka panjang yang mewujudkan investasi hunian
        berkualitas dengan transparansi, estetika, dan ketepatan. Berpengalaman
        sejak 2009.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20ingin%20konsultasi%20gratis%20untuk%20proyek%20saya`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bekon-gold text-white rounded-full transition-all duration-200 hover:bg-bekon-gold-dark hover:-translate-y-0.5 hover:shadow-gold text-sm font-medium"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Konsultasi Gratis
        </a>
        <Link
          href="/portfolio"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-bekon-gold text-bekon-gold rounded-full transition-all duration-200 hover:bg-bekon-gold hover:text-white text-sm font-medium"
        >
          Lihat Portfolio &rarr;
        </Link>
      </div>

      <div className="mt-12 pt-8 border-t border-bekon-border flex items-center gap-6">
        <div>
          <div className="font-display text-[28px] font-semibold leading-none text-bekon-gold">
            200+
          </div>
          <div className="text-bekon-text-muted uppercase tracking-wider text-[11px] font-medium mt-0.5">
            Proyek Selesai
          </div>
        </div>
        <div className="w-px h-8 bg-bekon-border" />
        <div>
          <div className="font-display text-[28px] font-semibold leading-none text-bekon-gold">
            15+
          </div>
          <div className="text-bekon-text-muted uppercase tracking-wider text-[11px] font-medium mt-0.5">
            Tahun Pengalaman
          </div>
        </div>
        <div className="w-px h-8 bg-bekon-border" />
        <div>
          <div className="font-display text-[28px] font-semibold leading-none text-bekon-gold">
            100%
          </div>
          <div className="text-bekon-text-muted uppercase tracking-wider text-[11px] font-medium mt-0.5">
            Kepuasan Klien
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MobileContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
    >
      <div className="mb-3">
        <span className="text-bekon-gold uppercase text-[10px] font-semibold tracking-[0.15em]">
          Jasa Konstruksi & Desain &mdash; Serang, Banten
        </span>
      </div>

      <h1 className="font-display text-[44px] font-light leading-[1.05] text-white mb-4">
        Wujudkan
        <br />
        <em className="italic text-bekon-gold not-italic">Hunian</em>
        <br />
        Impian Anda
      </h1>

      <div className="w-12 h-px bg-bekon-gold mb-4" />

      <p className="text-white/80 text-[15px] leading-relaxed mb-8 max-w-xs">
        Mitra jangka panjang untuk hunian berkualitas. Berpengalaman sejak 2009.
      </p>

      <div className="flex flex-col gap-3">
        <a
          href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20ingin%20konsultasi%20gratis`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-7 py-3.5 bg-bekon-gold text-white rounded-full text-sm font-medium"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Konsultasi Gratis
        </a>
        <Link
          href="/portfolio"
          className="flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-white text-white rounded-full text-sm font-medium"
        >
          Lihat Portfolio &rarr;
        </Link>
      </div>
    </motion.div>
  );
}
