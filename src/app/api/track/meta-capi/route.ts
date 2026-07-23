import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const capiSchema = z.object({
  eventName: z.string().min(1).max(100),
  eventId: z.string().min(1).max(200),
  eventSourceUrl: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(200).optional(),
})

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex")
}

export async function POST(request: NextRequest) {
  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    return NextResponse.json({ success: false, skipped: true }, { status: 200 })
  }

  try {
    const identifier = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const limit = rateLimit(`meta-capi:${identifier}`, 30, 60000)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 })
    }

    const body = await request.json()
    const validation = capiSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Data event tidak valid" }, { status: 400 })
    }

    const { eventName, eventId, eventSourceUrl, phone, email } = validation.data

    const userData: Record<string, string[]> = {
      client_ip_address: [identifier].filter((v) => v !== "unknown"),
    }
    if (phone) userData.ph = [sha256(phone)]
    if (email) userData.em = [sha256(email)]

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              event_source_url: eventSourceUrl,
              action_source: "website",
              user_data: userData,
            },
          ],
        }),
      }
    )

    if (!res.ok) {
      console.error("Meta CAPI error:", await res.text())
      return NextResponse.json({ error: "Gagal mengirim event" }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/track/meta-capi error:", error)
    return NextResponse.json({ error: "Gagal mengirim event" }, { status: 500 })
  }
}
