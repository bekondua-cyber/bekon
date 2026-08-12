import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

/**
 * WAJIB ADA — kelas bug yang sama persis dengan yang dulu membekukan beranda.
 *
 * Berkas ini membaca database lewat Prisma, tapi panggilan Prisma bukan sinyal
 * dinamis bagi Next. Tanpa deklarasi ini, sitemap diprerender saat build lalu
 * disajikan statis selamanya: artikel dan portfolio baru tidak pernah masuk
 * sampai ada deploy berikutnya, dan Google menemukannya jauh lebih lambat.
 *
 * Satu jam cukup — sitemap tidak perlu seketika, tapi juga tidak boleh beku.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bangunrumahbekon.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/tentang-kami`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/layanan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/portfolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/video`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/informasi/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/kontak`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const services = [
    "desain-eksterior",
    "desain-interior",
    "bangun-rumah-renovasi",
    "interior-rumah",
    "bangun-kost-ruko",
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((slug) => ({
    url: `${baseUrl}/layanan/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  let portfolioItems: { slug: string; updatedAt: Date }[] = [];
  try {
    portfolioItems = await prisma.portfolio.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
  } catch (e) {
    console.warn("Sitemap: could not fetch portfolios", e);
  }

  const portfolioRoutes: MetadataRoute.Sitemap = portfolioItems.map((item) => ({
    url: `${baseUrl}/portfolio/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  let articleItems: { slug: string; updatedAt: Date }[] = [];
  try {
    articleItems = await prisma.article.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
  } catch (e) {
    console.warn("Sitemap: could not fetch articles", e);
  }

  const blogRoutes: MetadataRoute.Sitemap = articleItems.map((item) => ({
    url: `${baseUrl}/informasi/blog/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...portfolioRoutes,
    ...blogRoutes,
  ];
}
