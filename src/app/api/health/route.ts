import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const categoryCount = await prisma.category.count();
    const tagCount = await prisma.tag.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount,
      postCount,
      categoryCount,
      tagCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message,
      },
      { status: 500 }
    );
  }
}

