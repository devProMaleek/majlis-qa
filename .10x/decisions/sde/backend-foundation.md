# Backend implementation handoff

Implemented the two schema migrations, explicit grants/RLS, private security helpers, stable tenant relationships and revision-checked session-state primitive. Generated database types from the actual migrated local PostgreSQL 17 database. Created guarded local CLI/environment/fixture tooling.

Added request-specific Supabase SSR/browser clients, no-store refresh proxy, server-only verified identity/data access, shared Zod validation, React Hook Form sign-in and a read-only staff workspace. Existing preview screens remain unchanged. No elevated key is required by app runtime; no public signup or real question/membership/assignment mutation is enabled.

Verification: lint/typecheck/build passed; 5 unit, 30 backend and 68 browser tests passed; audit zero. Initial verification caught admin INSERT RETURNING policy visibility and asynchronous SDK expiry checks entering Next.js prerendering. Both were corrected and verified. See `docs/backend-foundation.md` for evidence, local review accounts and remaining hosted/product work.

No commits, pushes, PRs or hosted changes. Preserve the original uncommitted UI foundation and wait for user review/testing before committing.
