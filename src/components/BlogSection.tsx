"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { articles } from "@/data/articles";

export function BlogSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

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
            className="text-bekon-gold text-sm font-medium hover:text-bekon-gold-dark transition-colors hidden md:inline-flex items-center gap-1"
          >
            Semua Artikel &rarr;
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
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
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block px-3 py-1 rounded-full bg-bekon-gold/10 text-bekon-gold text-[11px] font-semibold uppercase tracking-wider mb-3">
                    {article.category.replace(/-/g, " ")}
                  </span>
                  <h3 className="text-bekon-near-black font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-bekon-gold transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-bekon-text-muted text-sm line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-bekon-text-muted">
                    <span>{article.date}</span>
                    <span>{article.read_time}</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/informasi/blog"
            className="text-bekon-gold text-sm font-medium hover:text-bekon-gold-dark transition-colors inline-flex items-center gap-1"
          >
            Semua Artikel &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
