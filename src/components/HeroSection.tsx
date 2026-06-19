"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { WhatsAppIcon } from "@/components/Icons";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";

const MotionImage = motion.create(Image);

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
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Images */}
      {slides.map((s, i) => {
        const isActive = i === current;
        return (
          <MotionImage
            key={i}
            src={s.image}
            alt={s.alt}
            fill
            sizes="100vw"
            className="object-cover"
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 1.05,
            }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            {...(isActive ? { priority: true } : { loading: "lazy" })}
          />
        );
      })}

      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/10" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-24 gap-5">
        <DesktopContent />
      </div>

      {/* Dot Navigator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full p-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-bekon-gold ${
              i === current
                ? "bg-bekon-gold w-6 h-2"
                : "bg-white/50 w-3 h-3"
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#stats"
        initial={false}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0, 0, 0.2, 1], delay: 0.2 }}
      className="flex flex-col gap-5 pb-16 sm:pb-0"
    >
      {/* Section label */}
      <span className="text-bekon-gold text-xs font-semibold uppercase tracking-[0.15em]">
        Jasa Konstruksi & Desain &mdash; Serang, Banten
      </span>

      {/* Headline - blur block */}
      <div className="self-start max-w-3xl">
        <h1
          className="font-display text-5xl lg:text-[64px] xl:text-[72px] font-light leading-[1.05] text-white"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.8)" }}
        >
          Wujudkan
          <br />
          <em className="not-italic text-bekon-gold">Hunian</em>
          <br />
          Impian Anda
        </h1>
      </div>

      {/* Gold divider */}
      <div className="w-16 h-px bg-bekon-gold self-start ml-1" />

      {/* Description - text shadow */}
      <div className="self-start max-w-md">
        <p
          className="text-white text-[16px] leading-relaxed"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.8)" }}
        >
          BEKON adalah mitra jangka panjang yang mewujudkan investasi hunian
          berkualitas dengan transparansi, estetika, dan ketepatan. Berpengalaman
          sejak 2009.
        </p>
      </div>

      {/* CTA buttons - no blur */}
      <div className="flex flex-col sm:flex-row gap-4 self-start">
        <a
          href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20ingin%20konsultasi%20gratis%20untuk%20proyek%20saya`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bekon-gold text-white rounded-full transition-all duration-200 hover:bg-bekon-gold-dark hover:-translate-y-0.5 hover:shadow-gold text-sm font-medium"
        >
          <WhatsAppIcon className="w-[18px] h-[18px]" aria-hidden="true" />
          Konsultasi Gratis
        </a>
        <Link
          href="/portfolio"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-bekon-gold text-bekon-gold rounded-full transition-all duration-200 hover:bg-bekon-gold hover:text-white text-sm font-medium"
        >
          Lihat Portfolio &rarr;
        </Link>
      </div>
    </motion.div>
  );
}
