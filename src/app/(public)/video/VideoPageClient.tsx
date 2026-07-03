"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  youtubeUrl: string;
  thumbnail: string | null;
  category: string | null;
  isFeatured: boolean;
  isPublished: boolean;
}

const TABS = [
  { label: "Semua", value: "semua" },
  { label: "Home Tour", value: "hometour" },
  { label: "3D Desain", value: "3d-desain" },
  { label: "Behind the Build", value: "behind-the-build" },
];

interface Props {
  items: VideoItem[];
}

export default function VideoPageClient({ items }: Props) {
  const [activeTab, setActiveTab] = useState("semua");
  const [lightboxVideo, setLightboxVideo] = useState<VideoItem | null>(null);

  const openLightbox = (video: VideoItem) => {
    setLightboxVideo(video);
  };

  const closeLightbox = useCallback(() => {
    setLightboxVideo(null);
  }, []);

  useEffect(() => {
    if (!lightboxVideo) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxVideo, closeLightbox]);

  const filtered =
    activeTab === "semua"
      ? items
      : items.filter((v) => v.category === activeTab);

  return (
    <section className="py-12">
      <div className="max-w-container mx-auto px-6 lg:px-20">

        {/* Tab Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                activeTab === tab.value
                  ? "bg-bekon-near-black text-white border-bekon-near-black"
                  : "bg-white text-bekon-text-muted border-bekon-border hover:border-bekon-near-black hover:text-bekon-near-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-bekon-text-muted py-12">
            Belum ada video di kategori ini.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((video) => (
              <button
                key={video.id}
                onClick={() => openLightbox(video)}
                className="group relative aspect-video rounded-xl overflow-hidden bg-bekon-near-black text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-bekon-gold"
              >
                <Image
                  src={
                    video.thumbnail ||
                    `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
                  }
                  alt={video.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-bekon-gold/90 group-hover:bg-bekon-gold flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
                    <svg
                      className="w-5 h-5 text-white ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                  <p className="text-white text-xs font-medium line-clamp-2 leading-snug">
                    {video.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* YouTube Button */}
        <div className="mt-10 flex justify-center">
          <a
            href="https://www.youtube.com/@bangunrumahbekon2009"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-bekon-near-black text-white rounded-full text-sm font-medium hover:bg-bekon-near-black/80 transition-colors"
          >
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Kunjungi YouTube BEKON
          </a>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-bekon-gold transition-colors p-2 z-10"
            aria-label="Tutup video"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Video Container */}
          <div
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <p className="text-white text-sm font-medium mb-3 text-center line-clamp-1 px-8">
              {lightboxVideo.title}
            </p>

            {/* YouTube Embed */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${lightboxVideo.youtubeId}?autoplay=1&rel=0`}
                title={lightboxVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Close hint */}
            <p className="text-white/40 text-xs text-center mt-3">
              Klik di luar video atau tekan ESC untuk menutup
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
