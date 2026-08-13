"use client"

// Tipe window.fbq / gtag / ttq tinggal di src/types/tracking.d.ts.

import { LEAD_CURRENCY, valueForEvent } from "./lead-value"
import { getFbc } from "./fbc"
import { getVisitorId } from "./visitor-id"
import { normalizeWA } from "./utils"

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
const GOOGLE_ADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL
const GOOGLE_ADS_CONTACT_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONTACT_LABEL

/**
 * Conversion action Google Ads per jenis event.
 *
 * Dulu submit form dan klik WhatsApp memakai action yang sama, sehingga Google
 * tidak bisa membedakan prospek yang meninggalkan nama dan nomor dari yang
 * sekadar mengklik tombol — padahal nilainya berbeda dan kualitasnya jauh
 * berbeda. Optimasi kampanye jadi menembak sasaran campur aduk.
 *
 * Kalau label Contact belum diisi, ia jatuh kembali ke label lama supaya
 * perilakunya tidak berubah sebelum action barunya dibuat di dashboard.
 */
export function googleAdsLabel(eventName: string): string | undefined {
  if (eventName === "Contact") return GOOGLE_ADS_CONTACT_LABEL || GOOGLE_ADS_LEAD_LABEL
  return GOOGLE_ADS_LEAD_LABEL
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

/**
 * Data pencocokan dalam bentuk MENTAH.
 *
 * Pixel Meta dan TikTok meng-hash sendiri di browser; server meng-hash dengan
 * sha256() miliknya. Keduanya harus menormalkan dengan cara yang sama persis —
 * kalau tidak, hash-nya berbeda dan platform membacanya sebagai dua orang yang
 * berlainan, yang justru lebih buruk daripada tidak mengirim apa pun.
 *
 * Karena itu normalisasi dipusatkan di sini: telepon lewat normalizeWA() yang
 * sama dengan yang dipakai seluruh tautan WhatsApp dan route /api/leads, email
 * cukup trim + huruf kecil (sama dengan yang dilakukan sha256() di server).
 */
export interface MatchData {
  email?: string
  phone?: string
  externalId?: string
}

export function buildMatchData(data?: { phone?: string; email?: string }): MatchData {
  const match: MatchData = {}

  const email = data?.email?.trim().toLowerCase()
  if (email) match.email = email

  const phone = data?.phone ? normalizeWA(data.phone) : ""
  if (phone) match.phone = phone

  const visitorId = getVisitorId()
  if (visitorId) match.externalId = visitorId

  return match
}

/**
 * Data pencocokan untuk Enhanced Conversions Google.
 *
 * Berbeda dari Meta dan TikTok yang menerima nomor apa adanya, Google menuntut
 * format **E.164** — harus diawali tanda `+` beserta kode negara. Nomor tanpa
 * `+` diabaikan diam-diam, jadi kesalahan ini tidak memunculkan error apa pun,
 * hanya cakupan pencocokan yang tidak pernah naik.
 *
 * Mengembalikan undefined kalau tidak ada satu pun penanda, supaya kita tidak
 * memanggil gtag dengan objek kosong.
 */
export function buildGoogleUserData(match: MatchData): Record<string, string> | undefined {
  const userData: Record<string, string> = {}

  if (match.email) userData.email = match.email
  if (match.phone) userData.phone_number = `+${match.phone}`

  return Object.keys(userData).length > 0 ? userData : undefined
}

export function trackConversion(eventName: string, data?: { phone?: string; email?: string }) {
  const eventId = generateEventId()

  // value & currency wajib ikut di setiap event. Tanpa keduanya, Meta/TikTok/
  // Google tidak bisa menghitung ROAS dan Events Manager menandainya sebagai
  // masalah prioritas tinggi. Nilainya beda per jenis event — lihat
  // valueForEvent(); route server menghitung ulang dari eventName yang sama.
  const value = valueForEvent(eventName)
  const match = buildMatchData(data)

  if (typeof window !== "undefined" && window.fbq) {
    // Advanced Matching. Tanpa ini, separuh event yang dikirim pixel tidak
    // membawa penanda orang sama sekali — hanya salinan Conversions API yang
    // membawanya — sehingga cakupan tiap match key mentok di 50% dan skor
    // Event Match Quality tertahan. Meta menerima nilai mentah lalu menormalkan
    // dan meng-hash sendiri.
    if (META_PIXEL_ID && (match.email || match.phone || match.externalId)) {
      const advanced: Record<string, string> = {}
      if (match.email) advanced.em = match.email
      if (match.phone) advanced.ph = match.phone
      if (match.externalId) advanced.external_id = match.externalId
      window.fbq("init", META_PIXEL_ID, advanced)
    }

    window.fbq("track", eventName, { value, currency: LEAD_CURRENCY }, { eventID: eventId })
  }

  const adsLabel = googleAdsLabel(eventName)
  if (typeof window !== "undefined" && window.gtag && GOOGLE_ADS_ID && adsLabel) {
    // Enhanced Conversions — padanan Advanced Matching milik Google, dan satu-
    // satunya dari tiga platform yang tadinya tidak menerima penanda orang sama
    // sekali. Conversion action di Google Ads sudah disetel "Dikelola melalui
    // Tag Google", artinya data ini yang dipakainya.
    //
    // `set` sebelum `event`, bukan digabung ke dalamnya: gtag menyimpan
    // user_data di scope dan menerapkannya ke event berikutnya.
    const userData = buildGoogleUserData(match)
    if (userData) window.gtag("set", "user_data", userData)

    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${adsLabel}`,
      value,
      currency: LEAD_CURRENCY,
      // Tanpa ini, memuat ulang halaman atau mengirim form dua kali terhitung
      // sebagai dua konversi.
      transaction_id: eventId,
    })
  }

  if (typeof window !== "undefined" && window.ttq) {
    // TikTok punya celah yang sama persis dengan Meta, dan pixel-nya aktif.
    if (window.ttq.identify && (match.email || match.phone || match.externalId)) {
      const identity: Record<string, string> = {}
      if (match.email) identity.email = match.email
      if (match.phone) identity.phone_number = match.phone
      if (match.externalId) identity.external_id = match.externalId
      window.ttq.identify(identity)
    }

    window.ttq.track(eventName, { value, currency: LEAD_CURRENCY }, { event_id: eventId })
  }

  fetch("/api/track/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      // Lewat getFbc(), bukan cookie mentah: kalau pixel belum sempat menulis
      // `_fbc`, nilainya sudah kita susun sendiri dari `fbclid` saat mendarat.
      fbc: getFbc(),
      fbp: getCookie("_fbp"),
      externalId: match.externalId,
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
      externalId: match.externalId,
      ...data,
    }),
  }).catch(() => {})
}
