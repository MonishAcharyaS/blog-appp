import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPostThumbsCount, adjustPostThumbsCount } from "@/lib/thumbs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET: Fetch current thumbs count
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: postId } = await context.params;

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id: postId }, { slug: postId }],
      },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const count = getPostThumbsCount(post.id);
    return NextResponse.json({ thumbsCount: count });
  } catch (error: any) {
    console.error("Failed to get thumbs count:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get thumbs count" },
      { status: 500 }
    );
  }
}

// POST: Toggle or increment thumbs up anonymously / without authentication
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: postId } = await context.params;

    // Resolve post by ID or slug
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id: postId }, { slug: postId }],
      },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let delta = 1;
    try {
      const body = await req.json();
      if (typeof body.delta === "number") {
        delta = body.delta;
      } else if (body.retract === true) {
        delta = -1;
      }
    } catch {
      // Default to +1
      delta = 1;
    }

    const updatedCount = adjustPostThumbsCount(post.id, delta);

    return NextResponse.json({
      success: true,
      endorsed: delta > 0,
      thumbsCount: updatedCount,
    });
  } catch (error: any) {
    console.error("Failed to toggle thumbs up:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle thumbs up" },
      { status: 500 }
    );
  }
}
