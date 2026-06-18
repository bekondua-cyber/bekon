"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  thumbnail?: string;
  publishedAt?: string;
}

export function BlogSection({ items }: { items: ArticleItem[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const data = items.length > 0 ? items.slice(0, 3) : [];

  if (data.length === 0) {
    return (
      <section
        id="blog"
        aria-label="Blog dan artikel BEKON"
        className="bg-bekon-cream py-20 md:py-28"
      >
        <div className="max-w-container mx-auto px-6 lg:px-20 text-center">
          <span className="section-label text-[#7A6228]">Blog</span>
          <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-3 mb-6">
            Tips & Inspirasi Rumah
          </h2>
          <p className="text-bekon-text-muted text-sm">
            Belum ada artikel. Pantau terus untuk tips & inspirasi rumah.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="blog"
      aria-label="Blog dan artikel BEKON"
      className="bg-bekon-cream py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="section-label">Blog</span>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-3">
              Tips & Inspirasi Rumah
            </h2>
          </div>
          <Link
            href="/informasi/blog"
            className="text-[#7A6228] text-sm font-medium hover:text-bekon-gold-dark transition-colors hidden md:inline-flex items-center gap-1"
          >
            Semua Artikel &rarr;
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/informasi/blog/${article.slug}`}
                className="block bg-white rounded-xl overflow-hidden border border-bekon-border group hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={article.thumbnail ?? ""}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  {article.category && (
                    <span className="inline-block px-3 py-1 rounded-full bg-bekon-gold/10 text-bekon-gold text-[11px] font-semibold uppercase tracking-wider mb-3">
                      {article.category.replace(/-/g, " ")}
                    </span>
                  )}
                  <h3 className="text-bekon-near-black font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-bekon-gold transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-bekon-text-muted text-sm line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-bekon-text-muted">
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/informasi/blog"
            className="text-[#7A6228] text-sm font-medium hover:text-bekon-gold-dark transition-colors inline-flex items-center gap-1"
          >
            Semua Artikel &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
