# Backend QA — 23 November 2026

Node 24.20.0. Supabase CLI 3.3.0 and the isolated local PostgreSQL 17/Auth/Data API stack. Both migrations verified from empty state.

- Lint and typecheck: passed.
- Production build: passed.
- Unit tests: 5 passed.
- Real backend tests: 30 passed, no skips. Five repeated activation races each left one open session.
- Browser tests: 68 passed, no retries/skips; Chromium at 1440, 768, 390 and 320px widths.
- Dependency audit: zero findings at verification time.
- Diff whitespace check: passed.
- Final browser run: no runtime/prerendering errors. Desktop/mobile sign-in and staff screenshots manually inspected.

Test scope and limits are detailed in `docs/backend-foundation.md`. No production/device/load result is implied. All source remains uncommitted for user review and testing.
