"use client";

import { useEffect } from "react";
import { siteConfig } from "@/data/site-config";
import { WhatsAppLink } from "@/components/WhatsAppLink";

/**
 * Jaring pengaman terakhir: dipakai kalau root layout sendiri yang gagal.
 *
 * Berbeda dari error.tsx, berkas ini MENGGANTI root layout, jadi ia wajib
 * merender <html> dan <body>-nya sendiri — dan `globals.css` tidak ikut
 * termuat. Karena itu semua gaya di sini ditulis inline; kelas Tailwind tidak
 * akan berfungsi.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout gagal dirender:", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8F5F0",
          color: "#1A1A1A",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "440px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 400, marginBottom: "12px" }}>
            Situs sedang bermasalah
          </h1>
          <p style={{ color: "#6B6560", lineHeight: 1.6, marginBottom: "32px" }}>
            Maaf, ada gangguan sesaat. Silakan muat ulang halaman — atau
            langsung hubungi tim BEKON lewat WhatsApp.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                padding: "12px 28px",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                backgroundColor: "#1A1A1A",
                color: "#FFFFFF",
              }}
            >
              Muat Ulang
            </button>
            <WhatsAppLink
              href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20ingin%20konsultasi`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 28px",
                borderRadius: "9999px",
                fontSize: "14px",
                fontWeight: 500,
                backgroundColor: "#B8963E",
                color: "#FFFFFF",
                textDecoration: "none",
              }}
            >
              Konsultasi via WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </body>
    </html>
  );
}
