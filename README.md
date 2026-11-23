# Majlis Q&A

The first implementation milestone: a Next.js foundation and responsive application shells based on the [approved Figma file](https://www.figma.com/design/Hy3mVWRxNcOPgTglY5yMyY).

**This is an interface preview with invented sample content. It does not accept or store questions, authenticate staff, connect to Supabase, or publish events.** Staff mutation controls are deliberately disabled. `/preview` navigation is for reviewing screens; it is not an account role switch.

## Run locally

Use Node.js 24 and npm. From this directory:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables or external services are required. `next/font` downloads Inter at build time and serves it locally at runtime; the first development/production build needs access to Google Fonts.

| Route | Preview |
| --- | --- |
| `/` | Redirects to the KBC attendee shell |
| `/e/dcl/kbc-2026` | Attendee form and current-session presentation |
| `/preview/moderator` | Queue, search, status filters and question details |
| `/preview/admin` | Organisation overview, draft event and setup checklist |
| `/preview/design-system` | Tokens, buttons, controls, cards and feedback |

Only the exact sample event/organisation resolves; other event links show the not-found screen. The route shape is suitable for a permanent event URL, but permanent slug allocation and QR generation are not implemented yet. The attendee active-session screen and admin draft screen are separate design scenarios, not a shared live event state.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite runs the production build on port 3100. Build before running it. It checks four Chromium viewport sizes (1440, 768, 390 and 320px), navigation, unknown event resolution, character counting, disabled submissions, queue search/filter/detail interactions, keyboard access, touch-target sizes and automated accessibility. Screenshots and traces are written to ignored `test-results/`; the HTML report is in ignored `playwright-report/`.

Automated accessibility and viewport checks do not replace real-device, Safari/Firefox or assistive-technology testing. The full product's access-isolation, concurrent activation, idempotency, offline/recovery and load tests belong to later milestones when those features exist.

## Structure

```text
src/app/                  App Router pages, metadata and Figma theme tokens
src/components/ui/        shadcn Nova / Radix primitives, customised centrally
src/components/shells/    shared layout and preview navigation
src/components/attendee/  presentation-only question form
src/components/moderator/ sample queue browsing and question cards
src/components/admin/     organisation overview
src/lib/preview/          invented sample data and pure selectors
tests/                    browser and accessibility checks
docs/                     design audit, deployment notes and verification record
.10x/                     architecture decision and milestone handoff
```

The UI uses semantic CSS variables mapped to the Figma palette, Inter, 12px card radii and reusable components. The user approved a 44px minimum control height in place of the Figma 100px specimens. Dark mode is intentionally deferred until it is designed. See [design audit](docs/design-audit.md) for node references, interaction gaps and accessibility adjustments.

## Deployment and environment preparation

See [deployment notes](docs/deployment.md). `.env.example` documents reserved future variables; none is consumed by this milestone. No remote environment was created or modified.

The current implementation follows the [Next.js App Router documentation](https://nextjs.org/docs/app) and [shadcn Next.js setup](https://ui.shadcn.com/docs/installation/next). Versions are pinned by `package-lock.json`.

## Next milestone

Review the diff and test these shells before committing. Then implement Supabase migrations, authentication, membership/assignment permissions and RLS with organisation-isolation tests. Only enable attendee submissions after server-side validation, durable rate limits and idempotency are verified. Event administration, invitations, actual QR generation, Realtime and moderation mutations follow incrementally.
