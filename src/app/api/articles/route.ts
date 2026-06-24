import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const q = searchParams.get("q");
    const categories = categoryParam
      ? categoryParam.split(",").map((c) => c.trim()).filter(Boolean)
      : null;

    const where: Record<string, unknown> = { isPublished: true };

    if (categories && categories.length === 1) {
      where.category = categories[0];
    } else if (categories && categories.length > 1) {
      where.category = { in: categories };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
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
