import { Navbar } from "@/components/Navbar";
import { SocialProofBar } from "@/components/SocialProofBar";
import type { PortfolioItem } from "@/components/PortfolioSection";
import type { Testimonial } from "@/components/TestimoniColumns";
import type { VideoItem } from "@/components/VideoSection";
import type { ArticleItem } from "@/components/BlogSection";
import type { WhyBekonItem } from "@/data/why-bekon";
import type { TeamMember } from "@/components/TeamSection";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/data/site-config";
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

function extractArray(res: unknown): unknown[] {
  if (res && typeof res === "object" && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (Array.isArray(d)) return d;
  }
  return [];
}

function extractObject(res: unknown): Record<string, string> {
  if (res && typeof res === "object" && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, string>;
  }
  return {};
}

export default async function HomePage() {
  const [portfolioRes, testimonialsRes, videosRes, articlesRes, settingsRes, teamRes] =
    await Promise.all([
      fetchJSON(`${API_BASE}/api/portfolio`),
      fetchJSON(`${API_BASE}/api/testimonials`),
      fetchJSON(`${API_BASE}/api/videos`),
      fetchJSON(`${API_BASE}/api/articles`),
      fetchJSON(`${API_BASE}/api/settings`),
      fetchJSON(`${API_BASE}/api/team`),
    ]);

  const portfolioData = extractArray(portfolioRes);
  const testimonialsData = extractArray(testimonialsRes);

  const videosData = extractArray(videosRes);

  const articlesData = extractArray(articlesRes);

  const settings = extractObject(settingsRes);

  const tentangLabel = settings.tentang_label;
  const tentangTitle = settings.tentang_judul;
  const tentangImage = settings.tentang_gambar;
  let tentangItems: WhyBekonItem[] | undefined;
  try {
    const raw = settings.tentang_items;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        tentangItems = parsed;
      }
    }
  } catch {}

  const teamData = extractArray(teamRes) as TeamMember[];

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
    url: "https://bekon.co.id",
    telephone: [siteConfig.phone1, siteConfig.phone2],
    email: siteConfig.email,
    image: "https://bekon.co.id/og-image.jpg",
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
        <HeroSection />
        <SocialProofBar stats={stats} />
        <ServicesSection />
        <PortfolioSection items={portfolioData as PortfolioItem[]} />
        <WhyBekonSection label={tentangLabel} title={tentangTitle} image={tentangImage} items={tentangItems} />
        <TeamSection items={teamData} />
        <ProcessSection />
        <TestimoniColumns items={testimonialsData as Testimonial[]} />
        <VideoSection items={videosData as VideoItem[]} />
        <BlogSection items={articlesData as ArticleItem[]} />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
