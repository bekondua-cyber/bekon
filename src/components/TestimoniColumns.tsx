"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export type Testimonial = {
  id: string;
  clientName: string;
  content: string;
  rating: number;
  projectType?: string | null;
  location?: string | null;
  photo?: string | null;
}

const TestimonialCard = ({ item }: { item: Testimonial }) => {
  const initials = item.clientName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const stars = "★".repeat(item.rating || 5);

  return (
    <div className="p-8 rounded-2xl border border-bekon-border bg-bekon-off-white shadow-md max-w-xs w-full">
      <div className="text-bekon-gold text-lg mb-3">{stars}</div>
      <p className="text-bekon-near-black font-[Cormorant_Garamond] italic text-[17px] leading-relaxed mb-5">
        {"\u201C"}{item.content}{"\u201D"}
      </p>
      <div className="flex items-center gap-3">
        {item.photo ? (
          <Image src={item.photo} alt={item.clientName} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-bekon-near-black flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {initials}
          </div>
        )}
        <div>
          <p className="font-semibold text-bekon-near-black text-sm">{item.clientName}</p>
          <p className="text-bekon-text-muted text-xs">
            {item.projectType}{item.projectType && item.location ? " • " : ""}{item.location}
          </p>
        </div>
        <span className="ml-auto text-[#7A6228] text-xs border border-[#7A6228] rounded-full px-2 py-0.5">★ Review</span>
      </div>
    </div>
  );
};

const TestimoniColumn = ({
  items,
  duration = 15,
  className = "",
}: {
  items: Testimonial[];
  duration?: number;
  className?: string;
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (items.length === 0) return null;
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ translateY: "0%" }}
        animate={reducedMotion ? { translateY: "0%" } : { translateY: "-50%" }}
        transition={reducedMotion ? { duration: 0 } : { duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...Array(2)].map((_, i) => (
          <React.Fragment key={i}>
            {items.map((item) => (
              <TestimonialCard key={`${i}-${item.id}`} item={item} />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export default function TestimoniColumns({ items }: { items: Testimonial[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const data = items;

  const col1 = data.filter((_, i) => i % 3 === 0);
  const col2 = data.filter((_, i) => i % 3 === 1);
  const col3 = data.filter((_, i) => i % 3 === 2);

  return (
    <section className="bg-bekon-off-white py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-label text-[#7A6228]">Testimoni Klien</span>
          <h2 className="font-[Cormorant_Garamond] text-[42px] md:text-[56px] font-light text-bekon-near-black mt-3 leading-tight">
            Apa Kata Klien Kami
          </h2>
          <div className="w-16 h-px bg-bekon-gold mx-auto mt-4"></div>
        </div>

        {/* Columns */}
        <div className="bg-bekon-near-black rounded-2xl p-6 flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[700px] overflow-hidden">
          {col1.length > 0 && <TestimoniColumn items={col1} duration={15} />}
          {col2.length > 0 && <TestimoniColumn items={col2} duration={19} className="hidden md:block" />}
          {col3.length > 0 && <TestimoniColumn items={col3} duration={17} className="hidden lg:block" />}
        </div>
      </div>
    </section>
  );
}
