"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  images: string[];
  title: string;
}

export default function PortfolioHeroCarousel({ images, title }: Props) {
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
      {/* HERO: Foto Besar */}
      <section className="relative h-[calc(55vh+80px)] min-h-[500px] bg-black pt-20">
        <Image
          src={images[activeIndex]}
          alt={`${title} - ${activeIndex + 1}`}
          fill
          sizes="100vw"
          className="object-cover cursor-zoom-in"
          priority
          onClick={() => setLightboxOpen(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bekon-near-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Counter badge */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full z-10">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Prev arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white rounded-full p-3 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Next arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white rounded-full p-3 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-20 max-w-container mx-auto z-10">
          <Link
            href="/portfolio"
            className="text-bekon-gold text-sm mb-3 inline-block hover:text-bekon-gold-light transition-colors"
          >
            ← Portfolio
          </Link>
          <h1 className="font-display text-[clamp(28px,4vw,48px)] text-white mt-1">
            {title}
          </h1>
        </div>
      </section>

      {/* THUMBNAIL STRIP — langsung di bawah foto besar */}
      {images.length > 1 && (
        <div className="bg-white border-b border-bekon-border">
          <div className="max-w-container mx-auto px-6 lg:px-20 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    i === activeIndex
                      ? "border-bekon-gold opacity-100"
                      : "border-transparent opacity-55 hover:opacity-85"
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
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col select-none"
          onClick={() => setLightboxOpen(false)}
        >
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

          <div
            className="flex-1 relative flex items-center justify-center min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-3 transition-all"
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
                className="absolute right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-3 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

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
