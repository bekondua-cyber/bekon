import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/request-ip"
import { normalizeWA } from "@/lib/utils"
import { LEAD_CURRENCY, valueForEvent } from "@/lib/lead-value"

export const dynamic = "force-dynamic"

/** Daftar putih yang sama dengan route Meta CAPI — lihat catatan di sana. */
const ALLOWED_EVENTS = ["Lead", "Contact"] as const

const eventSchema = z.object({
  eventName: z.enum(ALLOWED_EVENTS),
  eventId: z.string().min(1).max(200),
  eventSourceUrl: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(200).optional(),
  ttclid: z.string().max(300).optional(),
  ttp: z.string().max(300).optional(),
})

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex")
}

export async function POST(request: NextRequest) {
  const pixelCode = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN

  if (!pixelCode || !accessToken) {
    return NextResponse.json({ success: false, skipped: true }, { status: 200 })
  }

  try {
    const identifier = getClientIp(request)
    const limit = rateLimit(`tiktok-events:${identifier}`, 30, 60000)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 })
    }

    const body = await request.json()
    const validation = eventSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Data event tidak valid" }, { status: 400 })
    }

    const { eventName, eventId, eventSourceUrl, phone, email, ttclid, ttp } = validation.data

    const userData: Record<string, string | string[]> = {}
    if (identifier !== "unknown") userData.ip = identifier
    const userAgent = request.headers.get("user-agent")
    if (userAgent) userData.user_agent = userAgent
    if (phone) userData.phone = [sha256(normalizeWA(phone))]
    if (email) userData.email = [sha256(email)]
    if (ttclid) userData.ttclid = ttclid
    if (ttp) userData.ttp = ttp

    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify({
        event_source: "web",
        event_source_id: pixelCode,
        data: [
          {
            event: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            user: userData,
            page: eventSourceUrl ? { url: eventSourceUrl } : undefined,
            // Tanpa value & currency, TikTok tidak bisa menghitung ROAS.
            // Dihitung dari eventName supaya sama persis dengan pixel browser.
            properties: {
              value: valueForEvent(eventName),
              currency: LEAD_CURRENCY,
            },
          },
        ],
      }),
    })

    if (!res.ok) {
      console.error("TikTok Events API error:", await res.text())
      return NextResponse.json({ error: "Gagal mengirim event" }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/track/tiktok-events error:", error)
    return NextResponse.json({ error: "Gagal mengirim event" }, { status: 500 })
  }
}
