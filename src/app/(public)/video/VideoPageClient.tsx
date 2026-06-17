"use client";

import { useState } from "react";
import Image from "next/image";
import type { VideoItem } from "./page";

export function VideoPageClient({ items }: { items: VideoItem[] }) {
  const featured = items.find((v) => v.isFeatured) || items[0];
  const [activeVideo, setActiveVideo] = useState(featured);

  return (
    <>
      <div className="aspect-video rounded-xl overflow-hidden mb-8">
        <iframe
          src={`https://www.youtube.com/embed/${activeVideo.youtubeId}`}
          title={activeVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items
          .filter((v) => v.id !== activeVideo.id)
          .map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group relative aspect-video rounded-lg overflow-hidden bg-bekon-near-black text-left"
            >
              <Image
                src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            </button>
          ))}
      </div>
    </>
  );
}
