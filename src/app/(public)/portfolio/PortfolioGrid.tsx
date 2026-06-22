"use client";

import { useState } from "react";
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

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  location?: string;
  year?: number;
  coverImage?: string;
  isFeatured?: boolean;
}

const VALID_CATEGORIES = CATEGORIES.map((c) => c.value);

export function PortfolioGrid({ items, initialCategory }: { items: PortfolioItem[]; initialCategory?: string }) {
  const validInitial = initialCategory && VALID_CATEGORIES.includes(initialCategory) ? initialCategory : "semua";
  const [activeFilter, setActiveFilter] = useState(validInitial);

  const filtered =
    activeFilter === "semua"
      ? items
      : items.filter((p) => p.category === activeFilter);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-bekon-text-muted text-sm">
          Belum ada portfolio yang tersedia. Silakan kembali lagi nanti.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveFilter(cat.value)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeFilter === cat.value
                ? "bg-bekon-near-black text-white"
                : "bg-white text-bekon-text-muted border border-gray-200 hover:border-bekon-near-black hover:text-bekon-near-black"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-bekon-text-muted text-sm">
            Tidak ada portfolio dengan kategori &ldquo;
            {CATEGORIES.find((c) => c.value === activeFilter)?.label}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/portfolio/${item.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-100"
            >
              {item.coverImage && (
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-bekon-near-black/80 via-bekon-near-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h2 className="text-white text-base font-bold">
                  {item.title}
                </h2>
                <p className="text-white/70 text-xs mt-1 capitalize">
                  {item.category && item.category.replace("-", " & ")} &middot;{" "}
                  {item.location && item.location}
                  {item.year && <> &middot; {item.year}</>}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
