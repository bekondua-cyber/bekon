"use client"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
const GOOGLE_ADS_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function trackConversion(eventName: string, data?: { phone?: string; email?: string }) {
  const eventId = generateEventId()

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, {}, { eventID: eventId })
  }

  if (typeof window !== "undefined" && window.gtag && GOOGLE_ADS_ID && GOOGLE_ADS_CONVERSION_LABEL) {
    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
    })
  }

  fetch("/api/track/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      ...data,
    }),
  }).catch(() => {})
}
