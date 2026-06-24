"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface PortfolioGalleryProps {
  images: string[];
  title: string;
}

export default function PortfolioGallery({ images, title }: PortfolioGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxOpen, prev, next]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Grid Gallery */}
      <div
        className={`grid gap-3 ${
          images.length === 1
            ? "grid-cols-1"
            : images.length === 2
            ? "grid-cols-2"
            : "grid-cols-2 md:grid-cols-3"
        }`}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-zoom-in"
          >
            <Image
              src={img}
              alt={`${title} - foto ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <span className="text-white/60 text-sm font-medium">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              onClick={closeLightbox}
              className="text-white hover:text-bekon-gold transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main image */}
          <div className="flex-1 relative flex items-center justify-center min-h-0">
            {images.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-4 z-10 text-white hover:text-bekon-gold transition-colors p-3 bg-black/40 hover:bg-black/60 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="relative w-full h-full px-16">
              <Image
                src={images[activeIndex]}
                alt={`${title} - ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={next}
                className="absolute right-4 z-10 text-white hover:text-bekon-gold transition-colors p-3 bg-black/40 hover:bg-black/60 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex-shrink-0 py-4 px-6 bg-black/50">
              <div className="flex gap-2 overflow-x-auto justify-center pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative w-16 h-12 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                      i === activeIndex
                        ? "border-bekon-gold opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
