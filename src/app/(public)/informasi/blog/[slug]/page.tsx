import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/data/articles";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default function BlogDetailPage({ params }: Props) {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-bekon-off-white">
      <article className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        <Link
          href="/informasi/blog"
          className="text-bekon-gold text-sm mb-6 inline-block hover:text-bekon-gold-light transition-colors"
        >
          &larr; Kembali ke Blog
        </Link>

        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-bekon-gold/10 text-bekon-gold text-[11px] font-semibold uppercase tracking-wider mb-4">
            {article.category.replace(/-/g, " ")}
          </span>

          <h1 className="font-display text-[clamp(28px,4vw,42px)] text-bekon-near-black mb-4 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-bekon-text-muted mb-8">
            <span>{article.author}</span>
            <span>&middot;</span>
            <span>{article.date}</span>
            <span>&middot;</span>
            <span>{article.read_time}</span>
          </div>

          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-10">
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-bekon-text-secondary text-lg leading-relaxed mb-6">
              {article.excerpt}
            </p>
            <p className="text-bekon-text-muted leading-relaxed">
              Artikel ini akan segera dilengkapi dengan konten lengkap. Untuk
              informasi lebih lanjut, silakan hubungi tim BEKON.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
