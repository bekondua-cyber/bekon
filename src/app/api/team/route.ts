import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const team = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, role: true, bio: true, photo: true },
    });
    return NextResponse.json({ data: team }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("GET /api/team error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data tim" },
      { status: 500 }
    );
  }
}
