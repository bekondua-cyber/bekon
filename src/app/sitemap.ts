import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bekon.co.id";

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${baseUrl}/tentang-kami`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/layanan`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/portfolio`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/video`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/informasi/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/kontak`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
  ];

  const services = [
    "desain-eksterior",
    "desain-interior",
    "bangun-rumah-renovasi",
    "interior-rumah",
    "bangun-kost-ruko",
  ];

  const serviceRoutes = services.map((slug) => ({
    url: `${baseUrl}/layanan/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const portfolios = [
    "villa-modern-tropis",
    "rumah-minimalis-2-lantai",
    "living-room-modern",
    "hunian-mewah-tropis",
    "interior-kamar-tidur",
    "renovasi-ruang-keluarga",
    "kost-modern-3-lantai",
  ];

  const portfolioRoutes = portfolios.map((slug) => ({
    url: `${baseUrl}/portfolio/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogSlugs = [
    "7-kesalahan-umum-saat-membangun-rumah-pertama",
    "tren-desain-interior-2025",
    "cara-menghitung-rab-bangun-rumah-2-lantai",
  ];

  const blogRoutes = blogSlugs.map((slug) => ({
    url: `${baseUrl}/informasi/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...portfolioRoutes,
    ...blogRoutes,
  ];
}
