import { Navbar } from "@/components/Navbar";
import { SocialProofBar } from "@/components/SocialProofBar";
import type { PortfolioItem } from "@/components/PortfolioSection";
import type { Testimonial } from "@/components/TestimoniColumns";
import type { VideoItem } from "@/components/VideoSection";
import type { ArticleItem } from "@/components/BlogSection";
import { Footer } from "@/components/Footer";
import dynamic from "next/dynamic";

const HeroSection = dynamic(
  () => import("@/components/HeroSection").then(m => ({ default: m.HeroSection })),
  { ssr: false }
);

const ServicesSection = dynamic(
  () => import("@/components/ServicesSection").then(m => ({ default: m.ServicesSection })),
  { ssr: false }
);

const PortfolioSection = dynamic(
  () => import("@/components/PortfolioSection").then(m => ({ default: m.PortfolioSection })),
  { ssr: false }
);

const WhyBekonSection = dynamic(
  () => import("@/components/WhyBekonSection").then(m => ({ default: m.WhyBekonSection })),
  { ssr: false }
);

const ProcessSection = dynamic(
  () => import("@/components/ProcessSection").then(m => ({ default: m.ProcessSection })),
  { ssr: false }
);

const TestimoniColumns = dynamic(
  () => import("@/components/TestimoniColumns"),
  { ssr: false }
);

const VideoSection = dynamic(
  () => import("@/components/VideoSection").then(m => ({ default: m.VideoSection })),
  { ssr: false }
);

const BlogSection = dynamic(
  () => import("@/components/BlogSection").then(m => ({ default: m.BlogSection })),
  { ssr: false }
);

const CTASection = dynamic(
  () => import("@/components/CTASection").then(m => ({ default: m.CTASection })),
  { ssr: false }
);

const ContactSection = dynamic(
  () => import("@/components/ContactSection").then(m => ({ default: m.ContactSection })),
  { ssr: false }
);

const FloatingWhatsApp = dynamic(
  () => import("@/components/FloatingWhatsApp").then(m => ({ default: m.FloatingWhatsApp })),
  { ssr: false }
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
  const [portfolioRes, testimonialsRes, videosRes, articlesRes, settingsRes] =
    await Promise.all([
      fetchJSON(`${API_BASE}/api/portfolio`),
      fetchJSON(`${API_BASE}/api/testimonials`),
      fetchJSON(`${API_BASE}/api/videos`),
      fetchJSON(`${API_BASE}/api/articles`),
      fetchJSON(`${API_BASE}/api/settings`),
    ]);

  const portfolioData = extractArray(portfolioRes);
  const testimonialsData = extractArray(testimonialsRes);

  const videosData = extractArray(videosRes);

  const articlesData = extractArray(articlesRes);

  const settings = extractObject(settingsRes);

  const stats = [
    { value: settings.stat_proyek || "200", label: "Proyek Selesai", suffix: "+" },
    { value: settings.stat_pengalaman || "15", label: "Tahun Pengalaman", suffix: "+" },
    { value: settings.stat_kota || "50", label: "Kota Terlayani", suffix: "+" },
    { value: settings.stat_kepuasan || "100", label: "Kepuasan Klien", suffix: "%" },
  ];

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofBar stats={stats} />
        <ServicesSection />
        <PortfolioSection items={portfolioData as PortfolioItem[]} />
        <WhyBekonSection />
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
