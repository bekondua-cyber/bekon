"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TestimonialSliderItem {
  id: string;
  clientName: string;
  projectType: string;
  location: string;
  content: string;
  rating: number;
}

const dummyTestimonials: TestimonialSliderItem[] = [
  {
    id: "1",
    clientName: "Ira Elisa Widuri",
    projectType: "Bangun Ruko",
    location: "Serang, Banten",
    content:
      "Terimakasih Bangun Rumah Bekon sudah wujudkan ruko impian, saya suka hasil nya dan tim sangat profesional dan komunikatif.",
    rating: 5,
  },
  {
    id: "2",
    clientName: "Lidya Yusnita",
    projectType: "Bangun Rumah",
    location: "Cilegon, Banten",
    content:
      "Alhamdulillah rumahnya udah selesai. Terima kasih team bangun rumah Bekon yang sudah bekerja dengan baik dan tepat waktu.",
    rating: 5,
  },
  {
    id: "3",
    clientName: "Widi Sakti",
    projectType: "Bangun Rumah",
    location: "Serang, Banten",
    content:
      "Alhamdulillah rumah idaman kami selesai tepat waktu. Terimakasih team Bangun Eka Konstruksi, hasilnya sangat memuaskan.",
    rating: 5,
  },
  {
    id: "4",
    clientName: "Mulia Almahdi",
    projectType: "Bangun Rumah",
    location: "Banten",
    content:
      "Hasilnya sangat memuaskan. Pengerjaan cepat, rapi, segi pelayanan yang baik. Pokoknya recommended banget!",
    rating: 5,
  },
  {
    id: "5",
    clientName: "Syamsul",
    projectType: "Bangun Rumah",
    location: "Serang, Banten",
    content:
      "Hasil pekerjaan rapi, bagus, dan melebihi dari ekspektasi. Pemilihan material bangunannya juga berkualitas.",
    rating: 5,
  },
  {
    id: "6",
    clientName: "Roni Setyawan",
    projectType: "Renovasi Rumah",
    location: "Cilegon, Banten",
    content:
      "Alhamdulillah rumah bergaya scandinavian sudah terwujud. Terimakasih tim Bangun Eka Konstruksi!",
    rating: 5,
  },
  {
    id: "7",
    clientName: "Ikoh Rofikoh",
    projectType: "Bangun Rumah",
    location: "Serang, Banten",
    content:
      "Terimakasih bangun eka konstruksi, hasil yang memuaskan dan tim yang ramah serta profesional.",
    rating: 5,
  },
  {
    id: "8",
    clientName: "Imron Tsaluji",
    projectType: "Bangun Rumah",
    location: "Banten",
    content:
      "Terima kasih untuk Bangun Eka Konstruksi atas jasa pembangunannya, rumah saya sekarang sangat nyaman dan indah.",
    rating: 5,
  },
  {
    id: "9",
    clientName: "Nabila Azra",
    projectType: "Desain & Bangun",
    location: "Serang, Banten",
    content:
      "Desain rumahnya bagus, modern. Hasil jasa bangun rumahnya juga sesuai apa yang diinginkan. Sangat puas!",
    rating: 5,
  },
  {
    id: "10",
    clientName: "Farid Y. Kurniawan",
    projectType: "Bangun Rumah",
    location: "Cilegon, Banten",
    content:
      "Terimakasih untuk tim Bekon. Pelayanan yang diberikan bagus, komunikatif, dan tepat waktu. Highly recommended!",
    rating: 5,
  },
];

const AVATAR_COLORS = [
  "#B8963E", // gold
  "#4A7C3F", // sage
  "#8B5E3C", // brown
  "#2C6E49", // dark sage
  "#A07A50", // light brown
  "#D4A574", // tan
  "#6B5B4A", // taupe
  "#7A4F3D", // rust
  "#9D8B6F", // grey-brown
  "#C2956F", // caramel
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface TestimoniSliderProps {
  items?: TestimonialSliderItem[];
}

export function TestimoniSlider({ items = [] }: TestimoniSliderProps) {
  const displayItems = items.length > 0 ? items : dummyTestimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = displayItems.length;

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, 4000);
  }, [totalItems]);

  useEffect(() => {
    if (!isHovering) {
      startAutoPlay();
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isHovering, startAutoPlay]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const getItemIndex = (offset: number) => (currentIndex + offset + totalItems) % totalItems;

  return (
    <section
      aria-label="Testimoni klien BEKON"
      className="bg-[#1A1A1A] py-24 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="inline-block text-[12px] font-medium tracking-widest text-[#B8963E] uppercase mb-6">
            Testimoni Klien
          </span>
          <h2 className="font-[Cormorant_Garamond] text-3xl md:text-6xl font-light text-[#F8F5F0] mb-6">
            Apa Kata Klien Kami
          </h2>
          {/* Decorative Line */}
          <div className="flex justify-center">
            <div className="w-16 h-px bg-[#B8963E]"></div>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          className="relative py-12"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Carousel Wrapper */}
          <div className="overflow-hidden">
            <div className="flex items-center justify-center gap-6 lg:gap-8">
              {/* Left Preview Card (Desktop Only) */}
              <div className="hidden lg:block flex-shrink-0 w-1/4">
                <div className="opacity-40 scale-90 transition-all duration-500 ease-in-out">
                  <TestimonialCard
                    testimonial={displayItems[getItemIndex(-1)]}
                    avatarColorIndex={getItemIndex(-1)}
                  />
                </div>
              </div>

              {/* Main Card (Center) */}
              <div className="w-full lg:w-1/2 flex-shrink-0">
                <div className="transition-all duration-500 ease-in-out">
                  <TestimonialCard
                    testimonial={displayItems[currentIndex]}
                    avatarColorIndex={currentIndex}
                    isMain
                  />
                </div>
              </div>

              {/* Right Preview Card (Desktop Only) */}
              <div className="hidden lg:block flex-shrink-0 w-1/4">
                <div className="opacity-40 scale-90 transition-all duration-500 ease-in-out">
                  <TestimonialCard
                    testimonial={displayItems[getItemIndex(1)]}
                    avatarColorIndex={getItemIndex(1)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            aria-label="Testimoni sebelumnya"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-[#F8F5F0] hover:text-[#B8963E] transition-colors duration-300 -ml-12 lg:-ml-16"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={handleNext}
            aria-label="Testimoni berikutnya"
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F8F5F0] hover:text-[#B8963E] transition-colors duration-300 -mr-12 lg:-mr-16"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {displayItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Slide ${index + 1}`}
              className={`transition-all duration-300 rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8963E] ${
                index === currentIndex
                  ? "bg-[#B8963E] w-6 h-2"
                  : "bg-white/30 w-3 h-3"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  testimonial: TestimonialSliderItem;
  avatarColorIndex: number;
  isMain?: boolean;
}

function TestimonialCard({
  testimonial,
  avatarColorIndex,
  isMain = false,
}: TestimonialCardProps) {
  return (
    <div
      className={`bg-[#F8F5F0] rounded-2xl relative transition-all duration-500 ease-in-out ${
        isMain ? "px-12 py-10 shadow-2xl" : "p-8 shadow-lg"
      }`}
    >
      {/* Quote Mark Decoration */}
      <div className="absolute top-4 left-6 text-[120px] leading-none font-light text-[#B8963E] opacity-20">
        &ldquo;
      </div>

      {/* Stars Rating */}
      <div className="flex gap-1 mb-6 relative z-10">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <span key={i} className="text-[#B8963E] text-xl">
            ★
          </span>
        ))}
      </div>

      {/* Review Text */}
      <p
        className={`font-[Cormorant_Garamond] italic text-[#1A1A1A] leading-relaxed mb-6 relative z-10 ${
          isMain ? "text-2xl" : "text-lg"
        }`}
      >
        {testimonial.content}
      </p>

      {/* Divider Line */}
      <div className="w-12 h-px bg-[#B8963E] mb-6"></div>

      {/* Client Info */}
      <div className="flex items-center gap-4 relative z-10">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
          style={{
            backgroundColor:
              AVATAR_COLORS[avatarColorIndex % AVATAR_COLORS.length] || '#1A1A1A',
          }}
        >
          {getInitials(testimonial.clientName)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1A1A1A] text-base">
            {testimonial.clientName}
          </p>
          <p className="text-[#6B6560] text-sm">
            {testimonial.projectType}
            {testimonial.projectType && testimonial.location ? " • " : ""}
            {testimonial.location}
          </p>
        </div>

        {/* Google Review Badge */}
        <div className="flex-shrink-0 flex items-center gap-1 bg-[#F1F3F4] border border-[#E0D9CE] px-3 py-1.5 rounded-full whitespace-nowrap">
          <span className="text-xs font-medium">★</span>
          <span className="text-xs font-medium text-[#1A1A1A]">Review</span>
        </div>
      </div>
    </div>
  );
}
