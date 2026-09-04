# ==============================================================================
# GitHub Issues Automation Script (PowerShell)
# Raised by: Senior Project Manager (25 YOE) & 3 Engineering Subagents
# Target: Blog Application Repository
# ==============================================================================

Write-Host ">>> Checking GitHub CLI authentication..." -ForegroundColor Cyan

# Check if authenticated
$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: You are not currently logged into GitHub CLI." -ForegroundColor Yellow
    Write-Host "Please run 'gh auth login' first, then re-run this script." -ForegroundColor Yellow
    Write-Host "If you don't have a remote repo yet, run: gh repo create blog-application --public --source=. --remote=origin" -ForegroundColor Yellow
    exit 1
}

Write-Host ">>> Creating GitHub Labels..." -ForegroundColor Cyan

$labels = @(
    @{ name = "user story"; color = "0E8A16"; description = "User-centric feature requirements" },
    @{ name = "frontend"; color = "1D76DB"; description = "UI, Client Components, and Styling" },
    @{ name = "backend"; color = "5319E7"; description = "Server, Database, API, and Auth" },
    @{ name = "enhancement"; color = "A2EEEF"; description = "New feature or functional enhancement" },
    @{ name = "bug"; color = "D93F0B"; description = "Defect, regression, or failure" },
    @{ name = "security"; color = "B60205"; description = "Security, RBAC, and Sanitization" },
    @{ name = "qa"; color = "FBCA04"; description = "Quality Assurance & Test Automation" },
    @{ name = "devops"; color = "0052CC"; description = "CI/CD, Build, and Deployment" },
    @{ name = "p0"; color = "B60205"; description = "Highest priority - Blocker" },
    @{ name = "p1"; color = "D93F0B"; description = "High priority" },
    @{ name = "p2"; color = "FBCA04"; description = "Medium priority" }
)

foreach ($lbl in $labels) {
    gh label create $lbl.name --color $lbl.color --description $lbl.description --force 2>$null
}

Write-Host ">>> Labels initialized successfully." -ForegroundColor Green
Write-Host ">>> Raising Sprint Tickets on GitHub..." -ForegroundColor Cyan

$issues = @(
    # Sprint 1
    @{
        title = "[PROJ-101] Database Schema Design & Prisma Setup"
        body = "## User Story`nAs a System Architect, I want a complete relational schema for Users, Posts, Categories, Tags, Comments, and Likes, so that all core entities and relationships are modeled with type safety.`n`n## Summary`nConfigure schema.prisma with User, Post, Category, Tag, Comment, and Like models.`n`n## Positive Test Cases`n- npx prisma validate passes with 0 errors.`n- Prisma client generates strongly typed models.`n- Post deletion cascades to comments, tags, and likes.`n`n## Negative Test Cases`n- Duplicate email on User throws unique constraint violation (P2002).`n- Duplicate [postId, userId] in Like throws error.`n`n## Definition of Done`n- schema.prisma validated, client generated, foreign keys verified."
        labels = "backend,user story,p0"
    },
    @{
        title = "[PROJ-102] Automated Database Seed Script"
        body = "## User Story`nAs a Developer or QA Engineer, I want an automated seed script that creates a default Admin, sample readers, categories, and populated blog posts.`n`n## Summary`nCreate prisma/seed.ts with Admin (admin@example.com / Admin123!), sample readers, 5 categories, and 4 high-quality rich articles.`n`n## Positive Test Cases`n- npx prisma db seed exits with code 0.`n- Admin and Readers created with bcrypt hashes.`n- Posts linked to categories and tags.`n`n## Negative Test Cases`n- Running seed multiple times is idempotent and does not fail on unique collisions.`n`n## Definition of Done`n- prisma db seed runs cleanly and populates all testable data."
        labels = "backend,enhancement,p1"
    },
    @{
        title = "[PROJ-103] NextAuth & Password Hashing with Bcrypt"
        body = "## User Story`nAs a Registered User or Admin, I want to securely log in with my email and password, so that I receive an authenticated session with my role and user ID.`n`n## Summary`nImplement NextAuth in src/lib/auth.ts with CredentialsProvider, bcrypt compare, and session/jwt callbacks injecting role, id, isBanned.`n`n## Positive Test Cases`n- Valid admin credentials return session with role: 'ADMIN'.`n- Valid reader credentials return session with role: 'READER'.`n- Client getSession() exposes user details.`n`n## Negative Test Cases`n- Unregistered email returns authorization error.`n- Incorrect password returns CredentialsSignin error.`n- Banned user login returns Account suspended error.`n`n## Definition of Done`n- Bcrypt salt rounds >= 10, HttpOnly session cookies."
        labels = "backend,security,user story,p0"
    },
    @{
        title = "[PROJ-104] RBAC Edge Middleware & Route Guards"
        body = "## User Story`nAs a System Administrator, I want non-admin users and anonymous visitors blocked from accessing /admin pages and admin APIs.`n`n## Summary`nCreate src/middleware.ts using NextAuth JWT verification to protect /admin and /api/admin paths.`n`n## Positive Test Cases`n- Admin user accesses /admin successfully (HTTP 200).`n- Anonymous visitor accesses public routes smoothly.`n`n## Negative Test Cases`n- Anonymous visitor navigating to /admin is redirected to /login.`n- Reader navigating to /admin is redirected to / with error.`n- Non-admin calling /api/admin returns HTTP 403.`n`n## Definition of Done`n- Edge middleware verified for all administrative routes."
        labels = "backend,security,p0"
    },
    @{
        title = "[PROJ-105] User Registration & Login UI Screens"
        body = "## User Story`nAs a Visitor, I want a clean, modern registration and login screen, so that I can create an account and sign into the platform effortlessly.`n`n## Summary`nBuild /login and /register pages with validation, error toasts, and auto-redirect.`n`n## Positive Test Cases`n- Registering new account creates READER user and redirects smoothly.`n- Logging in with new credentials updates Navbar session state.`n`n## Negative Test Cases`n- Invalid email format displays inline error.`n- Password under 6 characters displays validation warning.`n- Duplicate email displays 'Email already registered'.`n`n## Definition of Done`n- Forms responsive, accessible, dark/light mode supported."
        labels = "frontend,user story,p1"
    },
    # Sprint 2
    @{
        title = "[PROJ-201] Design System, CSS Tokens & Dark/Light Mode Switcher"
        body = "## User Story`nAs a Reader or Admin, I want a modern dark and light mode toggle that remembers my preference.`n`n## Summary`nConfigure tailwind.config.js with darkMode: 'class', CSS variables in globals.css, and ThemeToggle.tsx.`n`n## Positive Test Cases`n- Clicking toggle switches sun/moon and toggles theme.`n- Reloading page retains chosen theme.`n- Prefers-color-scheme respected on first visit.`n`n## Negative Test Cases`n- Disabling JS retains clean light default without crash.`n`n## Definition of Done`n- Tested across viewports; color contrast passes WCAG AA."
        labels = "frontend,enhancement,p1"
    },
    @{
        title = "[PROJ-202] Public Navigation & Footer Components"
        body = "## User Story`nAs a Visitor, I want a glassmorphic top navigation bar and informative footer.`n`n## Summary`nBuild Navbar.tsx with active links, search shortcut, ThemeToggle, user avatar dropdown, and Footer.tsx with newsletter and links.`n`n## Positive Test Cases`n- Visitor sees Sign In / Get Started.`n- Reader sees profile and Sign Out.`n- Admin sees Admin Dashboard badge.`n- Mobile view collapses into responsive drawer.`n`n## Negative Test Cases`n- Rapid clicking menu toggle maintains consistent state.`n`n## Definition of Done`n- Backdrop blur smooth; links valid; mobile accessible."
        labels = "frontend,enhancement,p2"
    },
    @{
        title = "[PROJ-203] Public Discovery Hub (Featured Hero, Debounced Search, Category Filter)"
        body = "## User Story`nAs a Reader, I want to view a featured hero article, search posts in real time, and filter by categories and sort criteria.`n`n## Summary`nBuild FeaturedHero.tsx, SearchBar.tsx with 300ms debounce, category pills, sort dropdown, and BlogCard.tsx grid.`n`n## Positive Test Cases`n- Search keyword filters posts in real time.`n- Category click displays only matching posts.`n- Sort by Most Liked sorts accurately.`n`n## Negative Test Cases`n- No matches displays friendly empty state.`n- Special characters in search are sanitized.`n`n## Definition of Done`n- Debounced search smooth; zero UI lag; pagination works."
        labels = "frontend,user story,p0"
    },
    @{
        title = "[PROJ-204] TipTap WYSIWYG Editor Component with Formatting Toolbar"
        body = "## User Story`nAs an Author / Admin, I want a rich WYSIWYG editor with headings, lists, code blocks, blockquotes, and image embedding.`n`n## Summary`nImplement RichTextEditor.tsx with TipTap starter kit, image/link extensions, formatting toolbar, and word count.`n`n## Positive Test Cases`n- Typing and formatting with H1, bold, list outputs clean HTML.`n- Inserting link wraps in <a> with noopener.`n- Inserting image URL or uploaded file embeds image.`n`n## Negative Test Cases`n- Malicious script tags are sanitized.`n- Submitting empty editor prompts validation error.`n`n## Definition of Done`n- Output HTML sanitized; rendered preview matches article."
        labels = "frontend,enhancement,user story,p0"
    },
    @{
        title = "[PROJ-205] Multipart File & Cover Image Upload API Pipeline"
        body = "## User Story`nAs an Author / Admin, I want to upload image files for blog covers and article content.`n`n## Summary`nBuild /api/upload endpoint accepting multipart form data, validating mime/size (<= 5MB), and saving to public/uploads.`n`n## Positive Test Cases`n- Uploading 2MB PNG returns 200 with image URL.`n- Requesting image URL serves image correctly.`n`n## Negative Test Cases`n- File over 5MB returns 400 error.`n- Non-image files (.exe, .js) return 400 invalid type.`n- Unauthenticated upload request returns 401.`n`n## Definition of Done`n- File validation, storage, and URL generation verified."
        labels = "backend,enhancement,p1"
    },
    # Sprint 3
    @{
        title = "[PROJ-301] Single Blog Article Page with Dynamic Typography & SEO Metadata"
        body = "## User Story`nAs a Reader or Visitor, I want to read a full article with beautiful typography, author details, reading time, and social share buttons.`n`n## Summary`nBuild /blog/[slug] with Next.js metadata, view count increment, Tailwind typography, author bio, and share buttons.`n`n## Positive Test Cases`n- Visiting /blog/valid-slug displays full post and bio.`n- View counter increments by 1.`n- HTML head contains OpenGraph tags.`n`n## Negative Test Cases`n- Invalid slug returns 404 page.`n- Draft post returns 404 for non-admins.`n`n## Definition of Done`n- Typography looks great in dark and light mode; SEO meta tags verified."
        labels = "frontend,user story,p0"
    },
    @{
        title = "[PROJ-302] Interactive Like/Heart System with Optimistic UI"
        body = "## User Story`nAs a Registered Reader, I want to like or unlike an article with a single click.`n`n## Summary`nAPI POST /api/posts/[id]/like and client LikeButton.tsx with optimistic update and heart animation.`n`n## Positive Test Cases`n- Logged-in reader clicks like: heart fills and count increments.`n- Clicking again unlikes: heart outlines and count decrements.`n- Reloading retains liked status.`n`n## Negative Test Cases`n- Anonymous click prompts login modal/toast without incrementing.`n- Network failure reverts optimistic state.`n`n## Definition of Done`n- Compound unique constraint enforced; optimistic UI transitions smooth."
        labels = "frontend,backend,user story,p1"
    },
    @{
        title = "[PROJ-303] 2-Level Nested Comment & Reply Thread Engine"
        body = "## User Story`nAs a Reader, I want to post comments and reply directly to other readers' comments, and edit or delete my own remarks.`n`n## Summary`nBuild CommentSection.tsx, CommentItem.tsx, and comment CRUD APIs with 2-level nesting hierarchy.`n`n## Positive Test Cases`n- Registered reader posts top-level comment.`n- Reader clicks reply: nested reply displays indented.`n- Comment author edits comment: updates with (edited) badge.`n- Comment author deletes comment: removed from thread.`n`n## Negative Test Cases`n- Anonymous visitor prompted to sign in.`n- User A editing User B's comment returns 403 Forbidden.`n- Admin can delete any comment.`n- Nesting beyond 2 levels is flattened.`n`n## Definition of Done`n- 2-level hierarchy tested; ownership permissions verified; XSS prevented."
        labels = "frontend,backend,user story,p0"
    },
    @{
        title = "[PROJ-304] Social Sharing & Dynamic Reading Time Indicator"
        body = "## User Story`nAs a Reader, I want quick share buttons (Twitter/X, LinkedIn, Copy Link) and a reading time estimate.`n`n## Summary`nBuild ShareButtons.tsx with Twitter intent, LinkedIn share, and clipboard copy with toast, plus reading time calculation.`n`n## Positive Test Cases`n- Copy link copies URL to clipboard with toast notification.`n- Share on X opens Twitter intent with post title and link.`n- Reading time calculated accurately.`n`n## Negative Test Cases`n- Fallback for browsers without clipboard API.`n`n## Definition of Done`n- Share URLs tested; copy toast dismisses after 2.5s."
        labels = "frontend,enhancement,p2"
    },
    # Sprint 4
    @{
        title = "[PROJ-401] Admin Dashboard Layout & Metric Overview Cards"
        body = "## User Story`nAs an Administrator, I want an overview dashboard displaying high-level platform metrics.`n`n## Summary`nBuild /admin layout and page with KPI cards (Articles, Published, Views, Likes, Comments, Users) and recent activity.`n`n## Positive Test Cases`n- Admin logs in: all 6 KPI cards show accurate DB counts.`n- Sidebar navigation highlights active route.`n- Return to website link works.`n`n## Negative Test Cases`n- Non-admin blocked by middleware.`n`n## Definition of Done`n- Metrics computed with efficient database aggregations."
        labels = "frontend,backend,user story,p1"
    },
    @{
        title = "[PROJ-402] Admin Post Management, Publishing & Feature Controls"
        body = "## User Story`nAs an Administrator, I want to manage all articles (create, edit, delete, publish/draft toggle, feature toggle).`n`n## Summary`nData table at /admin/posts with status filter, publish/featured toggles, delete confirmation, and create/edit post screens.`n`n## Positive Test Cases`n- Admin creates post: saves and redirects to posts list.`n- Toggling publish instantly updates status and public visibility.`n- Toggling featured updates hero banner.`n- Deleting post removes it from DB and public view.`n`n## Negative Test Cases`n- Submitting without title displays error.`n- Duplicate slug appends unique suffix.`n`n## Definition of Done`n- Full CRUD functional; optimistic UI for toggles; delete modal safe."
        labels = "frontend,backend,user story,p0"
    },
    @{
        title = "[PROJ-403] Global Comment Moderation Suite"
        body = "## User Story`nAs an Administrator, I want a central table of all comments across all blog posts with one-click deletion.`n`n## Summary`nBuild /admin/comments listing all comments/replies with post link, author info, and one-click delete.`n`n## Positive Test Cases`n- Lists all comments chronologically.`n- Post title link navigates directly to blog post.`n- Admin delete removes comment from DB and post page.`n`n## Negative Test Cases`n- Non-admin calling delete API returns 403.`n`n## Definition of Done`n- Moderation table tested; deletion cascades properly."
        labels = "frontend,backend,user story,p1"
    },
    @{
        title = "[PROJ-404] User Management, Ban/Unban & Role Control"
        body = "## User Story`nAs an Administrator, I want to inspect all registered users, toggle their ban status, and promote/demote roles.`n`n## Summary`nBuild /admin/users and PATCH /api/admin/users/[id] to toggle isBanned and change roles.`n`n## Positive Test Cases`n- Admin bans user: status updates to Banned.`n- Admin promotes user to ADMIN: user gains /admin access.`n`n## Negative Test Cases`n- Banned user login fails with Account suspended.`n- Admin cannot ban their own account.`n`n## Definition of Done`n- Self-lockout prevented; ban status invalidates session immediately."
        labels = "frontend,backend,security,p1"
    },
    @{
        title = "[PROJ-405] End-to-End Test Automation, Security Audit & CI/CD Deployment Pipeline"
        body = "## User Story`nAs a DevOps & Release Lead, I want a complete automated verification suite, GitHub Actions CI workflow, and Vercel deployment configuration.`n`n## Summary`nConfigure GitHub Actions CI, execute XSS security audits, Lighthouse audit (target 90+), and prepare Vercel deployment.`n`n## Positive Test Cases`n- npm run build completes with 0 errors.`n- GitHub Actions CI workflow passes.`n- Vercel deployment succeeds.`n`n## Negative Test Cases`n- Broken TypeScript or import fails CI build and prevents deployment.`n`n## Definition of Done`n- Production build green; security audit clean; deployment docs ready."
        labels = "devops,qa,security,p0"
    )
)

$count = 0
foreach ($issue in $issues) {
    $count++
    Write-Host "[$count/19] Creating: $($issue.title)" -ForegroundColor Yellow
    gh issue create --title $issue.title --body $issue.body --label $issue.labels
}

Write-Host ">>> ALL 19 TICKETS RAISED SUCCESSFULLY ON GITHUB!" -ForegroundColor Green
