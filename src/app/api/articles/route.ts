import { NextRequest, NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const categories = categoryParam
      ? categoryParam.split(",").map((c) => c.trim()).filter(Boolean)
      : null;

    const items = await getPublishedArticles({
      categories,
      q: searchParams.get("q"),
    });

    return NextResponse.json(
      { data: items },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data artikel" },
      { status: 500 }
    );
  }
}
