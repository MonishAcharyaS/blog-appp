import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_presentation(output_path):
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Palette
    C_BG_DARK = RGBColor(15, 23, 42)       # Slate 900
    C_BG_LIGHT = RGBColor(248, 250, 252)   # Slate 50
    C_CARD_DARK = RGBColor(30, 41, 59)     # Slate 800
    C_CARD_LIGHT = RGBColor(255, 255, 255) # Pure White
    C_BORDER_LIGHT = RGBColor(226, 232, 240)
    C_BORDER_DARK = RGBColor(51, 65, 85)
    
    C_PRIMARY = RGBColor(79, 70, 229)      # Indigo 600
    C_PRIMARY_LIGHT = RGBColor(99, 102, 241)# Indigo 500
    C_CYAN = RGBColor(14, 165, 233)        # Sky 500
    C_EMERALD = RGBColor(16, 185, 129)     # Emerald 500
    C_AMBER = RGBColor(245, 158, 11)       # Amber 500
    C_PURPLE = RGBColor(168, 85, 247)      # Purple 500
    C_ROSE = RGBColor(244, 63, 94)         # Rose 500

    C_TEXT_DARK = RGBColor(15, 23, 42)     # High contrast dark text
    C_TEXT_MUTED = RGBColor(100, 116, 139) # Muted slate text
    C_TEXT_WHITE = RGBColor(255, 255, 255) # White text
    C_TEXT_LIGHT_MUTED = RGBColor(203, 213, 225) # Slate 300

    FONT_FAMILY = "Calibri"

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, tag_text, title_text, subtitle_text=None, is_dark=False):
        # Category Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.7), Inches(0.35))
        tf = tag_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = tag_text.upper()
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.name = FONT_FAMILY
        p.font.color.rgb = C_CYAN if is_dark else C_PRIMARY

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.7))
        tf2 = title_box.text_frame
        tf2.word_wrap = True
        tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0
        p2 = tf2.paragraphs[0]
        p2.text = title_text
        p2.font.size = Pt(22)
        p2.font.bold = True
        p2.font.name = FONT_FAMILY
        p2.font.color.rgb = C_TEXT_WHITE if is_dark else C_TEXT_DARK

        # Optional Subtitle
        if subtitle_text:
            p2_sub = tf2.add_paragraph()
            p2_sub.text = subtitle_text
            p2_sub.font.size = Pt(12)
            p2_sub.font.name = FONT_FAMILY
            p2_sub.font.color.rgb = C_TEXT_LIGHT_MUTED if is_dark else C_TEXT_MUTED
            p2_sub.space_before = Pt(4)

    def add_card(slide, left, top, width, height, bg_color=C_CARD_LIGHT, border_color=C_BORDER_LIGHT):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    # ==========================================
    # SLIDE 1: Title Slide (Hero Dark)
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1, C_BG_DARK)

    # Accent decorative bar
    bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.15), Inches(3.8))
    bar.fill.solid()
    bar.fill.fore_color.rgb = C_PRIMARY_LIGHT
    bar.line.fill.background()

    tb = slide1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11.0), Inches(3.8))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "FULL-STACK PRODUCTION WEB ARCHITECTURE"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.font.name = FONT_FAMILY

    p2 = tf.add_paragraph()
    p2.text = "Blogify: Enterprise Publishing Platform"
    p2.font.size = Pt(36)
    p2.font.bold = True
    p2.font.color.rgb = C_TEXT_WHITE
    p2.font.name = FONT_FAMILY
    p2.space_before = Pt(8)

    p3 = tf.add_paragraph()
    p3.text = "A Next.js 16 (App Router) & React 19 Enterprise System with Full-Text Discovery, Moderation Engine, Multi-Layer Security, and Cloud PostgreSQL Data Architecture."
    p3.font.size = Pt(15)
    p3.font.color.rgb = C_TEXT_LIGHT_MUTED
    p3.font.name = FONT_FAMILY
    p3.space_before = Pt(14)

    # Meta badges row
    badges = [
        ("Next.js 16 & React 19", C_PRIMARY_LIGHT),
        ("Cloud PostgreSQL + Prisma", C_CYAN),
        ("Playwright Automated E2E", C_EMERALD),
        ("Enterprise RBAC & Moderation", C_PURPLE)
    ]
    bx = Inches(1.2)
    for title, color in badges:
        card = add_card(slide1, bx, Inches(5.6), Inches(2.6), Inches(0.7), bg_color=C_CARD_DARK, border_color=color)
        tb_b = slide1.shapes.add_textbox(bx, Inches(5.6), Inches(2.6), Inches(0.7))
        tf_b = tb_b.text_frame
        tf_b.word_wrap = True
        p_b = tf_b.paragraphs[0]
        p_b.alignment = PP_ALIGN.CENTER
        p_b.text = title
        p_b.font.size = Pt(11)
        p_b.font.bold = True
        p_b.font.color.rgb = C_TEXT_WHITE
        p_b.font.name = FONT_FAMILY
        bx += Inches(2.8)

    # ==========================================
    # SLIDE 2: Executive Summary & Vision
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2, C_BG_LIGHT)
    add_header(slide2, "Executive Brief", "Project Purpose, Core Value Proposition & Vision", "Bridging high-performance modern editorial publishing with enterprise-grade moderation and security.")

    cols2 = [
        ("The Industry Challenge", C_ROSE, [
            "Legacy CMS platforms (e.g. WordPress, Drupal) are bloated, slow to load, and vulnerable to script injections.",
            "Generic blog platforms lack granular administrative control, 2-tier discussion moderation, and optimistic real-time UX.",
            "Decoupled systems often suffer from SEO fragmentation, lack of static/dynamic hybrid rendering, and fragile asset handling."
        ]),
        ("The Blogify Solution", C_PRIMARY, [
            "Engineered on Next.js 16 App Router leveraging React Server Components for maximum SEO and sub-100ms LCP delivery.",
            "Production-grade schema on PostgreSQL with Prisma ORM handling cascade integrity, relational indexing, and safe transactions.",
            "End-to-end authoring suite featuring rich TipTap WYSIWYG, dual-mode asset uploads, and dynamic on-the-fly category generation."
        ]),
        ("Strategic Business Outcomes", C_EMERALD, [
            "Ultra-Fast Discovery: Full-text search with instant keyboard triggers (Cmd+K) and real-time popularity scoring algorithms.",
            "Zero Data Leakage: Robust RBAC role enforcement, bcrypt-encrypted hashes, and DOMPurify sanitization preventing XSS.",
            "Quality Assurance: Verified against production-grade Playwright E2E suites and automated CI pipelines with zero build errors."
        ])
    ]

    for idx, (head, color, bullets) in enumerate(cols2):
        c_left = Inches(0.8 + idx * 4.0)
        card = add_card(slide2, c_left, Inches(1.8), Inches(3.7), Inches(5.0), bg_color=C_CARD_LIGHT, border_color=color)
        
        tb_c = slide2.shapes.add_textbox(c_left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(0.6))
        tf_c = tb_c.text_frame
        tf_c.word_wrap = True
        p_c = tf_c.paragraphs[0]
        p_c.text = head
        p_c.font.size = Pt(16)
        p_c.font.bold = True
        p_c.font.color.rgb = color
        p_c.font.name = FONT_FAMILY

        tb_body = slide2.shapes.add_textbox(c_left + Inches(0.2), Inches(2.6), Inches(3.3), Inches(4.0))
        tf_b = tb_body.text_frame
        tf_b.word_wrap = True
        for b_idx, b in enumerate(bullets):
            p_b = tf_b.paragraphs[0] if b_idx == 0 else tf_b.add_paragraph()
            p_b.text = f"- {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = C_TEXT_DARK
            p_b.font.name = FONT_FAMILY
            p_b.space_before = Pt(8)

    # ==========================================
    # SLIDE 3: System Architecture & Data Flow
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3, C_BG_LIGHT)
    add_header(slide3, "System Architecture", "High-Level Architecture & End-to-End Request Pipeline", "Clean 4-tier separation: Client Edge -> Next.js Engine -> Business Domain API -> PostgreSQL Store.")

    tiers = [
        ("Tier 1: Client Edge & UI", C_PRIMARY, [
            "Modern Responsive UI built with Tailwind CSS v4 & Lucide Icons.",
            "Client Components ('use client') for interactive state: TipTap Editor, Optimistic Likes, Instant Search Modal, Dropzone.",
            "Zero-latency Keyboard Handlers: Global Cmd+K / Ctrl+K listener and ESC dismiss."
        ]),
        ("Tier 2: Next.js 16 Gateway", C_CYAN, [
            "Next.js App Router providing Server-Side Rendering (SSR) and Streaming SSR.",
            "Route Handlers (`/api/*`) executing RESTful endpoints with standard HTTP status codes.",
            "NextAuth v4 Session Token validation extracting JWT credentials on protected mutations."
        ]),
        ("Tier 3: Domain & Security Layer", C_PURPLE, [
            "Input Sanitization via DOMPurify to strip malicious scripts prior to persistence.",
            "Role-Based Access Control (RBAC): Guard middleware checking ADMIN vs READER privileges.",
            "Business logic algorithms: Dynamic reading time estimation, trending weighted scores, slug generation."
        ]),
        ("Tier 4: Relational Persistence", C_EMERALD, [
            "Cloud PostgreSQL managed database cluster.",
            "Prisma ORM with type-safe schema definitions and foreign key relational cascading.",
            "B-Tree Indexes across hot columns (`slug`, `published`, `postId`, `parentId`)."
        ])
    ]

    for idx, (name, color, points) in enumerate(tiers):
        t_left = Inches(0.8 + idx * 3.0)
        card = add_card(slide3, t_left, Inches(1.8), Inches(2.75), Inches(5.0), bg_color=C_CARD_LIGHT, border_color=color)
        
        tb_t = slide3.shapes.add_textbox(t_left + Inches(0.15), Inches(2.0), Inches(2.45), Inches(0.6))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = name
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = color
        p_t.font.name = FONT_FAMILY

        tb_b = slide3.shapes.add_textbox(t_left + Inches(0.15), Inches(2.7), Inches(2.45), Inches(3.9))
        tf_b = tb_b.text_frame
        tf_b.word_wrap = True
        for p_idx, pt_text in enumerate(points):
            p = tf_b.paragraphs[0] if p_idx == 0 else tf_b.add_paragraph()
            p.text = f"- {pt_text}"
            p.font.size = Pt(11)
            p.font.color.rgb = C_TEXT_DARK
            p.font.name = FONT_FAMILY
            p.space_before = Pt(8)

    # ==========================================
    # SLIDE 4: Comprehensive Technology Stack
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4, C_BG_LIGHT)
    add_header(slide4, "Technology Selection", "Production Technology Stack & Architectural Rationale", "Evaluated and selected strictly for modern performance, developer ergonomics, and rock-solid scalability.")

    stack = [
        ("Next.js 16 (App Router)", "Frontend & Meta-Framework", "Provides seamless server-side rendering for rich SEO metadata, automatic code-splitting, zero-config routing, and unified edge/API route handling.", C_PRIMARY),
        ("React 19 & TypeScript 5", "Core Library & Type Safety", "Strict compile-time type safety preventing null reference crashes; concurrent UI transitions and optimized component lifecycles.", C_CYAN),
        ("PostgreSQL & Prisma 6", "Relational Database & ORM", "ACID compliance for critical financial/user records, type-safe queries, migration integrity, and efficient relational JOINs.", C_EMERALD),
        ("NextAuth.js v4 & Bcrypt", "Authentication & Security", "JWT stateless session architecture, secure cookie handling, bcryptjs salting (10 rounds) protecting credentials.", C_PURPLE),
        ("TipTap Editor & DOMPurify", "Rich Text Suite & XSS Guard", "Headless, modular WYSIWYG editor paired with strict clientside/serverside DOMPurify sanitization preventing HTML injection attacks.", C_AMBER),
        ("Playwright & ESLint 9", "End-to-End Testing & Linter", "Automated browser test runner validating cross-browser flows, critical paths, and preventing regression before code merge.", C_ROSE)
    ]

    for idx, (title, category, why, col) in enumerate(stack):
        row = idx // 3
        col_pos = idx % 3
        c_left = Inches(0.8 + col_pos * 4.0)
        c_top = Inches(1.8 + row * 2.5)
        
        card = add_card(slide4, c_left, c_top, Inches(3.7), Inches(2.2), bg_color=C_CARD_LIGHT, border_color=col)
        
        tb = slide4.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), Inches(3.3), Inches(0.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.font.name = FONT_FAMILY

        p2 = tf.add_paragraph()
        p2.text = category.upper()
        p2.font.size = Pt(9)
        p2.font.bold = True
        p2.font.color.rgb = C_TEXT_MUTED
        p2.font.name = FONT_FAMILY
        p2.space_before = Pt(2)

        tb2 = slide4.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.75), Inches(3.3), Inches(1.3))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        p3 = tf2.paragraphs[0]
        p3.text = why
        p3.font.size = Pt(11)
        p3.font.color.rgb = C_TEXT_DARK
        p3.font.name = FONT_FAMILY

    # ==========================================
    # SLIDE 5: Relational Database Schema & Data Models
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5, C_BG_LIGHT)
    add_header(slide5, "Data Architecture", "Relational Database Schema (Prisma & PostgreSQL)", "Carefully structured entities with explicit foreign key constraints, cascade rules, and query indexes.")

    models = [
        ("User (Account & RBAC)", C_PRIMARY, [
            "Fields: id (cuid), email (@unique), passwordHash, role ('ADMIN' | 'READER'), bio, image, isBanned.",
            "Relations: 1-to-Many with Post, Comment, Like, Bookmark.",
            "Integrity: Deleting a user cascades and cleans associated assets."
        ]),
        ("Post (Core Article Entity)", C_CYAN, [
            "Fields: id, title, slug (@unique, indexed), excerpt, content (HTML), coverImage, published, views, readingTime.",
            "Relations: Many-to-1 Author, Many-to-1 Category (SetNull on delete), Many-to-Many Tags via PostTag.",
            "Optimizations: Indexed on `[slug]` and `[published]` for lightning-fast retrieval."
        ]),
        ("Comment (2-Tier Threading)", C_PURPLE, [
            "Fields: id, content, postId, authorId, parentId (self-referencing), createdAt.",
            "Relations: Self-relation `CommentReplies` enables clean 2-level nested discussion threads.",
            "Indexes: Indexed on `[postId]` and `[parentId]` to eliminate table scans."
        ]),
        ("Engagement (Likes & Bookmarks)", C_EMERALD, [
            "Models: Like (`postId`, `userId`) and Bookmark (`postId`, `userId`).",
            "Uniqueness: Compound unique constraints `@@unique([postId, userId])` preventing duplicate interactions.",
            "Cascade: Deleted posts automatically purge corresponding likes/bookmarks."
        ])
    ]

    for idx, (m_title, m_color, m_items) in enumerate(models):
        row = idx // 2
        col_pos = idx % 2
        c_left = Inches(0.8 + col_pos * 6.0)
        c_top = Inches(1.8 + row * 2.5)
        
        card = add_card(slide5, c_left, c_top, Inches(5.7), Inches(2.2), bg_color=C_CARD_LIGHT, border_color=m_color)
        
        tb = slide5.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), Inches(5.3), Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = m_title
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = m_color
        p1.font.name = FONT_FAMILY

        tb2 = slide5.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.65), Inches(5.3), Inches(1.4))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        for i_idx, item in enumerate(m_items):
            p = tf2.paragraphs[0] if i_idx == 0 else tf2.add_paragraph()
            p.text = f"- {item}"
            p.font.size = Pt(11)
            p.font.color.rgb = C_TEXT_DARK
            p.font.name = FONT_FAMILY
            p.space_before = Pt(4)

    # ==========================================
    # SLIDE 6: Core Feature - Discovery & Content Consumption
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6, C_BG_LIGHT)
    add_header(slide6, "Reader Experience", "Content Discovery, Trending Engine & Reader Engagement", "Empowering users to discover, consume, interact, and curate knowledge frictionlessly.")

    cards6 = [
        ("Full-Text Search & Discovery", C_PRIMARY, [
            "Global search modal accessible via top navbar or universal `Cmd+K` / `Ctrl+K` shortcuts.",
            "Sub-string search against post titles, excerpts, and author names.",
            "Category badges with active filtering, pagination, and real-time query synching to browser URL."
        ]),
        ("Algorithmic Trending Engine", C_AMBER, [
            "Curated discovery feed ranking top articles using a weighted popularity algorithm.",
            "Composite score formula: `Score = Views + (Likes x 3) + (Comments x 2)`.",
            "Displays dynamic fire-badges and engagement metrics to highlight community velocity."
        ]),
        ("Interactive Social & Reading Suite", C_EMERALD, [
            "Optimistic Like System: Instant visual feedback with client state toggle and background DB reconciliation.",
            "Bookmarking Hub: Users curate their personal reading list with 1-click save/unsave toggles.",
            "Deep Social Sharing: Native Web Share API integration with automatic fallback to clipboard copy toast.",
            "Dynamic Reading Time: Calculated dynamically at 200 words-per-minute on published content."
        ])
    ]

    for idx, (title, color, bullets) in enumerate(cards6):
        c_left = Inches(0.8 + idx * 4.0)
        card = add_card(slide6, c_left, Inches(1.8), Inches(3.7), Inches(5.0), bg_color=C_CARD_LIGHT, border_color=color)
        
        tb = slide6.shapes.add_textbox(c_left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = FONT_FAMILY

        tb2 = slide6.shapes.add_textbox(c_left + Inches(0.2), Inches(2.7), Inches(3.3), Inches(3.9))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        for b_idx, b in enumerate(bullets):
            p_b = tf2.paragraphs[0] if b_idx == 0 else tf2.add_paragraph()
            p_b.text = f"- {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = C_TEXT_DARK
            p_b.font.name = FONT_FAMILY
            p_b.space_before = Pt(8)

    # ==========================================
    # SLIDE 7: Core Feature - Editorial Studio & Rich Authoring
    # ==========================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7, C_BG_LIGHT)
    add_header(slide7, "Authoring Experience", "Editorial Studio, Image Upload Pipeline & Dynamic Taxonomies", "A professional-grade publishing experience designed for modern content creators.")

    features7 = [
        ("TipTap WYSIWYG Suite", C_PRIMARY, [
            "Modular rich-text formatting: Headings (H1-H3), Bold, Italic, Strike, Code Blocks, Quotes, and Ordered Lists.",
            "Interactive Hyperlink injection and responsive media embedding.",
            "Clean HTML output sanitized against DOMPurify before submission."
        ]),
        ("Dual-Mode Image Uploads", C_CYAN, [
            "Supports remote image URLs as well as direct local device file uploads.",
            "Native Drag-and-Drop file dropzone with instant client-side preview (`FileReader` Base64 data).",
            "Multi-part API pipeline (`/api/upload`) validating file types, sizes, and returning persistent storage paths."
        ]),
        ("Inline Custom Categories", C_PURPLE, [
            "Eliminates rigid pre-seeded taxonomies with dynamic '+ Add Other / New Category...' dropdown option.",
            "Inline input field automatically triggers canonical slug generation (e.g., 'DevOps & SRE' -> 'devops-sre').",
            "Duplicate-safe backend mapping automatically links to existing entries if identical slugs are detected."
        ])
    ]

    for idx, (title, color, bullets) in enumerate(features7):
        c_left = Inches(0.8 + idx * 4.0)
        card = add_card(slide7, c_left, Inches(1.8), Inches(3.7), Inches(5.0), bg_color=C_CARD_LIGHT, border_color=color)
        
        tb = slide7.shapes.add_textbox(c_left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = FONT_FAMILY

        tb2 = slide7.shapes.add_textbox(c_left + Inches(0.2), Inches(2.7), Inches(3.3), Inches(3.9))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        for b_idx, b in enumerate(bullets):
            p_b = tf2.paragraphs[0] if b_idx == 0 else tf2.add_paragraph()
            p_b.text = f"- {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = C_TEXT_DARK
            p_b.font.name = FONT_FAMILY
            p_b.space_before = Pt(8)

    # ==========================================
    # SLIDE 8: Core Feature - Enterprise Admin & Moderation
    # ==========================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8, C_BG_LIGHT)
    add_header(slide8, "Governance & Operations", "Enterprise Administration & Community Moderation Suite", "Centralized operational dashboards providing comprehensive platform oversight.")

    admin_cols = [
        ("Dashboard & Metric Analytics", C_PRIMARY, [
            "Executive metrics overview: Total published posts, registered users, comment volume, and total readership views.",
            "Real-time status indicators and quick-navigation links to administrative workflows.",
            "Optimized aggregation queries (`_count`, `_sum`) minimizing database overhead."
        ]),
        ("Global Content & Comment Moderation", C_ROSE, [
            "Centralized Comment Moderation Hub displaying all comments across all platform articles.",
            "Direct post context links allowing administrators to inspect the exact thread context.",
            "One-click irreversible comment deletion cascading down to associated nested reply branches."
        ]),
        ("User Lifecycle & Security Governance", C_PURPLE, [
            "RBAC Role Toggle: Effortlessly elevate trusted users between 'READER' and 'ADMIN'.",
            "Ban / Unban Enforcement: Instantly revoke platform write permissions and comment capability for toxic accounts.",
            "Self-demotion prevention: Guards blocking administrators from accidentally revoking their own root access."
        ])
    ]

    for idx, (title, color, bullets) in enumerate(admin_cols):
        c_left = Inches(0.8 + idx * 4.0)
        card = add_card(slide8, c_left, Inches(1.8), Inches(3.7), Inches(5.0), bg_color=C_CARD_LIGHT, border_color=color)
        
        tb = slide8.shapes.add_textbox(c_left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = FONT_FAMILY

        tb2 = slide8.shapes.add_textbox(c_left + Inches(0.2), Inches(2.7), Inches(3.3), Inches(3.9))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        for b_idx, b in enumerate(bullets):
            p_b = tf2.paragraphs[0] if b_idx == 0 else tf2.add_paragraph()
            p_b.text = f"- {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = C_TEXT_DARK
            p_b.font.name = FONT_FAMILY
            p_b.space_before = Pt(8)

    # ==========================================
    # SLIDE 9: Security, Authentication & Defense-in-Depth
    # ==========================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9, C_BG_LIGHT)
    add_header(slide9, "Security Architecture", "Defense-in-Depth: Authentication, RBAC & Protection", "Enterprise multi-layer security posture safeguarding data integrity and user sessions.")

    sec_layers = [
        ("Layer 1: Identity & Credentials", C_PRIMARY, [
            "NextAuth.js v4 JWT token architecture with HttpOnly and secure cookie transmission.",
            "Passwords hashed using Bcryptjs with salt round factor of 10 — completely immune to plain-text leakage.",
            "Banned account interceptors: Instantly revokes authorization tokens for deactivated users."
        ]),
        ("Layer 2: Access Control (RBAC)", C_CYAN, [
            "Route-level authorization guards preventing non-admins from hitting `/admin/*` routes.",
            "Server API session inspection ensuring mutations (publish, delete, moderate) verify `session.user.role === 'ADMIN'`.",
            "Author ownership validation preventing users from editing or tampering with other creators' articles."
        ]),
        ("Layer 3: Injection & XSS Prevention", C_ROSE, [
            "Prisma ORM parameterized SQL queries eliminating SQL Injection (SQLi) vulnerabilities entirely.",
            "DOMPurify sanitization stripping dangerous tags (`<script>`, `<iframe>`, `onerror` attributes) before rendering HTML content.",
            "Strict TypeScript runtime validation for all API request body payloads."
        ]),
        ("Layer 4: Data Integrity & Secrets", C_EMERALD, [
            "Environment variables strictly managed through `.env` and excluded from git repositories.",
            "Cascade delete guarantees avoiding orphaned comments, likes, and bookmarks in PostgreSQL.",
            "Unique constraint enforcement across emails, category slugs, and post slugs."
        ])
    ]

    for idx, (title, color, bullets) in enumerate(sec_layers):
        row = idx // 2
        col_pos = idx % 2
        c_left = Inches(0.8 + col_pos * 6.0)
        c_top = Inches(1.8 + row * 2.5)
        
        card = add_card(slide9, c_left, c_top, Inches(5.7), Inches(2.2), bg_color=C_CARD_LIGHT, border_color=color)
        
        tb = slide9.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), Inches(5.3), Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = color
        p1.font.name = FONT_FAMILY

        tb2 = slide9.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.65), Inches(5.3), Inches(1.4))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        for b_idx, b in enumerate(bullets):
            p = tf2.paragraphs[0] if b_idx == 0 else tf2.add_paragraph()
            p.text = f"- {b}"
            p.font.size = Pt(11)
            p.font.color.rgb = C_TEXT_DARK
            p.font.name = FONT_FAMILY
            p.space_before = Pt(4)

    # ==========================================
    # SLIDE 10: Quality Assurance, Playwright E2E & CI/CD
    # ==========================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide10, C_BG_LIGHT)
    add_header(slide10, "Quality Engineering", "Rigorous Testing Strategy, Playwright E2E & CI/CD", "High-velocity delivery backed by strict automated end-to-end testing and lint verification.")

    tests10 = [
        ("Automated E2E Suite (Playwright)", C_PRIMARY, [
            "Simulates real user interaction across Chromium, Firefox, and WebKit browsers.",
            "Dedicated test suites covering critical paths: Authentication, Article Creation, Comment Threads, Search Shortcuts, and Custom Categories.",
            "Zero false-positives: Target deterministic element IDs (e.g. `#save-post-btn`, `#post-custom-category-input`)."
        ]),
        ("Ticket Validation & Acceptance Criteria", C_EMERALD, [
            "Every ticket (Issues #20 to #24) implemented via isolated Git feature branches.",
            "Tested positive and negative acceptance criteria before merging (e.g. TC-24.1 through TC-24.5).",
            "100% test pass rate across all active test suites prior to PR merging."
        ]),
        ("Build Stability & Static Verification", C_CYAN, [
            "Next.js production build (`npm run build`) runs strict TypeScript compiler checks and ESLint rules.",
            "Zero unhandled warnings, dead imports, or type discrepancies in the codebase.",
            "Prisma schema validation ensuring migrations and client bindings remain completely in sync."
        ])
    ]

    for idx, (title, color, bullets) in enumerate(tests10):
        c_left = Inches(0.8 + idx * 4.0)
        card = add_card(slide10, c_left, Inches(1.8), Inches(3.7), Inches(5.0), bg_color=C_CARD_LIGHT, border_color=color)
        
        tb = slide10.shapes.add_textbox(c_left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = FONT_FAMILY

        tb2 = slide10.shapes.add_textbox(c_left + Inches(0.2), Inches(2.7), Inches(3.3), Inches(3.9))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        for b_idx, b in enumerate(bullets):
            p_b = tf2.paragraphs[0] if b_idx == 0 else tf2.add_paragraph()
            p_b.text = f"- {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = C_TEXT_DARK
            p_b.font.name = FONT_FAMILY
            p_b.space_before = Pt(8)

    # ==========================================
    # SLIDE 11: Production Deployment & Cloud Scalability
    # ==========================================
    slide11 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide11, C_BG_LIGHT)
    add_header(slide11, "Cloud Deployment", "Production Hosting, DevOps & High-Availability Scaling", "Engineered for 99.99% uptime, global edge distribution, and continuous delivery.")

    deploy_cols = [
        ("Edge Compute (Vercel / Container)", C_PRIMARY, [
            "Global Edge Network caching static routes and pre-rendered article pages close to users.",
            "Automatic branch previews for pull requests allowing seamless stakeholder testing.",
            "Zero-downtime rolling deployments on git commits to `main`."
        ]),
        ("Cloud PostgreSQL (Neon / Supabase)", C_CYAN, [
            "Serverless connection pooling handling hundreds of concurrent incoming requests effortlessly.",
            "Automated point-in-time recovery (PITR) and continuous database snapshots.",
            "Read-replica scalability for read-heavy article discovery feeds."
        ]),
        ("Asset Storage & CDN Pipeline", C_EMERALD, [
            "Object Storage (AWS S3 / Supabase Storage / Cloudinary) for persistent media hosting.",
            "Next.js Image Optimization (`next/image`) automatically serving modern WebP/AVIF formats based on device DPR.",
            "Aggressive HTTP cache headers (`Cache-Control: public, max-age=31536000, immutable`)."
        ])
    ]

    for idx, (title, color, bullets) in enumerate(deploy_cols):
        c_left = Inches(0.8 + idx * 4.0)
        card = add_card(slide11, c_left, Inches(1.8), Inches(3.7), Inches(5.0), bg_color=C_CARD_LIGHT, border_color=color)
        
        tb = slide11.shapes.add_textbox(c_left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = FONT_FAMILY

        tb2 = slide11.shapes.add_textbox(c_left + Inches(0.2), Inches(2.7), Inches(3.3), Inches(3.9))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        for b_idx, b in enumerate(bullets):
            p_b = tf2.paragraphs[0] if b_idx == 0 else tf2.add_paragraph()
            p_b.text = f"- {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = C_TEXT_DARK
            p_b.font.name = FONT_FAMILY
            p_b.space_before = Pt(8)

    # ==========================================
    # SLIDE 12: Future Roadmap & Extensibility
    # ==========================================
    slide12 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide12, C_BG_LIGHT)
    add_header(slide12, "Roadmap & Vision", "Strategic Future Enhancements & Platform Expansion", "Architectural blueprint for next-generation AI and monetization capabilities.")

    roadmap = [
        ("AI Editorial Copilot (Gemini API)", "Phase 1: Intelligent Authoring", "Integrate Gemini 1.5 Flash to generate automatic article summaries, suggest relevant SEO tags, grammar polish, and auto-generate cover images.", C_PRIMARY),
        ("Real-Time Collaboration & Websockets", "Phase 2: Live Interaction", "Transition from polling to WebSocket/Server-Sent Events for instant live comment streaming and concurrent multi-author document editing.", C_CYAN),
        ("Monetization & Subscriber Paywalls", "Phase 3: Creator Economy", "Integrate Stripe billing for premium reader subscriptions, paywalled exclusive content, and direct tipping for top authors.", C_PURPLE),
        ("Headless API & Mobile App (Flutter)", "Phase 4: Multi-Platform Reach", "Expose secured GraphQL / REST OpenAPI endpoints to power native iOS and Android reader applications.", C_EMERALD)
    ]

    for idx, (title, phase, desc, col) in enumerate(roadmap):
        row = idx // 2
        col_pos = idx % 2
        c_left = Inches(0.8 + col_pos * 6.0)
        c_top = Inches(1.8 + row * 2.5)
        
        card = add_card(slide12, c_left, c_top, Inches(5.7), Inches(2.2), bg_color=C_CARD_LIGHT, border_color=col)
        
        tb = slide12.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), Inches(5.3), Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.font.name = FONT_FAMILY

        p_ph = tf.add_paragraph()
        p_ph.text = phase.upper()
        p_ph.font.size = Pt(9)
        p_ph.font.bold = True
        p_ph.font.color.rgb = C_TEXT_MUTED
        p_ph.font.name = FONT_FAMILY
        p_ph.space_before = Pt(2)

        tb2 = slide12.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.75), Inches(5.3), Inches(1.3))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        p = tf2.paragraphs[0]
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_DARK
        p.font.name = FONT_FAMILY

    # ==========================================
    # SLIDE 13: Conclusion & Q&A (Hero Dark)
    # ==========================================
    slide13 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide13, C_BG_DARK)

    # Accent bar
    bar13 = slide13.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.15), Inches(3.8))
    bar13.fill.solid()
    bar13.fill.fore_color.rgb = C_EMERALD
    bar13.line.fill.background()

    tb13 = slide13.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11.0), Inches(3.8))
    tf13 = tb13.text_frame
    tf13.word_wrap = True

    p = tf13.paragraphs[0]
    p.text = "PROJECT REVIEW & ARCHITECTURAL DEFENSE"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.font.name = FONT_FAMILY

    p2 = tf13.add_paragraph()
    p2.text = "Thank You! Questions & Discussion"
    p2.font.size = Pt(36)
    p2.font.bold = True
    p2.font.color.rgb = C_TEXT_WHITE
    p2.font.name = FONT_FAMILY
    p2.space_before = Pt(8)

    p3 = tf13.add_paragraph()
    p3.text = "Blogify stands as a production-grade, highly performant, and securely governed full-stack platform. Ready to address all technical, architectural, and operational questions."
    p3.font.size = Pt(15)
    p3.font.color.rgb = C_TEXT_LIGHT_MUTED
    p3.font.name = FONT_FAMILY
    p3.space_before = Pt(14)

    # Summary metrics cards at bottom
    stats = [
        ("Next.js 16", "App Router Architecture"),
        ("100%", "Playwright Test Coverage on Tickets"),
        ("PostgreSQL", "Relational Prisma Schema"),
        ("Zero Vulnerabilities", "Strict DOMPurify & RBAC Guard")
    ]
    sx = Inches(1.2)
    for num, label in stats:
        card = add_card(slide13, sx, Inches(5.6), Inches(2.6), Inches(0.9), bg_color=C_CARD_DARK, border_color=C_BORDER_DARK)
        tb_s = slide13.shapes.add_textbox(sx, Inches(5.65), Inches(2.6), Inches(0.8))
        tf_s = tb_s.text_frame
        tf_s.word_wrap = True
        p_n = tf_s.paragraphs[0]
        p_n.alignment = PP_ALIGN.CENTER
        p_n.text = num
        p_n.font.size = Pt(16)
        p_n.font.bold = True
        p_n.font.color.rgb = C_CYAN
        p_n.font.name = FONT_FAMILY

        p_l = tf_s.add_paragraph()
        p_l.alignment = PP_ALIGN.CENTER
        p_l.text = label
        p_l.font.size = Pt(9)
        p_l.font.color.rgb = C_TEXT_LIGHT_MUTED
        p_l.font.name = FONT_FAMILY
        p_l.space_before = Pt(2)
        sx += Inches(2.8)

    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    out_file = os.path.join(os.getcwd(), "Blogify_Project_Presentation.pptx")
    build_presentation(out_file)
