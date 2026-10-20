# CODEX.md — Codex Adapter

<!--
DROP-IN: place this file at the repo root when using Codex.
AGENTS.md is the canonical model-agnostic operating contract. Do not duplicate those rules here.
Codex auto-loads AGENTS.md, not this file: keep the "Tool adapters" line in AGENTS.md so it is read.
-->

Codex loads `AGENTS.md` automatically; its tool-adapter line points here. This file is the Codex-specific adapter, not a second operating contract.

## Codex specifics

- The hooks in `.claude/settings.json` are not installed around Codex tool calls. Treat the hard stops in `AGENTS.md` as policy even when no guard intercepts a command, and run the required checks explicitly rather than assuming a stop hook ran them.
- Codex task context and any harness-managed memory are not model-agnostic project memory. Durable, shareable state belongs in `.ratchet/` under the rules in `AGENTS.md`; sensitive private pointers do not.
- Codex discovers repo skills in `.agents/skills/`, not `.claude/skills/`. Ratchet installs its skills there for that reason. If a workflow exists only under `.claude/skills/`, Codex will not load it on its own: read its `SKILL.md` directly when the task matches, and report the gap.
- Treat any conflict between this file and `AGENTS.md` as a configuration error. `AGENTS.md` wins; report the conflict.

## Model routing

Tiers, what each owns, and the routing rules are defined in `AGENTS.md` → Delegation and model tiers. This table only says which model fills each tier here. The orchestrator's model is selected by the Codex host or the owner. Model availability varies by host.

| Tier | Model |
|---|---|
| Orchestrate | **Host-selected; prefer GPT-6 Astra (`gpt-6-astra`)** |
| Operate, high risk | **GPT-6 Astra (`gpt-6-astra`)** |
| Operate, routine | **GPT-6.1 Sol (`gpt-6.1-sol`)** |
| Git & docs | **GPT-6 Luna (`gpt-6-luna`)** |

These recommendations use the models available on this host as of 2026-10-19 and the [official OpenAI model guidance](https://developers.openai.com/api/docs/models): Astra for complex reasoning and coding, Sol for balanced capability and cost, and Luna for bounded, cost-sensitive work. Recheck availability when changing hosts. This table does not switch the current orchestrator or authorize delegation; the approval, fallback, escalation, and review rules in `AGENTS.md` still apply.
