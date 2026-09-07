import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Parallel database aggregation metrics
  const [
    totalPosts,
    publishedPosts,
    viewsAggregation,
    totalLikes,
    totalComments,
    totalUsers,
    recentPosts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.like.count(),
    prisma.comment.count(),
    prisma.user.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, image: true } },
        category: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
  ]);

  const totalViews = viewsAggregation._sum.views ?? 0;

  const kpis = [
    {
      id: "metric-posts",
      title: "Total Articles",
      value: totalPosts,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      id: "metric-published",
      title: "Published Articles",
      value: publishedPosts,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "metric-views",
      title: "Total Article Views",
      value: totalViews.toLocaleString(),
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-100 dark:border-purple-900/50",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      id: "metric-likes",
      title: "Total Likes",
      value: totalLikes,
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-100 dark:border-rose-900/50",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
    {
      id: "metric-comments",
      title: "Total Comments",
      value: totalComments,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: "metric-users",
      title: "Registered Users",
      value: totalUsers,
      color: "bg-indigo-50 text-[#5B48EE] dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Admin Control Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time platform overview, publication metrics, and database activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            id="admin-role-badge"
            data-testid="admin-role-badge"
            className="px-3.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-[#5B48EE] dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider"
          >
            {session?.user?.role ?? "ADMIN"}
          </span>
          <Link
            id="admin-new-post-btn"
            data-testid="admin-new-post-btn"
            href="/admin/editor-test"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5B48EE] hover:bg-[#4C3BDB] transition-all shadow-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* 6 Metric KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            data-testid={`kpi-card-${kpi.id}`}
            className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {kpi.title}
              </p>
              <p
                id={kpi.id}
                data-testid={kpi.id}
                className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white"
              >
                {kpi.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${kpi.color}`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Recent Platform Articles
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Latest articles created or drafted on the platform.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {recentPosts.length} most recent
          </span>
        </div>

        <div className="overflow-x-auto">
          <table
            id="recent-articles-table"
            data-testid="recent-articles-table"
            className="w-full text-left text-xs"
          >
            <thead className="bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 uppercase font-bold text-[11px] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Author</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Engagement</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentPosts.map((post) => (
                <tr
                  key={post.id}
                  data-testid={`recent-post-row-${post.slug}`}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                    {post.title}
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                    {post.author?.name || "Anonymous"}
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    {post.category?.name || "General"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        post.published
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-3">
                      <span>{post.views} views</span>
                      <span>•</span>
                      <span>{post._count.likes} likes</span>
                      <span>•</span>
                      <span>{post._count.comments} comments</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[#5B48EE] hover:underline font-bold text-xs"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
