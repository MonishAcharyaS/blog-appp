import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST: Create or retrieve custom category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required to create categories" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const name = (body.name || "").trim();
    const description = (body.description || "").trim() || null;

    if (!name) {
      return NextResponse.json(
        { error: "Category name cannot be empty" },
        { status: 400 }
      );
    }

    // Generate canonical slug
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseSlug) {
      baseSlug = `category-${Date.now().toString(36)}`;
    }

    // Check if category already exists by case-insensitive name or slug
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: baseSlug },
        ],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { category: existingCategory, created: false },
        { status: 200 }
      );
    }

    // Create new category
    const category = await prisma.category.create({
      data: {
        name,
        slug: baseSlug,
        description,
      },
    });

    return NextResponse.json({ category, created: true }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
