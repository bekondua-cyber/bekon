"use client";

import { useEffect, useRef, useState } from "react";
import { stats } from "@/data/stats";

function AnimatedCounter({
  value,
  suffix,
}: {
  value: string;
  suffix: string;
}) {
  const numValue = parseInt(value);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const step = 16;
          const steps = duration / step;
          const increment = numValue / steps;
          let current = 0;

          const timer = setInterval(() => {
            current = Math.min(current + increment, numValue);
            setCount(Math.floor(current));
            if (current >= numValue) clearInterval(timer);
          }, step);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export function SocialProofBar() {
  return (
    <section
      id="stats"
      aria-label="Statistik BEKON"
      className="bg-bekon-near-black py-12 md:py-16"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center px-4 py-6 md:py-4 ${
                i < stats.length - 1
                  ? "border-r border-bekon-gold/20"
                  : ""
              } ${i >= 2 ? "border-t border-bekon-gold/20 md:border-t-0" : ""}`}
            >
              <div className="font-display text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] text-bekon-gold">
                <AnimatedCounter value={stat.value} suffix={stat.suffix!} />
              </div>
              <div className="text-bekon-off-white/70 uppercase tracking-[0.12em] text-xs font-medium mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
