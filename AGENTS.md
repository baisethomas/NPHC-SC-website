# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

NPHC Solano Hub is a Next.js 16 (App Router), React 19, and TypeScript site backed by Firebase Auth, Firestore, Storage, and Cloud Functions. The role-based member/admin CMS, its Firebase rules, and its role-management function are shipped.

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
