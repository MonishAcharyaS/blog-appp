import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPostThumbsCount } from "@/lib/thumbs";
import { getPostUpvotesCount } from "@/lib/upvotes";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "upvotes"; // upvotes | thumbs | latest | likes | views
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

    // Determine orderBy for database query
    let orderBy: any = { createdAt: "desc" };
    if (sort === "views") {
      orderBy = { views: "desc" };
    }

    const isCustomSort = sort === "upvotes" || sort === "thumbs" || sort === "thumbsUp" || sort === "likes";

    const [total, rawPosts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy,
        skip: isCustomSort ? 0 : skip,
        take: isCustomSort ? 100 : limit,
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

    // Attach computed / persistent upvotes and thumbsUp counts to each post
    let posts = rawPosts.map((p) => {
      const thumbsUp = getPostThumbsCount(p.id);
      const upvotes = getPostUpvotesCount(p.id);
      return {
        ...p,
        _count: {
          ...p._count,
          thumbsUp,
          upvotes,
        },
      };
    });

    // Custom sorting:
    if (sort === "likes") {
      // Sort strictly by likes count descending
      posts.sort((a, b) => {
        const diff = (b._count?.likes ?? 0) - (a._count?.likes ?? 0);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (sort === "thumbs" || sort === "thumbsUp") {
      // Sort strictly by thumbsUp count descending
      posts.sort((a, b) => {
        const diff = (b._count?.thumbsUp ?? 0) - (a._count?.thumbsUp ?? 0);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (sort === "upvotes" || !sort) {
      // Default: order strictly by upvotes count descending
      posts.sort((a, b) => {
        const diff = (b._count?.upvotes ?? 0) - (a._count?.upvotes ?? 0);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    const paginatedPosts = isCustomSort ? posts.slice(skip, skip + limit) : posts;

    return NextResponse.json({
      posts: paginatedPosts,
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

