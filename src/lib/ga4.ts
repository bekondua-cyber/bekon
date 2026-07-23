import { GoogleAuth } from "google-auth-library"

export interface Ga4Report {
  totals: {
    users: number
    pageviews: number
    bounceRate: number
    avgSessionDuration: number
    conversions: number
  }
  trend: { date: string; users: number }[]
  bounceTrend: { date: string; bounceRate: number }[]
  genderBreakdown: { gender: string; users: number }[]
  topPages: {
    path: string
    pageviews: number
    bounceRate: number
    avgSessionDuration: number
  }[]
}

type Ga4Row = { dimensionValues?: { value: string }[]; metricValues: { value: string }[] }

function getAuth(): GoogleAuth | null {
  const key = process.env.GA4_SERVICE_ACCOUNT_KEY
  if (!key) return null

  const credentials = JSON.parse(
    key.trim().startsWith("{") ? key : Buffer.from(key, "base64").toString("utf-8")
  )

  return new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  })
}

export async function isGa4Configured(): Promise<boolean> {
  return Boolean(process.env.GA4_PROPERTY_ID && process.env.GA4_SERVICE_ACCOUNT_KEY)
}

const GENDER_LABELS: Record<string, string> = {
  male: "Laki-laki",
  female: "Perempuan",
  unknown: "Tidak diketahui",
}

export async function getGa4Report(startDate: string, endDate: string): Promise<Ga4Report> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const auth = getAuth()
  if (!propertyId || !auth) {
    throw new Error("GA4 belum dikonfigurasi")
  }

  const client = await auth.getClient()
  const baseUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}`
  const runReport = (data: Record<string, unknown>) =>
    client.request({ url: `${baseUrl}:runReport`, method: "POST", data })

  const [totalsRes, dailyRes, genderRes, pagesRes] = await Promise.all([
    runReport({
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
      ],
    }),
    runReport({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "bounceRate" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    runReport({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "userGender" }],
      metrics: [{ name: "totalUsers" }],
    }).catch(() => null),
    runReport({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "bounceRate" }, { name: "averageSessionDuration" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    }),
  ])

  const totalsRow = (totalsRes.data as { rows?: Ga4Row[] }).rows?.[0]
  const totals = {
    users: Number(totalsRow?.metricValues[0]?.value || 0),
    pageviews: Number(totalsRow?.metricValues[1]?.value || 0),
    bounceRate: Number(totalsRow?.metricValues[2]?.value || 0),
    avgSessionDuration: Number(totalsRow?.metricValues[3]?.value || 0),
    conversions: Number(totalsRow?.metricValues[4]?.value || 0),
  }

  const dailyRows = (dailyRes.data as { rows?: Ga4Row[] }).rows || []
  const trend = dailyRows.map((r) => ({
    date: r.dimensionValues![0].value,
    users: Number(r.metricValues[0].value),
  }))
  const bounceTrend = dailyRows.map((r) => ({
    date: r.dimensionValues![0].value,
    bounceRate: Number(r.metricValues[1].value) * 100,
  }))

  const genderRows = genderRes ? (genderRes.data as { rows?: Ga4Row[] }).rows || [] : []
  const genderBreakdown = genderRows
    .map((r) => ({
      gender: GENDER_LABELS[r.dimensionValues![0].value] || r.dimensionValues![0].value,
      users: Number(r.metricValues[0].value),
    }))
    .filter((g) => g.users > 0)

  const pagesRows = (pagesRes.data as { rows?: Ga4Row[] }).rows || []
  const topPages = pagesRows.map((r) => ({
    path: r.dimensionValues![0].value,
    pageviews: Number(r.metricValues[0].value),
    bounceRate: Number(r.metricValues[1].value) * 100,
    avgSessionDuration: Number(r.metricValues[2].value),
  }))

  return { totals, trend, bounceTrend, genderBreakdown, topPages }
}
