"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { services } from "@/data/services";

const iconMap: Record<string, React.ReactNode> = {
  building: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  ),
  layout: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  "hard-hat": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c0-3.3 1.5-6.3 3.8-8.3" />
      <path d="M22 15c0-3.3-1.5-6.3-3.8-8.3" />
      <path d="M22 15H2" />
      <path d="M18 15v-2a6 6 0 0 0-12 0v2" />
      <rect x="6" y="15" width="12" height="4" rx="1" />
    </svg>
  ),
  sofa: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M4 11v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <path d="M2 16h20" />
      <path d="M8 16v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
    </svg>
  ),
  store: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
};

export function ServicesSection() {
  return (
    <section
      id="layanan"
      aria-label="Layanan BEKON"
      className="bg-bekon-off-white py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="section-label">Layanan Kami</span>
          <h2 className="font-display text-[clamp(32px,4vw,42px)] text-bekon-near-black mt-3">
            Solusi Lengkap Untuk
            <br />
            Hunian & Bangunan Anda
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
            />
          ))}
        </div>

        {services.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex justify-center"
          >
            <ServiceCard
              service={services[4]}
              index={4}
              centered
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
  centered,
}: {
  service: (typeof services)[0];
  index: number;
  centered?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-white border border-bekon-border rounded-xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-bekon-gold group ${
        centered ? "md:max-w-sm" : ""
      }`}
    >
      <div className="w-12 h-12 rounded-lg bg-bekon-gold/10 flex items-center justify-center text-bekon-gold mb-5 group-hover:bg-bekon-gold group-hover:text-white transition-colors duration-300">
        {iconMap[service.icon]}
      </div>
      <h3 className="text-lg font-semibold text-bekon-near-black mb-2">
        {service.title}
      </h3>
      <p className="text-bekon-text-muted text-sm leading-relaxed mb-4">
        {service.short_desc}
      </p>
      <Link
        href={`/layanan/${service.slug}`}
        className="text-bekon-gold text-sm font-medium hover:text-bekon-gold-dark transition-colors inline-flex items-center gap-1"
      >
        Selengkapnya &rarr;
      </Link>
    </motion.div>
  );
}
