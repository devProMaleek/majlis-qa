# Local and Vercel deployment notes

## This milestone

Run with Node.js 24. Install using `npm ci`, build using `npm run build`, start using `npm run start`. Next.js detects the App Router and the existing `next.config.ts`; no Vercel-specific configuration is needed for these shells. The checked-in npm lockfile is the reproducible dependency source.

To deploy after review: create a Vercel project connected to the eventual repository, select the Next.js framework preset, set this app directory as the root, choose Node.js 24, and use the default build/output detection. Keep the preview clearly labelled and protect review deployments using Vercel deployment protection. Do not distribute this shell to event attendees.

The local app currently lives in `outputs/majlis-qa` relative to the supplied workspace. If it is moved into a standalone repository, select the repository root instead. There has been no commit, push, repository creation on GitHub or deployment in this task.

If using the CLI, upgrade it first with `npm i -g vercel@latest`; the session reported an outdated CLI. Prefer a preview deployment for review. Deploying this preview must be separately authorised.

## Future Supabase environments

No Supabase SDK or project is wired yet. Do not paste credentials just to run the shells. Before the next milestone:

1. Use separate local/development, preview/staging and production projects. Do not let untrusted preview branches use production data.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` per environment. Public keys require RLS; they confer no privacy on their own.
3. Set a canonical `NEXT_PUBLIC_SITE_URL` after choosing the real origin. QR codes must be generated from that origin and the permanent event route, never the Figma example hostname.
4. Keep elevated/secret keys server-only, out of all `NEXT_PUBLIC_*` values and logs. Add only the server variables actually required by the reviewed implementation.
5. Review Auth redirect allowlists, invitation expiry and organisation membership before enabling staff routes.
6. Apply versioned migrations to staging first and run the access-isolation, session-activation and anonymous-read denial tests before production.

## Required server guarantees before real use

- Authorise every staff operation; route visibility alone does not grant permissions.
- Deny anonymous reads of questions and scope staff access to organisation membership and session assignments through RLS.
- Enforce one open session per event in PostgreSQL, including concurrent activation attempts.
- Accept anonymous questions only through a validated server boundary with shared/durable rate limits and scoped idempotency keys.
- Treat Realtime as an invalidation/notification mechanism; re-read authorised PostgreSQL state after reconnects and protect updates against stale revisions.
- Review draft retention and privacy, closed-session handling and unconfirmed delivery before implementing offline behaviour.

These guarantees are planned requirements, not implemented features of this shell milestone.
