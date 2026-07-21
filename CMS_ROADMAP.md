# CMS Roadmap — From Developer-Dependent Site to Volunteer-Manageable CMS

**Date:** 2026-07-21
**Goal:** A person with no coding experience can run this site day-to-day — publish content, manage members, see form submissions — without touching the codebase. ClubExpress-lite, not ClubExpress.

---

## Where things actually stand

Three audits (admin panel, public content, data model) agree on the shape of the gap:

**What already works for a volunteer** — the five content sections have real admin CRUD. Announcements is genuinely polished (drafts, scheduling, bulk operations, confirmations, previews — the template everything else should copy). Events creation, board members, programs, and documents are all usable today.

**The three big gaps:**

1. **People management has zero UI.** No self-signup, no pending-member approval queue, no role assignment screen. Every new member requires the Firebase console plus a CLI script; every role change requires a developer. The backend for all of it already exists (`members` collection, `membershipStatus` gate, the `setUserRoles` Cloud Function with audit logging) — it's a UI away.

2. **The content a volunteer would most want to edit is hardcoded.** President's message, mission statement, the entire About page, contact info, footer, social links, the homepage hero, and the Divine Nine org list (which also gates what can appear on the Programs page) all require code deploys to change.

3. **Two public forms silently destroy user data.** The contact form `console.log`s the message and shows "Message Sent!" — nothing is stored or emailed. The mailing-list form has no submit handler at all. Real community members are almost certainly sending messages into the void right now. Related: the gallery page publicly serves leftover developer scaffolding, and the donations page is buttons with no handlers.

**A note on the data model:** CLAUDE.md describes a 13-collection CMS (tiers, invoices, payments, registrations, contentPages…) that mostly doesn't exist — `cms-collections.ts` is an un-imported constants file and `types/cms.ts` defines only `Member`. The real system is the legacy collections, and that's fine. This roadmap builds on what's real rather than the aspirational schema, and CLAUDE.md should be corrected to match (done as part of Phase 0 hygiene).

---

## Phase 0 — Stop the bleeding (fix what's broken or lying) — ~1 dev-day

| # | Item | Why |
|---|------|-----|
| 0.1 | **Contact form → Firestore + admin inbox.** Write submissions to a `contactSubmissions` collection via server action; add an admin "Inbox" page (list, mark handled). | Users are told "Message Sent!" while data is discarded. Worst bug on the site. |
| 0.2 | **Mailing-list form → Firestore.** Store signups in `mailingList` (email, name, timestamp); admin page with CSV export. Email-provider integration comes in Phase 3 — capturing addresses can't wait for it. | Same silent data loss. |
| 0.3 | **Take down /gallery** (or stub it "coming soon"). It currently shows internal dev documentation publicly. | Public embarrassment; 15-minute fix. |
| 0.4 | **Fix the events edit form.** It bypasses server actions and writes with the client SDK — which the hardened Firestore rules now block, so event *editing is likely broken in production*. Route it through a server action, restore the rich-text editor, and add the missing fields (status, RSVP settings, max attendees) so events can be unpublished after creation. | Latent production breakage + a volunteer can't fix a typo in a published event. |
| 0.5 | **Fix the RSVP CSV export page** (server component passing a `window`-using onClick — errors whenever an event has RSVPs). | Volunteers need the attendee list; it's the whole point of RSVP. |
| 0.6 | **Delete confirmations everywhere.** Events, board, and organizations delete instantly with no confirmation and swallow errors. Reuse the announcements AlertDialog pattern. | One mis-click destroys content invisibly. |
| 0.7 | Small trust fixes: footer `© 2024` → dynamic year; remove or wire the dead `href="#"` social icons; replace the fake-looking phone/PO box on Contact (pull from site settings once 2.1 lands). | Site credibility. |
| 0.8 | Correct CLAUDE.md's fictional CMS-collections section; delete or annotate `cms-collections.ts`. | Stops misleading every future developer (and AI assistant). |

## Phase 1 — People management UI (the biggest ClubExpress delta) — ~3-4 dev-days

| # | Item | Notes |
|---|------|-------|
| 1.1 | **Admin → Members section**: searchable list of all members (from the `members` collection), showing status, roles, org, last sign-in. | Read path already exists (`getDirectoryMembers` pattern). |
| 1.2 | **Pending-approval queue**: approve/reject buttons that set `membershipStatus` — the field is already enforced at login, but nothing in the app can set it today. Badge count on the admin dashboard. | Server action guarded by the existing (currently unused) `approve_members` permission. |
| 1.3 | **Role assignment UI**: role checkboxes per member wired to the existing `setUserRoles` callable (super_admin-gated, audit-logged, already built — nothing calls it). | First real consumer of the callable; App Check enforcement already on it. |
| 1.4 | **Self-signup**: add "Request an account" to /login (`createUserWithEmailAndPassword` → `members` doc with `pending` status → lands in the 1.2 queue). | Closes the loop: today accounts are Firebase-console-only. |
| 1.5 | Deactivate/reactivate member; edit member profile fields (name, org, chapter). | Completes the lifecycle. |

**Exit criterion:** a chapter president can onboard a new member, approve them, and give the comms chair announcement-publishing rights — all from the browser.

## Phase 2 — Editable site content — ~3-4 dev-days

| # | Item | Notes |
|---|------|-------|
| 2.1 | **Site-settings admin page** backed by one `siteSettings/main` Firestore doc: contact email/phone/address, social links, footer text, donation link. Public pages read from it (server-side, cached). | Kills the most-frequent "call the developer" asks. |
| 2.2 | **Content-blocks editor** for the high-churn hardcoded copy: homepage hero (headline, tagline, background image), president's message, mission statement, and the About page sections (history, objectives, accordion essays). One `siteContent` collection, one generic admin editor using the existing Tiptap + image-upload pieces. Not a page builder — a fixed list of named blocks with rich text. | The president's message alone justifies this: it changes with every administration. |
| 2.3 | **Finish the Organizations admin**: make name/chapter/description editable after creation (today only link + president are), add real logo upload via `admin-storage.ts` (today every new org gets a placeholder image forever). | Currently the weakest section (2/5). |
| 2.4 | **Migrate the Divine Nine list to Firestore** and make homepage + Programs read it from the `organizations` collection. Deletes the hardcoded array that gates which orgs can appear at all. | Also removes the tokened-URL-in-source-code pattern that broke logos this week. |

**Exit criterion:** a new council president takes office — photo, message, and board updates happen entirely in the admin panel.

## Phase 3 — Communications & money — ~4-5 dev-days + account setup

| # | Item | Notes |
|---|------|-------|
| 3.1 | **Email provider** (Resend is the simplest fit): contact-form submissions notify the council inbox; approval emails to new members. | First actual email capability — nothing in the codebase can send email today. |
| 3.2 | **Announcement broadcast**: "Email this to the mailing list" button on published announcements, using the Phase 0.2 signup list. | This is the core ClubExpress communications feature. |
| 3.3 | **Donations via a hosted provider** (Zeffy = zero-fee for nonprofits, or Givebutter/Stripe Payment Links). Replace the decorative buttons with real links configured in site settings. Do **not** build in-house payment processing — hosted checkout means no PCI scope, no card data, no webhooks to maintain. | Turns the fake donations page into a working one in an afternoon once the account exists. |
| 3.4 | **Real gallery**: albums + images in Firestore/Storage with an admin upload page (reuse `admin-storage.ts` + the documents-page patterns). | Replaces the Phase 0.3 stub. |

## Phase 4 — Only if genuinely needed (deliberately deferred)

- **Audit-log viewer** (data already accumulates from role changes) — small, nice-to-have.
- **Committees, membership tiers, invoices/dues tracking** — this is where ClubExpress-scale complexity lives. Don't build until the council actually asks; hosted tools (spreadsheet + Zeffy memberships) cover a 9-org council fine.
- **Analytics dashboard** — Vercel Analytics toggle covers 90% of it with zero code.
- **Meeting notes / messages / requests portal polish** — the member portal works; refine from real usage feedback.

---

## Sequencing rationale

Phase 0 first because two forms are actively losing real users' data and event editing is likely broken in production. Phase 1 before content editing because people-management is the difference between "a developer must be involved weekly" and "monthly at most" — and every piece of its backend already exists. Phase 2 kills the recurring copy-change requests. Phase 3 is where the site starts replacing paid tools rather than just being manageable.

Total to "hand over the keys": roughly **11-14 dev-days** across phases 0-2, with Phase 3 as the follow-on. Every phase leaves the site shippable.
