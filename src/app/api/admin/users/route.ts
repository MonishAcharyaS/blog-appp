import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users - List users with search, role and status filtering
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
    const role = (searchParams.get("role") || "").trim().toUpperCase();
    const status = (searchParams.get("status") || "").trim().toLowerCase();

    const where: any = {};

    // Search filter across name and email
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Role filter
    if (role === "ADMIN" || role === "READER") {
      where.role = role;
    }

    // Status filter
    if (status === "active") {
      where.isBanned = false;
    } else if (status === "banned") {
      where.isBanned = true;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
      users,
      total: users.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch admin users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}
