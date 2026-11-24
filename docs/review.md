# First milestone — review handoff

Historical application-shell handoff. For the current backend implementation and verification, see [backend-foundation.md](backend-foundation.md).

Completed 23 November 2026. Scope: initialise Next.js and build Figma-based design foundations and responsive attendee, moderator and organisation administrator shells.

## Implemented

- Next.js 16.4.6 App Router, React 19.3, strict TypeScript, Tailwind 4.3 and shadcn Nova / Radix source components.
- Exact Figma core colour tokens and self-hosted Inter. User-approved 44px controls, compact status badges, readable status colours and focus indicators.
- Shared page shell, review navigation and component gallery.
- Stable attendee route shape with an exact KBC demo fixture; unknown events/organisations do not fall back to KBC.
- Presentation-only question form, character count and a disabled submission action. Typing does not send or save text.
- Moderator queue search, filters, empty states, derived sample counts and desktop/mobile detail browsing. Mutations and reading mode remain disabled.
- Admin overview with consistent draft status and setup checklist. Event editing, staff invitations, assignments, publishing and QR controls remain disabled.
- Environment template, deployment instructions, architecture decision and design interaction audit.

## Verification

Final checks ran with Node.js **24.20.0**.

| Check | Result |
| --- | --- |
| `npm run lint` | Passed, zero warnings |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run test:e2e` | 40 passed, no retries |
| `npm audit --audit-level=moderate` | Zero reported vulnerabilities at verification time |
| `git diff --check` | Passed |

Browser coverage: Chromium at 1440×1000, 768×1024, 390×844 and 320×800. Each surface was checked for horizontal overflow, browser runtime exceptions and automated WCAG A/AA findings using axe. Tests also cover navigation, queue search/status/detail behaviour, mobile dialog closing and focus return, keyboard tabs, skip navigation, minimum enabled-control dimensions, text limit, absence of write requests, unknown event resolution and light-theme consistency under dark system preferences.

Inter was verified as the computed body and heading font, with font loading complete. Desktop and mobile screenshots were manually compared with the inspected Figma references. The review notice, review links, disabled controls and accessible sizing are deliberate preview adaptations documented in the design audit.

The initial accessibility runs found low-contrast section links and a mismatch between visible question labels and accessible button names; both were corrected. Generated Playwright reports are excluded from lint. A desktop queue-card padding conflict caused by its hidden mobile footer was also corrected after screenshot inspection.

## Dependency note

shadcn is a development dependency because it supplies build-time CSS helpers and CLI tooling. Its `@ts-morph/common` dependency pulled an affected minimatch version. A narrowly scoped npm override pins minimatch **11.0.1**, the patched version for [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). The audit then reported zero vulnerabilities. shadcn diagnostics and an in-memory ts-morph AST/glob smoke check passed after the override. Remove the override when upstream dependencies adopt a patched release.

## What is deliberately deferred

This is not the completion of Phase 1 or a production-ready application. Supabase clients/environments, migrations, Auth, organisation membership, moderator assignments and RLS have not been implemented. Zod and React Hook Form will be introduced with the real validated forms. There are no real questions, database connections, staff sessions, rate limits, idempotency records, Realtime subscriptions, persistent drafts, QR generation or server mutations.

No claims are made about multi-organisation isolation, concurrent session activation, duplicate handling, offline recovery or load capacity; those require the actual backend implementation and its tests. Real-device testing, Safari/Firefox, screen-reader testing and event load testing remain future coverage.

## Review locally

Open the running app at http://127.0.0.1:3000. Use the preview links (or the **Previews** button on mobile) to switch screens. See the [README](../README.md) to restart it, or run `npm run dev` from this app directory.

Review with `git diff` from this directory. This is a fresh local repository with no commits or remote. Files are marked intent-to-add solely so the complete initial diff is visible; no content has been committed. No push, PR, deployment or external environment mutation was performed. The source patch is also supplied beside the app as `majlis-qa-foundation.patch` (screenshots excluded).

### Screenshots

| Surface | Desktop | Mobile |
| --- | --- | --- |
| Attendee | [Screenshot](screenshots/attendee-desktop.png) | [Screenshot](screenshots/attendee-mobile.png) |
| Moderator | [Screenshot](screenshots/moderator-desktop.png) | [Screenshot](screenshots/moderator-mobile.png) |
| Admin | [Screenshot](screenshots/admin-desktop.png) | [Screenshot](screenshots/admin-mobile.png) |
| Components | [Screenshot](screenshots/components-desktop.png) | [Screenshot](screenshots/components-mobile.png) |

Next action: user reviews the diff and tests the shells. Wait for explicit approval before any commit, push or PR. The next implementation milestone is Supabase migrations, authentication and organisation-level permissions with RLS tests.
