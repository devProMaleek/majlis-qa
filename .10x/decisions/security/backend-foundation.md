# Backend threat model

Protect private questions, staff identity and tenant isolation against unauthenticated users, authenticated outsiders and staff from another organisation. Treat direct Data API requests, route parameters, cookies and form fields as untrusted. Do not use elevated application credentials or user-editable JWT metadata for access decisions.

Controls: verified server identity, request-specific Supabase clients, no-store auth/staff responses, server-side Zod validation, controlled initial provisioning, disabled public registration, SQL grants plus RLS, immutable tenant relationships and scoped foreign keys. Default-deny sensitive writes. Authentication success alone never grants staff access.

Verification must include real database roles and API calls, not mocked policies. Cross-tenant visibility or privilege escalation is a high-severity blocker. See ADR 002 and the forthcoming backend verification record.

Verification complete: no in-scope high-severity issue remains in the tested local implementation. SQL and real Data API tests verify private-question denial and tenant/assignment boundaries. Browser tests verify forged-cookie denial, session refresh persistence, sign-out and private/no-store responses at four viewport widths. The application uses no service-role key; local elevated test credentials are ignored, loopback-guarded and absent from application modules. See `.10x/reviews/2026-11-23-backend-security-review.md` for limits.
