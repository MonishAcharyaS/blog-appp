import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "latest"; // latest | likes | views
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    // Sanitize search query: strip control characters, excessive whitespace
    const search = rawSearch.replace(/[\x00-\x1F\x7F]/g, "").trim();

    // Build Prisma where filter
    const where: any = {
      published: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categorySlug && categorySlug !== "all") {
      where.category = {
        slug: categorySlug,
      };
    }

    // Determine orderBy
    let orderBy: any = { createdAt: "desc" };
    if (sort === "views") {
      orderBy = { views: "desc" };
    } else if (sort === "likes") {
      orderBy = {
        likes: {
          _count: "desc",
        },
      };
    }

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              bio: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST: Create a new article (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await (await import("next-auth")).getServerSession(
      (await import("@/lib/auth")).authOptions
    );

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const title = (body.title || "").trim();
    const content = body.content || "";
    const excerpt = (body.excerpt || "").trim();
    const coverImage = body.coverImage || null;
    let categoryId = body.categoryId || null;
    const newCategoryName = (body.newCategoryName || "").trim();
    const published = !!body.published;
    const isFeatured = !!body.isFeatured;

    // Handle inline custom category creation or resolution
    if (newCategoryName) {
      let catSlug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (!catSlug) catSlug = `category-${Date.now().toString(36)}`;

      let category = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: newCategoryName, mode: "insensitive" } },
            { slug: catSlug },
          ],
        },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: newCategoryName,
            slug: catSlug,
          },
        });
      }
      categoryId = category.id;
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseSlug) {
      baseSlug = `article-${Date.now().toString(36)}`;
    }

    // Check for duplicate slug and append unique suffix if conflict exists
    let slug = baseSlug;
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingPost) {
      slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const readingTime = (await import("@/lib/readingTime")).calculateReadingTime(
      content
    );

    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || title,
        content,
        coverImage,
        categoryId: categoryId || undefined,
        published,
        isFeatured,
        readingTime,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}

