import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://bekon.co.id"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
