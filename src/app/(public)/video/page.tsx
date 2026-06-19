import type { Metadata } from "next";
import { VideoPageClient } from "./VideoPageClient";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Video",
  description:
    "Tonton video home tour, desain 3D, dan proses pembangunan proyek BEKON.",
  alternates: { canonical: "/video" },
};

const API_BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl?: string;
  youtubeId: string;
  thumbnail?: string;
  category?: string;
  isFeatured?: boolean;
  sortOrder?: number;
}

async function fetchVideos(): Promise<VideoItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/videos`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    if (json && Array.isArray(json.data)) return json.data as VideoItem[];
    return [];
  } catch {
    return [];
  }
}

export default async function VideoPage() {
  const items = await fetchVideos();

  return (
    <div className="min-h-screen bg-bekon-off-white">
      <div className="max-w-container mx-auto px-6 lg:px-20 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 className="font-display text-[clamp(32px,4vw,48px)] text-bekon-near-black">
            Video Proyek
          </h1>
          <p className="text-bekon-text-muted mt-2">
            Lihat hasil nyata proyek BEKON
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-bekon-text-muted text-sm">
              Belum ada video yang tersedia. Silakan kembali lagi nanti.
            </p>
          </div>
        ) : (
          <VideoPageClient items={items} />
        )}

        <div className="text-center mt-8">
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-bekon-near-black text-white rounded-full text-sm font-medium hover:bg-bekon-gold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Kunjungi YouTube BEKON
          </a>
        </div>
      </div>
    </div>
  );
}
