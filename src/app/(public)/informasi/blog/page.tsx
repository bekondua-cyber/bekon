import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { articles } from "@/data/articles";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, inspirasi desain, dan panduan membangun rumah dari BEKON.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-bekon-cream">
      <div className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        <div className="text-center mb-14">
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black">
            Blog
          </h1>
          <p className="text-bekon-text-muted mt-2">
            Tips & Inspirasi Rumah
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/informasi/blog/${article.slug}`}
              className="block bg-white rounded-xl overflow-hidden border border-bekon-border group hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <span className="inline-block px-3 py-1 rounded-full bg-bekon-gold/10 text-bekon-gold text-[11px] font-semibold uppercase tracking-wider mb-3">
                  {article.category.replace(/-/g, " ")}
                </span>
                <h2 className="text-bekon-near-black font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-bekon-gold transition-colors">
                  {article.title}
                </h2>
                <p className="text-bekon-text-muted text-sm line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-bekon-text-muted">
                  <span>{article.date}</span>
                  <span>{article.read_time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
