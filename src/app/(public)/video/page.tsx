import type { Metadata } from "next";
import { videos } from "@/data/videos";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Video",
  description:
    "Tonton video home tour, desain 3D, dan proses pembangunan proyek BEKON.",
};

export default function VideoPage() {
  const featured = videos.find((v) => v.is_featured) || videos[0];

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

        <div className="aspect-video rounded-xl overflow-hidden mb-8">
          <iframe
            src={`https://www.youtube.com/embed/${featured.youtube_id}`}
            title={featured.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {videos.slice(1).map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-video rounded-lg overflow-hidden bg-bekon-near-black"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-bekon-near-black/40 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white" className="opacity-80 group-hover:opacity-100 transition-opacity">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-medium truncate">
                  {video.title}
                </p>
              </div>
            </a>
          ))}
        </div>

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
