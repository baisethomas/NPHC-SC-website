# Dependency Audit Policy

## CI behavior

`npm run audit:dependencies` audits production dependencies (`--omit=dev`) for both the Next.js application and `functions/`. It fails CI when a **new high or critical** advisory is detected or a documented exception increases in severity. Moderate and low advisories are reported for review but do not block a pull request by themselves.

This avoids treating the existing upstream advisory backlog as a new regression while still preventing newly introduced high-impact vulnerabilities from being merged without review. The audit command needs npm registry access; a registry outage is a CI infrastructure failure, not an exception to the policy.

## Current exceptions

The npm advisory feed is mutable, so counts can change without a lockfile change. The CI baseline deliberately records the high/critical package-and-severity pairs instead of fixed totals. At the initial review on 2026-07-14, the Functions production tree had no high or critical advisories; its moderate findings remain non-blocking and visible in CI logs.

The application high/critical baseline is maintained in `scripts/audit-dependencies.mjs`. It currently covers the Genkit/OpenTelemetry and Firebase/Google transitive chains, plus the current `next`, document/image-tooling, markdown, request, and glob dependency chains. Each exception is pinned to its observed severity, so an escalation still fails CI.

These are documented exceptions, not accepted indefinitely. Most are transitive, and several available fixes require a coordinated major upgrade. `next` is direct and must be included in the next dependency-maintenance update. The legacy image/document tooling chain is also scheduled for replacement or upgrade before adding new features that depend on it.

## Triage workflow

1. Run `npm run audit:dependencies` locally before dependency changes.
2. For any new high or critical result, do not add it to the baseline until its affected package, exploitability, and upgrade path are reviewed.
3. Prefer a compatible direct-dependency upgrade or a targeted `overrides` entry. Do not use `npm audit fix --force` without validating the major-version changes.
4. Record approved exceptions in this document and add only the affected package name to the audit baseline. Include the review date, owner, remediation target, and a link to the tracking issue.
5. Review this policy and every remaining exception at least monthly and after every framework, Firebase, Genkit, or image-tooling upgrade. Remove baseline entries as fixes land.

The full audit remains visible in CI logs so moderate and low advisories can be triaged promptly. Dependency changes that increase any advisory count should be explained in the pull request.
