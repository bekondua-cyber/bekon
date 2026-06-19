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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${API_BASE}/api/articles?slug=${params.slug}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const json = await res.json();
      const data =
        json &&
        typeof json === "object" &&
        "data" in json &&
        Array.isArray(json.data)
          ? json.data
          : [];
      const article = data.find(
        (a: { slug: string }) => a.slug === params.slug
      );
      if (article) {
        return {
          title: article.title,
          description: article.excerpt,
          alternates: { canonical: `/informasi/blog/${params.slug}` },
        };
      }
    }
  } catch {
    // fall through
  }
  return { title: "Artikel Tidak Ditemukan" };
}

export default async function BlogDetailPage({ params }: Props) {
  let article: {
    id: string;
    title: string;
    slug: string;
    category?: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string | null;
    publishedAt?: string | null;
  } | null = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/articles?slug=${params.slug}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const json = await res.json();
      const data =
        json &&
        typeof json === "object" &&
        "data" in json &&
        Array.isArray(json.data)
          ? json.data
          : [];
      article =
        data.find(
          (a: { slug: string }) => a.slug === params.slug
        ) ?? null;
    }
  } catch {
    article = null;
  }

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
            {article.category?.replace(/-/g, " ") ?? ""}
          </span>

          <h1 className="font-display text-[clamp(28px,4vw,42px)] text-bekon-near-black mb-4 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-bekon-text-muted mb-8">
            <span>Tim BEKON</span>
            <span>&middot;</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>

          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-10">
            <Image
              src={article.thumbnail ?? ""}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>

          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
          />
        </div>
      </article>
    </div>
  );
}
