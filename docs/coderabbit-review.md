# CodeRabbit review fixes — 24 November 2026

Reviewed all six unresolved, current CodeRabbit threads on [PR #1](https://github.com/devProMaleek/majlis-qa/pull/1), against head `b2cbbe1`. Each issue was independently confirmed. All six are fixed; none was skipped. Following the review handoff, the user explicitly authorised committing and pushing the fixes. No GitHub review threads were manually resolved or replied to.

## Findings, in original review order

| CodeRabbit title | Severity | Location | Local fix |
| --- | --- | --- | --- |
| Reject `host` and `port` query parameters in the local database URL. | Minor | `scripts/seed-local-backend.ts` | Reject both query keys before creating any backend client or connection. |
| Pass `orientation` to `TabsPrimitive.Root`. | Minor | `src/components/ui/tabs.tsx` | Forward the extracted prop to Radix, retaining the horizontal default. |
| Keep temporary identity failures separate from missing sessions. | Minor | `src/lib/auth/access.ts` | Recognise the SDK's retryable error type and throw a safe temporary-unavailability error for the staff boundary; keep missing/invalid-session redirects. |
| Handle returned refresh errors before continuing. | Minor | `src/lib/supabase/proxy.ts` | Inspect the returned Auth error and return the existing private/no-store HTTP 503 response for retryable failures; retain anonymous/invalid-session route handling and thrown-error protection. |
| Register connection cleanup immediately after each connection succeeds. | Minor | `tests/backend/concurrency.test.ts` | Register each client's teardown with the test context immediately after connection. Fixture cleanup failure or a later connection failure cannot bypass these hooks. |
| Reject `host` and `port` query parameters in `TEST_DATABASE_URL`. | Minor | `tests/backend/helpers.ts` | Apply the same query-key restriction in the SQL test helper. |

While checking identity recovery, the staff error screen's button was switched to the installed Next.js `retry` callback, which refreshes the route before resetting the boundary. The legacy `reset` callback only clears the boundary state in this framework version. This preserves the existing screen and wording.

The auth checks use the installed Supabase SDK's `isAuthRetryableFetchError` distinction, rather than interpreting every error as an invalid session. See [Supabase's retryable Auth error guidance](https://supabase.com/kb/troubleshooting/auth-error-503-authretryablefetcherror-51b88c). Forwarding orientation follows the [Radix Tabs API](https://www.radix-ui.com/primitives/docs/components/tabs). Next.js error-boundary behaviour was verified against the documentation and implementation bundled with this project's installed version.

## Verification

On Node.js 24.20.0:

- Lint, typecheck and production build passed.
- **14 unit tests passed**, including direct tests of the staff identity guard and request proxy with returned network/500/503/504 errors, missing/invalid sessions and unexpected thrown failures. Added tests also cover encoded/repeated/empty database override parameters, valid local URLs and both Radix orientations.
- The new regression tests were run before the fixes and reproduced the URL guard, tab semantics and returned Auth error failures, then passed after the fixes.
- **30 real backend tests passed**, including five repeated competing session activation races using the updated teardown flow.
- **68 Chromium browser tests passed**, without skips or retries, across all four configured viewport sizes.
- Diff whitespace validation passed.

The unit command enables Node's built-in experimental module mocking to exercise the existing server modules directly. The remaining experimental warning is expected; no additional test dependency was installed. Auth outages are injected in unit tests; the browser suite uses the real healthy local backend. Failed connection acquisition/cleanup paths were checked through the teardown structure; the backend suite exercises successful acquisition and cleanup against PostgreSQL.

No database migration, hosted configuration or deployment was performed for this follow-up. Existing untracked duplicate files remain untouched and are excluded from the commits.

## Separate scanner comment

GitGuardian's separate PR comment flags the deliberately documented development-only password for the five fake local review accounts in the seed script. This is distinct from CodeRabbit's six findings and is not a hosted credential. The local-target guard is hardened by this follow-up; actual local elevated keys remain in ignored files. The scanner alert has not been dismissed, and Git history has not been rewritten.
