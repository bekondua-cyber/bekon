import type { Metadata } from "next";
import VideoPageClient from "./VideoPageClient";


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
  youtubeId: string;
  youtubeUrl: string;
  thumbnail: string | null;
  category: string | null;
  isFeatured: boolean;
  isPublished: boolean;
}

async function fetchVideos(): Promise<VideoItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/videos`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data;
    if (Array.isArray(data)) return data as VideoItem[];
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


      </div>
    </div>
  );
}
