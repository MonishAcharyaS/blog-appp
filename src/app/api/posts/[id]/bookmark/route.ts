import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET: Check current user's bookmark status for the post
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: postId } = await context.params;

    // Check if post exists (either by id or slug)
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id: postId }, { slug: postId }],
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    let bookmarked = false;

    if (session?.user?.id) {
      const existingBookmark = await prisma.bookmark.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: session.user.id,
          },
        },
      });
      bookmarked = !!existingBookmark;
    }

    return NextResponse.json({
      bookmarked,
    });
  } catch (error: any) {
    console.error("Failed to fetch bookmark status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookmark status" },
      { status: 500 }
    );
  }
}

// POST: Toggle bookmark for authenticated user
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to bookmark posts" },
        { status: 401 }
      );
    }

    const { id: postId } = await context.params;
    const userId = session.user.id;

    // Resolve post by ID or slug
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id: postId }, { slug: postId }],
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const resolvedPostId = post.id;

    // Execute atomic toggle
    const result = await prisma.$transaction(async (tx) => {
      const existingBookmark = await tx.bookmark.findUnique({
        where: {
          postId_userId: {
            postId: resolvedPostId,
            userId,
          },
        },
      });

      let bookmarked = false;
      if (existingBookmark) {
        // Remove bookmark
        await tx.bookmark.delete({
          where: {
            id: existingBookmark.id,
          },
        });
        bookmarked = false;
      } else {
        // Add bookmark
        await tx.bookmark.create({
          data: {
            postId: resolvedPostId,
            userId,
          },
        });
        bookmarked = true;
      }

      return { bookmarked };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to toggle bookmark:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}
