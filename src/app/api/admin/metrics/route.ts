import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalUsers, totalPosts, totalCategories, totalComments, totalLikes] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.category.count(),
        prisma.comment.count(),
        prisma.like.count(),
      ]);

    return NextResponse.json({
      status: "success",
      metrics: {
        totalUsers,
        totalPosts,
        totalCategories,
        totalComments,
        totalLikes,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
