"use client"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function trackConversion(eventName: string, data?: { phone?: string; email?: string }) {
  const eventId = generateEventId()

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, {}, { eventID: eventId })
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
