# Backend security review — 23 November 2026

Scope: two migrations, table grants/RLS, SECURITY DEFINER helpers, session transitions, Supabase SSR clients, proxy, staff sign-in/actions and read-only staff data access. No hosted deployment was assessed.

Verified: every app table has RLS and explicit grants; anonymous users cannot read private tables; outsiders and foreign staff cannot read private questions; moderators see only assigned questions; editable Auth metadata cannot grant access; revocation works with an existing JWT; cross-tenant relationships fail; direct clients cannot promote users, assign themselves or insert/update questions. The state function checks current admin membership, serializes on the event, checks revisions and retains the one-open-session constraint under concurrent activation.

All SECURITY DEFINER functions are private, use an empty search path and fully qualified references. The app verifies identity with Auth rather than trusting cookie contents, then uses the user's own token with RLS. No shared cache holds private results. Cookie refresh forwarding and no-store headers were tested in the real browser, including expired persisted sessions and forged-cookie rejection. No credentials or question bodies are logged by application auth modules.

Initial findings corrected: SELECT policy visibility for admin INSERT RETURNING; request-time exclusion for SDK asynchronous expiry checks under Cache Components. Local-only test scaffolding is guarded against hosted targets and excluded from deployment credentials.

Checks passed: 5 unit, 30 backend and 68 browser tests, static checks/build, and zero reported dependency vulnerabilities. No unresolved in-scope high-severity finding. This is not a production security sign-off: hosted Auth/RLS settings, initial provisioning/invitations/recovery, real anonymous submission validation/rate limiting/idempotency, moderation mutation concurrency, Realtime and load testing remain later gates.
