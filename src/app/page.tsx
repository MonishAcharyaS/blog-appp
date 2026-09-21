import { prisma } from "@/lib/prisma";
import { FeaturedHero } from "@/components/blog/FeaturedHero";
import { DiscoveryFeed } from "@/components/blog/DiscoveryFeed";
import { BlogPost, CategoryItem } from "@/types/blog";
import { getPostThumbsCount } from "@/lib/thumbs";
import { getPostUpvotesCount } from "@/lib/upvotes";

export const dynamic = "force-dynamic";

export default async function Home() {
  let featuredPost: BlogPost | null = null;
  let initialPosts: BlogPost[] = [];
  let categories: CategoryItem[] = [];

  try {
    // Fetch featured post directly with relational includes for fast initial paint
    const rawFeaturedPost = await prisma.post.findFirst({
      where: { published: true, isFeatured: true },
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
    });

    // Fallback if no post is explicitly featured
    featuredPost = (rawFeaturedPost ??
      (await prisma.post.findFirst({
        where: { published: true },
        orderBy: { createdAt: "desc" },
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
      }))) as unknown as BlogPost | null;

    // Fetch initial posts for the discovery grid, ranked by upvotes count
    const rawInitialPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 100,
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
    });

    // Fetch categories
    categories = (await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    })) as unknown as CategoryItem[];

    // Map each post to attach calculated/persistent upvotes and thumbsUp count, and sort by upvotes count descending
    const postsWithCounts: BlogPost[] = (rawInitialPosts as unknown as BlogPost[]).map((p) => {
      const thumbsUp = getPostThumbsCount(p.id);
      const upvotes = getPostUpvotesCount(p.id);
      return {
        ...p,
        _count: {
          likes: p._count?.likes ?? 0,
          comments: p._count?.comments ?? 0,
          thumbsUp,
          upvotes,
        },
      };
    });

    postsWithCounts.sort((a, b) => {
      const diff = (b._count?.upvotes ?? 0) - (a._count?.upvotes ?? 0);
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    initialPosts = postsWithCounts.slice(0, 12);
  } catch (dbErr) {
    console.warn("Home page database connection error, rendering empty feed fallback:", dbErr);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Featured Hero Story */}
      <FeaturedHero post={featuredPost} />

      {/* Real-time Discovery Feed (Debounced Search, Category Filter, Sort, Grid) */}
      <DiscoveryFeed initialPosts={initialPosts} categories={categories} />
    </div>
  );
}
