"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
  const featuredItem = items.find((p) => p.isFeatured) || items[0];
  const [activeItem, setActiveItem] = useState<PortfolioItem>(featuredItem);

  if (items.length === 0) {
    return (
      <section
        id="portfolio"
        aria-label="Portfolio BEKON"
        className="bg-black/80 pt-20 md:pt-28 pb-0"
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
      className="bg-black/80 pt-20 md:pt-28 pb-20"
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
      </div>

      <div className="w-screen relative left-1/2 -translate-x-1/2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href={`/portfolio/${activeItem.slug}`} className="relative block aspect-[16/9] overflow-hidden">
              <Image
                src={activeItem.coverImage ?? ""}
                alt={activeItem.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                {activeItem.category && (
                  <span className="inline-block bg-bekon-gold text-bekon-near-black text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                    {activeItem.category}
                  </span>
                )}
                <h3 className="font-display text-2xl md:text-3xl text-white font-light leading-tight">
                  {activeItem.title}
                </h3>
                <span className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-bekon-gold text-bekon-near-black rounded-full text-sm font-medium transition-all duration-200 hover:bg-bekon-gold-dark hover:-translate-y-0.5">
                  Lihat Detail &rarr;
                </span>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-screen relative left-1/2 -translate-x-1/2 mt-4">
        <div className="max-w-container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
            {items.map((item) => {
              const isActive = activeItem.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  onMouseEnter={() => setActiveItem(item)}
                  className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "ring-2 ring-bekon-gold ring-offset-2 ring-offset-black/80 opacity-100"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={item.coverImage ?? ""}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                    <p className="text-white text-xs md:text-sm font-medium truncate">
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-container mx-auto px-6 lg:px-20">
        <div className="mt-6 text-center md:hidden">
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
