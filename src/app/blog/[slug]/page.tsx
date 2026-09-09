import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { AuthorBioCard } from "@/components/article/AuthorBioCard";
import { SocialShareButtons } from "@/components/article/SocialShareButtons";
import { LikeButton } from "@/components/article/LikeButton";
import { BookmarkButton } from "@/components/article/BookmarkButton";
import { CommentSection } from "@/components/comments/CommentSection";
import { sanitizeHtml } from "@/lib/sanitize";
import { calculateReadingTime } from "@/lib/readingTime";
import { BlogPost } from "@/types/blog";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
    },
  });

  if (!post) {
    return {
      title: "Article Not Found - Blogify",
    };
  }

  const title = `${post.title} | Blogify`;
  const description = post.excerpt || "Read this full article on Blogify.";
  const url = `https://blogify.example.com/blog/${post.slug}`;
  const images = post.coverImage ? [post.coverImage] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: post.author.name ? [post.author.name] : [],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function BlogPostPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // 1. Fetch post with relations
  const post = await prisma.post.findUnique({
    where: { slug },
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

  if (!post) {
    notFound();
  }

  // 2. Draft Access Control Check & Session resolution
  const session = await getServerSession(authOptions);
  if (!post.published) {
    const isAdmin = session?.user?.role === "ADMIN";
    const isAuthor = session?.user?.id === post.authorId;

    if (!isAdmin && !isAuthor) {
      notFound();
    }
  }

  // Check if current user has liked or bookmarked this post
  let initialIsLiked = false;
  let initialIsBookmarked = false;
  if (session?.user?.id) {
    const [existingLike, existingBookmark] = await Promise.all([
      prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: session.user.id,
          },
        },
      }),
      prisma.bookmark.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: session.user.id,
          },
        },
      }),
    ]);
    initialIsLiked = !!existingLike;
    initialIsBookmarked = !!existingBookmark;
  }

  // 3. Atomically increment view count
  const updatedPost = await prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  // Calculate dynamic reading time from content or retain post.readingTime if specified
  const dynamicReadingTime =
    post.readingTime && post.readingTime !== "3 min read"
      ? post.readingTime
      : calculateReadingTime(post.content || "");

  // Assign updated views count and dynamic reading time
  const blogPost: BlogPost = {
    ...post,
    views: updatedPost.views,
    readingTime: dynamicReadingTime,
  };

  // 4. Sanitize content
  const sanitizedContent = sanitizeHtml(blogPost.content || "");

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Article Header */}
      <ArticleHeader
        post={blogPost}
        initialIsLiked={initialIsLiked}
        initialIsBookmarked={initialIsBookmarked}
      />

      {/* Article Body Typography */}
      <div
        id="article-content-body"
        data-testid="article-content-body"
        className="prose-article"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* Article Tags */}
      {blogPost.tags && blogPost.tags.length > 0 && (
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-2">
            Tags:
          </span>
          {blogPost.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#F0EFFF] hover:text-[#5B48EE] dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Share & Author Bio */}
      <div className="space-y-8 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Enjoyed this article?
            </h2>
            <LikeButton
              postId={blogPost.id}
              initialLikesCount={blogPost._count?.likes ?? 0}
              initialIsLiked={initialIsLiked}
              variant="footer"
            />
            <BookmarkButton
              postId={blogPost.id}
              initialIsBookmarked={initialIsBookmarked}
              variant="footer"
            />
          </div>
          <SocialShareButtons title={blogPost.title} slug={blogPost.slug} variant="footer" />
        </div>

        {/* Author Bio Card */}
        <AuthorBioCard author={blogPost.author} />

        {/* 2-Level Nested Comment Section */}
        <CommentSection
          postId={blogPost.id}
          postSlug={blogPost.slug}
          postAuthorId={blogPost.author.id}
          initialCommentsCount={blogPost._count?.comments ?? 0}
        />
      </div>
    </article>
  );
}
