import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookmarksFeed } from "@/components/bookmarks/BookmarksFeed";

export const metadata: Metadata = {
  title: "My Bookmarks | Blogify",
  description: "View and manage your saved and bookmarked articles on Blogify.",
};

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login?callbackUrl=/bookmarks");
  }

  // Fetch bookmarks for the user
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
      post: {
        published: true,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
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
      },
    },
  });

  const posts = bookmarks.map((b) => ({
    ...b.post,
    bookmarkedAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-[#5B48EE] dark:text-violet-400 mb-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Personal Reading List
          </div>
          <h1
            id="bookmarks-page-title"
            data-testid="bookmarks-page-title"
            className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight"
          >
            My Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Articles and guides you have saved to read at your convenience.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            id="bookmarks-count-badge"
            data-testid="bookmarks-count-badge"
            className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            {posts.length} {posts.length === 1 ? "Saved Article" : "Saved Articles"}
          </span>
        </div>
      </div>

      {/* Interactive Feed */}
      <BookmarksFeed initialBookmarks={posts} />
    </div>
  );
}
