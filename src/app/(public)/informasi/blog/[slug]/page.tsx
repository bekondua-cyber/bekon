import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: { slug: string };
}

const API_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const CATEGORY_LABELS: Record<string, string> = {
  eksterior: "Eksterior",
  interior: "Interior",
  umum: "Umum",
};

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

interface Article {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string | null;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
}

async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE}/api/articles/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && typeof json.data === "object" && !Array.isArray(json.data)) {
      return json.data as Article;
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await fetchArticle(params.slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };
  return {
    title: article.metaTitle || article.title,
    description: article.metaDesc || article.excerpt,
    alternates: { canonical: `/informasi/blog/${params.slug}` },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const article = await fetchArticle(params.slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-bekon-off-white">
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
              dangerouslySetInnerHTML={{ __html: article.content }}
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
