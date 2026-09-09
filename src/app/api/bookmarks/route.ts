import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
        post: {
          published: true,
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { excerpt: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
                bio: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            tags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    const posts = bookmarks.map((b) => ({
      ...b.post,
      bookmarkedAt: b.createdAt,
    }));

    return NextResponse.json({
      bookmarks: posts,
      total: posts.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch bookmarks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
