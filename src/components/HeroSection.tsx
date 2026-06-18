"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";

const MotionImage = motion(Image);

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
      {slides.map((s, i) => (
        <MotionImage
          key={i}
          src={s.image}
          alt={s.alt}
          fill
          sizes="100vw"
          priority={i === 0}
          className="object-cover"
          animate={{
            opacity: i === current ? 1 : 0,
            scale: i === current ? 1 : 1.05,
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      ))}

      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

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
      className="flex flex-col gap-5"
    >
      {/* Section label - blur pill */}
      <div className="inline-block self-start">
        <div className="bg-black/40 backdrop-blur-md rounded-full px-5 py-2">
          <span className="text-bekon-gold text-xs font-semibold uppercase tracking-[0.15em]">
            Jasa Konstruksi & Desain &mdash; Serang, Banten
          </span>
        </div>
      </div>

      {/* Headline - blur block */}
      <div className="bg-black/35 backdrop-blur-md rounded-xl px-8 py-6 self-start max-w-3xl">
        <h1 className="font-display text-5xl lg:text-[64px] xl:text-[72px] font-light leading-[1.05] text-white">
          Wujudkan
          <br />
          <em className="not-italic text-bekon-gold">Hunian</em>
          <br />
          Impian Anda
        </h1>
      </div>

      {/* Gold divider */}
      <div className="w-16 h-px bg-bekon-gold self-start ml-1" />

      {/* Description - blur block */}
      <div className="bg-black/35 backdrop-blur-md rounded-xl px-6 py-4 self-start max-w-md">
        <p className="text-white text-[16px] leading-relaxed">
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
    </motion.div>
  );
}
