import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET: Check current user's like status and total like count for the post
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
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    let liked = false;

    if (session?.user?.id) {
      const existingLike = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: session.user.id,
          },
        },
      });
      liked = !!existingLike;
    }

    return NextResponse.json({
      liked,
      likesCount: post._count.likes,
    });
  } catch (error: any) {
    console.error("Failed to fetch like status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch like status" },
      { status: 500 }
    );
  }
}

// POST: Toggle like for authenticated user
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to like posts" },
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
      const existingLike = await tx.like.findUnique({
        where: {
          postId_userId: {
            postId: resolvedPostId,
            userId,
          },
        },
      });

      let liked = false;
      if (existingLike) {
        // Unlike
        await tx.like.delete({
          where: {
            id: existingLike.id,
          },
        });
        liked = false;
      } else {
        // Like
        await tx.like.create({
          data: {
            postId: resolvedPostId,
            userId,
          },
        });
        liked = true;
      }

      const count = await tx.like.count({
        where: { postId: resolvedPostId },
      });

      return { liked, likesCount: count };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to toggle like:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle like" },
      { status: 500 }
    );
  }
}
