"use client";

import type { CSSProperties, ReactNode } from "react";
import { trackConversion } from "@/lib/track-client";

/**
 * Tautan WhatsApp yang selalu terlacak.
 *
 * Sebagian besar CTA WhatsApp ada di server component (Footer, halaman layanan,
 * detail portfolio, halaman kontak) sehingga `onClick` tidak bisa ditempel
 * langsung. Komponen klien tipis ini menutup celah itu: satu-satunya cara
 * merender tautan WhatsApp di proyek ini, supaya tidak ada lagi CTA yang lolos
 * dari pelacakan konversi seperti sebelumnya.
 */
export function WhatsAppLink({
  href,
  className,
  style,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  /** Dipakai global-error.tsx, yang berjalan tanpa globals.css sehingga
   *  kelas Tailwind tidak tersedia di sana. */
  style?: CSSProperties;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
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
