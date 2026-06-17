import { NextResponse } from "next/server"
import { getServerSession } from "./auth-server"

export async function requireAdmin() {
  const session = await getServerSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}
