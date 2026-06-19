"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const AVATAR_COLORS = ["#B8963E", "#4A7C3F", "#8B5E3C", "#2C6E49", "#A07A50"];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  projectType?: string;
  location?: string;
  content: string;
  rating?: number;
}

export function TestimonialsSection({ items }: { items: TestimonialItem[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const data = items.length > 0 ? items : [];

  useEffect(() => {
    if (data.length === 0) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % data.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [data.length]);

  const goTo = (i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + data.length) % data.length);
  };

  const goNext = () => {
    setDirection(1);
    setCurrent((p) => (p + 1) % data.length);
  };

  if (data.length === 0) {
    return (
      <section
        aria-label="Testimoni klien BEKON"
        className="bg-bekon-cream py-20 md:py-28"
      >
        <div className="max-w-container mx-auto px-6 lg:px-20 text-center">
          <span className="section-label">Testimoni</span>
          <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-5 mb-6">
            Apa Kata Klien Kami
          </h2>
          <p className="text-bekon-text-muted text-sm">
            Belum ada testimoni. Jadilah yang pertama!
          </p>
        </div>
      </section>
    );
  }

  const t = data[current];

  return (
    <section
      aria-label="Testimoni klien BEKON"
      className="bg-bekon-cream py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="section-label">Testimoni</span>
          <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-5">
            Apa Kata Klien Kami
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto relative">
          {/* Quote mark bg */}
          <div className="font-display text-[120px] font-light text-bekon-gold/10 absolute -top-12 left-0 pointer-events-none select-none leading-none">
            &ldquo;
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
              transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
              className="text-center px-4"
            >
              <blockquote className="font-display text-[22px] md:text-[24px] font-normal italic leading-relaxed text-bekon-near-black mb-6">
                &ldquo;{t.content}&rdquo;
              </blockquote>

              <div className="flex justify-center gap-1 mb-5">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-bekon-gold text-bekon-gold"
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-base"
                  style={{
                    backgroundColor:
                      AVATAR_COLORS[current % AVATAR_COLORS.length],
                  }}
                >
                  {getInitials(t.clientName)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-bekon-near-black text-sm">
                    {t.clientName}
                  </p>
                  <p className="text-bekon-text-muted text-xs">
                    {t.projectType}
                    {t.projectType && t.location ? " \u00b7 " : ""}
                    {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={goPrev}
              aria-label="Sebelumnya"
              className="w-10 h-10 rounded-full border border-bekon-border flex items-center justify-center text-bekon-text-secondary hover:bg-bekon-gold hover:text-white hover:border-bekon-gold transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-2">
              {data.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Testimoni ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-bekon-gold w-6 h-2"
                      : "bg-bekon-border w-2 h-2"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              aria-label="Berikutnya"
              className="w-10 h-10 rounded-full border border-bekon-border flex items-center justify-center text-bekon-text-secondary hover:bg-bekon-gold hover:text-white hover:border-bekon-gold transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
