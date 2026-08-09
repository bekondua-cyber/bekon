import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { getArticleBySlug } from "@/lib/queries";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  eksterior: "Eksterior",
  interior: "Interior",
  umum: "Umum",
};

function formatDate(dateStr: Date | string | null | undefined): string {
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

/**
 * Dulu ini fetch HTTP ke `/api/articles/${slug}` dengan slug disisipkan mentah
 * ke URL. Query langsung menghapus perjalanan jaringan sekaligus masalah
 * penyisipan itu.
 */
async function fetchArticle(slug: string) {
  return getArticleBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await fetchArticle(params.slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };

  // Metadata Next menerima `undefined`, bukan `null` — dan kolom opsional
  // Prisma bernilai null.
  const title = article.metaTitle || article.title;
  const description = article.metaDesc || article.excerpt || undefined;
  const image = article.ogImage || article.thumbnail || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/informasi/blog/${params.slug}` },
    openGraph: {
      title,
      description,
      url: `https://bangunrumahbekon.com/informasi/blog/${params.slug}`,
      siteName: "BEKON",
      locale: "id_ID",
      type: "article",
      // OpenGraph menuntut ISO 8601, bukan objek Date.
      publishedTime: article.publishedAt?.toISOString(),
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const article = await fetchArticle(params.slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.metaDesc || article.excerpt,
    image: article.ogImage || article.thumbnail || undefined,
    datePublished: article.publishedAt || undefined,
    author: { "@type": "Organization", name: "BEKON" },
    publisher: { "@type": "Organization", name: "BEKON" },
    mainEntityOfPage: `https://bangunrumahbekon.com/informasi/blog/${params.slug}`,
  };

  return (
    <div className="min-h-screen bg-bekon-off-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        <Link
          href="/informasi/blog"
          className="text-bekon-gold text-sm mb-6 inline-block hover:text-bekon-gold-light transition-colors"
        >
          ← Kembali ke Blog
        </Link>

        <div className="max-w-3xl mx-auto">
          {article.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-bekon-gold/10 text-bekon-gold text-[11px] font-semibold uppercase tracking-wider mb-4">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
          )}

          <h1 className="font-display text-[clamp(28px,4vw,42px)] text-bekon-near-black mb-4 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-bekon-text-muted mb-8">
            <span>Tim BEKON</span>
            <span>·</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>

          {article.thumbnail ? (
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
          ) : null}

          {article.excerpt && !article.content && (
            <p className="text-bekon-text-muted leading-relaxed text-lg mb-8">
              {article.excerpt}
            </p>
          )}

          {article.content ? (
            <div
              className="prose prose-gray max-w-none prose-headings:text-bekon-near-black prose-a:text-bekon-gold"
              dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
            />
          ) : (
            <div className="bg-white rounded-xl border border-bekon-border p-8 text-center">
              <p className="text-bekon-text-muted">
                Konten artikel belum tersedia.
              </p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-bekon-border">
            <Link
              href="/informasi/blog"
              className="inline-flex items-center gap-2 text-bekon-gold hover:text-bekon-gold/80 text-sm font-medium transition-colors"
            >
              ← Kembali ke Blog
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
