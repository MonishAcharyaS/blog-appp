# Platform Security Architecture & Audit Report

This document outlines the security controls, defensive design patterns, and vulnerability mitigation strategies implemented across the **Blogify** platform.

---

## 1. Authentication & Session Security

- **Algorithm**: bcrypt hashing with cost factor 10 for password encryption (`bcrypt.compare` on verification).
- **Session Strategy**: JSON Web Token (`strategy: "jwt"`) with HMAC-SHA256 signature signed using `NEXTAUTH_SECRET`.
- **Active Invalidation**:
  - The JWT callback synchronizes `role` and `isBanned` directly against the database on each token check.
  - If an account is suspended or role updated, existing user sessions reflect the change immediately.
- **Self-Lockout Prevention**:
  - Administrators cannot ban or demote their own account via API or UI, preventing accidental platform lockout.

---

## 2. Role-Based Access Control (RBAC) & Edge Middleware

- **Route Protection**:
  - `/admin/*` and `/api/admin/*` are strictly guarded by `src/middleware.ts`.
  - Unauthenticated requests are redirected to `/login?callbackUrl=...` or returned `401 Unauthorized`.
  - Authenticated `READER` accounts attempting to access admin views are redirected with `error=unauthorized` or returned `403 Forbidden`.
  - Banned accounts are blocked from all admin and API functionality with `403 Forbidden` (`Account suspended`).

---

## 3. Cross-Site Scripting (XSS) Mitigation

- **Dual-Layer Defense**:
  1. **Sanitization Engine**: All incoming rich HTML from the TipTap WYSIWYG editor and comments passes through `sanitizeHtml` (`DOMPurify`), which strictly forbids:
     - Executable tags: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<style>`, `<form>`.
     - Malicious event attributes: `onerror`, `onload`, `onclick`, `onmouseover`, `onfocus`, etc.
     - Inline protocol attacks: `javascript:`, `data:text/html`.
  2. **Framework Escaping**: React JSX automatically escapes dynamic values in user identity, metadata, and post titles.

---

## 4. SQL Injection Prevention

- **Parameterized Queries**:
  - Database access is handled exclusively by **Prisma ORM**.
  - All queries (including search queries and dynamic filters) use parameterized SQL statements. Raw string concatenation is prohibited across all API endpoints.

---

## 5. File Upload Safety

- **Size Limits**: Max 5MB per upload.
- **MIME & Extension Whitelist**: Only `image/jpeg`, `image/png`, `image/webp`, and `image/gif` are accepted.
- **Magic Byte Verification**: Binary headers are checked to prevent file extension spoofing.
- **Isolated Storage**: Uploaded assets are served statically without server-side execution capability.

---

## 6. HTTP Security Headers (`vercel.json`)

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 7. Reporting Vulnerabilities

If you discover a potential security vulnerability in this project, please send a responsible disclosure email to `security@blogify.example.com`. Please allow up to 48 hours for an acknowledgment before disclosing publicly.
