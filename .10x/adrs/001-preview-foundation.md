# ADR 001: Isolated application-shell previews

Status: Accepted for the first task, 23 November 2026.

## Context

The approved brief requests Next.js, TypeScript, Tailwind and shadcn/ui foundations and responsive attendee, moderator and administrator shells. It explicitly defers full product delivery. The workspace was empty.

## Decision

Use App Router layouts and Server Components, with small Client Components for navigation and queue browsing. Place sample staff screens under `/preview` and keep fixtures separate from components. Use the stable attendee route shape `/e/[organisationSlug]/[eventSlug]`, resolving only the explicit KBC demo fixture for now. Unknown events return 404.

Implement no database reads, anonymous write endpoint, authentication bypass, Realtime connection or staff mutation. All mutations remain disabled with an explanation. Sample questions are invented public preview fixtures, never private records. This preview must not be used at a real event.

Use Figma Inter typography and exact colour tokens with semantic CSS variables. The user approved 44px minimum-height controls and compact badges in place of the Figma 100px specimens. Derive flexible layouts from the desktop/mobile references. Preserve the simple canvas/cards direction.

## Alternative considered

Build full authenticated dashboards immediately. This adds schema, RLS, authentication and concurrency dependencies beyond the first task and makes the change harder to review. Defer these to the next milestone.

## Consequences

The app builds without credentials and is safe to inspect with sample content. Staff route names and preview navigation will change when authentication is implemented. Supabase, RLS, server-side validation, durable rate limiting and idempotency must precede enabling real submissions. No Workflow SDK is needed for these ordinary UI shells.
