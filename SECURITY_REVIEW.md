# NPHC Solano Hub — Code Review & Hardening Report

**Date:** 2026-07-20
**Scope:** Full-site review across five axes — authentication/authorization, API routes & server actions, Firebase rules & Cloud Functions, client code & rendering, and configuration/dependencies/CI.
**Method:** Five parallel focused reviews; every finding below was verified in source. Severities reflect exploitability given the current architecture (all protected data flows through server routes using the Admin SDK, with deny-by-default Firestore/Storage rules).

---

> **Remediation status (2026-07-21):** All Critical, High, Medium, and code-fixable Low findings have been addressed. Still open, deliberately:
> - **App Check** — code side is DONE: `src/lib/firebase.ts` initializes App Check when `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` is set (with dev debug-token support), and `setUserRoles` has `enforceAppCheck: true`. Remaining console steps (service account lacks permission to do these): (1) Firebase console → App Check → Apps → register the web app with reCAPTCHA Enterprise (console creates the key), (2) put the site key in `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` locally and in Vercel env, (3) deploy functions (`firebase deploy --only functions`), (4) after the App Check metrics page shows healthy verified-traffic ratios, flip Firestore/Storage/Auth enforcement to Enforced in the console — monitor first, enforce second.
> - **`rateLimits` TTL policy** — code now writes an `expireAt` field; enable once with `gcloud firestore fields ttls update expireAt --collection-group=rateLimits --enable-ttl`.
> - **ESLint warnings-as-errors** — 104 pre-existing warnings must be cleaned up before CI can run with `--max-warnings=0`.
> - **Handler-level test coverage** for API routes/server actions — project-sized effort, not a point fix.
> - **Directory email exposure** — intended-behavior product decision, needs sign-off, not a code change.
> - **Admin documents page** — search debounce and refetch-blanking fixed; the full component split and `alert()`/`confirm()` replacement remain a UX refactor.
>
> New/updated Firestore rules tests run in CI (no local Java runtime available).

## Executive summary

The security foundation is genuinely solid: Firestore and Storage rules are deny-by-default, protected data is read server-side through the Admin SDK behind typed fail-closed guards, tokens are verified with revocation checking, API request bodies use strict zod schemas, IDOR is properly prevented on documents and messages, and CI even runs Firestore rules tests in an emulator (uncommon and valuable).

The issues worth acting on cluster in a few areas: a **server-side request forgery (SSRF) primitive** in document download, an **email-allowlist admin path that skips email verification**, **legacy `admin` claims that survive role removal**, a **regex-based HTML sanitizer that is bypassable**, **no security headers**, and a **production dependency tree with 4 critical / 15 high advisories**. None of these require a rewrite — most are targeted fixes.

### Priority order

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | SSRF via arbitrary `fileUrl`/`storagePath` in document download | Critical | Low |
| 2 | Email allowlist grants admin without `email_verified` check | Critical | Low |
| 3 | Legacy `admin: true` claim survives role demotion (Functions + rules) | High | Low |
| 4 | Bypassable regex HTML sanitizer on public rich-text pages | High | Medium |
| 5 | No security headers (CSP/HSTS/X-Frame-Options) | High | Low |
| 6 | 4 critical / 15 high production dependency vulnerabilities | High | Medium |
| 7 | Unauthenticated RSVP action — capacity/storage DoS + email enumeration | High | Low |
| 8 | Draft/executive meeting notes readable by all members | Medium | Low |
| 9 | Rate limiting keys on spoofable `X-Forwarded-For`; only auth route is limited | Medium | Low |
| 10 | `.env` not gitignored; `tsconfig.tsbuildinfo` tracked | Medium | Trivial |

---

## Critical

### 1. SSRF via arbitrary `fileUrl` / `storagePath` in member document download
`src/app/api/members/documents/[id]/download/route.ts:86` · schema `src/lib/member-api-schemas.ts:4,12-13`

The download route does `await fetch(document.fileUrl)` and streams the response back to the caller. `fileUrl` is validated only as `z.string().url()` — no scheme or host restriction — and is writable through `POST/PUT /api/members/documents` by anyone holding `manage_documents` (not full admin). An attacker sets `fileUrl` to `http://169.254.169.254/computeMetadata/v1/...` (GCP metadata server) or another internal address, then GETs the download endpoint and receives the response body — on Firebase App Hosting this can expose the service-account token, a real privilege escalation. The parallel `storagePath` field (`safeText(1024)`, unconstrained) is served via `bucket().file(storagePath).download()`, letting the same role read any current or future object in the bucket.

**Fix:** Restrict `fileUrl` to `https:` plus an allowlist of Firebase Storage download hosts (or drop it in favor of `storagePath` only). Validate `storagePath` against the exact format the upload route produces (e.g. `^documents/[a-f0-9-]{36}\.[a-z0-9]+$`).

### 2. Email allowlist grants full server-side admin without email verification
`src/lib/authz.ts:31-41` (`isAdminUser`) — consumed by `requireAdmin`, `requireAdminSession`, `requireActiveMember`, `withRoles`, `member-content-access`

`isAdminUser` treats membership in `ADMIN_EMAIL_ALLOWLIST` as full admin authority, and `email_verified` is checked nowhere in the codebase. Because Firebase lets anyone create an email/password account without verifying the address, an attacker who registers an account using an allowlisted email immediately gets a token whose `email` claim passes `isAdminUser` — full admin on every API route and server action. CLAUDE.md states the allowlist is "not RBAC authority," but the code makes it exactly that.

**Fix:** Require `email_verified === true` before consulting the allowlist at minimum; better, remove the allowlist from `isAdminUser` entirely and rely on `roles` claims. Also delete `NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST` (`AuthContext.tsx:60`) — it ships the list of high-value target accounts to every browser.

---

## High

### 3. Legacy `admin: true` claim survives role demotion
`functions/src/admin/user-management.ts:34-37` · `firestore.rules:11` · `storage.rules:7`

`setUserRoles` writes `setCustomUserClaims(uid, { ...user.customClaims, roles })`, spreading existing claims — so a user carrying the pre-RBAC `admin: true` claim keeps it forever. Both rules files grant full read/write on `token.admin == true`. A super_admin who "removes" someone's access via `setUserRoles(uid, ['member'])` leaves them with full Firestore and Storage access. The same legacy bridge is honored in `authz.ts:39`, `authz-v2.ts:23`, and `AuthContext.tsx:66`.

**Fix:** Strip `admin` when writing claims (`const { admin, ...rest } = user.customClaims ?? {}`), and/or stop honoring `token.admin` in the rules now that roles exist. Retire the legacy bridge on a dated schedule and log any request still authorized through it.

Related migration risk: `scripts/migrate-roles.ts:32-34` maps legacy `admin` **and** allowlisted users to `super_admin` (the only role holding `manage_roles`) — an escalation beyond what legacy admins ever had. Migrate them to `admin`; assign `super_admin` only by explicit manual action.

### 4. Regex-based HTML sanitizer is bypassable on public rich-text pages
`src/lib/sanitizer.ts:24-49` · sinks `src/app/news/[slug]/page.tsx:49`, `src/app/events/[slug]/page.tsx:83`

Both public pages correctly route Tiptap content through `sanitizeHtml()` before `dangerouslySetInnerHTML` (verified) — but the server-side sanitizer is regex-based and bypassable. HTML-entity-encoded payloads survive (regexes don't decode entities, the browser does), `java\tscript:` variants pass the `/javascript:/gi` strip, and the attribute-stripping regex only matches quoted attributes so unquoted ones survive. Any content-editor (or a compromised legacy record) can store a payload that executes stored XSS in every reader's browser.

**Fix:** Replace the regex sanitizer with a real HTML parser — `isomorphic-dompurify` or `sanitize-html` — on the server, matching the client's DOMPurify behavior.

### 5. No security headers
`next.config.ts` — no `headers()` block

No CSP, HSTS, X-Frame-Options/frame-ancestors, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy. This leaves the admin panel clickjackable and removes the second layer that would contain an XSS like #4.

**Fix:** Add a `headers()` function: `Content-Security-Policy` (allowing Firebase/Google endpoints), `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

### 6. Production dependency vulnerabilities: 4 critical / 15 high
`npm audit --omit=dev` · `DEPENDENCY_POLICY.md:15` · `scripts/audit-dependencies.mjs:9-52`

The production tree carries 89 advisories (4 critical, 15 high), including `websocket-driver`, `ws`, `@grpc/grpc-js`, and `next` itself — DoS and memory-disclosure vectors in the server-side Firebase/Genkit chains. `DEPENDENCY_POLICY.md` already flags the `next` update as due.

**Fix:** Run the non-breaking subset of `npm audit fix`, take the flagged `next` update, and shrink the ~40-entry exception baseline. Add a Dependabot/Renovate config and a scheduled audit workflow (today the gate only fires on push/PR, so a new advisory against `main` goes unnoticed).

### 7. Unauthenticated RSVP action — capacity/storage DoS + email enumeration
`src/app/events/rsvp-actions.ts:18-84` (verified: `createRSVP` has no auth or rate limiting)

The public RSVP form action is intentionally unauthenticated, but has no abuse controls. Scripted POSTs can fill any event to `maxAttendees` with fake RSVPs (blocking real attendees), write unbounded documents into `rsvps` (cost/storage DoS), and enumerate whether a given email already RSVP'd — the deterministic ID `${eventId}_${email}` returns a distinguishable "already RSVP'd" error for other people's emails.

**Fix:** Add `checkDurableRateLimit` keyed by IP + eventId, cap total RSVPs, use a non-distinguishable success/error response, and add a CAPTCHA/Turnstile to the public form.

---

## Medium

### 8. Draft & executive meeting notes readable by all active members
`src/app/api/members/meetings/route.ts:10-38`

Unlike the documents and messages routes (which filter via `canAccessDocument`/`canViewMessage`), the meetings GET applies no status/type visibility filter. `?status=draft&type=executive` returns the full `content` of unapproved executive minutes to any approved member.

**Fix:** For non-admin callers, force `status: 'approved'` before querying, and decide whether `executive`-type notes need role gating.

### 9. Rate limiting: spoofable IP key, and only the auth route is protected
`src/lib/rate-limiter.ts:65-77` (`getClientIP`) · usage in `src/app/api/auth/session/route.ts:12`

`getClientIP` trusts the first element of `x-forwarded-for` (and `x-real-ip`, `x-client-ip`), all attacker-settable. Rotating a forged XFF per request voids the auth rate limit. Separately, `checkDurableRateLimit` is referenced *only* on the auth route — document/message/request POSTs and all server actions have zero throttling.

**Fix:** Derive the client IP from the trusted platform position (App Hosting `request.ip` / last untrusted hop) and ignore client headers. Add uid-keyed rate limiting to at least `POST /api/members/requests` and the admin upload route.

### 10. Secrets & build-artifact hygiene in git
`.gitignore`

`git check-ignore .env` → not ignored (only `.env.local` / `.env*.local` variants are). A developer copying `.env.example` to `.env` with real Admin credentials can commit them. Additionally `tsconfig.tsbuildinfo` is tracked (constant diff noise), and `.tmp/` plus `NPHC-Solano-Backend-Code-Review.docx` are one `git add -A` from entering public history.

**Fix:** Add `.env`, `.env.*` (with `!.env.example`), `*.tsbuildinfo`, `.tmp/`, and `*.docx` to `.gitignore`; `git rm --cached tsconfig.tsbuildinfo`.

### 11. Catch-all rule lets any `admin` rewrite audit logs and financial records
`firestore.rules:25-27`

`match /{document=**} { allow read, write: if isAdmin(); }` makes no per-collection distinction, so a plain `admin` (not just `super_admin`) can edit or delete `auditLogs`, `payments`, and `invoices` directly from the client SDK with no field validation — defeating the accountability model.

**Fix:** Carve out `auditLogs` (and ideally `payments`/`invoices`) as `allow write: if false` — the Admin SDK bypasses rules, so server writes still work.

### 12. `setUserRoles` — the most sensitive operation — is not audit-logged
`functions/src/admin/user-management.ts:18-50`

The system defines an `auditLogs` collection and a `view_audit_log` permission, but granting/removing roles (including `super_admin`) writes no audit entry. A rogue or compromised super_admin leaves no trace.

**Fix:** Write an `auditLogs` document (actor uid, target uid, before/after roles, timestamp) inside the function.

### 13. Server actions upload via the client Storage SDK (broken + unvalidated)
`src/app/admin/board/actions.ts:10`, `programs/actions.ts` → `src/lib/storage.ts:283-307`

`'use server'` code calls `uploadBoardMemberImage`, which uses the *client* `firebase/storage` SDK. On the server this runs unauthenticated, so `storage.rules` (admin-only write) should deny it — the path is likely broken as well as doing no size/MIME validation, and it embeds raw `file.name` in the storage path. The danger is a future "fix" that loosens the storage rule to make it work, opening a public-write path.

**Fix:** Upload through the Admin SDK bucket (`adminStorage`) inside the action, applying the same MIME/size checks as `api/admin/documents/upload`.

### 14. Other medium items (grouped)

- **Raw ID token as session cookie** (`api/auth/session/route.ts:46-52`): a 1-hour `maxAge` can outlive the token; prefer Firebase `createSessionCookie`/`verifySessionCookie(cookie, true)`, which are purpose-built for this. (`httpOnly`/`secure`/`sameSite` are already set correctly.)
- **No App Check** anywhere (`functions/src/admin/user-management.ts:18`, no client init, no `firebase.json` config): no bot/abuse protection on the callable or on direct Firestore/Storage API access. Add reCAPTCHA-Enterprise App Check with `enforceAppCheck: true`.
- **Public `organizations` GET leaks raw `error.message` and can trigger DB seeding** (`api/organizations/route.ts:35`, `data.ts:441`): return a generic error; move seeding to an admin script.
- **FormData server-action variants skip zod** (`programs/actions.ts:107-306`, `board/actions.ts:76-141`): `status` is cast with `as` without validation; `updateData: any` invites mass-assignment. Route FormData through the same zod schemas.
- **`requirePermissionSession` diverges from `authz-v2`** (`server-auth.ts:58-62`): it normalizes roles directly instead of using `getRolesFromClaims`, so a legacy/allowlist admin with no `roles` claim resolves to `[]` and every permission check fails. Fails closed, but the two auth paths disagree — consolidate on one helper.

---

## Low / Improvements

- **`canViewMessage` defaults a missing member record to role `member`** (`member-content-access.ts:30`) — fails open if ever called without a prior active-member gate. Default to a non-matching sentinel.
- **Rules test coverage gaps** (`tests/rules/firebase-rules.test.ts`): no cases for member write-denied to own doc, legacy `admin: true` access, member/anonymous Storage reads, or non-admin elevated roles (`content_editor`, `treasurer`) on CMS collections.
- **Broad test gaps overall**: only 4 small test files. Untested critical paths include every `/api/members/*` and `/api/admin/*` handler, all admin server actions, `server-auth.ts`, `member-access.ts`, `durable-rate-limiter.ts`, and the `setUserRoles` function.
- **`roles.hasAny` errors when the `roles` claim is absent** (`firestore.rules:12`, `storage.rules:8`) — fails closed but brittle; guard with `('roles' in request.auth.token)`.
- **Dead client bindings** (`src/lib/admin.ts:57-114`): `setAdminClaims`, `deleteUser`, etc. call callables that don't exist in `functions/src/index.ts` (only `setUserRoles` is exported). Delete them, or implement with the same super_admin guard.
- **Member directory `<img src={avatarUrl}>`** (`members/directory/page.tsx:49`) — unvalidated URL scheme; a member-set value can leak viewer IP/referrer to an arbitrary host. Allow only `https:` and prefer `next/image`.
- **`member.displayName.split(' ')`** (`directory/page.tsx:56`) assumes non-null — a record with an empty `displayName` crashes the Server Component render. Add a fallback.
- **Directory exposes every approved member's email** to any approved account (bulk-PII, harvestable) — server-gated so not a bypass, but confirm it's an intended product decision.
- **`getClientIP` `'unknown'` bucket** collectively locks out all header-less clients (`rate-limiter.ts`).
- **`eslint.config.mjs:15-22`** downgrades several correctness rules (incl. react-hooks) to `warn`, and CI passes on warnings — run eslint with `--max-warnings=0`.
- **`check-env.js:78-93`** validates only variable *names*, never value shape — malformed `FIREBASE_ADMIN_CREDENTIALS_JSON` passes (the exact bug fixed in f3618dd). Attempt `JSON.parse` when set.
- **Image `remotePatterns`** (`next.config.ts:56-60`) proxy arbitrary content from low-trust third-party hosts (`www.pngall.com`) — self-host instead.
- **UX**: `admin/documents/page.tsx` is a 633-line client component using `alert()`/`confirm()` and a full-page spinner on every search keystroke; debounce search and use the app's toast/AlertDialog primitives.
- **`rateLimits` collection is never expired** (`durable-rate-limiter.ts`) — add a TTL policy.
- **CI actions pinned by tag** rather than SHA; **`apphosting.yaml` `maxInstances: 1`** is a hard availability ceiling and changes rate-limiter/session behavior when raised.

---

## What's done well

- **Deny-by-default data layer.** No public read of anything; member PII is owner-or-admin read, admin-only write; all portal traffic goes through server routes using the Admin SDK. The "collections without rules" concern resolves to safe deny-by-default.
- **Fail-closed guards by construction** — typed `{ ok: false }` results, null returns when `adminDb` is unavailable, `normalizeRoles` strips unknown roles. Token verification uses `checkRevoked = true` consistently.
- **Strong API input discipline** — strict zod schemas block mass-assignment, server-controlled fields are overwritten from the verified token, pagination is capped at 50 with validated base64url cursors, and IDOR is prevented on documents and messages (responses strip `fileUrl` and other users' read receipts).
- **The admin upload route** has a proper MIME + 10 MB + randomized-UUID-filename allowlist; the RSVP capacity check runs in a Firestore transaction; the durable rate limiter fails closed and survives cold starts.
- **`setUserRoles`** correctly restricts to `super_admin`, validates uid and every role against a fixed allowlist, and keeps Auth claims and the `members` doc in sync.
- **CI is a real quality gate** — env-template check, typecheck, lint, unit tests, **Firestore/Storage rules emulator tests**, dependency-policy audit, app build, and Functions build. The least-privilege role→permission matrix (only `super_admin` holds `manage_roles`) is well designed, and no Admin secrets reach the client bundle.
