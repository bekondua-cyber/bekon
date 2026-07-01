"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { VideoItem } from "./page";

const VIDEO_TABS = [
  { value: "semua", label: "Semua" },
  { value: "hometour", label: "Home Tour" },
  { value: "3d-desain", label: "3D Desain" },
  { value: "behind-the-build", label: "Behind the Build" },
];

function tabFromHash(): string {
  if (typeof window === "undefined") return "semua";
  const hash = window.location.hash.replace("#", "");
  if (hash === "hometour") return "hometour";
  if (hash === "3d-desain") return "3d-desain";
  if (hash === "behind-the-build") return "behind-the-build";
  return "semua";
}

export function VideoPageClient({ items }: { items: VideoItem[] }) {
  const featured = items.find((v) => v.isFeatured) || items[0];
  const [activeVideo, setActiveVideo] = useState(featured);
  const [activeTab, setActiveTab] = useState("semua");

  useEffect(() => {
    const tab = tabFromHash();
    setActiveTab(tab);
    if (tab !== "semua") {
      const el = document.getElementById("video-tabs-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const filtered = items.filter((v) => {
    if (activeTab === "semua") return true;
    return v.category === activeTab;
  });

  return (
    <section id="video-tabs-section">
      <div className="aspect-video rounded-xl overflow-hidden mb-8">
        <iframe
          src={`https://www.youtube.com/embed/${activeVideo.youtubeId}`}
          title={activeVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {VIDEO_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === tab.value
                ? "bg-bekon-near-black text-white"
                : "bg-white text-bekon-text-muted border border-gray-200 hover:border-bekon-near-black hover:text-bekon-near-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered
          .map((video) => {
            const isActive = video.id === activeVideo.id;
            return (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className={`group relative aspect-video rounded-lg overflow-hidden bg-bekon-near-black text-left transition-all ${
                isActive
                  ? "ring-2 ring-bekon-gold ring-offset-2"
                  : ""
              }`}
            >
              <Image
                src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {isActive ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-bekon-gold flex items-center justify-center">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-bekon-near-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-medium truncate">
                  {video.title}
                </p>
              </div>
            </button>
            );
          })}
      </div>
    </section>
  );
}
