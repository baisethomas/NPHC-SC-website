# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NPHC Solano Hub — the official website for the National Pan-Hellenic Council of Solano County. Built on Next.js 16 + Firebase with a custom role-based CMS being developed in phases.

## Commands

```bash
npm run dev                 # Start dev server on port 9002
npm run build               # Runs typecheck then next build
npm run check               # Typecheck + lint
npm test                    # Unit tests (excluding emulator rules tests)
npm run test:rules          # Firestore/Storage rules tests through emulators
npm run env:check           # Validate local environment without printing secrets
npm run env:check:ci        # Validate the secret-free environment template
npm run audit:dependencies  # Production dependency policy check
```

`test:rules` uses `firebase emulators:exec` and needs Java 21. The configured emulator ports are Auth 9099, Firestore 8080, Storage 9199, Functions 5001, and UI 4000.

Firebase Cloud Functions (in `functions/`):
```bash
cd functions && npm run build
firebase emulators:start
firebase deploy --only firestore:rules,firestore:indexes,storage
firebase deploy --only functions
```

Admin utility scripts (run with `ts-node` or `npx tsx`):
```bash
npx tsx scripts/set-admin.ts       # Assign admin role to a user
npx tsx scripts/migrate-roles.ts   # Migrate users collection → members collection
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Firebase — Auth, Firestore, Storage, Cloud Functions
- **Styling**: Tailwind CSS v3, Radix UI primitives (via shadcn/ui), `cn()` utility from `src/lib/utils.ts`
- **Forms**: react-hook-form + zod
- **Rich text editor**: Tiptap
- **AI**: Genkit with Google AI (Gemini 2.0 Flash) — configured in `src/ai/genkit.ts`
- **Deployment**: Firebase App Hosting (`apphosting.yaml`)

### Route Groups
- **Public pages**: `/`, `/about`, `/events`, `/organizations`, `/news`, `/programs`, `/gallery`, `/contact`, `/donations`, `/mailing-list`
- **Auth**: `/login`
- **Members portal** (`/members/*`): Requires authenticated user. Guarded in `src/app/members/layout.tsx`.
- **Admin panel** (`/admin/*`): Requires `super_admin` or `admin` role. Guarded in `src/app/admin/layout.tsx`.
- **API routes** (`/api/*`): `src/app/api/members/` and `src/app/api/organizations/`

### Authentication & Authorization

**Client-side** — `src/contexts/AuthContext.tsx` wraps the entire app (see `src/app/layout.tsx`). It provides:
- `user`: Firebase `User | null`
- `roles: Role[]` — read from Firebase ID token custom claims
- `hasPermission(permission: Permission): boolean`
- `hasRole(role: Role): boolean`
- `loading: boolean`

**Server-side (API routes)** — Use `src/lib/authz-v2.ts`:
```ts
const result = await requirePermission(request, PERMISSIONS.MANAGE_EVENTS);
if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
// result.user is now typed as UserWithRoles
```

Available guards: `requireUser`, `requirePermission`, `requireAnyRole`, `requireAdmin`.

**Firebase Admin SDK** — `src/lib/firebase-admin.ts` initializes from `FIREBASE_ADMIN_CREDENTIALS_JSON`, the `FIREBASE_ADMIN_CLIENT_EMAIL`/`FIREBASE_ADMIN_PRIVATE_KEY` pair, or Application Default Credentials/`GOOGLE_APPLICATION_CREDENTIALS`. It exports `adminDb`, `adminAuth`, and `verifyIdToken()`. Never expose Admin credentials to client code.

### Role & Permission System

Defined in `src/lib/roles.ts`. Roles (10 total): `super_admin`, `admin`, `content_editor`, `membership_manager`, `event_manager`, `treasurer`, `comms_manager`, `committee_lead`, `member`, `visitor`.

Permissions (18 total): `manage_roles`, `manage_site_settings`, `edit_content`, `publish_announcements`, `manage_members`, `approve_members`, `manage_tiers`, `view_directory`, `manage_events`, `check_in_attendees`, `manage_payments`, `process_refunds`, `view_financial_reports`, `send_communications`, `manage_documents`, `manage_committees`, `view_analytics`, `view_audit_log`.

Roles are stored as custom claims on Firebase Auth tokens: `{ roles: Role[] }`. Firestore security rules check `request.auth.token.roles`; the legacy `admin` claim exists only during migration. Member profile reads are owner-or-admin, and other protected portal content flows through server routes guarded by `authz-v2`.

Cloud Functions in `functions/src/admin/user-management.ts` export `setUserRoles`, a callable function restricted to `super_admin`. It updates Firebase Auth custom claims and the Firestore `members` document together.

### Data Layer

**Production collections** (the real system — services in `src/lib/firestore-admin.ts` and helpers in `src/lib/data.ts`):
- Member portal: `documents`, `meetings`, `messages`, `requests`, `activities`
- Public content: `organizations`, `events`, `announcements`, `boardMembers`, `programs`
- People & security: `members` (profile/status/roles, written by `setUserRoles` and `scripts/migrate-roles.ts`), `auditLogs` (role-change trail; client writes blocked in rules), `rateLimits`, `rsvps`

**Aspirational collections** (planned, NOT built — see `CMS_ROADMAP.md`): `src/lib/cms-collections.ts` lists a designed future schema (`membershipTiers`, `cms_events`, `registrations`, `invoices`, `payments`, `donations`, `contentPages`, `committees`, `analyticsDaily`, …). Nothing imports that file and those collections have no types, UI, or data. Do not build against them without consulting the roadmap.

### TypeScript Types

`src/types/cms.ts` defines only `Member` and `MembershipStatus`. The working data model types for the portal (Document, Message, MeetingNote, Request, Activity, PaginatedResponse) live in `src/types/members.ts`; public content types (Event, Announcement, BoardMember, Organization, Program) live in `src/lib/definitions.ts`.

### Environment Variables

Required — see `.env.example`:
- `NEXT_PUBLIC_FIREBASE_*` plus `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — client configuration
- `FIREBASE_ADMIN_CREDENTIALS_JSON`, `FIREBASE_ADMIN_CLIENT_EMAIL`/`FIREBASE_ADMIN_PRIVATE_KEY`, or `GOOGLE_APPLICATION_CREDENTIALS` — server-side Admin credentials
- `NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST` / `ADMIN_EMAIL_ALLOWLIST` — temporary migration compatibility, not RBAC authority

### Testing, CI, and Deployment

The Verify workflow uses Node 22 and Java 21, then runs the secret-free environment template check, TypeScript/lint, unit tests, Firebase rules emulator tests, the production dependency-policy audit, the Next.js build, and the Functions TypeScript build. High/critical audit exceptions are documented in `DEPENDENCY_POLICY.md`; do not add one without triage.

The website deploys through Firebase App Hosting (`apphosting.yaml`). Firestore rules/indexes, Storage rules, and Cloud Functions deploy independently through Firebase CLI commands above.

---

# Operational reference (merged from the prior Codex AGENTS.md)

## Commands

```bash
npm run dev                 # Next.js on :9002
npm run check               # TypeScript and ESLint
npm test                    # Unit tests (rules tests excluded)
npm run test:rules          # Firestore/Storage rules via Firebase emulators
npm run env:check           # Validate local .env.local without printing secrets
npm run env:check:ci        # Validate .env.example only; safe in CI
npm run audit:dependencies  # Production dependency policy check
npm run build               # typecheck, then Next.js build
cd functions && npm run build
```

`test:rules` starts Firestore and Storage emulators through `firebase emulators:exec`; Java 21 is required. `firebase.json` defines the local ports (Auth 9099, Firestore 8080, Storage 9199, Functions 5001, Emulator UI 4000). Use `firebase emulators:start` for a full interactive stack.

## RBAC and data access

- `src/lib/roles.ts` is the role/permission source of truth. Firebase ID-token custom claims carry `roles: Role[]`.
- `AuthContext` exposes roles and permission checks to client components. Server handlers use `src/lib/authz-v2.ts` (`requireUser`, `requirePermission`, `requireAnyRole`, and `requireAdmin`) before accessing protected data.
- `firestore.rules` permits members to read their own profile, recognizes the legacy `admin` claim only for migration compatibility, and restricts remaining direct client access to admins. Protected portal content is served through server routes.
- `functions/src/admin/user-management.ts` exports the callable `setUserRoles` function. Only a `super_admin` may call it; it atomically updates Auth custom claims and the matching `members/{uid}` document.
- Use `CMS_COLLECTIONS`/`LEGACY_COLLECTIONS` from `src/lib/cms-collections.ts`, not handwritten collection names. CMS types live in `src/types/cms.ts`.

## Environment and deployment

Copy `.env.example` to `.env.local` for local development. The client requires the seven `NEXT_PUBLIC_FIREBASE_*`/Maps variables. Server-side Firebase Admin uses either `FIREBASE_ADMIN_CREDENTIALS_JSON`, the `FIREBASE_ADMIN_CLIENT_EMAIL` and `FIREBASE_ADMIN_PRIVATE_KEY` pair, or Application Default Credentials/`GOOGLE_APPLICATION_CREDENTIALS`. Do not commit credentials. The email allowlists are temporary migration compatibility only; RBAC claims are authoritative.

The web app deploys through Firebase App Hosting (`apphosting.yaml`). Firebase resources deploy separately:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
firebase deploy --only functions
```

CI installs with Node 22, validates the secret-free environment template, runs checks, unit tests, emulator rule tests, the dependency-policy audit, the application build, and the Functions TypeScript build. See `DEPENDENCY_POLICY.md` before changing audit exceptions.
