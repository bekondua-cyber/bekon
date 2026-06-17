"use client";

import { useState, useRef, useEffect } from "react";
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

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

interface TestimoniSliderProps {
  items?: TestimonialSliderItem[];
}

export function TestimoniSlider({ items = [] }: TestimoniSliderProps) {
  const displayItems = items.length > 0 ? items : dummyTestimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive: 3 items on desktop, 1 on mobile
  const itemsPerView = typeof window !== "undefined" && window.innerWidth >= 1024 ? 3 : 1;

  const totalSlides = Math.ceil(displayItems.length / itemsPerView);

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);
  };

  useEffect(() => {
    if (!isHovering) {
      startAutoPlay();
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isHovering, totalSlides]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const visibleItems = displayItems.slice(
    currentIndex * itemsPerView,
    (currentIndex + 1) * itemsPerView
  );

  return (
    <section
      aria-label="Testimoni klien BEKON"
      className="bg-[#EDE8DF] py-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium tracking-widest text-[#B8963E] uppercase mb-3">
            Testimoni Klien
          </span>
          <h2 className="font-[Cormorant_Garamond] text-4xl md:text-[42px] font-normal text-[#1A1A1A] leading-tight">
            Apa Kata Klien Kami
          </h2>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Cards Wrapper */}
          <div className="overflow-hidden">
            <div
              className="transition-transform duration-500 ease-in-out flex gap-6 lg:gap-8"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="w-full flex-shrink-0 lg:w-1/3"
                >
                  <div className="flex gap-6">
                    {displayItems
                      .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                      .map((testimonial, itemIndex) => {
                        const absoluteIndex = slideIndex * itemsPerView + itemIndex;
                        return (
                          <div
                            key={testimonial.id}
                            className="w-full flex-shrink-0 lg:flex-1"
                          >
                            <TestimonialCard
                              testimonial={testimonial}
                              avatarColorIndex={absoluteIndex}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            aria-label="Testimoni sebelumnya"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 lg:-translate-x-16 w-12 h-12 rounded-full border-2 border-[#B8963E] flex items-center justify-center text-[#B8963E] hover:bg-[#B8963E] hover:text-white transition-all duration-300"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            aria-label="Testimoni berikutnya"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 lg:translate-x-16 w-12 h-12 rounded-full border-2 border-[#B8963E] flex items-center justify-center text-[#B8963E] hover:bg-[#B8963E] hover:text-white transition-all duration-300"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Slide ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "bg-[#B8963E] w-3 h-3"
                  : "bg-[#D4C4B0] w-2 h-2"
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
}

function TestimonialCard({
  testimonial,
  avatarColorIndex,
}: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 h-full flex flex-col relative">
      {/* Google Review Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#F2F2F2] px-3 py-1.5 rounded-full text-xs font-medium text-[#1A1A1A]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="0"
            y="16"
            fontSize="14"
            fill="url(#grad)"
            fontWeight="bold"
            fontFamily="Arial"
          >
            G
          </text>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="25%" stopColor="#EA4335" />
              <stop offset="50%" stopColor="#FBBC05" />
              <stop offset="75%" stopColor="#34A853" />
              <stop offset="100%" stopColor="#4285F4" />
            </linearGradient>
          </defs>
        </svg>
        <span>Review</span>
      </div>

      {/* Quote Mark */}
      <div className="text-[80px] leading-none font-light text-[#B8963E] opacity-20 mb-2">
        &ldquo;
      </div>

      {/* Content */}
      <p className="font-[Cormorant_Garamond] text-[18px] italic text-[#1A1A1A] mb-6 flex-grow leading-relaxed">
        {testimonial.content}
      </p>

      {/* Rating */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <span key={i} className="text-[#B8963E] text-lg">
            ★
          </span>
        ))}
      </div>

      {/* Client Info */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
          style={{ backgroundColor: getAvatarColor(avatarColorIndex) }}
        >
          {getInitials(testimonial.clientName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#1A1A1A] text-sm">
            {testimonial.clientName}
          </p>
          <p className="text-[#6B6560] text-[12px]">
            {testimonial.projectType}
            {testimonial.projectType && testimonial.location ? " • " : ""}
            {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
}
