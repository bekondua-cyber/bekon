"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/data/process";
import { siteConfig } from "@/data/site-config";

const iconMap: Record<string, React.ReactNode> = {
  consultation: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  ),
  planning: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <path d="M16 14l-2 2-2-2" />
    </svg>
  ),
  construction: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c0-3.3 1.5-6.3 3.8-8.3" />
      <path d="M22 15c0-3.3-1.5-6.3-3.8-8.3" />
      <path d="M22 15H2" />
      <path d="M18 15v-2a6 6 0 0 0-12 0v2" />
      <rect x="6" y="15" width="12" height="4" rx="1" />
    </svg>
  ),
  handover: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
    </svg>
  ),
};

export function ProcessSection() {
  return (
    <section
      aria-label="Proses Kerja BEKON"
      className="bg-bekon-near-black py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-bekon-gold uppercase text-xs font-semibold tracking-[0.15em]">
            Proses Kerja
          </span>
          <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-white mt-3">
            Perjalanan Membangun
            <br />
            Bersama BEKON
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px border-t border-dashed border-bekon-gold/30" />

          {processSteps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Number background */}
              <div className="font-display text-[64px] font-semibold text-bekon-gold/10 absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none select-none">
                {step.number}
              </div>

              {/* Icon */}
              <div className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-full border border-white/20 flex items-center justify-center text-white">
                {iconMap[step.icon]}
              </div>

              <h3 className="text-white text-base font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-[220px] mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20ingin%20konsultasi`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 bg-bekon-gold text-white rounded-full text-sm font-medium transition-all duration-200 hover:bg-bekon-gold-dark"
          >
            Mulai Konsultasi
          </a>
        </motion.div>
      </div>
    </section>
  );
}
