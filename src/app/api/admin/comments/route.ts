import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch all comments platform-wide for admin moderation
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
    const search = (searchParams.get("search") || "").trim();

    const where: any = {};

    if (search) {
      where.OR = [
        { content: { contains: search } },
        { author: { name: { contains: search } } },
        { author: { email: { contains: search } } },
        { post: { title: { contains: search } } },
      ];
    }

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return NextResponse.json({
      comments,
      total: comments.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch admin comments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin comments" },
      { status: 500 }
    );
  }
}
