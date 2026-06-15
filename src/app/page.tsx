import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { SocialProofBar } from "@/components/SocialProofBar";
import { ServicesSection } from "@/components/ServicesSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { WhyBekonSection } from "@/components/WhyBekonSection";
import { ProcessSection } from "@/components/ProcessSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { VideoSection } from "@/components/VideoSection";
import { BlogSection } from "@/components/BlogSection";
import { CTASection } from "@/components/CTASection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofBar />
        <ServicesSection />
        <PortfolioSection />
        <WhyBekonSection />
        <ProcessSection />
        <TestimonialsSection />
        <VideoSection />
        <BlogSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
