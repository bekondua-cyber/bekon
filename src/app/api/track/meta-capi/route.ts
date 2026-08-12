import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/request-ip"
import { normalizeWA } from "@/lib/utils"
import { LEAD_CURRENCY, valueForEvent } from "@/lib/lead-value"

export const dynamic = "force-dynamic"

/**
 * Endpoint ini publik dan tanpa auth — memang harus, karena dipanggil dari
 * browser pengunjung. Tapi dulu ia menerima `eventName` apa pun, sehingga siapa
 * saja bisa menyuntik konversi karangan bernilai rupiah penuh ke akun iklan.
 * Hanya dua nama event yang benar-benar dipakai situs ini.
 */
const ALLOWED_EVENTS = ["Lead", "Contact"] as const

const capiSchema = z.object({
  eventName: z.enum(ALLOWED_EVENTS),
  eventId: z.string().min(1).max(200),
  eventSourceUrl: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(200).optional(),
  fbc: z.string().max(300).optional(),
  fbp: z.string().max(300).optional(),
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
    const identifier = getClientIp(request)
    const limit = rateLimit(`meta-capi:${identifier}`, 30, 60000)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 })
    }

    const body = await request.json()
    const validation = capiSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Data event tidak valid" }, { status: 400 })
    }

    const { eventName, eventId, eventSourceUrl, phone, email, fbc, fbp } = validation.data

    const userData: Record<string, string | string[]> = {}
    if (identifier !== "unknown") userData.client_ip_address = identifier
    const userAgent = request.headers.get("user-agent")
    if (userAgent) userData.client_user_agent = userAgent
    if (phone) userData.ph = [sha256(normalizeWA(phone))]
    if (email) userData.em = [sha256(email)]
    if (fbc) userData.fbc = fbc
    if (fbp) userData.fbp = fbp

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
              // Wajib ada, kalau tidak Meta tidak bisa menghitung ROAS dan
              // event ditandai bermasalah di Events Manager. Nilainya dihitung
              // dari eventName supaya persis sama dengan yang dikirim pixel —
              // dedup lewat eventID mengandalkan keduanya cocok.
              custom_data: {
                value: valueForEvent(eventName),
                currency: LEAD_CURRENCY,
              },
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
