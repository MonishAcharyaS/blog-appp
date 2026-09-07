import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateReadingTime } from "@/lib/readingTime";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET: Fetch single post details for editing or viewing
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PATCH: Update post fields, publish toggle, or featured toggle (Admin only)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator access required" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const existingPost = await prisma.post.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      updateData.title = title;
    }

    if (body.content !== undefined) {
      updateData.content = body.content;
      updateData.readingTime = calculateReadingTime(body.content);
    }

    if (body.excerpt !== undefined) {
      updateData.excerpt = body.excerpt;
    }

    if (body.coverImage !== undefined) {
      updateData.coverImage = body.coverImage;
    }

    if (body.categoryId !== undefined) {
      updateData.categoryId = body.categoryId || null;
    }

    if (body.published !== undefined) {
      updateData.published = !!body.published;
    }

    if (body.isFeatured !== undefined) {
      updateData.isFeatured = !!body.isFeatured;
    }

    const updatedPost = await prisma.post.update({
      where: { id: existingPost.id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error: any) {
    console.error("Failed to update post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a post (Admin only)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator access required" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const existingPost = await prisma.post.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id: existingPost.id },
    });

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (error: any) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}
