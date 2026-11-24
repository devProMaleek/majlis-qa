# Project delivery rules

- Do not commit, push or open a PR until the user has reviewed the diff, tested the change and explicitly approved it.
- Before handoff, run lint, typecheck, production build and applicable browser tests.
- Use atomic Conventional Commits when committing is approved. Do not add Codex or Anthropic attribution.
- Inspect the relevant Figma screens before implementing major screens and record missing interaction details in `docs/design-audit.md`.
- Keep sample previews separate from real data. Never enable question submission or staff mutations before the required server-side controls and RLS are tested.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
