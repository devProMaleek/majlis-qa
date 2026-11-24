# Majlis Q&A milestone status

Scope: responsive application shells and the locally verified backend foundation.

## History: application-shell milestone

- Design inspection complete: attendee 1:25 / 1:42, moderator 1:91 / 1:131, admin 1:73 / 1:152, components 7:36.
- Tokens inspected through Figma variable definitions.
- Accessible control-size adjustment explicitly approved by the user.
- Architecture documented in ADR 001.
- Milestone 1: scaffold and UI primitives complete; lint, typecheck and production build passed.
- Milestone 2: responsive shells complete; lint, typecheck and production build passed.
- Milestone 3: complete. Lint, TypeScript and production build passed on Node 24.20.0. All 40 browser checks passed; dependency audit reports zero vulnerabilities. Screenshots and review notes are in `docs/`.

No commits, pushes, PRs or deployments authorised. The shell milestone was completed before backend implementation began.

## Current milestone: backend foundation

User authorised implementation of the backend foundation and selected email/password staff sign-in. After the review handoff, the user explicitly authorised commits, a push, a public GitHub repository and a PR on 23 November 2026.

- Schema, tenant constraints, grants and RLS implemented in two migrations.
- Both migrations verified from a clean isolated local Supabase database; 21 PostgreSQL tests pass, including five concurrent activation races.
- Public configuration and sign-in schema unit checks: 5 passing.
- Typed database definitions generated from the migrated local schema.
- Email/password authentication, refresh, sign-out and protected read-only staff workspace complete.
- Lint, typecheck, build, 5 unit tests, 30 real-backend tests and all 68 browser tests passed on Node 24.20.0. Audit reports zero vulnerabilities.
- Review screenshots, setup instructions and limitations are in `docs/backend-foundation.md`.

No hosted environment has been modified. First-milestone previews remain intact. Local Supabase and the production app server on port 3000 are running for review. Publication is authorised; merging the PR and deploying remain separate decisions.
