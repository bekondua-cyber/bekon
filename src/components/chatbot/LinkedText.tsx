"use client";

import { linkify, isWhatsAppUrl } from "@/lib/linkify";
import { trackConversion } from "@/lib/track-client";

/**
 * Render balasan chatbot dengan tautan yang bisa diklik.
 *
 * Klik tautan WhatsApp di sini adalah konversi yang sah — sebelumnya sama
 * sekali tidak terlacak, padahal balasan fallback chatbot selalu mengarahkan
 * ke WhatsApp.
 */
export function LinkedText({ text }: { text: string }) {
  const segments = linkify(text);

  return (
    <>
      {segments.map((segment, i) =>
        segment.type === "link" ? (
          <a
            key={i}
            href={segment.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (isWhatsAppUrl(segment.href)) trackConversion("Contact");
            }}
            className="underline underline-offset-2 font-medium text-bekon-gold hover:text-bekon-gold-dark break-all"
          >
            {segment.value}
          </a>
        ) : (
          <span key={i}>{segment.value}</span>
        )
      )}
    </>
  );
}
