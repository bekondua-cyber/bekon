import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma"
import { hashSync } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = hashSync("bekon123", 12)

  await prisma.user.upsert({
    where: { email: "admin@bekon.com" },
    update: { password },
    create: {
      email: "admin@bekon.com",
      password,
      name: "Admin",
    },
  })

  const existingCount = await prisma.heroSlide.count()
  if (existingCount === 0) {
    const heroSlides = [
      {
        image: "https://images.unsplash.com/photo-1719887805632-de5be825f72b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
        title: "Wujudkan\nHunian\nImpian Anda",
        subtitle: "BEKON adalah mitra jangka panjang yang mewujudkan investasi hunian berkualitas dengan transparansi, estetika, dan ketepatan. Berpengalaman sejak 2009.",
        ctaText: "Konsultasi Gratis",
        ctaLink: "/kontak",
        order: 1,
        isActive: true,
        sourceType: "custom",
      },
      {
        image: "https://images.unsplash.com/photo-1745761320791-5ae142edee8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
        title: "Desain Modern\nuntuk Keluarga\nIndonesia",
        subtitle: "Kami menghadirkan desain hunian modern yang menggabungkan estetika kontemporer dengan kearifan lokal Indonesia.",
        ctaText: "Lihat Portfolio",
        ctaLink: "/portfolio",
        order: 2,
        isActive: true,
        sourceType: "custom",
      },
      {
        image: "https://images.unsplash.com/photo-1762117360944-82ad090fffb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
        title: "Bangun Rumah\nImpian Bersama\nBEKON",
        subtitle: "Dari konsep hingga konstruksi, kami hadir untuk mewujudkan rumah impian Anda dengan kualitas terbaik.",
        ctaText: "Konsultasi Gratis",
        ctaLink: "/kontak",
        order: 3,
        isActive: true,
        sourceType: "custom",
      },
    ]

    await prisma.heroSlide.createMany({ data: heroSlides })
    console.log("Seed: 3 hero slides created")
  }

  console.log("Seed completed: admin user & hero slides created")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
