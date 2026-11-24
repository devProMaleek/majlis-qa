# Current handoff

The backend foundation is complete and locally verified. See `docs/backend-foundation.md` for setup, local-only review accounts, architecture, access matrix and remaining work. Two migrations are applied on the isolated local Supabase project, with 30 real database/API tests passing. Five unit tests and all 68 browser tests pass; lint, typecheck, production build, audit and diff checks pass.

The app runs on port 3000; Supabase API/DB/Studio run on 54391/54392/54393. Staff authentication and current membership/assignment reads are real local services. The original attendee/moderation/admin design previews are still sample-only; real submissions and product mutations remain disabled. No hosted Supabase or Vercel environment was changed.

On 23 November 2026, after the implementation review handoff, the user explicitly authorised commits, pushing, creation of a public GitHub repository and a PR. Publish the UI and backend as separate Conventional Commits on a feature branch against a minimal main branch. Do not merge or deploy without separate authorisation. The next product milestone is event administration and controlled invitations/assignments/publishing/QR.

## Previous handoff

The application-shell milestone established Figma design foundations and responsive attendee/moderator/admin previews. Its original 40 checks passed, and all 40 continue to pass within the current 68-test browser suite. `docs/review.md` retains that historical milestone record.
