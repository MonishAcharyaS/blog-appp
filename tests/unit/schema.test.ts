import { prisma } from "../../src/lib/prisma";

async function runTests() {
  console.log("=== Starting Schema & Database Unit / Integration Tests ===");

  try {
    // Clean up test records
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.postTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // TC-101.1 & TC-101.2: Verify model generation and entity creation
    console.log("Testing TC-101.1 & TC-101.2: Entity creation and strong typing...");
    const user = await prisma.user.create({
      data: {
        name: "Test Admin",
        email: "admin@blogify.com",
        passwordHash: "$2b$10$epGk0.u/qX.1Z23456789O",
        role: "ADMIN",
        bio: "Senior System Architect",
      },
    });
    console.log("✔ Created user:", user.id, user.role);

    const category = await prisma.category.create({
      data: {
        name: "Engineering",
        slug: "engineering",
        description: "Technical deep dives and architecture",
      },
    });
    console.log("✔ Created category:", category.slug);

    const tag1 = await prisma.tag.create({
      data: { name: "Next.js", slug: "nextjs" },
    });
    const tag2 = await prisma.tag.create({
      data: { name: "Prisma", slug: "prisma" },
    });

    const post = await prisma.post.create({
      data: {
        title: "Building Scalable Systems with Prisma",
        slug: "building-scalable-systems-with-prisma",
        excerpt: "An architectural guide to relational data modeling.",
        content: "<p>Deep dive into schema design, indexes, and cascades.</p>",
        published: true,
        isFeatured: true,
        readingTime: "5 min read",
        authorId: user.id,
        categoryId: category.id,
        tags: {
          create: [{ tagId: tag1.id }, { tagId: tag2.id }],
        },
      },
      include: {
        tags: true,
        category: true,
        author: true,
      },
    });
    console.log("✔ Created post with tags and category:", post.title);

    // Create 2-level comment thread
    const topComment = await prisma.comment.create({
      data: {
        content: "Outstanding article! The cascade design is crisp.",
        postId: post.id,
        authorId: user.id,
      },
    });

    const replyComment = await prisma.comment.create({
      data: {
        content: "Agreed, great insight on composite unique indexes.",
        postId: post.id,
        authorId: user.id,
        parentId: topComment.id,
      },
    });
    console.log("✔ Created nested comments:", topComment.id, "-> reply:", replyComment.id);

    // Create Like
    const like = await prisma.like.create({
      data: {
        postId: post.id,
        userId: user.id,
      },
    });
    console.log("✔ Created like:", like.id);

    // TC-101.4: Negative Test - Duplicate email throws unique constraint violation
    console.log("Testing TC-101.4: Duplicate email unique constraint...");
    let duplicateEmailFailed = false;
    try {
      await prisma.user.create({
        data: {
          name: "Imposter User",
          email: "admin@blogify.com",
          passwordHash: "dummyHash",
        },
      });
    } catch (error: unknown) {
      const isPrismaError =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002";
      if (isPrismaError || String(error).includes("Unique constraint")) {
        duplicateEmailFailed = true;
        console.log("✔ Caught expected unique constraint violation on duplicate email.");
      } else {
        throw error;
      }
    }
    if (!duplicateEmailFailed) {
      throw new Error("FAILED: TC-101.4 Duplicate email did NOT throw unique constraint violation!");
    }

    // TC-101.5: Negative Test - Duplicate [postId, userId] in Like throws error
    console.log("Testing TC-101.5: Duplicate compound [postId, userId] Like constraint...");
    let duplicateLikeFailed = false;
    try {
      await prisma.like.create({
        data: {
          postId: post.id,
          userId: user.id,
        },
      });
    } catch (error: unknown) {
      const isPrismaError =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002";
      if (isPrismaError || String(error).includes("Unique constraint")) {
        duplicateLikeFailed = true;
        console.log("✔ Caught expected unique constraint violation on duplicate Like [postId, userId].");
      } else {
        throw error;
      }
    }
    if (!duplicateLikeFailed) {
      throw new Error("FAILED: TC-101.5 Duplicate like did NOT throw unique constraint violation!");
    }

    // TC-101.3: Positive Test - Post deletion cascades to comments, tags, and likes
    console.log("Testing TC-101.3: Post deletion cascade verification...");
    await prisma.post.delete({
      where: { id: post.id },
    });

    const remainingComments = await prisma.comment.count({ where: { postId: post.id } });
    const remainingPostTags = await prisma.postTag.count({ where: { postId: post.id } });
    const remainingLikes = await prisma.like.count({ where: { postId: post.id } });

    if (remainingComments !== 0 || remainingPostTags !== 0 || remainingLikes !== 0) {
      throw new Error(
        `FAILED: TC-101.3 Cascade failed! Remaining comments: ${remainingComments}, postTags: ${remainingPostTags}, likes: ${remainingLikes}`
      );
    }
    console.log("✔ Cascade verified! Comments, postTags, and likes cleanly deleted with Post.");

    console.log("\n========================================================");
    console.log(" ALL UNIT & INTEGRATION TEST CASES (TC-101.1 - 101.5) PASSED!");
    console.log("========================================================\n");
  } catch (err) {
    console.error("Test Suite Failure:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
