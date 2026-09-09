import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DiscoveryFeed } from "@/components/blog/DiscoveryFeed";
import { BlogPost, CategoryItem } from "@/types/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Articles & Topics | Blogify",
  description:
    "Explore diverse perspectives across modern web development, artificial intelligence, UI/UX design, cloud architecture, and engineering leadership on Blogify.",
  openGraph: {
    title: "Explore Articles & Topics | Blogify",
    description:
      "Explore curated perspectives across modern web development, AI, design systems, and cloud architecture.",
    type: "website",
  },
};

interface ExplorePageProps {
  searchParams?: Promise<{
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialSearch = (resolvedSearchParams.search || "").trim();
  const initialCategory = (resolvedSearchParams.category || "").trim();

  // Build where clause
  const where: any = { published: true };
  if (initialSearch) {
    where.OR = [
      { title: { contains: initialSearch, mode: "insensitive" } },
      { excerpt: { contains: initialSearch, mode: "insensitive" } },
      { content: { contains: initialSearch, mode: "insensitive" } },
    ];
  }
  if (initialCategory && initialCategory !== "all") {
    where.category = {
      slug: initialCategory,
    };
  }

  // Fetch initial published posts with full relational data
  const rawInitialPosts = await prisma.post.findMany({
    where,
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

  // Fetch all categories
  const rawCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });

  const categories = rawCategories as unknown as CategoryItem[];
  const initialPosts = rawInitialPosts as unknown as BlogPost[];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div
        id="explore-header"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-gray-950 text-white p-8 sm:p-12 border border-indigo-800/40 shadow-xl"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>Discover Knowledge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Explore Topics & Ideas
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            Dive into deep technical tutorials, architectural case studies, product insights, and engineering stories written by authors across the globe.
          </p>

          {/* Quick topic summary chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-gray-200 border border-white/10"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#5B48EE]/30 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* Interactive Discovery Feed: Category Pills, Search, Sorting, Grid */}
      <DiscoveryFeed
        initialPosts={initialPosts}
        categories={categories}
        initialSearchQuery={initialSearch}
      />
    </div>
  );
}
