# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NPHC Solano Hub — the official website for the National Pan-Hellenic Council of Solano County. Built on Next.js 16 + Firebase with a custom role-based CMS being developed in phases.

## Commands

```bash
npm run dev          # Start dev server on port 9002
npm run build        # Runs typecheck then next build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint on .js/.jsx/.ts/.tsx files
npm run check        # typecheck + lint together
```

There is no test suite configured. There is no `npm test` command.

Firebase Cloud Functions (in `functions/`):
```bash
cd functions && npm run build   # Compile functions TypeScript
firebase emulators:start        # Run Firebase emulators (Firestore :8080, Auth :9099, Functions :5001, UI :4000)
firebase deploy --only firestore:rules   # Deploy Firestore security rules
firebase deploy --only functions         # Deploy Cloud Functions
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

**Firebase Admin SDK** — `src/lib/firebase-admin.ts`. Only runs server-side (`typeof window === 'undefined'`). Falls back to `serviceAccountKey.json` if `FIREBASE_SERVICE_ACCOUNT_KEY` env var is missing. Exports `adminDb`, `adminAuth`, and `verifyIdToken()`.

### Role & Permission System

Defined in `src/lib/roles.ts`. Roles (10 total): `super_admin`, `admin`, `content_editor`, `membership_manager`, `event_manager`, `treasurer`, `comms_manager`, `committee_lead`, `member`, `visitor`.

Permissions (18 total): `manage_roles`, `manage_site_settings`, `edit_content`, `publish_announcements`, `manage_members`, `approve_members`, `manage_tiers`, `view_directory`, `manage_events`, `check_in_attendees`, `manage_payments`, `process_refunds`, `view_financial_reports`, `send_communications`, `manage_documents`, `manage_committees`, `view_analytics`, `view_audit_log`.

Roles are stored as custom claims on Firebase Auth tokens: `{ roles: Role[] }`. Firestore security rules check `request.auth.token.roles`.

Cloud Functions in `functions/src/admin/user-management.ts` manage role assignment atomically (updates both Firebase Auth claims and the Firestore `members` document).

### Data Layer

**Server-side data access**: `src/lib/cms-data.ts` — exports service objects (`memberService`, `membershipTierService`, `cmsEventService`, `registrationService`, `committeeService`, `announcementService`) that use `adminDb` (Firebase Admin). Use these in API routes and Server Actions only.

**Firestore collection constants**: `src/lib/cms-collections.ts` — always use `CMS_COLLECTIONS.X` (new) or `LEGACY_COLLECTIONS.X` (old) instead of string literals.

**Two collection systems exist in parallel:**
- **CMS collections** (new, `src/types/cms.ts`): `members`, `membershipTiers`, `cms_events`, `registrations`, `invoices`, `payments`, `donations`, `cms_announcements`, `contentPages`, `cms_documents`, `committees`, `commTemplates`, `auditLogs`, `analyticsDaily`
- **Legacy collections** (existing): `users`, `documents`, `meetings`, `messages`, `requests`, `activities`, `organizations`, `events`, `announcements`, `board`, `programs`

### TypeScript Types

All CMS data model types are in `src/types/cms.ts`. This is the source of truth for `Member`, `MembershipTier`, `CMSEvent`, `Registration`, `Invoice`, `Payment`, `Donation`, `Announcement`, `Committee`, `ContentPage`, `CMSDocument`, etc.

### Environment Variables

Required — see `.env.example`:
- `NEXT_PUBLIC_FIREBASE_*` — client-side Firebase config (6 vars)
- `FIREBASE_SERVICE_ACCOUNT_KEY` — JSON string of service account (server-side)
- `NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST` / `ADMIN_EMAIL_ALLOWLIST` — legacy, being replaced by role system
- `NEXT_PUBLIC_BASE_URL` — app URL (needed for Stripe in Phase 5)

### Development Phase Status

The project is being built in phases. Phases 1 (role system) and 2 (data models) are complete. Phase 3 (Admin UI: `cms-events`, `cms-members`, `membership-tiers` admin pages) is in progress. Phases 4–7 (communications, payments, mobile PWA, analytics) are planned.
