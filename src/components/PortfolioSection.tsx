"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { portfolioItems, portfolioCategories } from "@/data/portfolio";

export function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState("semua");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const filtered =
    activeFilter === "semua"
      ? portfolioItems
      : portfolioItems.filter((p) => p.category === activeFilter);

  const featured = filtered.find((p) => p.is_featured);
  const others = filtered.filter((p) => !p.is_featured);

  return (
    <section
      id="portfolio"
      aria-label="Portfolio BEKON"
      className="bg-bekon-cream py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <span className="section-label">Portfolio</span>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-3">
              Karya Terbaik Kami
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="text-bekon-gold text-sm font-medium hover:text-bekon-gold-dark transition-colors hidden md:inline-flex items-center gap-1"
          >
            Lihat Semua Portfolio &rarr;
          </Link>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {portfolioCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === cat.value
                  ? "bg-bekon-gold text-white"
                  : "bg-white text-bekon-text-secondary border border-bekon-border hover:border-bekon-gold"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {featured && (
              <Link
                href={`/portfolio/${featured.slug}`}
                className="relative group overflow-hidden rounded-xl md:col-span-2 md:row-span-2 min-h-[300px] md:min-h-[400px]"
              >
                <img
                  src={featured.cover_image}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                className="relative group overflow-hidden rounded-xl min-h-[220px]"
              >
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/portfolio"
            className="text-bekon-gold text-sm font-medium hover:text-bekon-gold-dark transition-colors inline-flex items-center gap-1"
          >
            Lihat Semua Portfolio &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
