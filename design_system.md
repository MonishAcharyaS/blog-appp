# Blogify Design System Specification & Layout Architecture

This document provides a comprehensive, production-ready design system specification derived from the high-fidelity UI mockup for **Blogify**, a modern blog and publishing platform.

---

## 1. Executive Summary & Design Principles

### Core Design Philosophy
1. **Content-First Hierarchy**: The central content column commands the primary visual weight with high contrast, legible typography, generous leading, and rich imagery.
2. **Three-Column Spatial Balance**:
   - **Left Navigation Rail (Fixed / Sticky)**: Streamlined navigation, category filtering, and primary CTA cards (`Write your story`, `Go Premium`).
   - **Center Feed (Scrollable Main Stream)**: Social stories bar followed by hybrid blog feed cards (both hero/full-width and split-row preview layouts).
   - **Right Context Rail (Sticky Discovery)**: Trending topics, recommended creators ("Who to follow"), curated reading ("Popular This Week"), and newsletter capture.
3. **Refined Micro-Interactions**: Soft pill badges, subtle borders (`#F3F4F6` and `#E5E7EB`), gentle border radiuses (`rounded-xl` / `rounded-2xl`), and unified violet/indigo accent motifs (`#5B48EE` / `#6366F1`).
4. **Accessible Contrast & Visual Rhythm**: High-contrast dark typography (`#111827`) paired with muted metadata (`#6B7280` / `#9CA3AF`) and light canvas backdrops (`#F8F9FB`).

---

## 2. Global Design Tokens

### 2.1 Color Palette

| Token Name | Hex Code | RGB / HSL | Usage Context |
| :--- | :--- | :--- | :--- |
| **Primary (Brand / CTA)** | `#5B48EE` | `rgb(91, 72, 238)` | Primary action buttons, active icons, avatar rings, brand dot |
| **Primary Hover** | `#4936E3` | `rgb(73, 54, 227)` | Button hover states, interactive focus states |
| **Primary Soft / Tint** | `#F0EFFF` | `rgb(240, 239, 255)` | Active navigation pill background, light badge tint |
| **Primary Glow / Ring** | `#818CF8` | `rgb(129, 140, 248)` | Story reel unread border, focus rings |
| **Background (Canvas)** | `#F8F9FB` | `rgb(248, 249, 251)` | App background canvas across all 3 columns |
| **Surface (Card / White)** | `#FFFFFF` | `rgb(255, 255, 255)` | Feed cards, sidebar cards, sticky header, search bar |
| **Surface Dark (Premium)** | `#111827` | `rgb(17, 24, 39)` | "Go Premium" card background, dark mode elements |
| **Text Primary (Headings)** | `#111827` | `rgb(17, 24, 39)` | Post titles, card headers, primary button labels |
| **Text Secondary (Body)** | `#4B5563` | `rgb(75, 85, 99)` | Post excerpt descriptions, subtext |
| **Text Muted / Metadata** | `#6B7280` | `rgb(107, 114, 128)` | Author timestamps, read times, counters, handles (`@user`) |
| **Text Tertiary / Placeholder** | `#9CA3AF` | `rgb(156, 163, 175)` | Input placeholders, inactive icons, shortcut tags |
| **Border Default** | `#E5E7EB` | `rgb(229, 231, 235)` | Card outlines, dividers, search border, avatar borders |
| **Border Light / Subtle** | `#F3F4F6` | `rgb(243, 244, 246)` | Inner card dividers, category separators |
| **Accent Rose / Like** | `#EF4444` | `rgb(239, 68, 68)` | Liked heart icon and active like count |
| **Accent Orange (Trending)** | `#F97316` | `rgb(249, 115, 22)` | Flame/fire icon in Trending Topics |

---

### 2.2 Typography Scale

The application uses **Inter** (with system fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).

| Element | Font Size | Line Height | Weight | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Logo Text** | `22px` (`1.375rem`) | `28px` | `800` (Bold/Extrabold) | `-0.03em` |
| **H1 Hero Post Title** | `26px - 28px` | `34px - 36px` | `700` (Bold) | `-0.025em` |
| **H2 Post Card Title** | `19px - 20px` | `28px` | `700` (Bold) | `-0.02em` |
| **H3 Widget Title** | `15px - 16px` | `24px` | `700` (Bold) | `-0.015em` |
| **Body (Excerpts)** | `14px - 15px` | `22px - 24px` | `400` (Regular) | `normal` |
| **Navigation Items** | `14px` | `20px` | `500` (Medium) / `600` | `normal` |
| **Author Name** | `14px` | `20px` | `600` (Semibold) | `normal` |
| **Metadata / Badges** | `12px - 13px` | `16px - 18px` | `400` / `500` | `0.01em` |
| **Section Overlines** | `11px` | `16px` | `600` (Semibold) | `0.05em` (Uppercase) |
| **Footer / Micro-copy** | `11px - 12px` | `16px` | `400` | `normal` |

---

### 2.3 Spacing & Layout Geometry

The layout is built upon an **8pt geometric grid** with **4pt sub-steps**:
- `4px` (`gap-1`), `8px` (`gap-2`), `12px` (`gap-3`), `16px` (`gap-4`), `20px` (`gap-5`), `24px` (`gap-6`), `32px` (`gap-8`).

#### Screen Breakpoints & Column Widths
- **Max Container Width**: `1440px` (centered with `mx-auto`, `px-4 sm:px-6 lg:px-8`)
- **Left Column (Navigation & Actions)**:
  - Width: `240px` to `260px`
  - Position: Sticky (`top-20`, `h-[calc(100vh-5rem)]`)
- **Center Column (Main Stream)**:
  - Width: `640px` to `680px` (Flexible `max-w-2xl` / `flex-1`)
  - Padding: `gap-6` between cards
- **Right Column (Context & Discovery)**:
  - Width: `300px` to `330px`
  - Position: Sticky (`top-20`, `h-fit`)
- **Inter-Column Gutter**: `28px - 32px` (`gap-7` or `gap-8`)

#### Elevation & Border Radii
- **Border Radii**:
  - Small pills & tags: `rounded-full` / `rounded-md` (`6px - 8px`)
  - Story thumbnails & mini thumbs: `rounded-full` (circular) / `rounded-xl` (`12px`)
  - Content Cards & Modals: `rounded-2xl` (`16px`)
  - Action / Hero Images: `rounded-xl` (`12px`)
- **Shadows**:
  - `shadow-xs`: `0 1px 2px 0 rgba(0, 0, 0, 0.03)`
  - `shadow-sm`: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`
  - Subtle `1px solid #E5E7EB` border aesthetics preferred over heavy elevations.

---

## 3. Structural Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP NAVIGATION HEADER (Sticky 68px, Glass/White, Full Width 1440px Max)                │
│ [Logo: Blogify.]   [Search Bar w/ ⌘K]                 [+ Write CTA] [Bell] [User Profile]│
├─────────────────┬──────────────────────────────────┬───────────────────────────────────┤
│ LEFT RAIL (250px)│ CENTER CONTENT FEED (680px)      │ RIGHT RAIL (320px)                │
│                 │                                  │                                   │
│ 1. Nav Menu     │ 1. Story Carousel / Reels        │ 1. Trending Topics Card           │
│    - Home        │    (Your story + creator avatars)│    (#NextJS, #WebDev, etc.)       │
│    - Explore     │                                  │                                   │
│    - Bookmarks   │ 2. Hero Featured Post Card       │ 2. Who to Follow Card             │
│    - Alerts      │    - Author header + options     │    (Avatars, handles, Follow btn) │
│    - Messages    │    - Full-bleed 16:9 Image       │                                   │
│                 │    - Bold H1 headline            │ 3. Popular This Week Card         │
│ 2. Categories   │    - Two-line description        │    (Thumbnail + Title + read time)│
│    - Tech, UI/UX│    - Tags (#React, #Tailwind)    │                                   │
│    - Business... │    - Interaction footer (Likes,   │ 4. Stay in the Loop (Newsletter)  │
│                 │      Comments, Bookmark, Share)  │    (Input + Subscribe Button)     │
│ 3. Write CTA Box│                                  │                                   │
│ 4. Pro Upgrade  │ 3. Horizontal Split Post Cards   │ 5. Footer Copyright & Legal Links │
│ 5. Legal Footer │    - Author metadata             │                                   │
│                 │    - Left: Title + Excerpt + Tags│                                   │
│                 │    - Right: 4:3 Rounded Thumbnail │                                   │
│                 │    - Interaction bar             │                                   │
└─────────────────┴──────────────────────────────────┴───────────────────────────────────┘
```

---

## 4. In-Depth Component Specifications

### 4.1 Top Navigation Bar (`Header`)
- **Dimensions**: Height `68px`, sticky `top-0 z-50`, background `bg-white/90 backdrop-blur-md`, border-b `border-gray-200/80`.
- **Sub-components**:
  1. **Brand Logo**: "Blogify" with accent purple dot (`text-xl font-black tracking-tight text-gray-950`).
  2. **Global Search Input**:
     - Container: `w-96 rounded-xl bg-gray-50/80 border border-gray-200 px-3.5 py-2 flex items-center gap-2`.
     - Icon: Magnifying glass (`w-4 h-4 text-gray-400`).
     - Placeholder: "Search for blogs, people, topics..." (`text-xs text-gray-400`).
     - Shortcut Badge: `⌘ K` (`border border-gray-200 bg-white rounded px-1.5 py-0.5 text-[10px] text-gray-500 font-mono`).
  3. **Actions Cluster**:
     - "Write" Button: `bg-[#5B48EE] hover:bg-[#4936E3] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all`.
     - Notification Bell: `p-2 rounded-xl text-gray-600 hover:bg-gray-100 relative`.
     - User Profile Pill: Avatar (`36px` circle) + Name (`13px font-semibold text-gray-900`) + Handle (`@monish_dev` in `11px text-gray-500`).

---

### 4.2 Left Navigation Rail (`LeftSidebar`)
- **Dimensions**: Width `250px`, sticky, flex column gap-6.
- **Sub-components**:
  1. **Primary Navigation Links**:
     - Items: `Home` (Active), `Explore`, `Bookmarks`, `Notifications`, `Messages`.
     - Active Item: `bg-[#F0EFFF] text-[#5B48EE] font-semibold rounded-xl px-3.5 py-2.5 flex items-center gap-3`.
     - Inactive Items: `text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 font-medium rounded-xl px-3.5 py-2.5 flex items-center gap-3 transition-colors`.
  2. **Categories Section**:
     - Header: `text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3.5 mb-2`.
     - Category Items: Technology, Design, Development, Business, AI / ML, Productivity, Lifestyle, Travel, "View all".
     - Icon + label layout with subtle hover states.
  3. **"Write your story" Prompt Card**:
     - Background: `bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs`.
     - Title & Description: `text-sm font-bold text-gray-900` + "Share your ideas with the world." (`text-xs text-gray-500 mt-0.5 mb-3`).
     - Button: Violet full-width button with edit icon.
  4. **"Go Premium" Banner Card**:
     - Background: `bg-[#111827] text-white rounded-2xl p-4 relative overflow-hidden`.
     - Accent: Golden crown icon (`text-amber-400`).
     - Subtitle: "Unlock exclusive content and features." (`text-xs text-gray-400 mt-1 mb-3`).
     - Upgrade Button: Translucent outline button (`border border-white/20 hover:bg-white/10 text-xs font-semibold py-2 rounded-xl w-full`).
  5. **Left Footer Links**:
     - Links: `Blogify © 2024 · About · Help · Terms · Privacy · Contact` (`text-[11px] text-gray-400 space-x-2 px-1`).

---

### 4.3 Story Reels Bar (`StoriesBar`)
- **Dimensions**: Horizontal flex container, `overflow-x-auto scrollbar-none py-2 gap-4 items-center`.
- **Story Item**:
  - Avatar Diameter: `56px` to `60px`.
  - Unread Gradient Ring: Ring with `ring-2 ring-offset-2 ring-[#5B48EE]`.
  - "Your Story" Item: Special `+` badge in primary violet at bottom-right corner of avatar.
  - Creator Name Label: Truncated `text-xs text-gray-700 font-medium text-center mt-1.5 w-16 truncate`.

---

### 4.4 Feed Post Cards (`BlogFeed`)

#### Variant A: Hero Featured Card (Full-width post)
- **Container**: `bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4`.
- **Header**:
  - Author Avatar: `40px` rounded-full.
  - Author Metadata: Name (`font-semibold text-sm text-gray-900`) + Date & Read Time (`May 20, 2024 · 5 min read` in `text-xs text-gray-500`).
  - More Options: `...` button (`text-gray-400 hover:text-gray-600`).
- **Feature Image**: `w-full h-72 sm:h-80 object-cover rounded-xl border border-gray-100`.
- **Content**:
  - Title: `text-xl sm:text-2xl font-bold text-gray-900 hover:text-[#5B48EE] cursor-pointer transition-colors leading-snug`.
  - Excerpt: `text-sm text-gray-600 line-clamp-2 leading-relaxed`.
- **Topic Tags**:
  - Badges: `bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors`.
- **Action Footer**:
  - Left Cluster: Likes count with heart (`text-xs text-gray-500 font-medium flex items-center gap-1.5`), Comments count with bubble, Bookmark icon.
  - Right: "Share" icon button (`text-xs text-gray-500 font-medium flex items-center gap-1.5`).

#### Variant B: Split Row Preview Card (Standard post)
- **Container**: `bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3`.
- **Header**: Same author metadata row.
- **Body Grid**:
  - Two-column grid (`flex items-start justify-between gap-4`):
    - Left Column: Title (`text-lg font-bold text-gray-900 leading-snug`) + Excerpt (`text-xs text-gray-600 mt-1.5 line-clamp-2`) + Topic Tags.
    - Right Column: Thumbnail image (`140px x 96px` fixed aspect ratio, `rounded-xl object-cover shrink-0`).
- **Action Footer**: Identical counter metrics & interaction buttons.

---

### 4.5 Right Discovery Rail (`RightSidebar`)
- **Dimensions**: Width `320px`, sticky, flex column gap-5.
- **Sub-components**:
  1. **Trending Topics Widget**:
     - Header: Flame icon (`text-orange-500`) + "Trending Topics" (`text-sm font-bold text-gray-900`).
     - List: 5 items (e.g. `#NextJS` [1.2K posts], `#WebDevelopment` [984 posts], `#ReactJS` [876 posts], etc.).
     - View All Trends Button: `w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold text-center mt-2 transition-colors`.
  2. **Who to Follow Widget**:
     - Header: "Who to follow" (`text-sm font-bold text-gray-900`).
     - User Item: Avatar (`36px`) + Name (`13px font-semibold`) + Handle (`11px text-gray-500`) + "Follow" button (`text-xs text-[#5B48EE] hover:bg-[#F0EFFF] px-3 py-1 rounded-full font-semibold transition-colors`).
     - View All Link: Violet link text at bottom.
  3. **Popular This Week Widget**:
     - Header: "Popular This Week" (`text-sm font-bold text-gray-900`).
     - List Items: Small squircle thumbnail (`48px x 48px rounded-lg`) + Post title (`13px font-bold line-clamp-2`) + Read time (`11px text-gray-400`).
     - View All Popular Button: Full-width light gray button.
  4. **Stay in the Loop (Newsletter Widget)**:
     - Header: "Stay in the loop" + "Get the best stories delivered to your inbox."
     - Form:
       - Input: `w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-[#5B48EE]`.
       - Button: Full-width violet button `bg-[#5B48EE] hover:bg-[#4936E3] text-white py-2.5 rounded-xl text-xs font-semibold mt-2`.

---

## 5. Tailwind CSS v4 Theme Mapping (`globals.css`)

Below is the verified token mapping for `@theme inline` in Tailwind CSS v4:

```css
@import "tailwindcss";

@theme inline {
  --color-brand: #5B48EE;
  --color-brand-hover: #4936E3;
  --color-brand-soft: #F0EFFF;
  --color-brand-ring: #818CF8;

  --color-canvas: #F8F9FB;
  --color-surface: #FFFFFF;
  --color-surface-dark: #111827;

  --color-border-subtle: #F3F4F6;
  --color-border-default: #E5E7EB;

  --color-text-main: #111827;
  --color-text-body: #4B5563;
  --color-text-muted: #6B7280;
  --color-text-faint: #9CA3AF;

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
```

---

## 6. Implementation Checklist & Component Architecture

1. `src/components/layout/Navbar.tsx`: Sticky responsive top bar with search, brand, and actions.
2. `src/components/layout/LeftSidebar.tsx`: Navigation menu, categories list, CTA cards, legal footer.
3. `src/components/layout/RightSidebar.tsx`: Trending topics, who to follow, popular articles, and newsletter signup.
4. `src/components/feed/StoriesBar.tsx`: Responsive avatars carousel with active status rings.
5. `src/components/feed/PostCardHero.tsx`: Full-bleed featured post with expansive hero visual and interaction bar.
6. `src/components/feed/PostCardSplit.tsx`: Compact horizontal split layout with right thumbnail.
7. `src/components/common/Button.tsx` & `Badge.tsx`: Reusable atomic UI elements adhering to the tokens.
