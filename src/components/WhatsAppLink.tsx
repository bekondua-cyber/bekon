"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { siteConfig } from "@/data/site-config";
import { getPublicSettings } from "@/lib/settings-client";
import { trackConversion } from "@/lib/track-client";
import { normalizeWA } from "@/lib/utils";

/**
 * Tautan WhatsApp yang selalu terlacak, dan selalu memakai nomor terbaru.
 *
 * Sebagian besar CTA WhatsApp ada di server component (Footer, halaman layanan,
 * detail portfolio, halaman kontak) sehingga `onClick` tidak bisa ditempel
 * langsung. Komponen klien tipis ini menutup celah itu: satu-satunya cara
 * merender tautan WhatsApp di proyek ini, supaya tidak ada lagi CTA yang lolos
 * dari pelacakan konversi seperti sebelumnya.
 *
 * Ada dua cara memberi tujuan, dan pilih sesuai keadaan:
 *
 * - `waKey` + `message` — DIUTAMAKAN. Nomor diambil dari Settings admin dengan
 *   siteConfig sebagai nilai awal, jadi tautannya tidak pernah kosong selagi
 *   memuat. Ini memperbaiki enam CTA yang dulu hardcode `siteConfig.whatsapp1`
 *   dan karenanya mengabaikan perubahan nomor di CMS. Dipakai juga oleh
 *   `layanan/[slug]` yang halaman statis — resolusinya di klien, jadi halaman
 *   itu tidak perlu berubah jadi dinamis hanya demi membaca satu nomor.
 *
 * - `href` — untuk tautan yang tujuannya memang sudah pasti, dan untuk
 *   `error.tsx` / `global-error.tsx` yang justru berjalan saat sistem sedang
 *   bermasalah sehingga tidak boleh bergantung pada fetch apa pun.
 */

type WaKey = "wa_admin_1" | "wa_admin_2";

const FALLBACK_NUMBER: Record<WaKey, string> = {
  wa_admin_1: siteConfig.whatsapp1,
  wa_admin_2: siteConfig.whatsapp2,
};

function buildHref(number: string, message?: string): string {
  const base = `https://wa.me/${normalizeWA(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

type WhatsAppLinkProps = {
  className?: string;
  /** Dipakai global-error.tsx, yang berjalan tanpa globals.css sehingga
   *  kelas Tailwind tidak tersedia di sana. */
  style?: CSSProperties;
  children: ReactNode;
  ariaLabel?: string;
} & (
  | { href: string; waKey?: never; message?: never }
  | { href?: never; waKey: WaKey; message?: string }
);

export function WhatsAppLink({
  href,
  waKey,
  message,
  className,
  style,
  children,
  ariaLabel,
}: WhatsAppLinkProps) {
  const [number, setNumber] = useState(() => (waKey ? FALLBACK_NUMBER[waKey] : ""));

  useEffect(() => {
    if (!waKey) return;
    let active = true;
    getPublicSettings().then((settings) => {
      const fromSettings = settings[waKey];
      if (active && fromSettings) setNumber(fromSettings);
    });
    return () => {
      active = false;
    };
  }, [waKey]);

  const finalHref = href ?? buildHref(number, message);

  return (
    <a
      href={finalHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={() => trackConversion("Contact")}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
