import { NextResponse } from "next/server";
import { getActiveTeam } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const team = await getActiveTeam();

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
