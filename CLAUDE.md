@AGENTS.md

# CLAUDE.md — Claude Code Adapter

`AGENTS.md` (imported above) is the canonical operating contract: the project documentation first, then the Ratchet rules for planning, verification, scope, project memory, decision autonomy, hard stops, reporting, and handoff. This file adds only what is specific to Claude Code.

## Claude Code specifics

- Use plan mode for nontrivial work when available.
- Respect configured `.claude/` hooks and never bypass a failing stop/check hook merely to complete the task.
- Read `.ratchet/STATE.md` and `.ratchet/DECISIONS.md` through the workflow defined in `AGENTS.md`.
- Maintain project memory autonomously according to the low/medium/high impact thresholds in `AGENTS.md`.
- Treat any conflict between this file and `AGENTS.md` as a configuration error. `AGENTS.md` wins; report the conflict.

## Model routing

Tiers, what each owns, and the routing rules are defined in `AGENTS.md` → Delegation and model tiers. This table only says which model fills each tier here. The owner picks the orchestrator's model (`/model`, or the `model` setting). Set a subagent's tier with the Agent tool's `model` parameter, or with `model:` in a `.claude/agents/*.md` definition.

| Tier | Model |
|---|---|
| Orchestrate | **Fable** (`fable`) |
| Operate, high risk | **Opus** (`opus`) |
| Operate, routine | **Sonnet** (`sonnet`) |
| Git & docs | **Haiku** (`haiku`) |

The value in backticks is the alias that `/model`, the `model` setting, and the Agent tool accept. Fable is not available on every plan or Claude Code version: where `fable` is not selectable, Opus orchestrates and takes the high-risk tier as well — state the substitution, as `AGENTS.md` requires.

## Repo-specific Claude notes

- The Ratchet plugin is enabled in this environment, so its destructive-command guard already runs on every Bash call. `.claude/settings.json` therefore wires only the stop gate and the lint-on-edit hook; do not add a second guard entry.
- The guard also blocks any Bash command whose program name is a shell variable, `rm -rf`, `git commit -m "$(...)"`, and `gh --jq` expressions containing parentheses. Write commit messages to a file and use `git commit -F <file>`; put the Chrome binary path in a script or quote it literally.
- Screenshots: no Playwright here. Use headless Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` with `--headless=new --screenshot --window-size=WxH`. It will not render narrower than about 500px, so treat a 390px capture as unreliable. The `claude-in-chrome` tools can drive the owner's logged-in browser for portal and admin pages.
- The dev server is `npm run dev` on port 9002 (see `.claude/launch.json`). It shares the production Firebase project.
