import { GoogleAuth } from "google-auth-library"

export interface Ga4Report {
  rows: { date: string; sessions: number; pageviews: number; conversions: number }[]
  topPages: { path: string; views: number }[]
  totals: { sessions: number; pageviews: number; conversions: number }
}

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

export async function getGa4Report(startDate: string, endDate: string): Promise<Ga4Report> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const auth = getAuth()
  if (!propertyId || !auth) {
    throw new Error("GA4 belum dikonfigurasi")
  }

  const client = await auth.getClient()
  const baseUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}`

  const [dailyRes, pagesRes] = await Promise.all([
    client.request({
      url: `${baseUrl}:runReport`,
      method: "POST",
      data: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "conversions" },
        ],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      },
    }),
    client.request({
      url: `${baseUrl}:runReport`,
      method: "POST",
      data: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      },
    }),
  ])

  const dailyData = (dailyRes.data as { rows?: Array<{ dimensionValues: { value: string }[]; metricValues: { value: string }[] }> })
  const pagesData = (pagesRes.data as { rows?: Array<{ dimensionValues: { value: string }[]; metricValues: { value: string }[] }> })

  const rows = (dailyData.rows || []).map((r) => ({
    date: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
    pageviews: Number(r.metricValues[1].value),
    conversions: Number(r.metricValues[2].value),
  }))

  const topPages = (pagesData.rows || []).map((r) => ({
    path: r.dimensionValues[0].value,
    views: Number(r.metricValues[0].value),
  }))

  const totals = rows.reduce(
    (acc, r) => ({
      sessions: acc.sessions + r.sessions,
      pageviews: acc.pageviews + r.pageviews,
      conversions: acc.conversions + r.conversions,
    }),
    { sessions: 0, pageviews: 0, conversions: 0 }
  )

  return { rows, topPages, totals }
}
