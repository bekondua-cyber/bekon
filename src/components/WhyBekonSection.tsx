"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { whyBekon } from "@/data/why-bekon";
import { siteConfig } from "@/data/site-config";

export function WhyBekonSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="tentang"
      aria-label="Keunggulan BEKON"
      className="bg-bekon-off-white py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1608387371413-f2566ac510e0?w=800&q=80"
                alt="Tim profesional BEKON"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-bekon-gold text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="font-display text-3xl font-semibold">
                {new Date().getFullYear() - siteConfig.since}+
              </div>
              <div className="text-white/80 text-xs uppercase tracking-wider font-medium">
                Tahun Pengalaman
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay: 0.2 }}
          >
            <span className="section-label">Keunggulan</span>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-3 mb-6">
              Mengapa Memilih BEKON?
            </h2>

            <div className="space-y-5">
              {whyBekon.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-bekon-gold shrink-0 mt-0.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <h3 className="text-base font-semibold text-bekon-near-black">
                      {item.title}
                    </h3>
                    <p className="text-bekon-text-muted text-sm mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="mt-8"
            >
              <a
                href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20ingin%20tahu%20lebih%20lanjut`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3 bg-bekon-gold text-white rounded-full text-sm font-medium transition-all duration-200 hover:bg-bekon-gold-dark hover:-translate-y-0.5"
              >
                Konsultasi Gratis
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
