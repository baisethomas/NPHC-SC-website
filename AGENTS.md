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

---

# Ratchet operating contract

Everything above describes the codebase. Everything below is Ratchet's model-agnostic operating contract: how any coding agent works in this repository. Tool adapters (`CLAUDE.md` for Claude Code, `CODEX.md` for Codex) add tool specifics only; this file wins any conflict.

## Ratchet invariants

1. **Model independence.** A fresh agent must be able to work without knowing which model worked previously.
2. **Human is not the memory bus.** Routine handoff context belongs in the repo, not in the user's head.
3. **Memory stays small.** Never store chat transcripts or duplicate facts that are safely inferable from code, tests, Git history, or linked protected systems.
4. **Git owns integration truth.** Ratchet does not create a second live synchronization system beside Git. Branches/worktrees may carry different current state until they are integrated.
5. **Durable decisions survive handoffs.** Accepted rationale is never silently deleted or rewritten.
6. **Agents cannot silently expand authority.** Shared-state, irreversible, or high-impact actions still require the appropriate human gate.
7. **Sensitive information never becomes durable project memory.** Store sanitized references, not secrets or protected data.

## Before any edit

- Read `.ratchet/STATE.md` and `.ratchet/DECISIONS.md` if they exist before planning.
- Tool adapters: after this file, read the adapter for your tool if one exists at the repo root (`CLAUDE.md` for Claude Code, `CODEX.md` for Codex). Adapters add tool specifics only; this file wins any conflict.
- Treat `STATE.md` as the current state of this branch/workstream, not guaranteed global state across every branch or clone.
- Read the files you'll change AND their call sites before forming a plan. The repo is context the user didn't type.
- For anything beyond a trivial change, state the plan before editing.
- Resolve three things first: what behavior changes (intent), what's allowed to change (blast radius), and what proves it's done (passing test, reproduced-then-fixed bug, green build, or other explicit check).

## Project memory is part of the job

The human should not have to manage project memory manually. Maintaining `.ratchet/STATE.md` and `.ratchet/DECISIONS.md` is part of normal agent work.

### Memory safety

Treat committed Ratchet memory as repository-visible information.

- Never write secrets, credentials, access tokens, private keys, personal/customer data, or sensitive security/incident details into Ratchet memory. In this repo that includes member names, emails, and phone numbers from the `members` collection, and anything from `.env.local`.
- Record only sanitized facts and references. Point to the approved secret manager, incident system, ticket, or other protected source without copying sensitive contents.
- If project memory itself must remain private, use a gitignored local `.ratchet/` or the project's approved private store instead of committing it. State clearly that cross-clone/agent continuity is then reduced unless that private store is shared.

### STATE.md

Treat `.ratchet/STATE.md` as the semantic handoff for the current branch/workstream.

- Update it automatically whenever meaningful workstream state changes: a milestone completes, active work changes, a blocker appears or clears, verification status changes, or the next action changes.
- Always leave it current before ending a nontrivial session or handing the branch/workstream to another agent.
- Replace stale state instead of appending a session diary. It is a dashboard, not a transcript.
- Store only context a fresh competent agent cannot safely infer from the repository.
- Do not attempt live cross-branch or cross-clone synchronization. Git is the integration mechanism.
- When integrating branches, reconcile `STATE.md` against the resulting code and tests, then write one clean post-integration state. If incoming state conflicts with repository reality, trust verified repository reality and repair the state.

### DECISIONS.md

Treat `.ratchet/DECISIONS.md` as durable shared project memory. The agent is responsible for deciding when a choice is durable enough to record.

Use this autonomy ladder:

- **Low impact:** routine implementation choices that are obvious from the code. Decide autonomously and do not record them unless their rationale would otherwise be lost.
- **Medium impact:** durable technical or product choices that constrain future work but are reversible and within the task's authorized scope. Decide autonomously, record them in `DECISIONS.md`, and surface them in the completion summary.
- **High impact:** choices with major blast radius or difficult reversal, including architecture replacement, destructive data changes, major dependency/platform changes, public API or shared-contract changes, security-sensitive policy changes, or material product-scope changes. Propose the decision and require explicit human approval before accepting or executing it.

- Append durable decisions; never silently rewrite accepted rationale.
- Parallel branches may add decisions independently. At integration, preserve compatible decisions from both sides. If accepted decisions conflict materially, stop and escalate rather than choosing silently.
- If a decision changes, mark the old entry superseded and append the replacement.
- If repository reality conflicts with an accepted decision, stop and report the conflict instead of choosing one silently.
- Do not preserve chat transcripts as project memory.

## Checkpoint discipline

- One conceptual change per step. Each step ends with the repo in a known-good state.
- Never batch edits across a failing state. Never stack a later step on an unverified earlier one.
- Do the riskiest or most informative step first so a fatal discovery happens early.

## Verification

- Never claim tests pass without running them.
- Reproduce a bug before fixing it whenever reproduction is possible.
- After writing a regression test, prove it can fail by reverting or disabling the fix, confirm failure, restore the fix, and confirm pass.
- Check installed-version APIs rather than relying on memory.
- If a test fails and the cause is not understood, stop and report. Do not hide, bypass, or reshape the test merely to produce green output.

## Scope law

- No drive-by changes: no unrelated reformatting, renames, cleanup, or debug output.
- Before summarizing, inspect the full diff and justify every hunk against the request.
- If one behavior change requires touching many files, call out the blast radius and reconsider whether the change is happening at the right layer.

## Hard stops

Require explicit human approval before:

- creating, modifying, or executing any database migration
- irreversible data changes
- force pushes, history rewrites, branch deletion, or destructive git operations
- deleting files or data outside the immediate task
- sending data to external systems
- changing public API surfaces or other shared contracts
- accepting or executing a high-impact decision as defined above
- anything listed as project-specific hard-stop territory below

The guard hooks intentionally enforce some of these categories more conservatively than prose alone. If a guarded action is genuinely approved, the human performs or explicitly bypasses the guard; agents must not invent self-approval mechanisms.

## Delegation and model tiers

The session that talks to the owner is the **orchestrator**. It cannot switch its own model. This section routes delegated work only when the owner has authorized delegation — it does not itself grant that authority. Delegate only bounded work and own the result: re-run the checks or read the evidence directly; never accept a subagent's "done" on trust. This contract binds every tier equally; a faster model gets a shorter leash, not a looser contract.

Tiers are roles, not vendors. Which model fills each tier lives in the tool's adapter (`CLAUDE.md`, `CODEX.md`). If a named model is unavailable, use the strongest available model appropriate to the same tier and state the substitution.

If only one model is available, every tier collapses onto it. The "Owns" column still describes the work; nothing is delegated. "Escalate on the second failure" then means stop and report to the owner. Verification, hard stops, and the self-test are unchanged. A single weaker model gets more process, not fewer rules.

| Tier | Owns | Never |
|---|---|---|
| Orchestrate | The conversation with the owner; plans and blast-radius calls; root-cause diagnosis of production symptoms; anything in hard-stop territory; cross-cutting changes spanning the role/permission system (`src/lib/roles.ts`, `src/lib/authz-v2.ts`, `firestore.rules`, `functions/src/admin/user-management.ts`) or the data layer and its consumers (`src/lib/data.ts`, `src/lib/firestore-admin.ts`, `src/lib/definitions.ts`, `src/types/members.ts`); medium/high-impact `DECISIONS.md` entries; arguing or accepting review findings; the final report. | Delegates a decision it should make itself. |
| Operate, high risk | Code in the high-risk modules listed under Repo specifics; anything that writes production data; concurrency changes; test-first bug fixes that must prove reproduce-revert-restore; migration proposals (never execution). | Merges, deploys, executes migrations, or hand-edits `package-lock.json`, `functions/package-lock.json`, `next-env.d.ts`, `functions/lib/`, or `.next/`. |
| Operate, routine | Code outside the high-risk modules that has a test suite; well-specified refactors within one file; new tests for described behavior. | Touches the high-risk modules, resolves merge conflicts, or changes a public API surface or shared contract. |
| Git & docs | Git mechanics with fully specified inputs; documentation writing and edits; PR body drafts; `.ratchet/STATE.md` refreshes; issue-tracker comments and link updates; read-only lookups and greps; running a named check and reporting its output verbatim. | Edits code, resolves conflicts, runs a git operation on the hard-stop list, rewords this file or an adapter, writes `DECISIONS.md` entries, or interprets a failing test. |

- **Route by blast radius, not by apparent size.** A one-line change in a high-risk module is high-risk work; a fifty-line new settings screen is routine.
- **Escalate on the second failure.** If a routine or git-and-docs task fails verification twice, or turns out to touch a hard stop, return it to the orchestrator or the next tier up with the failure attached. Never retry a weaker model into the same wall.
- **Reviews go up a tier.** A hostile diff review uses a model at least as strong as the one that wrote the diff, in a fresh context.
- **Verification is tier-independent.** The check command, the guards, the hard stops, and the self-test apply to every model equally.
- **When unsure, go up.** Use the high-risk operator tier. The cost of a wrong cheap answer in this repo is corrupting the `members` collection or Firebase custom claims (which can lock every admin out of the site) or exposing member contact data publicly, not a wasted token.

## Reporting format

Every nontrivial completion summary should contain, in order:

1. **What changed** — the behavior, first.
2. **Shape & why** — files touched, approach chosen, and why if alternatives were live.
3. **Verification** — what was actually run/read/assumed. Never collapse these categories.
4. **Residue** — assumptions, untested paths, follow-ups, and deliberately untouched issues.
5. **Handoff** — confirm `.ratchet/STATE.md` is current for this branch/workstream and call out any new medium-impact decisions recorded or high-impact decisions awaiting approval.

## Repo specifics

- Run everything: `npm run check && npm test` (typecheck, lint, unit tests; this is what the stop hook runs). `npm run test:rules` additionally exercises Firestore and Storage rules through the emulators and needs Java 21; run it whenever `firestore.rules`, `storage.rules`, or `tests/rules/` change.
- Run tests only: `npm test`
- Known untested / high-risk modules: `src/lib/data.ts` (highest churn in the repo, no tests, every public page depends on it); `src/lib/firestore-admin.ts` (all portal writes: documents, meetings, messages, requests, activities); every `src/app/admin/*/actions.ts` and `src/app/members/*/actions.ts` (server actions that write Firestore); `src/lib/firebase-admin.ts` (credential loading); `functions/src/admin/user-management.ts` (sets Auth custom claims); `src/app/api/members/**` and `src/app/api/organizations/**` (authenticated API surface). Tested: `src/lib/roles.ts`, `src/lib/authz-v2.ts`, rules via emulator, cursor pagination.
- Public API / shared contract surface: the `/api/members/*` and `/api/organizations/*` routes and their zod schemas in `src/lib/member-api-schemas.ts`; the callable Cloud Function `setUserRoles`; the `{ roles: Role[] }` custom-claim shape; Firestore collection names and document shapes in `src/lib/definitions.ts` and `src/types/members.ts`; `firestore.rules` and `storage.rules`; the CMS content keys in `src/lib/site-content.ts` and settings keys in `src/lib/site-settings.ts` (admins have already saved data under them).
- Environment assumptions worth stating: Node 22 and Java 21 (rules tests); `.env.local` with Firebase client config and Admin credentials, never committed; the dev server runs on port 9002 and shares one Firebase project with production, so local writes through the portal and admin hit real data; the app deploys from `main` via Vercel on push, while Firestore rules, indexes, and Cloud Functions deploy only through the Firebase CLI and can drift from the code.
- Additional hard-stop paths or operations: `firebase deploy` of any target; `scripts/set-admin.ts` and `scripts/migrate-roles.ts`; any change to custom claims, `firestore.rules`, or `storage.rules`; writes to the `members` or `auditLogs` collections outside the existing server actions and function; adding a high/critical exception to `DEPENDENCY_POLICY.md`; pushing to or merging into `main` (that is the production deploy); deleting or clearing `.next/` and `node_modules/` (the owner runs those).

## Self-test before every "done"

1. Did I run the available checks, or does the change merely read correct?
2. Does the diff contain only the intended change, and can I justify every hunk?
3. What did I assume about environment, versions, or project state, and did I state it?
4. For a bug fix, do I have evidence the regression test can fail without the fix?
5. Did I autonomously maintain branch/workstream state instead of leaving that work to the human?
6. Did I keep sensitive information out of durable project memory?
7. Did I avoid pretending branch-local state is globally synchronized state?
8. Did any migration, external send, shared-state action, irreversible action, or high-impact choice require human approval before execution?
9. Could a fresh agent continue this branch/workstream from `.ratchet/STATE.md` and `.ratchet/DECISIONS.md` without this conversation?

Any "no" means the work is not done yet.
