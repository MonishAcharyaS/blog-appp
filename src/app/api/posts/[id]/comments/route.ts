import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET: Fetch comments for a post in 2-level nested structure
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: postIdOrSlug } = await context.params;

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id: postIdOrSlug }, { slug: postIdOrSlug }],
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Fetch all comments for this post
    const comments = await prisma.comment.findMany({
      where: {
        postId: post.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Build 2-level nested hierarchy
    const rootComments: any[] = [];
    const replyMap = new Map<string, any[]>();

    for (const comment of comments) {
      const isEdited =
        comment.updatedAt.getTime() - comment.createdAt.getTime() > 2000;
      const commentWithMeta = {
        ...comment,
        isEdited,
        replies: [],
      };

      if (!comment.parentId) {
        rootComments.push(commentWithMeta);
      } else {
        const existing = replyMap.get(comment.parentId) || [];
        existing.push(commentWithMeta);
        replyMap.set(comment.parentId, existing);
      }
    }

    // Attach replies to root comments
    for (const root of rootComments) {
      root.replies = replyMap.get(root.id) || [];
    }

    // Newest top-level comments first
    rootComments.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return NextResponse.json({
      comments: rootComments,
      total: comments.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST: Post a new comment or reply
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to comment" },
        { status: 401 }
      );
    }

    const { id: postIdOrSlug } = await context.params;
    const body = await req.json();
    const rawContent = (body.content || "").trim();
    let parentId: string | null = body.parentId || null;

    if (!rawContent || rawContent.length === 0) {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    if (rawContent.length > 2000) {
      return NextResponse.json(
        { error: "Comment exceeds maximum limit of 2000 characters" },
        { status: 400 }
      );
    }

    // Resolve post
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id: postIdOrSlug }, { slug: postIdOrSlug }],
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2-level hierarchy flattening rule:
    // If parent comment itself has a parentId, reassign parentId to the top-level grandparent comment
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, parentId: true },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      if (parentComment.parentId) {
        // Flatten to the root comment
        parentId = parentComment.parentId;
      }
    }

    // Sanitize against XSS attacks
    const sanitizedContent = sanitizeHtml(rawContent);

    const newComment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        postId: post.id,
        authorId: session.user.id,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        comment: {
          ...newComment,
          isEdited: false,
          replies: [],
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to post comment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post comment" },
      { status: 500 }
    );
  }
}
