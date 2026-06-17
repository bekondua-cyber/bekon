import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { SocialProofBar } from "@/components/SocialProofBar";
import { ServicesSection } from "@/components/ServicesSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import type { PortfolioItem } from "@/components/PortfolioSection";
import { WhyBekonSection } from "@/components/WhyBekonSection";
import { ProcessSection } from "@/components/ProcessSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import type { TestimonialItem } from "@/components/TestimonialsSection";
import { VideoSection } from "@/components/VideoSection";
import type { VideoItem } from "@/components/VideoSection";
import { BlogSection } from "@/components/BlogSection";
import type { ArticleItem } from "@/components/BlogSection";
import { CTASection } from "@/components/CTASection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

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
        <TestimonialsSection items={testimonialsData as TestimonialItem[]} />
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
