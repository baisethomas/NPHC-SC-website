# Ratchet Project State

<!--
Semantic handoff for the current branch/workstream. Keep it short, current, and factual.
Never record secrets, credentials, or member personal data here.
Not a session transcript: replace stale state, do not append history.
-->

## Objective

Ship the October 2026 site refresh (branch `feat/site-refresh`, PR #28 into `main`): editorial ink/gold/ivory design system across the public site, member portal, and admin panel, plus the member-request review flow. Merging to `main` is the production deploy (Vercel on push), so the PR merges only on the owner's explicit say-so.

## Current phase

Review and hardening. All planned pages are built and visually verified; remaining work is closing bot review findings and the CI dependency audit before merge.

## Completed

- Design system: Newsreader headlines (400 display / 500 titles, mapped in `globals.css`), Instrument Sans body, Source Serif 4 for Greek lettermarks, organization brand colors via `src/lib/divine-nine-brand.ts`.
- Public pages rebuilt on the editorial direction (home, about, events + detail, programs, news + detail, organizations, get-involved, scholarships, donations, contact, mailing list, gallery, login).
- Members portal moved onto the site tokens with shared `src/components/portal/page-header.tsx`; admin got its own shell, page header, status badge, and table-based list pages under `src/components/admin/`.
- `/admin/requests` with review dialog (approve / deny / under review through the existing `approve_members`-guarded status route) and an open-requests count on the dashboard.
- Fixes: date picker rebuilt (`src/components/ui/calendar.tsx`), request form date/type validation, profile zod schema moved out of the `"use server"` module, portal greeting from email-shaped display names.
- Ratchet installed (this file, `DECISIONS.md`, skills, stop and lint hooks).
- Second-round Codex findings fixed: dashboard pending-requests read is permission-guarded; admin requests queue follows the API cursor past 50; date-only deadlines format as calendar dates (`src/lib/dates.ts`, tested); status transitions log their real action; pending members can sign out from the header; featured events are unique via a batch write.

## Working on

- Nothing in flight. Last pushed commit is the admin requests feature.

## Next

1. Close the remaining bot review findings on PR #28 (the second-round Codex findings are done; see Completed): active-membership check on `src/app/members/page.tsx` (use `requireActiveMemberSession`), event time parsing in `src/lib/events.ts` to use `America/Los_Angeles` instead of server-local time, replace the hardcoded members collection name in `src/lib/member-profile.ts` with the collection constant, RFC 5545 escaping test for `buildIcs`, add `/scholarships` and `/gallery` to the revalidation lists in the content and settings actions.
1a. Upstream to the Ratchet repo, not here: Ternary's two findings on the installed skill scripts (`test-install.sh` should fail rather than SKIP when the source is the repo's own `.agents`; `rrr.sh` should reject fix paths inside the Git directory).
2. Triage the dependency audit that fails the Verify CI job (advisories for next, sharp, tailwindcss, tiptap, postcss, nanoid) against `DEPENDENCY_POLICY.md`; upgrade where possible rather than adding exceptions.
3. Remove the unused admin nav branch from `src/components/portal/portal-shell.tsx` now that admin has `AdminShell`.
4. Owner: approve or deny a real request end to end and check the member sees the note; check the Vercel preview on a phone.

## Blocked

- Email notifications for requests: blocked on the owner choosing an email provider. Do not add email sending until they name one.

## Important context

- Local dev shares the production Firebase project. Portal and admin writes from `localhost:9002` are real data; the owner's own account is a `super_admin`.
- Events, programs, and news collections are currently empty in Firestore, so those public pages show their empty states by design.
- The Ratchet plugin guard is active in Claude Code and blocks `rm -rf`, shell-variable program names, and `$(...)` inside `git commit -m`; commit with `git commit -F <file>`.
- Headless Chrome will not render below ~500px wide; use 500 for narrow checks or the owner's logged-in browser via `claude-in-chrome`.
- The Ternary "directory opt-out" finding is already satisfied: `getDirectoryMembers` filters `showInDirectory !== false`.

## Verification status

- `npm run check` (tsc + eslint): green at the last commit, 0 errors, pre-existing warnings only.
- `npm test`: 17 passed at the last commit.
- `npm run test:rules`: not run this workstream (no rules changes).
- Visual: public pages at 1440 and 500px via headless Chrome; portal and admin pages via the owner's logged-in browser, including the request review dialog.
- Verify CI on PR #28: red on the dependency audit step only.

## Open risks / assumptions

- Event date/time handling assumes server-local time; on a UTC host countdowns and `.ics` times are off by the Pacific offset until item 1 above lands.
- Events written before the featured-uniqueness fix could still carry more than one `featured: true`; the next save of any featured event clears the others.
- Big Shoulders and Bricolage were tried and rejected for headlines; do not revisit without the owner asking.

## Integration note

- On merge to `main`, this branch's state replaces whatever `main` carried. Reconcile against the merged code; the "Next" list above becomes the follow-up backlog.

## Last handoff

- Updated: 2026-10-19
- By: agent / Claude Code (Fable)
- Branch/worktree: feat/site-refresh
- Last known-good commit: 45c04c0
