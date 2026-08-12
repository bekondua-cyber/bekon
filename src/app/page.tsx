import { Navbar } from "@/components/Navbar";
import { SocialProofBar } from "@/components/SocialProofBar";
import type { WhyBekonItem } from "@/data/why-bekon";
import { teamMembers as fallbackTeam } from "@/data/team";
import type { TeamMember } from "@/components/TeamSection";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/data/site-config";
import {
  getActiveHeroSlides,
  getActiveTeam,
  getPublishedArticleCards,
  getPublishedPortfolio,
  getPublishedTestimonials,
  getPublishedVideos,
  getSettingsMap,
} from "@/lib/queries";
import { serializeJsonLd } from "@/lib/json-ld";
import dynamicImport from "next/dynamic";

/**
 * WAJIB ADA. Beranda membaca database lewat Prisma, dan Next tidak punya cara
 * mengetahui itu — tanpa deklarasi mode render, halaman diprerender saat build
 * lalu dibekukan, sehingga perubahan admin (bio anggota tim, testimoni,
 * portfolio) tidak pernah muncul sampai deploy berikutnya.
 *
 * Dulu halaman ini `force-dynamic`, yang benar tapi mahal: setiap pengunjung
 * memicu tujuh query Neon untuk data yang sama. Sekarang ISR dengan TTL pendek,
 * dipasangkan dengan `revalidatePublic()` di route admin supaya perubahan tetap
 * muncul seketika. TTL-nya adalah jaring pengaman — kalau ada jalur tulis yang
 * lupa memanggil invalidasi, halaman ini paling lama basi satu menit dan tidak
 * bisa membeku seperti dulu.
 */
export const revalidate = 60;

const HeroSection = dynamicImport(
  () => import("@/components/HeroSection").then(m => ({ default: m.HeroSection })),
  {}  
);

const ServicesSection = dynamicImport(
  () => import("@/components/ServicesSection").then(m => ({ default: m.ServicesSection })),
  {}  
);

const PortfolioSection = dynamicImport(
  () => import("@/components/PortfolioSection").then(m => ({ default: m.PortfolioSection })),
  {}  
);

const WhyBekonSection = dynamicImport(
  () => import("@/components/WhyBekonSection").then(m => ({ default: m.WhyBekonSection })),
  {}  
);

const TeamSection = dynamicImport(
  () => import("@/components/TeamSection").then(m => ({ default: m.TeamSection })),
  {}  
);

const ProcessSection = dynamicImport(
  () => import("@/components/ProcessSection").then(m => ({ default: m.ProcessSection })),
  {}  
);

const TestimoniColumns = dynamicImport(
  () => import("@/components/TestimoniColumns"),
  {}  
);

const VideoSection = dynamicImport(
  () => import("@/components/VideoSection").then(m => ({ default: m.VideoSection })),
  {}  
);

const BlogSection = dynamicImport(
  () => import("@/components/BlogSection").then(m => ({ default: m.BlogSection })),
  {}  
);

const CTASection = dynamicImport(
  () => import("@/components/CTASection").then(m => ({ default: m.CTASection })),
  {}  
);

const ContactSection = dynamicImport(
  () => import("@/components/ContactSection").then(m => ({ default: m.ContactSection })),
  {}  
);

const FloatingWhatsApp = dynamicImport(
  () => import("@/components/FloatingWhatsApp").then(m => ({ default: m.FloatingWhatsApp })),
  {}
);

/**
 * PERHATIKAN: beranda ada di `src/app/page.tsx`, DI LUAR route group `(public)`.
 *
 * Artinya ia TIDAK mewarisi `src/app/(public)/layout.tsx`, dan setiap widget
 * global yang ditambahkan di sana harus ditambahkan manual juga di sini.
 * Chatbot sempat hilang persis karena ini: ia dirender di layout `(public)`,
 * jadi aktif di semua halaman KECUALI halaman dengan trafik tertinggi.
 */
const ChatbotWidget = dynamicImport(
  () => import("@/components/chatbot/ChatbotWidget").then(m => ({ default: m.ChatbotWidget })),
  {}
);

export default async function HomePage() {
  // Dulu ini enam fetch HTTP ke route API milik situs ini sendiri: satu render
  // beranda menghabiskan 7 invocation fungsi Vercel dan 7 koneksi DB untuk data
  // yang sama. Lebih buruk lagi, alamat dasarnya jatuh ke localhost kalau env
  // NEXT_PUBLIC_SITE_URL kosong dan kegagalannya ditelan diam-diam — beranda
  // bisa tampil kosong di produksi tanpa jejak error sama sekali.
  const [portfolioData, testimonialsData, videosData, articlesData, teamData_, heroSlides, settings] =
    await Promise.all([
      getPublishedPortfolio(),
      getPublishedTestimonials(),
      getPublishedVideos(),
      // BlogSection hanya menampilkan tiga kartu. Dulu di sini seluruh artikel
      // diambil lengkap dengan kolom `content`, lalu ikut terkirim ke browser
      // karena BlogSection adalah komponen klien.
      getPublishedArticleCards({ take: 3 }),
      getActiveTeam(),
      getActiveHeroSlides(),
      getSettingsMap(),
    ]);

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

  // Kalau tim belum diisi lewat admin, pakai data statis supaya section-nya
  // tidak kosong.
  const teamData: TeamMember[] = teamData_.length > 0
    ? teamData_
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
    // TIDAK ADA aggregateRating di sini — sengaja.
    //
    // Dulu blok ini mengklaim rating 4,9 dari 100 ulasan, angka yang murni
    // dikarang dan tidak berasal dari data mana pun. Kebijakan structured data
    // Google melarang bisnis memasang rating agregat untuk dirinya sendiri
    // tanpa ulasan terverifikasi, dan sanksinya bisa berupa manual action pada
    // domain — jauh lebih mahal daripada manfaat bintang di hasil pencarian.
    //
    // Kalau nanti ingin dihidupkan lagi, sumbernya harus ulasan asli yang bisa
    // diverifikasi pihak ketiga (mis. Google Business Profile), bukan kolom
    // rating di tabel testimoni yang diisi sendiri lewat admin.
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Navbar />
      <main id="main" tabIndex={-1}>
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
      <ChatbotWidget />
      <FloatingWhatsApp settings={settings} />
    </>
  );
}
