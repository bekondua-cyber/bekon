import { Navbar } from "@/components/Navbar";
import { SocialProofBar } from "@/components/SocialProofBar";
import type { PortfolioItem } from "@/components/PortfolioSection";
import type { Testimonial } from "@/components/TestimoniColumns";
import type { VideoItem } from "@/components/VideoSection";
import type { ArticleItem } from "@/components/BlogSection";
import type { WhyBekonItem } from "@/data/why-bekon";
import { teamMembers as fallbackTeam } from "@/data/team";
import type { TeamMember } from "@/components/TeamSection";
import type { HeroSlide } from "@/types/hero";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/data/site-config";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";

const HeroSection = dynamic(
  () => import("@/components/HeroSection").then(m => ({ default: m.HeroSection })),
  {}  
);

const ServicesSection = dynamic(
  () => import("@/components/ServicesSection").then(m => ({ default: m.ServicesSection })),
  {}  
);

const PortfolioSection = dynamic(
  () => import("@/components/PortfolioSection").then(m => ({ default: m.PortfolioSection })),
  {}  
);

const WhyBekonSection = dynamic(
  () => import("@/components/WhyBekonSection").then(m => ({ default: m.WhyBekonSection })),
  {}  
);

const TeamSection = dynamic(
  () => import("@/components/TeamSection").then(m => ({ default: m.TeamSection })),
  {}  
);

const ProcessSection = dynamic(
  () => import("@/components/ProcessSection").then(m => ({ default: m.ProcessSection })),
  {}  
);

const TestimoniColumns = dynamic(
  () => import("@/components/TestimoniColumns"),
  {}  
);

const VideoSection = dynamic(
  () => import("@/components/VideoSection").then(m => ({ default: m.VideoSection })),
  {}  
);

const BlogSection = dynamic(
  () => import("@/components/BlogSection").then(m => ({ default: m.BlogSection })),
  {}  
);

const CTASection = dynamic(
  () => import("@/components/CTASection").then(m => ({ default: m.CTASection })),
  {}  
);

const ContactSection = dynamic(
  () => import("@/components/ContactSection").then(m => ({ default: m.ContactSection })),
  {}  
);

const FloatingWhatsApp = dynamic(
  () => import("@/components/FloatingWhatsApp").then(m => ({ default: m.FloatingWhatsApp })),
  {}  
);

// Untuk server component, gunakan absolute URL dari env atau construct dari headers
const API_BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function extractArray<T = unknown>(res: unknown): T[] {
  if (res && typeof res === "object" && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (Array.isArray(d)) return d as T[];
  }
  return [];
}

export default async function HomePage() {
  const [portfolioRes, testimonialsRes, videosRes, articlesRes, teamRes, heroRes, dbSettings] =
    await Promise.all([
      fetchJSON(`${API_BASE}/api/portfolio`),
      fetchJSON(`${API_BASE}/api/testimonials`),
      fetchJSON(`${API_BASE}/api/videos`),
      fetchJSON(`${API_BASE}/api/articles`),
      fetchJSON(`${API_BASE}/api/team`),
      fetchJSON(`${API_BASE}/api/hero-slides`),
      prisma.setting.findMany(),
    ]);

  const heroSlides = extractArray<HeroSlide>(heroRes);

  const portfolioData = extractArray<PortfolioItem>(portfolioRes);
  const testimonialsData = extractArray<Testimonial>(testimonialsRes);

  const videosData = extractArray<VideoItem>(videosRes);

  const articlesData = extractArray<ArticleItem>(articlesRes);

  const settings: Record<string, string> = {}
  for (const s of dbSettings) {
    if (s.value !== null) settings[s.key] = s.value
  }

  const tentangLabel = settings.tentang_label;
  const tentangTitle = settings.tentang_judul;
  const tentangImage = settings.tentang_gambar;
  let tentangItems: WhyBekonItem[] | undefined;
  try {
    const raw = settings.tentang_items;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter((item: WhyBekonItem) => item.title?.trim());
        if (valid.length > 0) {
          tentangItems = valid;
        }
      }
    }
  } catch {}

  const apiTeam = extractArray<TeamMember>(teamRes);
  const teamData: TeamMember[] = apiTeam.length > 0
    ? apiTeam
    : fallbackTeam.map(m => ({ id: m.id, name: m.name, role: m.role, bio: m.bio, photo: m.photo ?? null }));

  const stats = [
    { value: settings.stat_proyek || "200", label: "Proyek Selesai", suffix: "+" },
    { value: settings.stat_pengalaman || "15", label: "Tahun Pengalaman", suffix: "+" },
    { value: settings.stat_kota || "50", label: "Kota Terlayani", suffix: "+" },
    { value: settings.stat_kepuasan || "100", label: "Kepuasan Klien", suffix: "%" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    description: siteConfig.description,
      url: "https://bangunrumahbekon.com",
    telephone: [siteConfig.phone1, siteConfig.phone2],
    email: siteConfig.email,
            image: "https://bangunrumahbekon.com/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: "Serang",
      addressRegion: "Banten",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -6.12,
      longitude: 106.15,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    priceRange: siteConfig.priceRange,
    sameAs: [siteConfig.social.instagram, siteConfig.social.youtube, siteConfig.social.tiktok],
    founder: {
      "@type": "Person",
      name: "Bangun Eka Konstruksi",
    },
    foundingDate: "2009",
    areaServed: ["Serang", "Cilegon", "Banten"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Jasa Konstruksi & Desain",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Desain Eksterior" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Desain Interior" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bangun Rumah" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Renovasi Rumah" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Interior Rumah" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bangun Kost & Ruko" } },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5",
      ratingCount: "100",
      reviewCount: "100",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main id="main">
        <HeroSection initialSlides={heroSlides} heroLabel={settings.hero_label} />
        <SocialProofBar stats={stats} />
        <ServicesSection />
        <PortfolioSection items={portfolioData} />
        <WhyBekonSection label={tentangLabel} title={tentangTitle} image={tentangImage} items={tentangItems} since={settings.tahun_berdiri ? Number(settings.tahun_berdiri) : undefined} />
        <TeamSection items={teamData} />
        <ProcessSection />
        <TestimoniColumns items={testimonialsData} />
        <VideoSection items={videosData} />
        <BlogSection items={articlesData} />
        <CTASection settings={settings} />
        <ContactSection settings={settings} />
      </main>
      <Footer />
      <FloatingWhatsApp settings={settings} />
    </>
  );
}
