import { prisma } from "../../src/lib/prisma";
import bcrypt from "bcryptjs";

async function runSeedTests() {
  console.log("=== Starting Automated Seed Script Integration Tests ===");

  try {
    // TC-102.2: Verify Admin exists with correct role and valid bcrypt password hash
    console.log("Testing TC-102.2: Verifying Admin credentials & bcrypt hash...");
    const admin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (!admin) {
      throw new Error("FAILED: Admin user admin@example.com was not found!");
    }
    if (admin.role !== "ADMIN") {
      throw new Error(`FAILED: Admin role is ${admin.role}, expected 'ADMIN'!`);
    }

    const isPasswordValid = await bcrypt.compare("Admin123!", admin.passwordHash || "");
    if (!isPasswordValid) {
      throw new Error("FAILED: Bcrypt compare failed for Admin123!! Hash is invalid.");
    }
    console.log("✔ Admin user validated with role ADMIN and confirmed bcrypt hash.");

    // Verify Sample Readers
    const readers = await prisma.user.findMany({
      where: { role: "READER" },
    });
    if (readers.length < 2) {
      throw new Error(`FAILED: Expected at least 2 readers, found ${readers.length}!`);
    }
    for (const reader of readers) {
      const isReaderPasswordValid = await bcrypt.compare("Reader123!", reader.passwordHash || "");
      if (!isReaderPasswordValid) {
        throw new Error(`FAILED: Reader ${reader.email} has invalid password hash.`);
      }
    }
    console.log(`✔ Verified ${readers.length} readers with valid bcrypt passwords.`);

    // TC-102.3: Verify 5 Categories exist
    const categories = await prisma.category.findMany();
    if (categories.length !== 5) {
      throw new Error(`FAILED: Expected 5 categories, found ${categories.length}!`);
    }
    console.log(`✔ Verified 5 categories: ${categories.map((c) => c.slug).join(", ")}`);

    // Verify 4 Published Posts with tags and categories
    console.log("Testing TC-102.3: Verifying 4 published posts with tags & relationships...");
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: true,
        likes: true,
      },
    });

    if (posts.length !== 4) {
      throw new Error(`FAILED: Expected 4 published posts, found ${posts.length}!`);
    }

    for (const post of posts) {
      if (!post.category) {
        throw new Error(`FAILED: Post "${post.title}" is missing category link!`);
      }
      if (post.tags.length === 0) {
        throw new Error(`FAILED: Post "${post.title}" has no tags linked!`);
      }
      if (!post.coverImage || !post.readingTime) {
        throw new Error(`FAILED: Post "${post.title}" missing coverImage or readingTime!`);
      }
    }
    console.log("✔ Verified 4 published posts with full relational attachments.");

    // Verify featured post comments and likes
    const featuredPost = posts.find((p) => p.isFeatured);
    if (!featuredPost) {
      throw new Error("FAILED: Expected at least 1 featured post!");
    }
    if (featuredPost.comments.length < 2) {
      throw new Error(`FAILED: Featured post expected at least 2 comments, found ${featuredPost.comments.length}`);
    }
    if (featuredPost.likes.length < 2) {
      throw new Error(`FAILED: Featured post expected at least 2 likes, found ${featuredPost.likes.length}`);
    }
    console.log(`✔ Verified featured post comments (${featuredPost.comments.length}) and likes (${featuredPost.likes.length}).`);

    console.log("\n========================================================");
    console.log(" ALL SEED INTEGRATION TEST CASES (TC-102.1 - 102.4) PASSED!");
    console.log("========================================================\n");
  } catch (error) {
    console.error("Test Suite Failure:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSeedTests();
