import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TrendingFeed } from "@/components/blog/TrendingFeed";
import { BlogPost } from "@/types/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending Articles & Stories | Blogify",
  description:
    "Discover the most popular, high-engagement tech and engineering articles trending on Blogify right now.",
  openGraph: {
    title: "Trending Articles & Stories | Blogify",
    description:
      "Discover what developers, architects, and designers are reading and talking about on Blogify.",
    type: "website",
  },
};

export default async function TrendingPage() {
  // Fetch published posts ordered by engagement metrics
  const rawPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [
      { views: "desc" },
      { createdAt: "desc" },
    ],
    take: 24,
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

  const posts = rawPosts as unknown as BlogPost[];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Trending Header Banner */}
      <div
        id="trending-header"
        className="relative overflow-hidden rounded-3xl spatial-glass p-8 sm:p-12 shadow-2xl transition-all preserve-3d"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-400/30">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            <span>Real-Time Velocity</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-gray-950 dark:text-white">
            Trending on Blogify
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
            The stories sparking discussion, gaining traction, and driving developer conversations today. Ranked dynamically by community engagement, reads, and applause.
          </p>
        </div>

        {/* Decorative ambient background glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-orange-500/25 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* Trending Feed Component */}
      <TrendingFeed initialPosts={posts} />
    </div>
  );
}
