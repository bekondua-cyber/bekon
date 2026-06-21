import { NextResponse } from "next/server"
import { getServerSession } from "./auth-server"

// NOTE: Fungsi ini hanya memeriksa apakah ada session yang valid (siapa pun yang login).
// Saat ini belum ada role-based access. Nama "requireAdmin" dipakai untuk konsistensi
// dengan kemungkinan implementasi role checking di masa depan.
export async function requireAdmin() {
  const session = await getServerSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}

export function isPrismaErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === code
}
