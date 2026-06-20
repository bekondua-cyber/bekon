import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma"
import { hashSync } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || "admin123"
  const password = hashSync(defaultPassword, 12)

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
        order: 1,
        isActive: true,
        sourceType: "custom",
      },
      {
        image: "https://images.unsplash.com/photo-1745761320791-5ae142edee8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
        order: 2,
        isActive: true,
        sourceType: "custom",
      },
      {
        image: "https://images.unsplash.com/photo-1762117360944-82ad090fffb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
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
