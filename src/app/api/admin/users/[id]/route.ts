import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/admin/users/[id] - Toggle ban status or change role (promote/demote)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator access required" },
        { status: 403 }
      );
    }

    const { id: targetUserId } = await context.params;
    const body = await req.json();

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isSelf = session.user.id === targetUserId;

    // Self-lockout prevention: Admin cannot ban their own account
    if (isSelf && body.isBanned === true) {
      return NextResponse.json(
        { error: "Self-lockout prevented: You cannot ban your own account" },
        { status: 400 }
      );
    }

    // Self-lockout prevention: Admin cannot demote their own account to READER
    if (isSelf && body.role && body.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Self-lockout prevented: You cannot demote your own account" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (typeof body.isBanned === "boolean") {
      updateData.isBanned = body.isBanned;
    }

    if (body.role) {
      const normalizedRole = String(body.role).toUpperCase();
      if (normalizedRole !== "ADMIN" && normalizedRole !== "READER") {
        return NextResponse.json(
          { error: "Invalid role. Allowed roles are 'ADMIN' and 'READER'" },
          { status: 400 }
        );
      }
      updateData.role = normalizedRole;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update fields provided (isBanned or role expected)" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
