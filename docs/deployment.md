# Environment and deployment notes

## Current local implementation

Use Node.js 24. The Supabase schema, Auth flow and access controls have been verified on the isolated local project described in [backend-foundation.md](backend-foundation.md). The app uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. It does not require a service-role/secret key in application runtime.

Local `.env.local` and `.env.test.local` files are ignored. The test file contains the local elevated provisioning key and database connection string; it must never be deployed or copied to another environment. Local fixture account passwords are intentionally public and the tooling refuses a non-local target.

The Next.js project currently lives at `outputs/majlis-qa` relative to the original workspace. If it moves into a standalone repository, treat that directory as the project root. The npm lockfile pins the toolchain, including Supabase CLI 3.x. CLI commands target local development by default; hosted operations require an explicit target.

## Hosted preparation — pending review and authorisation

No hosted Supabase project or Vercel deployment was created, linked or modified in this task. Before a hosted rollout:

1. Choose distinct development/staging and production Supabase projects; keep preview branches away from production data.
2. Verify the target project and database version against the migration configuration (PostgreSQL 17 locally). Review both migration files and test on disposable staging first. Configure the Data API to expose only intended schemas; `private` must stay unexposed. Prefer disabling automatic grants on newly created tables, while keeping the explicit migration grants.
3. Set the public Supabase URL/publishable key for each Vercel environment. Never put a secret/service-role key in a `NEXT_PUBLIC_*` variable. The config validator rejects elevated key formats.
4. Configure Supabase Auth: email provider enabled; public registration and anonymous sign-in disabled; confirmed staff accounts; refresh rotation enabled; exact HTTPS site/redirect allowlists. Review password policy, SMTP, abuse protection and hosted sign-in limits. The local limit of 100 sign-in attempts per interval exists for repeatable tests and is not a production recommendation.
5. Provision the first confirmed Auth user through a trusted administrative channel. Record their Auth UUID, create the organisation and insert its initial `organisation_admin` membership through reviewed privileged SQL. Merely creating an Auth user grants no staff access. Do not use user-editable metadata for roles. Invitation and password-recovery UI are separate upcoming work.
6. Verify anonymous question reads fail through the actual hosted Data API, verify two separate organisations and assigned/unassigned moderators, and verify membership/assignment revocation. Local test scripts intentionally refuse hosted URLs; use a separately reviewed staging test configuration.
7. Configure a Vercel project with the Next.js preset, this app directory as root, Node.js 24, and the default build/output detection. Build with `npm run build`; run with `npm run start` for a local production server. Next.js and the existing `next.config.ts` supply the required platform configuration.
8. Protect review deployments and keep private auth/staff responses out of CDN/shared caches. Confirm HTTPS, refreshed cookies and no-store headers in the deployed environment.

If using the Vercel CLI, upgrade the outdated session CLI first with `npm i -g vercel@latest`. Start with a protected preview deployment after the diff has been reviewed and tested. No commit, push, PR or deployment is authorised by the implementation request alone.

## Implemented guarantees and remaining gates

Implemented and tested locally: explicit table grants, RLS on every app table, organisation/session access checks, composite tenant foreign keys, stable route slugs, one open session per event, revision-checked administrative session changes, cookie refresh, verified identity, generic sign-in failures and local session sign-out.

Still required before a real event: reviewed hosted setup, secure invitations and initial password/recovery flows, full event/session administration and publishing rules, actual QR generation from the permanent deployed URL, a validated anonymous submission boundary, shared/durable rate limits, idempotent retries, draft retention/privacy decisions, moderator mutation concurrency, authorised Realtime notifications/recovery, and real-device/load testing.

Keep anonymous question writes and moderator mutation UI disabled until those boundaries exist. Realtime must remain a notification mechanism with PostgreSQL as the authoritative source. Deployment rollback should disable affected features and use a reviewed forward migration or restore process; never drop tables containing real attendee records as an ad hoc rollback.
