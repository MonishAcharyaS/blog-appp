import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch all posts for admin management with status filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all"; // all | published | draft
    const search = (searchParams.get("search") || "").trim();

    const where: any = {};

    if (status === "published") {
      where.published = true;
    } else if (status === "draft") {
      where.published = false;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return NextResponse.json({ posts, total: posts.length });
  } catch (error: any) {
    console.error("Failed to fetch admin posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin posts" },
      { status: 500 }
    );
  }
}
