import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Users (Admin & Readers) with bcrypt hashes
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash("Admin123!", saltRounds);
  const readerPasswordHash = await bcrypt.hash("Reader123!", saltRounds);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      name: "Platform Administrator",
      bio: "Chief Editor & Technical Administrator at Blogify",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
    create: {
      email: "admin@example.com",
      name: "Platform Administrator",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      bio: "Chief Editor & Technical Administrator at Blogify",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
  });
  console.log(`✔ Seeded Admin user: ${admin.email} (Role: ${admin.role})`);

  const jane = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {
      passwordHash: readerPasswordHash,
      role: "READER",
      name: "Jane Cooper",
      bio: "Frontend Architect & Design Systems Lead",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
    create: {
      email: "jane@example.com",
      name: "Jane Cooper",
      passwordHash: readerPasswordHash,
      role: "READER",
      bio: "Frontend Architect & Design Systems Lead",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
  });

  const alex = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {
      passwordHash: readerPasswordHash,
      role: "READER",
      name: "Alex Rivera",
      bio: "Cloud & Distributed Systems Specialist",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    create: {
      email: "alex@example.com",
      name: "Alex Rivera",
      passwordHash: readerPasswordHash,
      role: "READER",
      bio: "Cloud & Distributed Systems Specialist",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });
  console.log(`✔ Seeded Readers: ${jane.email}, ${alex.email}`);

  // 2. Seed 5 Standard Categories
  const categoriesData = [
    {
      name: "Web Development",
      slug: "web-development",
      description: "Modern full-stack web engineering, frameworks, and architecture.",
    },
    {
      name: "AI & Machine Learning",
      slug: "ai-machine-learning",
      description: "Artificial intelligence, large language models, and agentic workflows.",
    },
    {
      name: "UI/UX Design",
      slug: "ui-ux-design",
      description: "Design systems, typography, micro-interactions, and visual harmony.",
    },
    {
      name: "Cloud Architecture",
      slug: "cloud-architecture",
      description: "Distributed systems, serverless infrastructure, and cloud scale.",
    },
    {
      name: "Career Advice",
      slug: "career-advice",
      description: "Navigating senior tech careers, management, and developer growth.",
    },
  ];

  const categories: Record<string, { id: string; name: string; slug: string }> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categories[cat.slug] = record;
  }
  console.log(`✔ Seeded 5 Categories: ${Object.keys(categories).join(", ")}`);

  // 3. Seed Tags
  const tagsData = [
    { name: "Next.js", slug: "nextjs" },
    { name: "Tailwind CSS", slug: "tailwind-css" },
    { name: "React", slug: "react" },
    { name: "TypeScript", slug: "typescript" },
    { name: "Prisma", slug: "prisma" },
    { name: "AI", slug: "ai" },
    { name: "Design Systems", slug: "design-systems" },
    { name: "Productivity", slug: "productivity" },
  ];

  const tags: Record<string, { id: string; name: string; slug: string }> = {};
  for (const tag of tagsData) {
    const record = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
    tags[tag.slug] = record;
  }
  console.log(`✔ Seeded ${Object.keys(tags).length} Tags`);

  // 4. Seed 4 Rich Articles
  const postsData = [
    {
      title: "Building a Scalable Blog Platform with Next.js and Tailwind CSS",
      slug: "building-a-scalable-blog-platform-with-nextjs-and-tailwind-css",
      excerpt:
        "Learn how to build a modern, scalable blog platform using Next.js 15, TypeScript, and Tailwind CSS. We'll cover everything from architecture to deployment.",
      content: `<h2>Introduction</h2>
<p>Modern web applications demand both developer velocity and unmatched user experience. In this comprehensive guide, we explore building an enterprise-grade blog platform leveraging <strong>Next.js App Router</strong>, <strong>Tailwind CSS</strong>, and <strong>Prisma ORM</strong>.</p>
<h2>Key Architectural Decisions</h2>
<ul>
  <li><strong>Server Components</strong> for optimal SEO and initial bundle sizes.</li>
  <li><strong>Prisma ORM</strong> with SQLite/PostgreSQL for strongly-typed relational schemas.</li>
  <li><strong>Tailwind CSS</strong> for a streamlined 8pt design token hierarchy.</li>
</ul>
<h2>Conclusion</h2>
<p>By establishing clear architectural boundaries early, systems remain maintainable as user velocity scales.</p>`,
      coverImage:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      published: true,
      isFeatured: true,
      views: 1240,
      readingTime: "5 min read",
      authorId: jane.id,
      categoryId: categories["web-development"].id,
      tagSlugs: ["nextjs", "tailwind-css", "react", "typescript"],
    },
    {
      title: "The Future of AI in Web Development",
      slug: "the-future-of-ai-in-web-development",
      excerpt:
        "Artificial Intelligence is transforming how we build web applications. Here are the top 5 ways AI is changing the software landscape.",
      content: `<h2>The Paradigm Shift</h2>
<p>From autonomous coding agents to intelligent semantic search, artificial intelligence is reshaping engineering workflows.</p>
<h2>Top Innovations</h2>
<ol>
  <li>Agentic pair programming and automated QA verification.</li>
  <li>Real-time personalized content feeds and recommendations.</li>
  <li>AI-assisted design-to-code pipelines.</li>
</ol>`,
      coverImage:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      published: true,
      isFeatured: false,
      views: 890,
      readingTime: "7 min read",
      authorId: alex.id,
      categoryId: categories["ai-machine-learning"].id,
      tagSlugs: ["ai", "react", "nextjs"],
    },
    {
      title: "10 Productivity Tips for Developers",
      slug: "10-productivity-tips-for-developers",
      excerpt:
        "Boost your productivity and get more done in less time with these proven tips and architectural workflows.",
      content: `<h2>Focus & Deep Work</h2>
<p>Productivity is about eliminating friction and maximizing high-leverage engineering time.</p>
<h2>Essential Practices</h2>
<ul>
  <li>Automate repetitive checks with git hooks and CI workflows.</li>
  <li>Master keyboard navigation and command palettes (⌘K).</li>
  <li>Keep PRs small, focused, and backed by automated tests.</li>
</ul>`,
      coverImage:
        "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=1200&auto=format&fit=crop&q=80",
      published: true,
      isFeatured: false,
      views: 654,
      readingTime: "4 min read",
      authorId: admin.id,
      categoryId: categories["career-advice"].id,
      tagSlugs: ["productivity", "typescript"],
    },
    {
      title: "Design Systems 101: A Beginner's Guide",
      slug: "design-systems-101-a-beginners-guide",
      excerpt:
        "Understand the foundations of tokens, typography scales, spacing grids, and component reusability.",
      content: `<h2>What is a Design System?</h2>
<p>A design system is the single source of truth that unifies product teams around shared design tokens and components.</p>
<h2>Core Elements</h2>
<ul>
  <li><strong>Design Tokens:</strong> Defined values for color, font size, spacing, and radius.</li>
  <li><strong>Component Library:</strong> Accessible, composable UI primitives.</li>
  <li><strong>Documentation:</strong> Clear guidelines on usage and visual hierarchy.</li>
</ul>`,
      coverImage:
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
      published: true,
      isFeatured: false,
      views: 420,
      readingTime: "6 min read",
      authorId: jane.id,
      categoryId: categories["ui-ux-design"].id,
      tagSlugs: ["design-systems", "tailwind-css"],
    },
    {
      title: "Upcoming Architectural Preview (Draft)",
      slug: "upcoming-architectural-preview-draft",
      excerpt: "Internal preview of upcoming distributed database migrations and caching layers.",
      content: "<h2>Confidential Preview</h2><p>This article is currently an unpublished draft reserved for editorial review.</p>",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
      published: false,
      isFeatured: false,
      views: 0,
      readingTime: "3 min read",
      authorId: admin.id,
      categoryId: categories["cloud-architecture"].id,
      tagSlugs: ["typescript"],
    },
  ];

  for (const postItem of postsData) {
    const post = await prisma.post.upsert({
      where: { slug: postItem.slug },
      update: {
        title: postItem.title,
        excerpt: postItem.excerpt,
        content: postItem.content,
        coverImage: postItem.coverImage,
        published: postItem.published,
        isFeatured: postItem.isFeatured,
        views: postItem.views,
        readingTime: postItem.readingTime,
        authorId: postItem.authorId,
        categoryId: postItem.categoryId,
      },
      create: {
        title: postItem.title,
        slug: postItem.slug,
        excerpt: postItem.excerpt,
        content: postItem.content,
        coverImage: postItem.coverImage,
        published: postItem.published,
        isFeatured: postItem.isFeatured,
        views: postItem.views,
        readingTime: postItem.readingTime,
        authorId: postItem.authorId,
        categoryId: postItem.categoryId,
      },
    });

    // Link PostTags idempotently
    for (const tagSlug of postItem.tagSlugs) {
      const tagRecord = tags[tagSlug];
      if (tagRecord) {
        await prisma.postTag.upsert({
          where: {
            postId_tagId: {
              postId: post.id,
              tagId: tagRecord.id,
            },
          },
          update: {},
          create: {
            postId: post.id,
            tagId: tagRecord.id,
          },
        });
      }
    }

    // Seed Comments and Likes for the hero featured post
    if (postItem.isFeatured) {
      // Top-level comment
      const existingComment = await prisma.comment.findFirst({
        where: { postId: post.id, parentId: null },
      });

      let topCommentId = existingComment?.id;
      if (!existingComment) {
        const comment = await prisma.comment.create({
          data: {
            content: "Phenomenal article! The architectural breakdown is crisp and practical.",
            postId: post.id,
            authorId: alex.id,
          },
        });
        topCommentId = comment.id;

        // Nested reply (2-level comment thread)
        await prisma.comment.create({
          data: {
            content: "Completely agree, especially the emphasis on type-safe cascading relations.",
            postId: post.id,
            authorId: admin.id,
            parentId: topCommentId,
          },
        });
      }

      // Seed Likes idempotently
      await prisma.like.upsert({
        where: {
          postId_userId: {
            postId: post.id,
            userId: alex.id,
          },
        },
        update: {},
        create: {
          postId: post.id,
          userId: alex.id,
        },
      });

      await prisma.like.upsert({
        where: {
          postId_userId: {
            postId: post.id,
            userId: admin.id,
          },
        },
        update: {},
        create: {
          postId: post.id,
          userId: admin.id,
        },
      });
    }

    console.log(`✔ Seeded Post: "${post.title}" with category & tags`);
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
