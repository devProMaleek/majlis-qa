# Majlis Q&A

Next.js application shells based on the [approved Figma file](https://www.figma.com/design/Hy3mVWRxNcOPgTglY5yMyY), with a locally verified Supabase backend foundation.

**Attendee and `/preview` screens still use invented sample content and do not accept questions or perform staff mutations.** `/auth/sign-in` and `/staff` now use real Supabase Auth, current database memberships and RLS. Preview navigation is not an account role switch. No hosted environment has been deployed.

## Run locally

Use Node.js 24 and npm. From this directory:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Design previews work without environment variables. To use staff authentication, follow [local backend setup](docs/backend-foundation.md), including the local-only review accounts. `next/font` downloads Inter at build time and serves it locally at runtime; the first build needs access to Google Fonts.

| Route | Preview |
| --- | --- |
| `/` | Redirects to the KBC attendee shell |
| `/e/dcl/kbc-2026` | Attendee form and current-session presentation |
| `/preview/moderator` | Queue, search, status filters and question details |
| `/preview/admin` | Organisation overview, draft event and setup checklist |
| `/preview/design-system` | Tokens, buttons, controls, cards and feedback |
| `/auth/sign-in` | Validated email/password staff sign-in |
| `/staff` | Protected organisation membership and assigned-session summary |

Only the exact sample event/organisation resolves; other event links show the not-found screen. The route shape is suitable for a permanent event URL, but permanent slug allocation and QR generation are not implemented yet. The attendee active-session screen and admin draft screen are separate design scenarios, not a shared live event state.

## Checks

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run test:backend
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite runs the production build on port 3100. Build before running it. It checks four Chromium viewport sizes (1440, 768, 390 and 320px), the original shells and real staff sign-in/session behaviour. Backend tests require the isolated local Supabase stack, generated test environment and review seed. Screenshots/traces are written to ignored `test-results/`; the HTML report is in ignored `playwright-report/`.

Database/API isolation and concurrent activation tests now pass locally. Automated accessibility and viewport checks do not replace real-device, Safari/Firefox or assistive-technology testing. Full anonymous idempotency, offline/recovery and load tests remain future work.

## Structure

```text
src/app/                  App Router pages, metadata and Figma theme tokens
src/components/ui/        shadcn Nova / Radix primitives, customised centrally
src/components/shells/    shared layout and preview navigation
src/components/attendee/  presentation-only question form
src/components/moderator/ sample queue browsing and question cards
src/components/admin/     organisation overview
src/lib/preview/          invented sample data and pure selectors
src/lib/supabase/         typed SSR/browser clients and public configuration
src/lib/auth/             verified staff data access and shared validation
supabase/migrations/      tenant schema, grants, RLS and session state primitive
scripts/                  guarded local setup and test-account provisioning
tests/                    unit, real backend, browser and accessibility checks
docs/                     design audit, deployment notes and verification record
.10x/                     architecture decision and milestone handoff
```

The UI uses semantic CSS variables mapped to the Figma palette, Inter, 12px card radii and reusable components. The user approved a 44px minimum control height in place of the Figma 100px specimens. Dark mode is intentionally deferred until it is designed. See [design audit](docs/design-audit.md) for node references, interaction gaps and accessibility adjustments.

## Deployment and environment preparation

See [backend setup and verification](docs/backend-foundation.md) and [deployment notes](docs/deployment.md). `.env.example` lists the two public application variables. Local test credentials are generated into ignored files. No remote environment was created or modified.

The current implementation follows the [Next.js App Router documentation](https://nextjs.org/docs/app) and [shadcn Next.js setup](https://ui.shadcn.com/docs/installation/next). Versions are pinned by `package-lock.json`.

## Next milestone

Review and test the backend foundation before committing. Next comes event administration: creation/editing, session management, controlled invitations/assignments and publishing/QR generation. Only enable attendee submissions after server-side validation, shared rate limits and idempotency are verified. Realtime and moderation mutations follow incrementally.
