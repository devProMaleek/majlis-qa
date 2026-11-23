# ADR 002: Supabase authentication and tenant boundaries

Status: Accepted for implementation under the user's backend-foundation instruction, 23 November 2026.

## Context and access patterns

The app has only sample UI and no backend. Organisations own events, events own lecture sessions, and sessions own private questions. Admins need organisation-wide access; moderators need only their assigned sessions and questions. Anonymous attendees need published event/current-session metadata and must never read questions. Pilot volumes are not specified; choose ordinary indexed PostgreSQL tables, with load verification deferred until real submission endpoints exist.

Trust boundaries: untrusted browser/form/cookies, Next.js server, Supabase Auth/Data API and PostgreSQL. The app uses the public publishable key with the requesting user's session. Elevated keys never enter application runtime. A signed-in user without current database membership receives no staff data. Membership revocation takes effect through live RLS lookups rather than JWT role claims.

## Decision

- Use Supabase SSR cookies, a narrow Next.js proxy for refresh/no-store headers, verified server-side identity and a server-only data access layer. Never cache user-specific results in a shared cache.
- User explicitly selected email/password sign-in. Public signup and anonymous Auth accounts are disabled in local config. Initial staff provisioning is an explicit privileged operation; invitation UI is Phase 2.
- Tables: organisations, organisation_memberships, events, lecture_sessions, moderator_assignments and questions. Composite foreign keys prevent cross-tenant relationships. Event and organisation route slugs are immutable. Memberships and assignments have no browser write grants.
- RLS and explicit grants protect every table. Public reads expose only published organisation/event metadata and the currently open published session. Questions permit staff SELECT only in this milestone; no attendee or moderator/admin writes are enabled yet.
- A partial unique index enforces one open session per event. An admin-only, revision-checked state function serializes on the event row; conflicting concurrent activation fails rather than silently switching sessions. The public RPC wrapper is SECURITY INVOKER; its checked implementation and RLS helpers live in an unexposed private schema with a pinned empty search path.
- Keep the existing preview routes and disabled submission controls. Add a minimal sign-in page and protected staff-access workspace using existing components. Figma has no corresponding auth frame; the user authorised a minimal email/password screen. Do not replace the shell milestone with the newer FINAL frames in this backend change.
- Use an isolated local Supabase project on dedicated ports. No hosted Supabase/Vercel environment is created or changed. Baseline source is preserved in `work/backend-baseline` outside the app for an incremental review diff.

## Alternatives

1. Rely on Next.js route checks alone: smaller initial SQL, but direct Data API calls could bypass the app. Rejected.
2. Put access roles in JWT metadata: fewer policy lookups, but revocation can remain stale and user-editable metadata can be unsafe. Rejected for membership authority.
3. Current database membership and RLS (selected): slightly more SQL, immediate access control across all clients, testable with real roles and real Auth sessions.

## Verification and rollback

Apply migrations to an empty local project and test SQL grants/RLS, cross-organisation foreign keys, self-promotion denial, assignment revocation, private question reads and concurrent activation using real PostgreSQL connections. Test real Supabase sign-in, refresh, sign-out and unassigned accounts, then rerun the existing UI suite. Generate TypeScript database types from the migrated database.

No production migration is authorised. Local test data is disposable and tests use fixed local-only identities. For a failed hosted rollout later, disable the affected app routes and restore/reconcile via a reviewed forward migration; do not drop tables with attendee data. Fresh local installs can be recreated only through the explicitly local reset command.
