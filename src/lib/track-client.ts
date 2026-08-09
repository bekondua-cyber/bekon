"use client"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    ttq?: { page: () => void; track: (...args: unknown[]) => void }
  }
}

import { LEAD_VALUE, LEAD_CURRENCY } from "./lead-value"

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
const GOOGLE_ADS_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export function trackConversion(eventName: string, data?: { phone?: string; email?: string }) {
  const eventId = generateEventId()

  // value & currency wajib ikut di setiap event. Tanpa keduanya, Meta/TikTok/
  // Google tidak bisa menghitung ROAS dan Events Manager menandainya sebagai
  // masalah prioritas tinggi.
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(
      "track",
      eventName,
      { value: LEAD_VALUE, currency: LEAD_CURRENCY },
      { eventID: eventId }
    )
  }

  if (typeof window !== "undefined" && window.gtag && GOOGLE_ADS_ID && GOOGLE_ADS_CONVERSION_LABEL) {
    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
      value: LEAD_VALUE,
      currency: LEAD_CURRENCY,
    })
  }

  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(
      eventName,
      { value: LEAD_VALUE, currency: LEAD_CURRENCY },
      { event_id: eventId }
    )
  }

  fetch("/api/track/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      fbc: getCookie("_fbc"),
      fbp: getCookie("_fbp"),
      ...data,
    }),
  }).catch(() => {})

  fetch("/api/track/tiktok-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      ttclid: getCookie("ttclid"),
      ttp: getCookie("_ttp"),
      ...data,
    }),
  }).catch(() => {})
}
