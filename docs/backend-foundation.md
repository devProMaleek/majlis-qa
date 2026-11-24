# Backend foundation — setup and review

Implemented 23 November 2026. This milestone adds real local Supabase authentication, database migrations and organisation/session access controls. The original attendee, moderator and admin previews remain sample-only.

## Run the local backend

From the application root in VS Code, with Node.js 24 and Docker running:

```sh
npm ci
npm run backend:start
npm run backend:env
npm run db:migrate
npm run backend:seed
npm run dev
```

`backend:start` targets only this app's `majlis-qa-foundation` local project. It applies migrations on first startup. `db:migrate` applies any later pending migrations. The first start downloads the Supabase images. The CLI stores its own state in ignored `work/supabase-cli` inside this app, without creating a Supabase home directory elsewhere.

`backend:env` writes ignored `.env.local` and `.env.test.local` files and prints no keys. It accepts only the isolated local URL and refuses to replace hand-written environment files. The app receives only its public URL and publishable key; the elevated key exists solely in the local test file for provisioning fake accounts. Test/seed tooling rejects non-loopback URLs and any database other than `127.0.0.1:54392/postgres`.

| Service | Local address |
| --- | --- |
| App | http://127.0.0.1:3000 |
| Staff sign-in | http://127.0.0.1:3000/auth/sign-in |
| Staff workspace | http://127.0.0.1:3000/staff |
| Supabase API | http://127.0.0.1:54391 |
| PostgreSQL | 127.0.0.1:54392 |
| Supabase Studio | http://127.0.0.1:54393 |
| Local mail viewer | http://127.0.0.1:54394 |

Studio, Auth, PostgreSQL and the Data API run locally. Storage, Edge Functions, analytics and Realtime are disabled because this milestone does not use them. Stop only this local stack with `npm run backend:stop`; it preserves the development data.

## Local review accounts

These are invented accounts on the isolated local stack, not hosted users. Every account below uses the development-only password **`MajlisLocalReview2026!`**.

| Email | Expected access |
| --- | --- |
| `admin@majlis.example.test` | Deen Communications organisation admin |
| `moderator@majlis.example.test` | Deen Communications; Understanding Our Deen assignment only |
| `other-admin@majlis.example.test` | Other Test Organisation only |
| `unassigned@majlis.example.test` | Deen Communications moderator without an assignment; no private questions |
| `outsider@majlis.example.test` | Auth account without membership; no organisation access |

`backend:seed` creates or resets only these local review accounts and upserts their fixture records. It does not send invitation emails. Backend API tests also provision/reset these same fake accounts, so use them only for local review.

## Database and access model

Two versioned migrations create organisations, organisation memberships, events, lecture sessions, moderator assignments and private questions. Composite foreign keys bind sessions to their event/organisation, questions to the exact session/event/organisation, and assignments to both a session and a current organisation membership.

| Operation | Anonymous / outsider | Organisation admin | Moderator |
| --- | --- | --- | --- |
| Published organisation/event and open-session metadata | Publicly readable | Publicly readable | Publicly readable |
| Unpublished event/session metadata | Denied | Own organisation | Assigned event/session only |
| Private questions | Denied | Own organisation | Assigned sessions only |
| Membership directory | Anonymous denied; outsider empty | Own organisation | Own membership only |
| Assignment directory | Anonymous denied; outsider empty | Own organisation | Own assignments only |
| Create/edit event/session metadata | Denied | Own organisation, permitted columns | Denied |
| Open/close a session | Denied | Checked RPC with expected revision | Denied |
| Membership/assignment changes | Denied | No client writes in this milestone | Denied |
| Insert/edit/delete questions | Denied | No client writes in this milestone | Denied |

The last two rows are intentional. Staff provisioning/invitations and anonymous submission/moderation mutations require their own validated server boundaries in later milestones. A TypeScript `Insert`/`Update` type does not imply that PostgreSQL grants the corresponding operation.

Permissions come from current database memberships and assignments, not editable Auth metadata or role fields in the browser. Revoking membership removes assignments through foreign-key cascades. Revoked membership/assignment access is denied even with the same unexpired JWT.

The `private` schema is not exposed by the Data API. All SECURITY DEFINER functions live there with `search_path = ''`, schema-qualified references and explicit execution grants. The public session-state RPC is SECURITY INVOKER; its private implementation independently verifies the caller's current admin membership.

Organisation and event slugs are immutable, giving each event a stable route identity. A partial unique index enforces one open lecture session per event. The state RPC locks the event row, checks the session revision and refuses to open another session while one is open. It never silently closes or switches an existing session. Closed sessions can be manually reopened after competing open sessions are closed; there is no automatic schedule activation.

Question storage has a per-session unique submission UUID and a 1,000-code-point body limit. This prepares the data model; it is not an anonymous submission API or a complete idempotent retry implementation.

## Authentication

Staff use email/password accounts provisioned by a trusted administrator. Public registration and anonymous Auth sign-in are disabled in local config. Signing in alone does not grant organisation access.

`src/proxy.ts` refreshes sessions only for `/auth` and `/staff` and marks their responses private/no-store. It forwards refreshed request cookies, response cookies and the SSR library's cache headers. The server-only data access layer independently calls `auth.getUser()` and uses the requesting user's credentials for every query; it never uses an elevated key. SDK creation is explicitly at request time so its asynchronous expiry checks cannot enter Next.js prerendering. Private user data is not placed in a shared cache.

The sign-in form uses React Hook Form and Zod; the Server Action validates again. It returns generic credential errors, a pending state and a fixed `/staff` redirect. Next.js Server Actions provide the same-origin mutation boundary. Sign-out clears the current session and invalidates the staff route cache. There are no invented registration, recovery or invitation links. Password recovery and initial invitation acceptance remain future work.

## Verification

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run test:backend
npm run build
npx playwright install chromium
npm run test:e2e
```

Verified on Node.js 24.20.0:

- Lint, TypeScript and production build passed.
- **5 unit tests** passed for form validation, public-key checks and cookie configuration.
- **30 backend tests** passed against real local PostgreSQL, Supabase Auth and PostgREST. Coverage includes RLS, grants, cross-tenant relationships, role escalation, current membership/assignment access, direct-API denial, signup denial, token refresh/revocation and stale revisions. Five competing activation races each produced exactly one open session.
- **68 Chromium browser tests** passed across 1440, 768, 390 and 320px widths, including the original 40 shell tests. New coverage includes generic sign-in failure, verified-route protection, membership scoping, no-membership state, session persistence, forged-cookie denial, sign-out, automatic refresh and persistence of refreshed cookies, no-store headers, keyboard/accessibility checks and runtime errors.
- No Next.js prerendering/runtime errors appeared in the final browser run. `git diff --check` passed. Dependency audit reported zero vulnerabilities at verification time.

Browser Auth tests require the seeded local backend. If `.env.test.local` is absent, those tests are explicitly skipped; the preview-only tests still run. A verification claim for this milestone requires the full configured run with no skipped tests. Tests do not prove hosted configuration, real-device/Safari/Firefox/screen-reader coverage or event load capacity.

Review screenshots: [desktop sign-in](screenshots/backend-sign-in-desktop.png), [mobile sign-in](screenshots/backend-sign-in-mobile.png), [desktop staff workspace](screenshots/backend-staff-desktop.png), [mobile staff workspace](screenshots/backend-staff-mobile.png).

## Migrations, generated types and reset safety

The migration files are in `supabase/migrations`. Generate TypeScript definitions after schema changes with `npm run db:types`, then format the generated file using the project's formatter. Do not hand-edit generated definitions to bypass grants or RLS.

The local database was recreated once during implementation to verify the corrected initial migration from an empty state. No hosted database was touched. For future changes, add a migration after the initial schema is reviewed/applied elsewhere. Do not rewrite migrations that have been applied to shared environments.

Do not run a reset against a database with real records. To discard this isolated development database deliberately, use the local CLI reset command only after confirming the project ID and dedicated ports, then regenerate environment files and reseed. For a hosted failure later, stop the affected app feature and prepare a reviewed forward fix or restore plan; do not drop tables containing attendee questions.

## Hosted setup still required

No hosted Supabase project, preview/staging project or Vercel deployment has been linked or changed. The setup is locally verified and reviewable. See [deployment notes](deployment.md) for the concrete hosted preparation checklist and approval boundary. Do not distribute the app at a real lecture yet: anonymous submissions, shared rate limits, invitation flows, full moderation and Realtime recovery are not implemented.

Sources used for implementation: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [CLI configuration](https://supabase.com/docs/guides/local-development/cli/config) and the Next.js documentation bundled with the installed framework.
