<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Codex + Matt Pocock workflow

The user has permission to substitute Codex for Claude Code. Use the official
Matt Pocock skills installed in `.agents/skills/` for this project. Preserve the
original skill text and license; `.claude/skills/` is retained as the earlier copy.

Execute the workflow in order: grill-with-docs → to-spec → to-tickets → implement
→ code-review. In Codex, a skill's instruction to call the Claude Skill tool means
read and follow the named SKILL.md; do not claim a Claude slash command executed.
For grill-with-docs, read both grilling and domain-modeling. Follow actual interview
rounds and record user answers, then obtain shared-understanding confirmation.
Follow the spec testing-seam and ticket-breakdown checkpoints. Use the existing
local Markdown tracker described in docs/agents/issue-tracker.md.

Current remediation records live in `.scratch/guestbook-codex/`. Distinguish the
previous implementation from subsequent interview-driven verification and changes.
Never backdate interview answers or claim the original implementation followed an
interview which did not occur. All new questions should concern unresolved choices;
accept already explicit assignment requirements and user answers as settled.
