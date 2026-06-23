import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlogFilterDropdown from "@/components/BlogFilterDropdown";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, inspirasi desain, dan panduan membangun rumah dari BEKON.",
  alternates: { canonical: "/informasi/blog" },
};

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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const filter = searchParams.filter || "semua";
  const categoryParam =
    filter === "semua" ? "eksterior,interior,umum" : filter;

  let articles: Array<{
    id: string;
    title: string;
    slug: string;
    category?: string;
    excerpt?: string;
    thumbnail?: string | null;
    publishedAt?: string | null;
  }> = [];

  try {
    const res = await fetch(
      `${API_BASE}/api/articles?category=${categoryParam}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const json = await res.json();
      if (
        json &&
        typeof json === "object" &&
        "data" in json &&
        Array.isArray(json.data)
      ) {
        articles = json.data;
      }
    }
  } catch {
    articles = [];
  }

  return (
    <div className="min-h-screen bg-bekon-cream">
      <div className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        <div className="text-center mb-10">
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black">
            Blog
          </h1>
          <p className="text-bekon-text-muted mt-2">
            Tips & Inspirasi Rumah
          </p>
        </div>

        <BlogFilterDropdown current={filter} />

        {articles.length === 0 ? (
          <p className="text-center text-bekon-text-muted">
            Belum ada artikel. Pantau terus untuk tips & inspirasi rumah.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
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
                  <span className="inline-block px-3 py-1 rounded-full bg-bekon-gold/10 text-bekon-gold text-[11px] font-semibold uppercase tracking-wider mb-3">
                    {CATEGORY_LABELS[article.category ?? ""] ?? article.category ?? ""}
                  </span>
                  <h2 className="text-bekon-near-black font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-bekon-gold transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-bekon-text-muted text-sm line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-bekon-text-muted">
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
