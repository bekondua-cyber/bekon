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

  console.log("Seed completed: admin user created")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
