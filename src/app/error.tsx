"use client";

import { useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { WhatsAppLink } from "@/components/WhatsAppLink";

/**
 * Error boundary halaman publik.
 *
 * Sebelumnya hanya sisi admin yang punya boundary, jadi satu query gagal di
 * halaman publik akan menampilkan layar error mentah Next.js — untuk situs
 * yang seluruh tujuannya mengumpulkan leads, itu prospek yang hilang permanen.
 *
 * Dua perbedaan sengaja dari versi admin:
 * 1. `error.message` TIDAK ditampilkan. Di admin itu membantu; di publik itu
 *    membocorkan detail internal ke siapa pun.
 * 2. Ada tombol WhatsApp, supaya halaman yang rusak pun masih bisa
 *    mengonversi.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Pesan aslinya tetap masuk log server Vercel lewat digest.
    console.error("Halaman publik gagal dirender:", error.digest ?? error.message);
  }, [error]);

  return (
    <main id="main" tabIndex={-1} className="min-h-screen flex items-center justify-center bg-bekon-off-white px-6">
      <div className="text-center max-w-md">
        <h1 className="font-display text-[clamp(28px,4vw,40px)] text-bekon-near-black mb-3">
          Halaman gagal dimuat
        </h1>
        <p className="text-bekon-text-muted mb-8 leading-relaxed">
          Maaf, ada gangguan sesaat di sisi kami. Silakan coba lagi — atau
          langsung hubungi tim BEKON, kami siap membantu sekarang.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-7 py-3 bg-bekon-near-black text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
          >
            Coba Lagi
          </button>
          <WhatsAppLink
            href={`https://wa.me/${siteConfig.whatsapp1}?text=Halo%20BEKON%2C%20saya%20ingin%20konsultasi`}
            className="inline-flex items-center justify-center px-7 py-3 bg-bekon-gold text-white rounded-full text-sm font-medium hover:bg-bekon-gold-dark transition-colors"
          >
            Konsultasi via WhatsApp
          </WhatsAppLink>
        </div>

        <Link
          href="/"
          className="inline-block mt-8 text-sm text-bekon-text-muted hover:text-bekon-gold transition-colors underline underline-offset-4"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
