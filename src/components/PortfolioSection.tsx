"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  { value: "semua", label: "Semua" },
  { value: "eksterior", label: "Eksterior" },
  { value: "interior", label: "Interior" },
  { value: "bangun", label: "Bangun" },
  { value: "renovasi", label: "Renovasi" },
  { value: "kost-ruko", label: "Kost & Ruko" },
];

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  location?: string;
  year?: number;
  coverImage?: string;
  isFeatured?: boolean;
}

export function PortfolioSection({ items }: { items: PortfolioItem[] }) {
  const [activeFilter, setActiveFilter] = useState("semua");

  const filtered =
    activeFilter === "semua"
      ? items
      : items.filter((p) => p.category === activeFilter);

  const featured = filtered.find((p) => p.isFeatured);
  const others = filtered.filter((p) => !p.isFeatured);

  if (items.length === 0) {
    return (
      <section
        id="portfolio"
        aria-label="Portfolio BEKON"
        className="bg-black/80 py-20 md:py-28"
      >
        <div className="max-w-container mx-auto px-6 lg:px-20 text-center">
          <span className="section-label text-[#CBA84A]">Portfolio</span>
          <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-[#F8F5F0] mt-3 mb-6">
            Karya Terbaik Kami
          </h2>
          <p className="text-[#F8F5F0]/60 text-sm">
            Belum ada portfolio yang tersedia. Silakan kembali lagi nanti.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="portfolio"
      aria-label="Portfolio BEKON"
      className="bg-black/80 py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <span className="section-label text-[#CBA84A]">Portfolio</span>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-[#F8F5F0] mt-3">
              Karya Terbaik Kami
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="text-[#CBA84A] text-sm font-medium hover:text-[#B8963E] transition-colors hidden md:inline-flex items-center gap-1"
          >
            Lihat Semua Portfolio &rarr;
          </Link>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === cat.value
                  ? "bg-[#B8963E] text-white border-transparent"
                  : "bg-white/10 text-[#F8F5F0] border border-white/30 hover:bg-white/20"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="w-full px-0">
        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"
          >
            {featured && (
              <Link
                href={`/portfolio/${featured.slug}`}
                className="relative group overflow-hidden rounded-none md:col-span-2 md:row-span-2 min-h-[400px] md:min-h-[560px]"
              >
                <Image
                  src={featured.coverImage ?? ""}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bekon-near-black/80 via-bekon-near-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white text-lg font-bold">
                    {featured.title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {featured.location} &middot; {featured.year}
                  </p>
                </div>
              </Link>
            )}

            {others.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={`/portfolio/${item.slug}`}
                className="relative group overflow-hidden rounded-none min-h-[280px]"
              >
                <Image
                  src={item.coverImage ?? ""}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bekon-near-black/80 via-bekon-near-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white text-base font-bold">
                    {item.title}
                  </h3>
                  <p className="text-white/70 text-xs mt-1">
                    {item.location} &middot; {item.year}
                  </p>
                </div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="max-w-container mx-auto px-6 lg:px-20">
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/portfolio"
            className="text-[#CBA84A] text-sm font-medium hover:text-[#B8963E] transition-colors inline-flex items-center gap-1"
          >
            Lihat Semua Portfolio &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
