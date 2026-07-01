"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface PortfolioGalleryProps {
  images: string[];
  title: string;
}

export default function PortfolioGallery({ images, title }: PortfolioGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
      if (e.key === "Escape") setLightboxOpen(false);
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
      {/* Main Image (large) */}
      <div className="relative w-full aspect-[16/9] md:aspect-[16/8] bg-black rounded-xl overflow-hidden mb-3 group">
        <Image
          src={images[activeIndex]}
          alt={`${title} - foto ${activeIndex + 1}`}
          fill
          sizes="100vw"
          className="object-cover cursor-zoom-in transition-opacity duration-300"
          priority
          onClick={() => setLightboxOpen(true)}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Prev button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-2.5 transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-2.5 transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Klik untuk perbesar
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === activeIndex
                  ? "border-bekon-gold opacity-100 scale-105"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox (fullscreen saat klik foto besar) */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white/60 text-sm font-medium">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="text-white hover:text-bekon-gold transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main image */}
          <div
            className="flex-1 relative flex items-center justify-center min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
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
            <div
              className="flex-shrink-0 py-4 px-6 bg-black/50"
              onClick={(e) => e.stopPropagation()}
            >
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
                    <Image src={img} alt={`Thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
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
