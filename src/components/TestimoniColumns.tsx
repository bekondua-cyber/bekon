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

const dummyTestimonials: Testimonial[] = [
  { id: "1", clientName: "Ira Elisa Widuri", projectType: "Bangun Ruko", location: "Serang, Banten", content: "Terimakasih Bangun Rumah Bekon sudah wujudkan ruko impian, saya suka hasil nya dan tim sangat profesional dan komunikatif.", rating: 5 },
  { id: "2", clientName: "Lidya Yusnita", projectType: "Bangun Rumah", location: "Cilegon, Banten", content: "Alhamdulillah rumahnya udah selesai. Terima kasih team bangun rumah Bekon yang sudah bekerja dengan baik dan tepat waktu.", rating: 5 },
  { id: "3", clientName: "Widi Sakti", projectType: "Bangun Rumah", location: "Serang, Banten", content: "Alhamdulillah rumah idaman kami selesai tepat waktu. Terimakasih team Bangun Eka Konstruksi, hasilnya sangat memuaskan.", rating: 5 },
  { id: "4", clientName: "Mulia Almahdi", projectType: "Bangun Rumah", location: "Banten", content: "Hasilnya sangat memuaskan. Pengerjaan cepat, rapi, segi pelayanan yang baik. Pokoknya recommended banget!", rating: 5 },
  { id: "5", clientName: "Syamsul", projectType: "Bangun Rumah", location: "Serang, Banten", content: "Hasil pekerjaan rapi, bagus, dan melebihi dari ekspektasi. Pemilihan material bangunannya juga berkualitas.", rating: 5 },
  { id: "6", clientName: "Roni Setyawan", projectType: "Renovasi Rumah", location: "Cilegon, Banten", content: "Alhamdulillah rumah bergaya scandinavian sudah terwujud. Terimakasih tim Bangun Eka Konstruksi!", rating: 5 },
  { id: "7", clientName: "Ikoh Rofikoh", projectType: "Bangun Rumah", location: "Serang, Banten", content: "Terimakasih bangun eka konstruksi, hasil yang memuaskan dan tim yang ramah serta profesional.", rating: 5 },
  { id: "8", clientName: "Imron Tsaluji", projectType: "Bangun Rumah", location: "Banten", content: "Terima kasih untuk Bangun Eka Konstruksi atas jasa pembangunannya, rumah saya sekarang sangat nyaman dan indah.", rating: 5 },
  { id: "9", clientName: "Nabila Azra", projectType: "Desain & Bangun", location: "Serang, Banten", content: "Desain rumahnya bagus, modern. Hasil jasa bangun rumahnya juga sesuai apa yang diinginkan. Sangat puas!", rating: 5 },
  { id: "10", clientName: "Farid Y. Kurniawan", projectType: "Bangun Rumah", location: "Cilegon, Banten", content: "Terimakasih untuk tim Bekon. Pelayanan yang diberikan bagus, komunikatif, dan tepat waktu. Highly recommended!", rating: 5 },
];

export default function TestimoniColumns({ items }: { items: Testimonial[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const data = items.length > 0 ? items : dummyTestimonials;

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
