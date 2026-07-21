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

**Firestore collection constants**: `src/lib/cms-collections.ts` — always use `CMS_COLLECTIONS.X` (new) or `LEGACY_COLLECTIONS.X` (old) instead of string literals.

**Two collection systems exist in parallel:**
- **CMS collections** (new, `src/types/cms.ts`): `members`, `membershipTiers`, `cms_events`, `registrations`, `invoices`, `payments`, `donations`, `cms_announcements`, `contentPages`, `cms_documents`, `committees`, `commTemplates`, `auditLogs`, `analyticsDaily`
- **Legacy collections** (existing): `users`, `documents`, `meetings`, `messages`, `requests`, `activities`, `organizations`, `events`, `announcements`, `board`, `programs`

### TypeScript Types

All CMS data model types are in `src/types/cms.ts`. This is the source of truth for `Member`, `MembershipTier`, `CMSEvent`, `Registration`, `Invoice`, `Payment`, `Donation`, `Announcement`, `Committee`, `ContentPage`, `CMSDocument`, etc.

### Environment Variables

Required — see `.env.example`:
- `NEXT_PUBLIC_FIREBASE_*` plus `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — client configuration
- `FIREBASE_ADMIN_CREDENTIALS_JSON`, `FIREBASE_ADMIN_CLIENT_EMAIL`/`FIREBASE_ADMIN_PRIVATE_KEY`, or `GOOGLE_APPLICATION_CREDENTIALS` — server-side Admin credentials
- `NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST` / `ADMIN_EMAIL_ALLOWLIST` — temporary migration compatibility, not RBAC authority

### Testing, CI, and Deployment

The Verify workflow uses Node 22 and Java 21, then runs the secret-free environment template check, TypeScript/lint, unit tests, Firebase rules emulator tests, the production dependency-policy audit, the Next.js build, and the Functions TypeScript build. High/critical audit exceptions are documented in `DEPENDENCY_POLICY.md`; do not add one without triage.

The website deploys through Firebase App Hosting (`apphosting.yaml`). Firestore rules/indexes, Storage rules, and Cloud Functions deploy independently through Firebase CLI commands above.
