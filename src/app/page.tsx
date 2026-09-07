import { prisma } from "@/lib/prisma";
import { FeaturedHero } from "@/components/blog/FeaturedHero";
import { DiscoveryFeed } from "@/components/blog/DiscoveryFeed";
import { BlogPost, CategoryItem } from "@/types/blog";

export const dynamic = "force-dynamic";

export default async function Home() {
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
  const featuredPost = (rawFeaturedPost ??
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

  // Fetch initial posts for the discovery grid
  const rawInitialPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 12,
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
  const categories = (await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  })) as unknown as CategoryItem[];

  const initialPosts = rawInitialPosts as unknown as BlogPost[];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Featured Hero Story */}
      <FeaturedHero post={featuredPost} />

      {/* Real-time Discovery Feed (Debounced Search, Category Filter, Sort, Grid) */}
      <DiscoveryFeed initialPosts={initialPosts} categories={categories} />
    </div>
  );
}
