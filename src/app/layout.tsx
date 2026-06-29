import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BEKON — Bangun Eka Konstruksi | Wujudkan Hunian Impian Anda",
    template: "%s | BEKON — Bangun Eka Konstruksi",
  },
  description:
    "BEKON adalah kontraktor dan arsitek profesional di Serang, Cilegon, Banten. Spesialis desain eksterior, interior, bangun rumah, renovasi, kost & ruko sejak 2009.",
  openGraph: {
    title: "BEKON — Bangun Eka Konstruksi",
    description:
      "Wujudkan Hunian Impian Anda bersama kontraktor profesional sejak 2009.",
    url: "https://bekon.co.id",
    siteName: "BEKON",
    locale: "id_ID",
    type: "website",
    images: [{ url: "https://res.cloudinary.com/dfkmge5kg/image/upload/v1782705092/logo_y3spfe.webp", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://res.cloudinary.com/dfkmge5kg/image/upload/v1782705092/logo_y3spfe.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  metadataBase: new URL("https://bekon.co.id"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "https://res.cloudinary.com/dfkmge5kg/image/upload/v1782705092/logo_y3spfe.webp",
  },
};

const criticalCSS = `
  .hero-critical {
    min-height: 100vh;
    position: relative;
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      </head>
      <body className="antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-bekon-gold focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
          Langsung ke konten utama
        </a>
        <main id="main" role="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
