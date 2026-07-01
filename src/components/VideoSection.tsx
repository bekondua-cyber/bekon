"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";
import Link from "next/link";

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl?: string;
  youtubeId: string;
  category?: string;
  isFeatured?: boolean;
  thumbnail?: string;
}

export function VideoSection({ items }: { items: VideoItem[] }) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [playing, setPlaying] = useState(false);

  const data = items.length > 0 ? items : [];

  if (data.length === 0) {
    return (
      <section
        id="video"
        aria-label="Video proyek BEKON"
        className="bg-bekon-off-white py-20 md:py-28"
      >
        <div className="max-w-container mx-auto px-6 lg:px-20 text-center">
          <span className="section-label">Video</span>
          <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-5 mb-6">
            Lihat Hasil Nyata Proyek Kami
          </h2>
          <p className="text-bekon-text-muted text-sm">
            Belum ada video yang tersedia.
          </p>
        </div>
      </section>
    );
  }

  const activeVid = playing && activeVideo ? activeVideo : (data.find((v) => v.isFeatured) || data[0]);

  return (
    <section
      id="video"
      aria-label="Video proyek BEKON"
      className="bg-bekon-off-white py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="section-label">Video</span>
          <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-5">
            Lihat Hasil Nyata Proyek Kami
          </h2>
        </motion.div>

        {/* Featured Video */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="aspect-video rounded-xl overflow-hidden bg-bekon-near-black mb-6 relative"
        >
          {playing && activeVideo ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center cursor-pointer flex items-center justify-center group"
              style={{
                backgroundImage: `url(https://img.youtube.com/vi/${activeVid.youtubeId}/hqdefault.jpg)`,
              }}
              onClick={() => {
                setActiveVideo(activeVid);
                setPlaying(true);
              }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-bekon-gold/90 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Play size={28} className="text-white ml-1" />
              </div>
            </div>
          )}
          {!playing && (
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white text-lg font-semibold">
                {activeVid.title}
              </h3>
            </div>
          )}
        </motion.div>

        {/* Thumbnails */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
        >
          {data
            .filter((v) => v.id !== activeVideo?.id || !playing)
            .slice(0, 3)
            .map((video) => (
              <button
                key={video.id}
                onClick={() => {
                  setActiveVideo(video);
                  setPlaying(true);
                }}
                className="group relative aspect-video rounded-lg overflow-hidden bg-bekon-near-black"
              >
                <Image
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-bekon-near-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-bekon-gold/90 flex items-center justify-center">
                    <Play size="16" className="text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium truncate">
                    {video.title}
                  </p>
                </div>
              </button>
            ))}
        </motion.div>

        <div className="text-center">
          <Link
            href="/video"
            className="text-[#7A6228] text-sm font-medium hover:text-bekon-gold-dark transition-colors inline-flex items-center gap-1"
          >
            Lihat Semua Video &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
