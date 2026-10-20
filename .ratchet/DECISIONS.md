# Ratchet Decision Ledger

<!--
DROP-IN: copy this file to `.ratchet/DECISIONS.md` in the target repository.
This is durable project memory: decisions that future agents should not reopen accidentally.

Unlike STATE.md, this file is append-oriented. The agent owns maintaining it. Record durable choices when their rationale would otherwise be lost and future work would be constrained by them.

SAFETY: Never record secrets, credentials, access tokens, personal/customer data, or sensitive security/incident details. Use sanitized references to the approved protected system instead.

GIT INTEGRATION: Parallel branches may add decisions independently. Do not invent live synchronization. At merge/integration, preserve compatible decisions from both sides and explicitly resolve true conflicts. Never silently drop an accepted or proposed decision from another branch.

Use branch-friendly decision IDs so parallel additions do not routinely collide. Preferred format: `D-YYYYMMDD-HHMM-short-slug` using UTC when available (for example `D-20260821-0615-shared-review-core`). If an ID collision still occurs, preserve both entries and rename one during integration; identity is not authority.

Autonomy rule:
- Low-impact implementation choices usually stay in code and do not need an entry.
- Medium-impact durable choices may be decided and recorded by the agent, then surfaced in the completion summary.
- High-impact choices require explicit human approval before they are accepted or executed.

Do not record routine implementation choices that are obvious from the code. Do not silently rewrite prior rationale.
-->

## Decision format

### D-YYYYMMDD-HHMM-short-slug — FILL-ME: short decision title

- **Status:** accepted | proposed | superseded
- **Impact:** low | medium | high
- **Date:** YYYY-MM-DD
- **Decision:** FILL-ME
- **Why:** FILL-ME
- **Rejected / alternatives:** FILL-ME
- **Consequences:** FILL-ME
- **Revisit when:** FILL-ME
- **Approved by:** agent | human name/role

---

## Decisions

<!--
Append durable decisions below.
Medium-impact decisions can be accepted autonomously by the agent when they are reversible and within authorized scope.
High-impact decisions remain proposed until a human approves them.
If an accepted decision changes, mark the old entry superseded and add a new decision that references it.
At branch integration, preserve compatible entries from all sides; escalate materially conflicting accepted decisions instead of choosing silently.
-->

### D-20261020-0500-editorial-design-direction — Editorial, photo-led design direction over templated card layouts

- **Status:** accepted
- **Impact:** medium
- **Date:** 2026-10-19
- **Decision:** Public, portal, and admin pages follow an editorial direction: varied section rhythm, numbered or agenda-style lists instead of icon-in-a-box card grids, full-color photography without heavy overlays, the eyebrow label at most twice per page, organization brand colors (`src/lib/divine-nine-brand.ts`, `textOn()` for contrast) wherever an organization is identified, gold reserved for buttons and small details. Empty states are omitted from the homepage rather than shown as placeholder cards.
- **Why:** The owner rejected the first refresh as "vibe codey": every section repeated eyebrow, serif heading, sentence, bordered icon cards, and the photos were darkened to near black. The Divine Nine crests and colors are the council's most distinctive asset and were buried.
- **Rejected / alternatives:** Keeping the shadcn card-grid pattern with cosmetic changes.
- **Consequences:** New pages should reuse `PageHero`, `SectionHeading` (eyebrow optional), `EventAgenda`, `EventBanner`, `DivineNineTiles`, the portal `page-header.tsx`, and the admin `AdminPageHeader` / `AdminPanel` set. Any new icon-card grid will read as a regression.
- **Revisit when:** The owner asks for a different direction, or real event photography makes a photo mosaic feasible where program photos are used today.
- **Approved by:** owner (in conversation, 2026-10-19)

### D-20261020-0510-type-system — Newsreader headlines, Instrument Sans body, Source Serif 4 for Greek lettermarks

- **Status:** accepted
- **Impact:** medium
- **Date:** 2026-10-19
- **Decision:** `--font-headline` is Newsreader (variable, `opsz` axis) at weight 400 for display sizes and 500 for section and card titles, mapped in `globals.css` with an `html .font-headline` selector so it outranks `font-bold` utilities. `--font-body` is Instrument Sans. `--font-greek` is Source Serif 4 with the Greek subset, applied through the `font-greek` class on every lettermark (ΑΚΑ, ΩΨΦ, …).
- **Why:** Playfair Display over Inter is the default pairing of generated sites and the owner wanted it gone. The owner wants a collegiate, academic, Black-excellence register, not whimsy. Newsreader at light weight matched Libre Caslon's color while keeping a usable bold for titles. Neither Newsreader (via next/font) nor Instrument Sans ships Greek glyphs, so without a dedicated face the lettermarks fell back to whatever serif the device had.
- **Rejected / alternatives:** Playfair Display (original), Big Shoulders (too loud), Bricolage Grotesque (too whimsical), Libre Caslon (display cut only in regular weight), Libre Bodoni (fragile hairlines at small sizes), Old Standard TT (too wide). Reusing Newsreader for Greek is blocked by next/font's subset list.
- **Consequences:** Change headline weight in the one block in `globals.css`, not per page. Lettermarks must carry `font-greek`, never `font-headline`.
- **Revisit when:** next/font exposes a Greek subset for Newsreader, or the owner wants the display weight adjusted.
- **Approved by:** owner (in conversation, 2026-10-19)

### D-20261020-0520-request-notifications-deferred — Member-request notifications wait for an email provider

- **Status:** accepted
- **Impact:** medium
- **Date:** 2026-10-19
- **Decision:** Member requests are reviewed through `/admin/requests` and surfaced on the admin dashboard. No email is sent on submission or decision.
- **Why:** The owner has not chosen an email service. Building against a guessed provider would be thrown away.
- **Rejected / alternatives:** Wiring Resend or another provider now behind an env flag.
- **Consequences:** Officers must open admin to see new requests; members must open the portal to see decisions. The hook points are the create handler in `src/app/api/members/requests/route.ts` after the Firestore write and the status route after the decision is recorded.
- **Revisit when:** The owner names an email provider.
- **Approved by:** owner (in conversation, 2026-10-19)

### D-20261020-0530-stop-gate-composition — Stop gate runs typecheck, lint, and unit tests; guard comes from the plugin

- **Status:** accepted
- **Impact:** medium
- **Date:** 2026-10-19
- **Decision:** `.claude/settings.json` wires only the Stop gate and the lint-on-edit hook. The gate's `CHECKS` are `npm run typecheck --if-present`, `npm run lint`, and `npm test`, which together equal the `npm run check && npm test` named in `AGENTS.md`. Firestore and Storage rules tests (`npm run test:rules`) are not in the gate.
- **Why:** The Ratchet plugin already runs the destructive-command guard on every Bash call in this environment; a second entry would run it twice. Rules tests need the Firebase emulators and Java 21 and take minutes, which would make every stop slow or red for environmental reasons. `--if-present` on typecheck lets the hook's own test fixtures, which define only `lint` and `test` scripts, still exercise the gate.
- **Rejected / alternatives:** `npm run check` as a single entry (fails the hook test suite's fixtures); adding `test:rules` to the gate; installing the repo-local guard alongside the plugin's.
- **Consequences:** Anyone editing `firestore.rules`, `storage.rules`, or `tests/rules/` runs `npm run test:rules` by hand. If the plugin is ever disabled here, add the `PreToolUse` guard entry from the Ratchet template to `.claude/settings.json`.
- **Revisit when:** The plugin is removed, or rules tests become fast enough to gate on.
- **Approved by:** agent (within the owner's "go ahead with the above")
