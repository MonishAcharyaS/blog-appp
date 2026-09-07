import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";

interface RouteContext {
  params: Promise<{
    commentId: string;
  }>;
}

// PATCH: Edit an existing comment (author only)
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to edit comments" },
        { status: 401 }
      );
    }

    const { commentId } = await context.params;
    const body = await req.json();
    const rawContent = (body.content || "").trim();

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

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Ownership check: Only comment author can edit
    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to edit this comment" },
        { status: 403 }
      );
    }

    const sanitizedContent = sanitizeHtml(rawContent);

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: sanitizedContent,
        updatedAt: new Date(),
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

    return NextResponse.json({
      comment: {
        ...updated,
        isEdited: true,
      },
    });
  } catch (error: any) {
    console.error("Failed to update comment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a comment (author or ADMIN)
export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to delete comments" },
        { status: 401 }
      );
    }

    const { commentId } = await context.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Permission check: Author OR Admin
    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to delete this comment" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true, message: "Comment deleted" });
  } catch (error: any) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete comment" },
      { status: 500 }
    );
  }
}
