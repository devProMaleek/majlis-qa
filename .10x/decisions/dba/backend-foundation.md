# Backend data model

Six relational tables with organisation-scoped composite foreign keys. Read paths are event-by-route, membership-by-user, sessions-by-event, assignments-by-user/session and questions-by-session/status. Index these foreign-key and policy lookup paths; use no sharding or speculative search infrastructure. Unknown scale is a later load-test input, not a reason to weaken consistency.

Enforce stable route slugs and one open session per event in PostgreSQL. Anonymous and authenticated clients have no question INSERT or UPDATE privilege in this milestone. Internal question records include a per-session submission UUID unique key and a revision for later idempotent submission/concurrency contracts; those endpoints are not enabled.

Use separate local and future hosted environments. Migrations are applied and tested locally only. Membership bootstrap requires privileged, explicit administration. See ADR 002 for the rollback approach.

Verification complete: both migrations applied from an empty local PostgreSQL 17 database. Thirty database/API tests pass, including five activation races, anonymous read/write denial, cross-tenant foreign keys, role escalation denial, live membership revocation and real-JWT assignment isolation. RLS SELECT policies explicitly recognise admins from the new row's organisation so INSERT RETURNING is supported without relying on a snapshot lookup of that row.
