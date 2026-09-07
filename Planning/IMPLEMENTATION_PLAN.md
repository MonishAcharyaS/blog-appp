# Full-Stack Multi-Author Blog Platform — Implementation Plan

A modern, production-grade blog platform built with **Next.js (App Router)**, **React**, **Tailwind CSS v3.4**, **Prisma ORM**, and **NextAuth.js (Auth.js)**. The application features a 3-tier role-based access control architecture, rich WYSIWYG content authoring, nested comment discussions, reader engagement, real-time discovery, a comprehensive `/admin` management suite, and full dark/light mode aesthetics.

---

## 1. System Requirements & User Tiers

### 1.1 Role-Based Access Control (RBAC)

1. **Administrator (`ADMIN`)**:
   - **Full access** to the entire application.
   - **Blog Management**: Create, edit, delete, publish/unpublish, and feature any blog post.
   - **Comment Moderation**: Delete or moderate any comment or reply across all blogs.
   - **User Management**: View all registered users, toggle ban status, and manage user roles.
   - **Admin Analytics**: View total views, posts, likes, comments, and registered users.
   - **Override Rights**: Override any restriction placed on regular users.

2. **Registered Reader (`READER`)**:
   - **Standard access** upon registration/login.
   - Browse and read all published blogs.
   - Like / unlike blog posts (persisted per user).
   - Post top-level comments and 2-level nested replies to comments.
   - Edit or delete their own comments and replies.
   - Manage their user profile.

3. **Anonymous Visitor (`VISITOR`)**:
   - **Read-only access**.
   - Browse published blogs, search by keywords, filter by category/tags.
   - Read full blog articles and view existing comments and like counts.
   - Prompted to Sign In / Sign Up when clicking like, comment, or reply buttons.

---

## 2. Technology Stack & Architecture

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 14/15 (App Router) | React Server Components, Client Components, Server Actions & API Routes |
| **Styling** | Tailwind CSS v3.4 | Custom theme tokens, `@tailwindcss/typography`, `@tailwindcss/forms` |
| **UI Aesthetics** | Modern Sleek Editorial | Dark/Light mode toggle, glassmorphism header, curated indigo/violet accents |
| **Database & ORM** | PostgreSQL with Prisma ORM | Relational schema, migrations, type-safe queries, SQLite local dev support |
| **Authentication** | NextAuth.js (Auth.js) | Credentials Provider (email + bcrypt), JWT session callbacks with `role` & `isBanned` |
| **Rich Text Editor** | TipTap WYSIWYG | Headings, lists, code blocks, blockquotes, links, and image embedding |
| **Media Handling** | Hybrid Image Uploads | Local static file serving in dev (`/public/uploads/`) + direct image URL / Unsplash pasting |
| **Deployment Target**| Vercel | Seamless serverless deployment with Neon / Supabase / Vercel Postgres support |

---

## 3. Database Schema Design (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql" // or "sqlite" for offline local dev
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  READER
}

model User {
  id           String    @id @default(cuid())
  name         String?
  email        String    @unique
  passwordHash String
  role         Role      @default(READER)
  bio          String?
  image        String?
  isBanned     Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  posts        Post[]
  comments     Comment[]
  likes        Like[]
}

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  posts       Post[]
  createdAt   DateTime @default(now())
}

model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  posts     PostTag[]
  createdAt DateTime  @default(now())
}

model Post {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  excerpt     String
  content     String    // HTML or rich text from TipTap
  coverImage  String?
  published   Boolean   @default(false)
  isFeatured  Boolean   @default(false)
  views       Int       @default(0)
  readingTime String    @default("3 min read")
  authorId    String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  tags        PostTag[]
  comments    Comment[]
  likes       Like[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([slug])
  @@index([published])
}

model PostTag {
  postId String
  tagId  String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}

model Comment {
  id        String    @id @default(cuid())
  content   String
  postId    String
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parentId  String?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("CommentReplies")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([postId])
  @@index([parentId])
}

model Like {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([postId, userId])
}
```

---

## 4. Key Modules & Implementation Steps

### Phase 1: Project Setup & Database Foundations
1. Initialize Next.js project with TypeScript and Tailwind CSS v3.4 (`@tailwindcss/typography`, `@tailwindcss/forms`).
2. Configure Prisma client and create schema models for Users, Posts, Categories, Tags, Comments, and Likes.
3. Build the automated database seed script (`prisma/seed.ts`) creating:
   - **Default Admin**: `admin@example.com` / `Admin123!`
   - **Sample Readers**: `jane@example.com`, `alex@example.com`
   - **Categories & Tags**: Tech, AI, Design, Cloud, Career
   - **Starter Articles**: High-quality posts with rich text, images, tags, comments, and likes.

### Phase 2: Authentication & Route Security
1. Set up **NextAuth.js** with CredentialsProvider and bcrypt password verification.
2. Implement custom session and JWT callbacks that inject `user.role`, `user.id`, and `user.isBanned`.
3. Create Next.js `middleware.ts` to protect `/admin` and `/api/admin/*` routes strictly for `role === 'ADMIN'`.
4. Build sign-in (`/login`) and sign-up (`/register`) pages with validation and smooth UI states.

### Phase 3: Core UI, Theme & Public Discovery
1. Implement responsive **Navbar** with glassmorphism, category links, dark/light theme toggle, and user account dropdown.
2. Build the **Homepage (`/`)**:
   - **Featured Hero Banner**: Spotlight the pinned/featured article with gradient badge.
   - **Live Search & Filter Bar**: Instant search with debounce by title/content, category pills, and sort dropdown (Latest, Most Liked, Most Viewed).
   - **Blog Card Grid**: Cover image, title, excerpt, reading time, author, date, and live like counts.
   - **Pagination / Load More**.
3. Implement modern **Footer** with newsletter subscription, social links, and categories.

### Phase 4: Article Reading & Reader Engagement
1. Build the **Single Blog Page (`/blog/[slug]`)**:
   - Full SEO metadata (OpenGraph tags, title, description).
   - Dynamic view counter increment.
   - Rich typography rendering via Tailwind `@tailwindcss/typography` (`prose prose-indigo dark:prose-invert`).
   - Author bio box and estimated reading time.
   - **Social Share Widget**: Twitter/X, LinkedIn, and copy link to clipboard with toast alert.
2. **Interactive Like System**:
   - Live optimistic like/unlike toggle with animated heart icon.
   - Prompts unauthenticated visitors to sign in.
3. **Nested 2-Level Comment Section**:
   - Root comment submission form for logged-in readers.
   - Parent comments with indentation and direct reply button.
   - Inline reply submission box.
   - Edit and delete controls for comment owners and Admins.
   - Anonymous visitor login prompt.

### Phase 5: TipTap WYSIWYG Content Authoring
1. Build TipTap WYSIWYG Editor component (`RichTextEditor.tsx`):
   - Formatting toolbar: Bold, Italic, Strikethrough, Code, Headings (H1-H3), Lists (bulleted/numbered), Blockquotes, Code Blocks, and Links.
   - Image insert modal (upload file or paste URL).
   - Placeholder text and character count.
2. Build file upload API endpoint (`/api/upload`) supporting direct image uploads saved to public storage.

### Phase 6: Comprehensive Admin Suite (`/admin`)
1. **Admin Layout (`/admin/layout.tsx`)**: Sidebar navigation, active links, quick stats link, and "Back to Website" button.
2. **Admin Dashboard Overview (`/admin/page.tsx`)**:
   - KPI metric cards: Total Articles, Published vs Drafts, Total Views, Total Likes, Total Comments, Total Users.
   - Quick action shortcuts (New Post, Moderate Comments).
3. **Post Management (`/admin/posts/page.tsx`)**:
   - Data table with search, category filter, published/draft status badges, feature toggle, view count, edit and delete actions.
4. **Create & Edit Post Pages (`/admin/posts/new`, `/admin/posts/[id]/edit`)**:
   - Title, slug auto-generation, category selection, tag input, cover image uploader, TipTap rich editor, draft/published toggle, and featured toggle.
5. **Global Comment Moderation (`/admin/comments/page.tsx`)**:
   - Table of all comments across every post with author details, post link, comment excerpt, and single-click delete action.
6. **User Management (`/admin/users/page.tsx`)**:
   - Table of registered users, roles, comment counts, join date, ban/unban toggle, and role change controls.

---

## 5. Verification & Testing Strategy

- **Build & TypeScript Validation**: Run `npm run build` to confirm zero compilation or lint errors.
- **Database Validation**: Verify seed execution (`npx prisma db seed`) and schema relationships.
- **Role & Access Validation**:
  - Unauthenticated visitor cannot access `/admin` or submit comments/likes.
  - Reader can like, comment, reply, edit/delete own comments, but cannot access `/admin`.
  - Admin has full access to `/admin`, create/edit/delete posts, and moderate any comment.
- **WYSIWYG & Upload Validation**: Test creating an article with formatted headings, lists, code blocks, and cover image.
- **Theme Validation**: Verify dark and light modes across all public and admin screens.
